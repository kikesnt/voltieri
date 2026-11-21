// Voltieri — motor de rutas real. Sin clave, sin backend.
const PLACES = {
  "Madrid":[-3.7037,40.4168], "Barcelona":[2.1686,41.3874], "Zaragoza":[-0.8896,41.6488],
  "Valencia":[-0.3774,39.4699], "Sevilla":[-5.9845,37.3891], "Bilbao":[-2.9345,43.2630],
  "Málaga":[-4.4214,36.7213], "Alicante":[-0.4811,38.3452], "Murcia":[-1.1304,37.9838],
  "Valladolid":[-4.7235,41.6523], "Palma":[2.6507,39.5714], "Tenerife":[-16.2546,28.1235],
  "Lisboa":[-9.1394,38.7223], "Oporto":[-8.6290,41.1579], "Girona":[2.8157,41.9794],
  "Córdoba":[-4.7758,37.8882], "Granada":[-3.5983,37.1773], "Santander":[-3.8036,43.4617]
};

const R = 6371;
const rad = d => d * Math.PI / 180;
function haversine(a, b){
  const [lon1,lat1]=a, [lon2,lat2]=b;
  const dl=rad(lon2-lon1), dp=rad(lat2-lat1);
  const h=Math.sin(dp/2)**2 + Math.cos(rad(lat1))*Math.cos(rad(lat2))*Math.sin(dl/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}

async function geocode(name){
  if (PLACES[name]) return PLACES[name];
  try {
    const u = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}, España&format=json&limit=1`;
    const d = await (await fetch(u)).json();
    if (d[0]) return [+d[0].lon, +d[0].lat];
  } catch(e) {}
  return null;
}

async function getRoute(from, to){
  const u = `https://router.project-osrm.org/route/v1/driving/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson&steps=false`;
  const d = await (await fetch(u)).json();
  if (d.code !== "Ok" || !d.routes?.length) throw new Error("No se encontró ruta");
  const r = d.routes[0];
  return { coords:r.geometry.coordinates, km:r.distance/1000, hours:r.duration/3600 };
}

function sample(coords, stepKm=10){
  const pts=[coords[0]], acc=[0];
  for(let i=1;i<coords.length;i++){ acc.push(acc[i-1]+haversine(coords[i-1],coords[i])); }
  const total=acc[acc.length-1];
  const out=[{p:coords[0], d:0}];
  let target=stepKm;
  while(target<total){
    let i=1; while(i<acc.length-1 && acc[i]<target) i++;
    const t=(target-acc[i-1])/((acc[i]-acc[i-1])||1);
    const lon=coords[i-1][0]+(coords[i][0]-coords[i-1][0])*t;
    const lat=coords[i-1][1]+(coords[i][1]-coords[i-1][1])*t;
    out.push({p:[lon,lat],d:target});
    target+=stepKm;
  }
  out.push({p:coords[coords.length-1],d:total});
  return out;
}

async function elevations(points){
  const out=[];
  for(let i=0;i<points.length;i+=90){
    const chunk=points.slice(i,i+90);
    const lat=chunk.map(p=>p.p[1]).join(","), lon=chunk.map(p=>p.p[0]).join(",");
    const d=await (await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lat}&longitude=${lon}`)).json();
    const vals=Array.isArray(d.elevation)?d.elevation:chunk.map(()=>0);
    out.push(...vals);
  }
  return out;
}

async function weatherAt(p){
  try{
    const d=await (await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${p[1]}&longitude=${p[0]}&current=temperature_2m,wind_speed_10m`)).json();
    return { temp:d.current?.temperature_2m ?? 18, wind:d.current?.wind_speed_10m ?? 0 };
  }catch(e){ return { temp:18, wind:0 }; }
}

// Consumo por tramo con física explícita (kWh)
function energyFor(legs, batteryKwh, speedKmh, temp, windKmh){
  const mass=1750+batteryKwh*5, g=9.81, crr=.010, cda=.62, rho=1.2, eta=.90;
  const v=speedKmh/3.6, wind=windKmh/3.6;
  let total=0;
  for(let i=1;i<legs.length;i++){
    const dKm=legs[i].d-legs[i-1].d;
    if(dKm<=0) continue;
    const dh=legs[i].e-legs[i-1].e, theta=Math.atan2(dh,dKm*1000);
    const fRoll=crr*mass*g*Math.cos(theta);
    const fAero=.5*rho*cda*(v+wind)**2;
    const fGrav=mass*g*Math.sin(theta);
    let e=(fRoll+fAero+fGrav)*(dKm*1000)/eta/3.6e6;
    if(fGrav<0) e+=fGrav*(dKm*1000)*.65/3.6e6;
    e+=.30*(dKm/speedKmh);
    total+=e;
  }
  const cold=Math.max(0,(20-temp)*.012)*batteryKwh*.02;
  return { total:total+cold, legs };
}

function nearestChargers(coords, chargers, maxKm=12){
  const out=[];
  for(const c of chargers){
    let best=Infinity, at=0;
    for(let i=0;i<coords.length;i++){
      const d=haversine(coords[i],[c.lon,c.lat]);
      if(d<best){best=d;at=i;}
    }
    if(best<=maxKm) out.push({...c, detour:best, at});
  }
  return out.sort((a,b)=>a.detour-b.detour || b.kw-a.kw);
}

async function loadChargers(){
  const txt=await (await fetch("data/chargers.txt")).text();
  return txt.trim().split("\n").map(l=>{
    const [name,lat,lon,kw,operator,connector]=l.split("|");
    return { name, lat:+lat, lon:+lon, kw:+kw, operator, connector };
  });
}

async function planRoute(fromName, toName, opts={}){
  const from=await geocode(fromName), to=await geocode(toName);
  if(!from||!to) throw new Error("Ciudad no encontrada");
  const route=await getRoute(from,to);
  const legs=sample(route.coords,10);
  const alt=await elevations(legs);
  legs.forEach((p,i)=>p.e=Math.round(alt[i]||0));
  const mid=legs[Math.floor(legs.length/2)].p;
  const w=await weatherAt(mid);
  const car=opts.car||{ battery:75, use:16.8, dc:250, name:"Tesla Model 3 LR" };
  const speed=opts.speed||100;
  const energy=energyFor(legs,car.battery,speed,w.temp,w.wind);
  const chargers=await loadChargers();
  const near=nearestChargers(route.coords,chargers,opts.maxDetour||15);
  const window=car.battery*.70;
  const stops=Math.max(0,Math.ceil((energy.total-car.battery*.92)/window));
  const chosen=[];
  for(let s=1;s<=stops;s++){
    const targetKm=route.km*s/(stops+1);
    const cand=near.filter(c=>Math.abs(c.at/(route.coords.length-1)*route.km-targetKm)<120)
      .sort((a,b)=>b.kw-a.kw||a.detour-b.detour)[0];
    if(cand) chosen.push(cand);
  }
  const chargeMin=chosen.reduce((a,c)=>a+Math.round(car.battery*.7/c.kw*60)+8,0);
  return {
    from:fromName, to:toName, km:+route.km.toFixed(1),
    driveHours:+route.hours.toFixed(2), coords:route.coords, legs,
    climb:legs.reduce((a,p,i)=>i?a+Math.max(0,p.e-legs[i-1].e):0,0),
    descent:legs.reduce((a,p,i)=>i?a+Math.max(0,legs[i-1].e-p.e):0,0),
    maxAlt:Math.max(...legs.map(p=>p.e)),
    weather:w, energy:+energy.total.toFixed(1), use:+(energy.total/route.km*100).toFixed(1),
    stops:chosen, chargeMin, hours:+(route.hours+chargeMin/60).toFixed(2),
    car:car.name, real:true, computedAt:new Date().toISOString()
  };
}

window.VoltieriRouting = { planRoute, geocode, getRoute, elevations, energyFor, nearestChargers, PLACES };
