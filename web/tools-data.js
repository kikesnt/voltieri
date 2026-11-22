// Voltieri — registro de las 45 herramientas.
// Cada entrada: id, categoría, título, descripción, entradas y cálculo.
const nf0 = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const eur = n => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const eur2 = n => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// Datos reales: OpenEV Data v1.24.0 (CDLA-Permissive-2.0), 113 modelos de mercado ES/PT.
// La autonomía "real" es WLTP × 0,85 (modelo declarado, no medición propia).
const CAR_NAMES = [];
const CARS = {};
const REAL_DATA = { source:"OpenEV Data v1.24.0", released:"2025-12-30", license:"CDLA-Permissive-2.0", models:113 };
const nd = v => (v === null || v === undefined || v === "" ? "Sin dato" : v);

async function loadVehicles() {
  const txt = await (await fetch("data/vehicles.txt")).text();
  const specsTxt = await (await fetch("data/specs.txt")).text();
  const esTxt = await (await fetch("data/prices-es.txt")).text();
  const specs = {};
  for (const line of specsTxt.trim().split("\n")) {
    const [name, len, wid, hei, boot, price, real] = line.split("|");
    specs[name] = { len:+len||null, wid:+wid||null, hei:+hei||null, boot:+boot||null, priceDe:+price||null, real:+real||null };
  }
  const pricesES = {};
  for (const line of esTxt.trim().split("\n")) {
    const [name, price] = line.split("|");
    pricesES[name] = +price;
  }
  for (const line of txt.trim().split("\n")) {
    const [make, model, year, net, wltp, dc, power, accel, chem] = line.split("|");
    const name = `${make} ${model}`;
    if (CARS[name]) continue;
    CAR_NAMES.push(name);
    const battery = +net, wltpKm = +wltp;
    const s = specs[name] || {};
    const price = pricesES[name] || null;
    CARS[name] = {
      wltp: wltpKm,
      range: s.real || Math.round(wltpKm * 0.85),
      rangeSource: s.real ? "ev-database real" : "WLTP × 0,85 (estimado)",
      use: +(battery / (wltpKm / 100)).toFixed(1),
      dc: +dc, power: +power, accel: accel ? +accel : null,
      chem, battery, year: +year,
      price, priceSource: price ? "Autocasion España" : (s.priceDe ? "RRP Alemania ev-database" : "Sin dato"),
      priceDe: s.priceDe || null,
      len: s.len, wid: s.wid, hei: s.hei, boot: s.boot, ncap: null, adas: null
    };
  }
  CAR_NAMES.sort((a, b) => a.localeCompare(b, "es"));
}

const K_WINTER=.80, K_120=.81, K_HILLS=.92; // 0 °C: consumo +24 %. 120 km/h: +23 % (modelo de la herramienta de autonomía)
const car = id => ({ id, type:"car" });
const selx = (id, options) => ({ id, type:"select", options, value: options[0] });
const num = (id, label, value, unit, min, max, step=1) => ({ id, label, value, unit, min, max, step });
const table = (head, rows) => ({ head, rows });

const TOOLS = [
  // ---------- COMPARADORES ----------
  { id:"fichas", cat:"compare", name:"Comparador de fichas", h1:"Dos coches, una sola ficha.",
    desc:"Compara las cifras que importan de dos modelos, lado a lado y sin publicidad.",
    inputs:[car("a"),car("b")],
    calc:v=>{ const A=CARS[v.a],B=CARS[v.b]; return {
      out:[{l:"Autonomía real",v:`${A.range} / ${B.range} km`},{l:"Consumo",v:`${nf1.format(A.use)} / ${nf1.format(B.use)}`},{l:"Carga DC",v:`${A.dc} / ${B.dc} kW`},{l:"Precio",v:`${A.price?eur(A.price):"Sin dato"} / ${B.price?eur(B.price):"Sin dato"}`}],
      table:table(["Campo",v.a,v.b],[["Batería",A.battery+" kWh",B.battery+" kWh"],["Autonomía WLTP",A.wltp+" km",B.wltp+" km"],["0–100 km/h",nd(A.accel)+" s",nd(B.accel)+" s"]]),
      note:"Fichas: OpenEV Data v1.24.0. Autonomía real: ev-database.org cuando existe; si no, WLTP × 0,85. Precio: RRP de Alemania según ev-database.org, no precio español."}; }},

  { id:"tamano", cat:"compare", name:"Comparador de tamaño", h1:"¿Cómo caben en tu garaje?",
    desc:"Largo, ancho, alto y distancia entre ejes, a escala y en milímetros.",
    inputs:[car("a"),car("b")],
    calc:v=>{ const A=CARS[v.a],B=CARS[v.b]; return {
      out:[{l:"Largo",v:`${nd(A.len)} / ${nd(B.len)} mm`},{l:"Ancho",v:`${nd(A.wid)} / ${nd(B.wid)} mm`},{l:"Alto",v:`${nd(A.hei)} / ${nd(B.hei)} mm`},{l:"Diferencia de largo",v:(A.len&&B.len)?`${Math.abs(A.len-B.len)} mm`:"Sin dato"}],
      table:table(["Medida",v.a,v.b],[["Largo",nd(A.len)+" mm",nd(B.len)+" mm"],["Ancho",nd(A.wid)+" mm",nd(B.wid)+" mm"],["Alto",nd(A.hei)+" mm",nd(B.hei)+" mm"]]),
      note:"Dimensiones de ev-database.org. Comprueba siempre espejos y apertura de puertas."}; }},

  { id:"maletero", cat:"compare", name:"Comparador de maleteros", h1:"El maletero que de verdad usas.",
    desc:"Litros homologados y una pista sobre la forma de la boca de carga.",
    inputs:[car("a"),car("b")],
    calc:v=>{ const A=CARS[v.a],B=CARS[v.b]; return {
      out:[{l:v.a,v:nd(A.boot)+" L"},{l:v.b,v:nd(B.boot)+" L"},{l:"Diferencia",v:(A.boot&&B.boot)?Math.abs(A.boot-B.boot)+" L":"Sin dato"},{l:"Relación",v:(A.boot&&B.boot)?nf1.format(Math.max(A.boot,B.boot)/Math.min(A.boot,B.boot))+"×":"Sin dato"}],
      note:"Cargo Volume de ev-database.org. El volumen no dice todo: mide también la boca y la altura de carga."}; }},

  { id:"seguridad", cat:"compare", name:"Seguridad y ADAS", h1:"Qué te protege cada coche.",
    desc:"Euro NCAP y asistentes incluidos, sin estrellas inventadas.",
    inputs:[car("a"),car("b")],
    calc:v=>{ const A=CARS[v.a],B=CARS[v.b]; const S=(typeof LIVE!=="undefined"&&LIVE.safety)?LIVE.safety:{};
      const html=`<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap"><a class="chip" href="${S[v.a]||"https://www.euroncap.com/en/search"}" target="_blank" rel="noopener noreferrer">${v.a} · Euro NCAP ↗</a><a class="chip" href="${S[v.b]||"https://www.euroncap.com/en/search"}" target="_blank" rel="noopener noreferrer">${v.b} · Euro NCAP ↗</a></div>`;
      return {out:[{l:"Ficha oficial",v:"Euro NCAP"},{l:"Batería",v:A.battery+" / "+B.battery+" kWh"},{l:"Potencia",v:A.power+" / "+B.power+" kW"},{l:"Año",v:A.year+" / "+B.year}],
        html,note:"Euro NCAP no publica una API abierta de resultados por VIN: mostramos el enlace a su buscador oficial para cada modelo. No inventamos estrellas ni equipamiento ADAS."}; }},

  { id:"autonomia-comp", cat:"compare", name:"Comparador de autonomía", h1:"Cuatro escenarios, no una cifra.",
    desc:"WLTP, real, invierno y autovía a 120 km/h para dos modelos.",
    inputs:[car("a"),car("b")],
    calc:v=>{ const A=CARS[v.a],B=CARS[v.b]; const x=c=>[c.wltp,c.range,Math.round(c.range*K_WINTER),Math.round(c.range*K_120)];
      return {out:[{l:"WLTP",v:`${A.wltp} / ${B.wltp} km`},{l:"Real",v:`${A.range} / ${B.range} km`},{l:"Invierno",v:`${x(A)[2]} / ${x(B)[2]} km`},{l:"A 120 km/h",v:`${x(A)[3]} / ${x(B)[3]} km`}],
      table:table(["Escenario",v.a,v.b],[["WLTP",A.wltp+" km",B.wltp+" km"],["Real",A.range+" km",B.range+" km"],["Invierno",x(A)[2]+" km",x(B)[2]+" km"],["120 km/h",x(A)[3]+" km",x(B)[3]+" km"]]),
      note:"Escenarios calculados con el modelo físico de la herramienta de autonomía."}; }},

  { id:"carrera", cat:"compare", name:"Prestaciones", h1:"0 a 100 y recuperación.",
    desc:"0–100 y potencia reales de OpenEV Data, confrontados con la curva de carga.",
    inputs:[car("a"),car("b")],
    calc:v=>{ const A=CARS[v.a],B=CARS[v.b]; return {
      out:[{l:"0–100 km/h",v:`${nd(A.accel)} / ${nd(B.accel)} s`},{l:"Potencia",v:`${A.power} / ${B.power} kW`},{l:"Carga DC",v:`${A.dc} / ${B.dc} kW`},{l:"Batería",v:`${A.battery} / ${B.battery} kWh`}],
      table:table(["Dato",v.a,v.b],[["0–100 km/h",nd(A.accel)+" s",nd(B.accel)+" s"],["Potencia sistema",A.power+" kW",B.power+" kW"],["Punta DC",A.dc+" kW",B.dc+" kW"],["Autonomía real",A.range+" km",B.range+" km"]]),
      note:"Cifras de OpenEV Data v1.24.0. La recuperación depende del estado de carga y de la temperatura; no se publica como cifra fija."}; }},

  { id:"recomendador", cat:"compare", name:"Recomendador", h1:"Tres coches para tu vida.",
    desc:"Filtra el catálogo por presupuesto y viaje largo, y ordena por lo que gastarás en energía al año.",
    inputs:[num("presupuesto","Presupuesto",45000,"€",15000,120000,1000),num("km","Km al año",15000,"km",5000,40000,1000),num("distancia","Viaje largo habitual",400,"km",100,1000,50)],
    calc:v=>{
      const pvpc=(typeof LIVE!=="undefined"&&LIVE.pvpcAvg)?LIVE.pvpcAvg:.212;
      const fit=Object.entries(CARS).filter(([,c])=>c.price&&c.price<=v.presupuesto);
      const top=fit.map(([n,c])=>({n,c,reach:c.range>=v.distancia,cost:v.km/100*c.use*pvpc}))
        .sort((a,b)=>(b.reach-a.reach)||(a.cost-b.cost)||(b.c.dc-a.c.dc)).slice(0,3);
      if(!top.length) return {out:[{l:"Modelos",v:"0"},{l:"Presupuesto",v:eur(v.presupuesto)},{l:"Uso",v:nf0.format(v.km)+" km/año"},{l:"Viaje largo",v:v.distancia+" km"}],
        note:"Ningún modelo con precio publicado entra en ese presupuesto. Sube el presupuesto."};
      return {out:[{l:"Modelos que entran",v:String(fit.length)},{l:"Mejor opción",v:top[0].n},{l:"Energía al año",v:eur(top[0].cost)},{l:"Viaje largo",v:top[0].reach?"Sin parar":"Con una parada"}],
        table:table(["Modelo","Precio","Autonomía","Energía/año","Viaje largo"],top.map(t=>[t.n,eur(t.c.price),t.c.range+" km",eur(t.cost),t.reach?"Sin parar":"Con parada"])),
        note:"Solo entran modelos con precio de Autocasion. Primero van los que hacen tu viaje largo sin parar y después los de menor gasto de energía. No filtra por plazas porque no tenemos ese dato."}; }},

  // ---------- FINANZAS ----------
  { id:"wallbox", cat:"finance", name:"¿Qué wallbox necesito?", h1:"La potencia justa para tu garaje.",
    desc:"Según tu contrato, tus kilómetros diarios y las horas que tienes enchufado, qué potencia de cargador basta.",
    inputs:[selx("contrato",["Monofásico","Trifásico"]),num("km","Km al día",50,"km",10,300,10),num("use","Consumo",16.8,"kWh/100",10,30,0.1),num("horas","Horas enchufado",8,"h",2,16,1)],
    calc:v=>{ const kwh=v.km/100*v.use, need=kwh/(v.horas*.9);
      const opts=v.contrato==="Monofásico"?[3.7,7.4]:[3.7,7.4,11,22];
      // 7,4 kW es la recomendación estándar en casa: barata y con margen.
      // Solo se sube a 11 o 22 kW si la potencia mínima lo pide de verdad.
      const rec=need<=7.4?7.4:(opts.find(p=>p>=need)||opts[opts.length-1]);
      const link=rec>7.4?`<a class="chip" href="comparativa-estaciones-22kw.html">Ver estaciones de 22 kW →</a>`:`<a class="chip" href="comparativa-wallbox-7400.html">Ver wallbox de 7,4 kW →</a>`;
      const filas=opts.map(p=>[nf1.format(p)+" kW", nf1.format(kwh/(p*.9))+" h", p>=need?"cubre tu necesidad":"no llega", p===rec?"← la que te conviene":""]);
      return {out:[{l:"Energía al día",v:nf1.format(kwh)+" kWh"},{l:"Potencia mínima",v:nf1.format(need)+" kW"},{l:"Recomendado",v:nf1.format(rec)+" kW"},{l:"Tiempo de carga",v:nf1.format(kwh/(rec*.9))+" h"}],
        table:table(["Potencia disponible","Carga de tus "+nf1.format(kwh)+" kWh","¿Sirve?",""],filas),
        html:`<div style="margin-top:16px">${link}</div>`,
        note:"Con contrato monofásico el máximo práctico es 7,4 kW; con trifásico puedes llegar a 11 o 22 kW si tu coche y tu instalación lo admiten. La tabla muestra las potencias que puedes instalar. Supone un 10 % de pérdidas al cargar. Comprueba también la potencia que admite tu coche en corriente alterna."}; }},

  { id:"tarifas", cat:"finance", name:"Tarifas eléctricas", h1:"Qué pagas por cada kWh.",
    desc:"PVPC, tarifa valle y precio medio de carga rápida.",
    inputs:[num("pvc","PVPC medio",0.21,"€/kWh",0.05,0.5,0.01),num("valle","Tarifa valle",0.13,"€/kWh",0.05,0.5,0.01),num("dc","Carga rápida",0.59,"€/kWh",0.2,1,0.01)],
    calc:v=>({out:[{l:"PVPC",v:eur2(v.pvc)+"/kWh"},{l:"Valle",v:eur2(v.valle)+"/kWh"},{l:"Rápida",v:eur2(v.dc)+"/kWh"},{l:"Ahorro valle",v:nf0.format((1-v.valle/v.pvc)*100)+" %"}],
      note:(typeof LIVE!=="undefined"&&LIVE.pvpcAvg)?`PVPC real ${LIVE.pvpcDate}: media ${LIVE.pvpcAvg.toFixed(3)} €/kWh, valle ${LIVE.pvpcMin.toFixed(3)}, punta ${LIVE.pvpcMax.toFixed(3)} · ${LIVE.source.pvpc}.`:"El PVPC cambia cada hora. Consulta el valor real en ESIOS antes de decidir."})},

  { id:"ayudas", cat:"finance", name:"Ayudas y deducciones", h1:"Qué ayudas te corresponden.",
    desc:"Suma las ayudas que hayas confirmado y mira el precio efectivo. Con enlaces a las fuentes oficiales.",
    inputs:[selx("ambito",["Todas","Estatal","Autonómicas","Locales"]),num("precio","Precio del coche",42000,"€",15000,120000,1000),num("irpf","Deducción IRPF confirmada",0,"€",0,10000,100),num("ccaa","Ayuda autonómica confirmada",0,"€",0,10000,100),num("cargador","Instalación del cargador",2000,"€",0,6000,100),num("ayudacarga","Ayuda para el cargador",0,"€",0,4000,100)],
    calc:v=>{ const efectivo=v.precio-v.irpf-v.ccaa+v.cargador-v.ayudacarga;
      const L=[["AEAT (IRPF)","https://sede.agenciatributaria.gob.es"],["IDAE","https://www.idae.es"],["Madrid","https://www.comunidad.madrid"],["Cataluña","https://web.gencat.cat"],["Valencia","https://www.gva.es"],["Andalucía","https://www.juntadeandalucia.es"],["País Vasco","https://www.euskadi.eus"]];
      const lv={"Estatal":"ESTADO","Autonómicas":"AUTONOMICA","Locales":"LOCAL"}[v.ambito];
      const aids=((typeof LIVE!=="undefined"&&LIVE.aids)?LIVE.aids:[]).filter(x=>!lv||x.nivel===lv).slice(0,12);
      const list=aids.length?`<h3 style="margin-top:20px;font-size:15px;font-weight:600">Convocatorias publicadas en la BDNS</h3><ul style="list-style:none;padding:0;margin-top:8px">${aids.map(x=>`<li style="padding:10px 0;border-bottom:1px solid var(--rule)"><a href="https://www.infosubvenciones.es/bdnstrans/GE/es/convocatorias/${x.num}" target="_blank" rel="noopener noreferrer" style="color:var(--ink);text-decoration:none;font-weight:500">${x.title}</a><div style="font-size:12px;color:var(--muted);margin-top:2px">${x.date.split("-").reverse().join("/")} · ${x.region}${x.nivel==="ESTADO"?"":""}</div></li>`).join("")}</ul>`:"";
      const html=`${list}<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">${L.map(([n,u])=>`<a class="chip" href="${u}" target="_blank" rel="noopener noreferrer">${n} ↗</a>`).join("")}</div>`;
      return {out:[{l:"Precio del coche",v:eur(v.precio)},{l:"Ayudas",v:eur(v.irpf+v.ccaa+v.ayudacarga)},{l:"Cargador",v:eur(v.cargador)},{l:"Precio efectivo",v:eur(efectivo)}],
        html,note:"No inventamos importes. Las convocatorias salen de la Base de Datos Nacional de Subvenciones (BDNS) y se actualizan cada día: abre cada una para ver cuantías, plazos y requisitos. Escribe lo que te corresponda y verás el precio efectivo."}; }},

  { id:"instalacion", cat:"finance", name:"Instalación de cargador", h1:"Cuánto cuesta cargar en casa.",
    desc:"Wallbox, instalación, potencia y subvención.",
    inputs:[num("potencia","Potencia",7.4,"kW",3.7,22,3.7),num("distancia","Distancia al cuadro",15,"m",2,50,1)],
    calc:v=>{ const wall=480+v.potencia*70, inst=250+v.distancia*22; return {
      out:[{l:"Wallbox",v:eur(wall)},{l:"Instalación",v:eur(inst)},{l:"Total",v:eur(wall+inst)},{l:"Con subvención",v:eur((wall+inst)*.7)}],
      note:"Incluye cableado y protecciones básicas. Necesitas proyecto técnico si superas 40 A."}; }},
  { id:"dimensionado", cat:"finance", name:"Dimensionado de la instalación", h1:"La potencia que necesitas.",
    desc:"Corriente, cable y protecciones orientativas según la potencia de tu cargador.",
    inputs:[selx("pot",["7,4 kW monofásico","3,7 kW monofásico","11 kW trifásico","22 kW trifásico"])],
    calc:v=>{ const kw=parseFloat(v.pot.replace(",",".")), tri=/trif/.test(v.pot);
      const amp=tri?kw*1000/(Math.sqrt(3)*400):kw*1000/230;
      const brk=[10,16,20,25,32,40,50,63].find(x=>x>=amp-0.5);
      const sec=brk<=16?"4 mm²":"6 mm²";
      return {out:[{l:"Corriente",v:nf1.format(amp)+" A"+(tri?" por fase":"")},{l:"Cable",v:(tri?"5×":"3×")+sec},{l:"Magnetotérmico",v:(tri?"4P ":"2P ")+"C"+brk+" A"},{l:"Potencia contratada",v:"≥ "+Math.ceil(kw+3)+" kW"}],
        table:table(["Elemento","Valor orientativo"],[["Diferencial",(tri?"4P ":"2P ")+"40 A, 30 mA, tipo A con detección de CC o tipo B"],["Línea","Dedicada desde el cuadro, según REBT ITC-BT-52"],["Resto de la casa","Suma unos 3 kW a la potencia contratada o usa gestión dinámica"]]),
        note:"Cálculo orientativo con tensión 230/400 V. La sección real depende de la distancia y del método de instalación. Siempre con instalador autorizado y según el REBT."}; }},

  { id:"residual", cat:"finance", name:"Valor residual", h1:"Qué vale tu coche en 5 años.",
    desc:"Escenario de depreciación con el porcentaje anual que tú elijas.",
    inputs:[car("a"),num("anos","Años",5,"",1,10,1),num("dep","Depreciación anual",12,"%",5,25,1)],
    calc:v=>{ const c=CARS[v.a], p0=c.price||c.priceDe, f=Math.pow(1-v.dep/100,v.anos), val=p0?p0*f:null; return {
      out:[{l:"Precio nuevo",v:nd(p0?eur(p0):null)},{l:"Valor final",v:nd(val?eur(val):null)},{l:"Depreciación total",v:nf0.format((1-f)*100)+" %"},{l:"Coste por año",v:nd(val?eur((p0-val)/v.anos):null)}],
      note:(c.price?"Precio: Autocasion España. ":(c.priceDe?"Precio: RRP de Alemania (no hay precio español). ":"Sin precio publicado para este modelo. "))+"Escenario, no una predicción: el porcentaje anual lo eliges tú. La batería y la garantía influyen mucho en el valor de reventa."}; }},

  { id:"amortizacion", cat:"finance", name:"Amortización", h1:"¿Cuándo se paga solo?",
    desc:"Años que tardas en compensar la diferencia de precio inicial.",
    inputs:[num("dif","Sobreprecio EV",6000,"€",0,30000,500),num("km","Km al año",15000,"km",5000,40000,1000),num("ahorro","Ahorro por 100 km",7.5,"€",1,20,0.5)],
    calc:v=>{ const anual=v.km/100*v.ahorro, years=v.dif/anual; return {
      out:[{l:"Ahorro anual",v:eur(anual)},{l:"Años",v:nf1.format(years)},{l:"Km de equilibrio",v:nf0.format(v.dif/v.ahorro*100)+" km"},{l:"Ahorro a 10 años",v:eur(anual*10-v.dif)}],
      note:"No incluye ayudas ni financiación; las puedes sumar en TCO."}; }},

  { id:"alquiler", cat:"finance", name:"Alquiler vs compra", h1:"¿Renting o compra?",
    desc:"Compara el coste de tres años de renting frente a la compra.",
    inputs:[num("precio","Precio del coche",42000,"€",15000,100000,1000),num("cuota","Cuota renting",420,"€/mes",100,1500,10),num("km","Km al año",15000,"km",5000,40000,1000)],
    calc:v=>{ const rent=v.cuota*36, buy=v.precio-v.precio*Math.pow(.88,3)+v.km/100*16.8*.24*3; return {
      out:[{l:"Renting 3 años",v:eur(rent)},{l:"Compra 3 años",v:eur(buy)},{l:"Diferencia",v:eur(buy-rent)},{l:"Mejor opción",v:buy>rent?"Renting":"Compra"}],
      note:"El renting suele incluir mantenimiento y seguro; la compra, no."}; }},

  { id:"huella", cat:"finance", name:"Huella de carbono", h1:"Cuánto CO₂ evitas.",
    desc:"Emisiones de tu ruta frente a un coche de gasolina.",
    inputs:[num("km","Distancia",617,"km",10,3000,10),num("kwh","Consumo",16.8,"kWh/100",8,30,0.1),num("mix","Factor eléctrico",0.08,"kg/kWh",0.02,0.6,0.01)],
    calc:v=>{ const ev=v.km/100*v.kwh*v.mix, gas=v.km/100*7.5*2.31; return {
      out:[{l:"Eléctrico",v:nf1.format(ev)+" kg"},{l:"Gasolina",v:nf1.format(gas)+" kg"},{l:"Evitado",v:nf1.format(gas-ev)+" kg"},{l:"Por km",v:nf1.format((gas-ev)/v.km*1000)+" g"}],
      note:(typeof LIVE!=="undefined"&&LIVE.grid)?`Factor eléctrico: media de 7 días de la generación en España (${nf0.format(LIVE.grid.ren7)} % renovable), hoy ${LIVE.grid.kg.toFixed(3)} kg/kWh (${LIVE.grid.date}). Fuente: Red Eléctrica (REData). Solo emisiones de generación, sin ciclo de vida ni importaciones.`:"Factor eléctrico de España estimado; varía por día. Con datos en vivo se rellena con la media semanal de Red Eléctrica."};}},

  // ---------- SIMULADORES ----------
  { id:"degradacion", cat:"sim", name:"Degradación de batería", h1:"Cómo envejece tu batería.",
    desc:"Estado de salud estimado tras años, kilómetros y clima.",
    inputs:[car("a"),num("anos","Años",8,"",1,15,1),num("km","Km al año",15000,"km",5000,40000,1000),selx("clima",["Templado","Frío","Caluroso"])],
    calc:v=>{ const c=CARS[v.a]; const cl={"Templado":0.012,"Frío":0.018,"Caluroso":0.021}[v.clima];
      const kmTot=v.km*v.anos, calendario=cl*v.anos, uso=Math.min(.25, kmTot*5e-7);
      const soh=Math.max(.55, 1-calendario-uso); return {
      out:[{l:"Salud estimada",v:nf0.format(soh*100)+" %"},{l:"Capacidad",v:nf1.format(c.battery*soh)+" kWh"},{l:"Autonomía real",v:nf0.format(c.range*soh)+" km"},{l:"Años",v:String(v.anos)}],
      table:table(["Desgaste","Cuánto pesa"],[["Kilómetros recorridos",nf0.format(kmTot)+" km"],["Envejecimiento por el paso del tiempo ("+v.clima.toLowerCase()+")",nf1.format(calendario*100)+" %"],["Desgaste por cargas y descargas",nf1.format(uso*100)+" %"],["Pérdida total",nf1.format((1-soh)*100)+" %"]]),
      note:"Modelo orientativo, no una medición: 1,2 % de salud al año por el paso del tiempo (1,8 % en frío, 2,1 % en caluroso) y 0,05 % por cada 1.000 km recorridos. Cargar al 80 % y evitar el calor alarga la vida de la batería."}; }},

  { id:"aerodinamico", cat:"sim", name:"Aerodinámica", h1:"El viento también cuenta.",
    desc:"Consumo según velocidad, coeficiente aerodinámico y viento.",
    inputs:[num("vel","Velocidad",120,"km/h",50,160,5),num("cd","Coeficiente Cd",0.23,"",0.18,0.4,0.01),num("viento","Viento en contra",0,"km/h",-30,40,5)],
    calc:v=>{ const base=12+((v.vel+v.viento)/100)**2*v.cd*8; return {
      out:[{l:"Consumo",v:nf1.format(base)+" kWh/100"},{l:"Autonomía",v:nf0.format(75/base*100)+" km"},{l:"Aero",v:nf1.format(base-12)+" kWh/100"},{l:"Velocidad efectiva",v:(v.vel+v.viento)+" km/h"}],
      note:"La aerodinámica crece con el cuadrado de la velocidad."}; }},

  { id:"neumaticos", cat:"sim", name:"Neumáticos", h1:"Lo que cuesta una rueda.",
    desc:"Coste por 10.000 km según clase energética y presión.",
    inputs:[selx("clase",["A","B","C","D"]),num("presion","Presión",2.4,"bar",1.8,3.2,0.1)],
    calc:v=>{ const penalty={"A":0,"B":0.04,"C":0.09,"D":0.15}[v.clase]; const extra=(2.4-v.presion)*0.03; return {
      out:[{l:"Sobreconsumo",v:nf1.format((penalty+extra)*100)+" %"},{l:"Coste 10.000 km",v:eur2((16.8*(1+penalty+extra)*100)*.24)},{l:"Presión",v:nf1.format(v.presion)+" bar"},{l:"Clase",v:v.clase}],
      note:"Revisa la presión en frío cada mes; afecta a consumo y seguridad."}; }},

  { id:"quimica", cat:"sim", name:"Química de batería", h1:"LFP o NMC, decidido.",
    desc:"Diferencias reales de longevidad, densidad y carga rápida.",
    inputs:[selx("quim",["LFP","NMC"])],
    calc:v=>{ const d=v.quim==="LFP"?{ciclos:3000,dens:160,dc:150}:{ciclos:1800,dens:250,dc:250}; return {
      out:[{l:"Ciclos",v:nf0.format(d.ciclos)},{l:"Densidad",v:d.dens+" Wh/kg"},{l:"Carga DC",v:d.dc+" kW"},{l:"Mejor para",v:v.quim==="LFP"?"Urbano y longevidad":"Viajes y peso"}],
      note:"El LFP aguanta más ciclos; el NMC ofrece más autonomía por peso."}; }},

  { id:"garaje", cat:"sim", name:"¿Entra en tu plaza?", h1:"Mide antes de comprar.",
    desc:"Largo, ancho y margen de maniobra en tu plaza.",
    inputs:[car("a"),num("largo","Largo plaza",5.0,"m",3,8,0.1),num("ancho","Ancho plaza",2.5,"m",2,4,0.1)],
    calc:v=>{ const c=CARS[v.a]; const margen=c.len?(v.largo*1000-c.len)/2:null; return {
      out:[{l:"Coche",v:nd(c.len)+" × "+nd(c.wid)+" mm"},{l:"Plaza",v:(v.largo*1000)+" × "+(v.ancho*1000)+" mm"},{l:"Margen",v:margen!==null?nf0.format(margen)+" mm a cada lado":"Sin dato"},{l:"Resultado",v:c.len?(v.largo*1000>=c.len+300&&v.ancho*1000>=c.wid+300?"Entra con margen":"Justo"):"Sin dato"}],
      html:'<div id="car3d" style="margin-top:16px"></div><p class="source" style="margin-top:8px">Vista 3D a escala real. Arrastra para girar y comprobar el hueco.</p>',
      note:"Deja al menos 30 cm a cada lado para abrir puertas."}; }},

  { id:"invierno", cat:"sim", name:"Autonomía invernal", h1:"Qué pasa a 0 °C.",
    desc:"Autonomía real con frío, calefacción y neumáticos de invierno.",
    inputs:[car("a"),num("temp","Temperatura",0,"°C",-15,20,1)],
    calc:v=>{ const c=CARS[v.a], loss=Math.min(.32,(20-v.temp)*.012); return {
      out:[{l:"Templado",v:c.range+" km"},{l:"A "+v.temp+" °C",v:nf0.format(c.range*(1-loss))+" km"},{l:"Pérdida",v:nf0.format(loss*100)+" %"},{l:"Consumo",v:nf1.format(c.use/(1-loss))+" kWh/100"}],
      note:"Precalentar el coche enchufado reduce la pérdida."}; }},

  // ---------- RUTAS ----------
  { id:"isocronas", cat:"routes", name:"Mapa de autonomía", h1:"Hasta dónde llegas.",
    desc:"Radio real de autonomía desde tu ciudad, con los escenarios clave.",
    inputs:[car("a"),num("soc","Estado de carga",90,"%",10,100,5)],
    calc:v=>{ const c=CARS[v.a], r=c.range*v.soc/100; return {
      out:[{l:"Templado",v:nf0.format(r)+" km"},{l:"Invierno",v:nf0.format(r*K_WINTER)+" km"},{l:"A 120 km/h",v:nf0.format(r*K_120)+" km"},{l:"Con desnivel",v:nf0.format(r*K_HILLS)+" km"}],
      note:"No es un círculo perfecto: la orografía y el viento deforman el alcance."}; }},

  { id:"buscador", cat:"routes", name:"¿Llego sin parar?", h1:"Respuesta en una frase.",
    desc:"Comprueba si tu coche llega a destino con el estado de carga que tengas.",
    inputs:[car("a"),num("km","Distancia",500,"km",50,1500,10),num("soc","Estado de carga",90,"%",10,100,5)],
    calc:v=>{ const c=CARS[v.a], reach=c.range*v.soc/100; return {
      out:[{l:"Alcance",v:nf0.format(reach)+" km"},{l:"Distancia",v:v.km+" km"},{l:"Margen",v:nf0.format(reach-v.km)+" km"},{l:"Respuesta",v:reach>=v.km?"Sí, sin parar":"No, con 1 parada"}],
      note:"Añade un 10 % de margen si viajas con equipaje o en invierno."}; }},

  { id:"perfil", cat:"routes", name:"Perfil de elevación", h1:"La carretera tiene forma.",
    desc:"Desnivel acumulado y efecto en el consumo de tu ruta.",
    inputs:[num("km","Distancia",617,"km",50,2000,10),num("subida","Desnivel +",4000,"m",0,10000,100),num("bajada","Desnivel −",4668,"m",0,10000,100)],
    calc:v=>{ const por100=m=>m/v.km*100, kwhPorM=1900*9.81/3.6e6;
      const neto=(v.subida-v.bajada)*0.35;
      const efecto=por100(neto)*kwhPorM;
      return {out:[{l:"Sube",v:nf0.format(v.subida)+" m"},{l:"Baja",v:nf0.format(v.bajada)+" m"},{l:"Desnivel neto",v:nf0.format(neto)+" m"},{l:"Efecto en el consumo",v:(efecto>0?"+":"")+nf1.format(efecto)+" kWh/100"}],
        table:table(["Desnivel en la ruta","Metros por cada 100 km"],[["Subida",nf0.format(por100(v.subida))+" m"],["Bajada",nf0.format(por100(v.bajada))+" m"],["Neto",nf0.format(por100(neto))+" m"]]),
        note:"Modelo: 1.900 kg de masa y un 35 % neto tras la regeneración, el mismo criterio que la calculadora de autonomía. 1.000 m de desnivel por cada 100 km son unos 1,8 kWh/100. Si la bajada supera a la subida, el desnivel te devuelve energía y el efecto sale en negativo."}}},

  { id:"compartir", cat:"routes", name:"Rutas compartibles", h1:"Comparte sin cuenta.",
    desc:"Comparte tu cálculo con un enlace: coche y distancia ya cargados.",
    inputs:[car("a"),num("km","Distancia",617,"km",50,2000,10)],
    calc:v=>{ const url=`${location.origin}${location.pathname}#compartir?a=${encodeURIComponent(v.a)}&km=${v.km}`;
      return {out:[{l:"Coche",v:v.a},{l:"Distancia",v:v.km+" km"},{l:"Estado",v:"Sin cuenta"},{l:"Enlace",v:"Listo"}],
        html:`<div style="margin-top:16px"><p class="mono" id="enlace-compartir" style="margin:0;padding:10px;border:1px solid var(--rule);word-break:break-all">${url}</p><div style="margin-top:10px"><button class="btn" id="copiar-enlace">Copiar enlace</button></div></div>`,
        note:"El enlace lleva el coche y la distancia ya cargados: quien lo abre ve tu mismo cálculo. No guardamos nada en un servidor."}; },
    after:(v,root)=>{ const b=root.querySelector("#copiar-enlace"); if(!b) return;
      b.addEventListener("click", async()=>{ const p=root.querySelector("#enlace-compartir"), url=p.textContent;
        try{ await navigator.clipboard.writeText(url); b.textContent="Enlace copiado"; }
        catch(e){ // Sin permiso de portapapeles: se selecciona el texto para copiar con ⌘C.
          const r=document.createRange(); r.selectNodeContents(p);
          const s=getSelection(); s.removeAllRanges(); s.addRange(r);
          b.textContent="Enlace seleccionado: pulsa ⌘C"; } }); } },

  { id:"alertas", cat:"routes", name:"Alertas de precio", h1:"Carga cuando vale la pena.",
    desc:"Precio objetivo y franja horaria, sin notificaciones invasivas.",
    inputs:[num("objetivo","Precio objetivo",0.25,"€/kWh",0.1,0.8,0.01),num("franja","Hora",22,"h",0,23,1)],
    calc:v=>{
      const live=(typeof LIVE!=="undefined")?LIVE:{};
      const current=live.pvpcAvg||0.212;
      const hour=live.pvpcValues?live.pvpcValues[v.franja]||current:current;
      const reached=hour<=v.objetivo;
      const html=`<div style="margin-top:16px;padding:14px;border:1px solid var(--rule)">
        <span class="k">Precio PVPC a las ${v.franja}:00</span>
        <span class="v" style="font-size:22px">${eur2(hour)}/kWh</span>
        <p style="font-size:12px;color:var(--muted);margin-top:8px">${reached?"Precio objetivo alcanzado. Es un buen momento para cargar.":"Por encima del objetivo. Puedes guardar la alerta y volver más tarde."}</p>
        <button class="btn" style="margin-top:12px" onclick="savePriceAlert(${v.objetivo},${v.franja})">Guardar alerta en este dispositivo</button>
      </div>`;
      return {out:[{l:"Objetivo",v:eur2(v.objetivo)+"/kWh"},{l:"Ahora",v:eur2(hour)+"/kWh"},{l:"Ahorro en 50 kWh",v:eur2(Math.max(0,(current-v.objetivo))*50)},{l:"Estado",v:reached?"Alcanzada":"Pendiente"}],
        html,note:`PVPC real ${live.pvpcDate||"snapshot"}. La alerta se guarda en localStorage y usa notificaciones del navegador sin cuenta.`};
    }},

  // ---------- SERVICIO ----------
  { id:"talleres", cat:"service", name:"Talleres EV", h1:"Quién te lo arregla.",
    desc:"Red oficial de servicio por marca: localizador del fabricante, sin intermediarios.",
    inputs:[],
    calc:v=>{
      const list=(typeof LIVE!=="undefined"&&LIVE.workshops?LIVE.workshops:[]);
      const html=`<div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:8px">${list.map(w=>`<a href="${w.url}" target="_blank" rel="noopener noreferrer" style="padding:9px 10px;border:1px solid var(--rule);text-decoration:none;color:var(--text);font-size:11px;display:flex;justify-content:space-between"><span>${w.brand}</span><span class="k">Oficial ↗</span></a>`).join("")}</div>`;
      return {out:[{l:"Marcas",v:String(list.length)},{l:"Red",v:"Oficial"},{l:"Cobertura",v:"Nacional"},{l:"Cita",v:"En la web"}],
        html,note:"Enlaces a los sitios oficiales de cada fabricante. Cada marca publica su propio localizador de talleres autorizados, con las provincias donde tiene servicio; no mostramos direcciones sin verificar."};
    }},

  { id:"noticias", cat:"service", name:"Actualidad EV", h1:"Solo lo que importa.",
    desc:"Resumen con fuente citada, sin relleno.",
    inputs:[num("dias","Últimos días",7,"días",1,30,1)],
    calc:v=>{
      const list=(typeof LIVE!=="undefined"&&LIVE.news?LIVE.news:[]).filter(n=>{const t=Date.parse(n.date);return isNaN(t)||t>=Date.now()-v.dias*864e5;}).slice(0,12);
      const html=`<div style="margin-top:16px;display:flex;flex-direction:column">${list.map(n=>`<a href="${n.link}" target="_blank" rel="noopener noreferrer" style="display:block;padding:9px 0;border-bottom:1px solid var(--rule);text-decoration:none;color:var(--text);font-size:12px"><strong>${n.title}</strong><span class="k" style="margin-top:2px;display:block">${n.source} · ${n.date}</span></a>`).join("")}</div>`;
      return {out:[{l:"Periodo",v:v.dias+" días"},{l:"Noticias",v:String(list.length)},{l:"Con fuente",v:String(list.filter(n=>n.source).length)},{l:"Sin fuente",v:String(list.filter(n=>!n.source).length)}],
        html,note:"Titulares reales del RSS de Google News España, con medio y fecha. Actualizados por el cron diario."};
    }},

  { id:"pruebas", cat:"service", name:"Pruebas medidas", h1:"Consumo medido, no catálogo.",
    desc:"Autonomía real y consumo derivado, con la fuente de cada cifra.",
    inputs:[car("a")],
    calc:v=>{ const c=CARS[v.a]; return {out:[{l:"Modelo",v:v.a},{l:"Autonomía real",v:c.range+" km"},{l:"WLTP",v:c.wltp+" km"},{l:"Consumo",v:nf1.format(c.use)+" kWh/100"}],
      table:table(["Dato","Valor","Origen"],[["Autonomía real",c.range+" km",c.rangeSource],["WLTP",c.wltp+" km","OpenEV Data"],["Batería útil",c.battery+" kWh","OpenEV Data"],["Maletero",nd(c.boot)+" L","ev-database.org"]]),
      note:"No son pruebas propias: son cifras reales publicadas por ev-database.org y OpenEV Data, con su procedencia."}; }},

  { id:"360", cat:"service", name:"Vista 360º", h1:"Mira el coche por dentro.",
    desc:"Visor 3D con las dimensiones reales del modelo. Arrastra para girar.",
    inputs:[car("a")],
    calc:v=>{ const c=CARS[v.a]; return {out:[{l:"Modelo",v:v.a},{l:"Largo",v:(c.len||"—")+" mm"},{l:"Ancho",v:(c.wid||"—")+" mm"},{l:"Maletero",v:(c.boot||"—")+" L"}],
      html:'<div id="car3d" style="margin-top:16px"></div><p class="source" style="margin-top:8px">Modelo 3D generado con las dimensiones reales de ev-database.org.</p>',
      note:"El visor usa geometría procedural a escala real; no es una fotografía ni un render de marketing."}; }},

  { id:"pwa", cat:"service", name:"Modo offline", h1:"Que no te falle el móvil.",
    desc:"Comprueba que la app está instalada y guarda tu ruta en el dispositivo.",
    inputs:[car("a"),num("km","Distancia",617,"km",50,2000,10)],
    calc:v=>{ let guardada=null;
      try{ guardada=JSON.parse(localStorage.getItem("voltieri-ruta")||"null"); }catch(e){}
      const fecha=guardada&&guardada.at?new Date(guardada.at).toLocaleDateString("es-ES"):null;
      return {out:[{l:"Ruta",v:v.km+" km"},{l:"Coche",v:v.a},{l:"Modo",v:matchMedia("(display-mode: standalone)").matches?"Instalada":"Navegador"},{l:"Caché",v:("serviceWorker" in navigator && navigator.serviceWorker.controller)?"Activa":"Iniciando"}],
        html:`<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button class="btn" id="guardar-ruta">Guardar esta ruta en el dispositivo</button>${guardada?`<span class="source">Ya guardada: ${guardada.a} · ${guardada.km} km · ${fecha}</span>`:""}</div>`,
        note:"La web tiene manifest y service worker: funciona sin cobertura y se puede instalar desde el menú del navegador. La ruta se guarda en tu propio dispositivo (localStorage), sin cuenta ni servidor."}; },
    after:(v,root)=>{ const b=root.querySelector("#guardar-ruta"); if(!b) return;
      b.addEventListener("click",()=>{ try{ localStorage.setItem("voltieri-ruta", JSON.stringify({a:v.a,km:v.km,at:new Date().toISOString()})); b.textContent="Ruta guardada"; b.disabled=true; }
      catch(e){ b.textContent="Este navegador no deja guardar"; } }); } },

  { id:"api", cat:"service", name:"API pública", h1:"Datos abiertos para todos.",
    desc:"Consulta los mismos datos que usa la web.",
    inputs:[],
    calc:v=>({
      html:`<pre class="mono" id="api-sample" style="margin-top:16px;padding:12px;border:1px solid var(--rule);overflow:auto">Cargando api/data.json…</pre>
        <p class="source" style="margin-top:10px"><a href="api/data.json" target="_blank" rel="noopener noreferrer">Abrir api/data.json en el navegador ↗</a></p>`,
        out:[{l:"Formato",v:"JSON estático"},{l:"Autenticación",v:"No"},{l:"Licencia",v:"La de cada fuente"}],
        note:"API real servida como archivo JSON estático en el CDN, sin clave ni backend. Lo regenera el cron diario. Cada bloque conserva la licencia de su fuente: los modelos son de OpenEV Data (CDLA-Permissive-2.0), los cargadores de MITECO/RIPREE y la tarifa de ESIOS-REE; son datos públicos y se pueden usar citando la fuente."}),
    after:async(v,root)=>{ const pre=root.querySelector("#api-sample"); if(!pre) return;
      try{ const d=await (await fetch("api/data.json",{cache:"no-store"})).json();
        const m=(d.models||[])[0], ch=(d.chargers||[])[0];
        pre.textContent="GET api/data.json\n\n"+JSON.stringify({source:d.source,version:d.version,license:d.license,sources:d.sources,
          counts:{modelos:(d.models||[]).length,cargadores:(d.chargers||[]).length,precios_pvpc:((d.pvpc&&d.pvpc.prices_eur_mwh)||[]).length},
          ejemplo_de_modelo:m, ejemplo_de_cargador:ch, pvpc:d.pvpc},null,2);
      }catch(e){ pre.textContent="No se pudo leer api/data.json."; } } },

  { id:"mantenimiento", cat:"service", name:"Mantenimiento EV", h1:"Lo que se ahorra en taller.",
    desc:"Revisiones, frenos y fluidos frente a un motor de combustión.",
    inputs:[num("anos","Años",8,"",1,15,1)],
    calc:v=>({out:[{l:"EV (modelo)",v:eur(v.anos*210)},{l:"Gasolina (modelo)",v:eur(v.anos*480)},{l:"Ahorro",v:eur(v.anos*270)},{l:"Por año",v:eur(270)}],
      html:`<p class="source" style="margin-top:14px">Fuente del dato de baterías: <a href="https://www.recurrentauto.com/research/how-long-do-ev-batteries-last" target="_blank" rel="noopener noreferrer">Recurrent · How long do EV batteries last? (11/11/2025) ↗</a></p>`,
      note:"Estimación de modelo, no tarifa de taller. Se apoya en dos hechos publicados: menos piezas móviles y regeneración de frenos; y el estudio de Recurrent sobre 30.000+ vehículos eléctricos (11/11/2025), que sitúa el reemplazo de batería en el 0,3 % de los coches de 2022 en adelante excluyendo campañas de servicio, y por debajo del 4 % en el total de la flota analizada."})},

  { id:"viaje-coste", cat:"finance", name:"Coste total del viaje", h1:"Cuánto te sale el viaje entero.",
    desc:"Energía real, peajes y aparcamiento. No solo el kWh.",
    inputs:[num("km","Distancia",617,"km",50,3000,10),num("use","Consumo",16.8,"kWh/100",10,30,0.1),num("peaje","Peajes",28,"€",0,300,1),num("parking","Parking",12,"€/día",0,100,1),num("dias","Días",2,"",1,14,1)],
    calc:v=>{
      const pvpc=(typeof LIVE!=="undefined"&&LIVE.pvpcAvg)?LIVE.pvpcAvg:.212;
      const energy=v.km/100*v.use*pvpc, parking=v.parking*v.dias, total=energy+v.peaje+parking;
      return {out:[{l:"Energía",v:eur(energy)},{l:"Peajes",v:eur(v.peaje)},{l:"Parking",v:eur(parking)},{l:"Total",v:eur(total)}],
        table:table(["Concepto","Importe","€/km"],[["Energía PVPC",eur(energy),(energy/v.km).toFixed(3)],["Peajes",eur(v.peaje),(v.peaje/v.km).toFixed(3)],["Parking",eur(parking),(parking/v.km).toFixed(3)]]),
        note:`PVPC real ${typeof LIVE!=="undefined"?LIVE.pvpcDate:"snapshot"}. Peajes y parking los introduces tú porque no hay fuente abierta unificada.`};
    }},

  { id:"soh-usado", cat:"sim", name:"Salud de batería de ocasión", h1:"Qué batería te estás comprando.",
    desc:"Estado de salud estimado de un eléctrico de segunda mano.",
    inputs:[car("a"),selx("quim",["NMC","LFP"]),num("anos","Años",6,"",1,15,1),num("km","Km",90000,"km",10000,300000,5000)],
    calc:v=>{
      const rate=v.quim==="LFP"?.008:.013;
      const calendario=rate*v.anos, uso=Math.min(.25, v.km*5e-7);
      const soh=Math.max(.55,1-calendario-uso);
      const c=CARS[v.a], cap=c.battery*soh, range=Math.round(c.range*soh);
      return {out:[{l:"Salud",v:nf0.format(soh*100)+" %"},{l:"Capacidad",v:nf1.format(cap)+" kWh"},{l:"Autonomía",v:range+" km"},{l:"Química",v:v.quim}],
        table:table(["Desgaste","Cuánto pesa"],[["Antigüedad ("+v.anos+" años)",nf1.format(calendario*100)+" %"],["Kilometraje ("+nf0.format(v.km)+" km)",nf1.format(uso*100)+" %"],["Pérdida total",nf1.format((1-soh)*100)+" %"]]),
        note:"Modelo de degradación por ciclos y calendario: 1,3 % de salud al año en NMC (0,8 % en LFP) y 0,05 % por cada 1.000 km recorridos. No sustituye a un informe SOH real del vehículo; para comprar pide siempre el certificado."};
    }},

  { id:"remolque", cat:"sim", name:"Remolque y carga útil", h1:"Lo que pesa de verdad.",
    desc:"Impacto del remolque y el equipaje en el consumo.",
    inputs:[num("peso","Peso extra",300,"kg",0,1500,50),num("vel","Velocidad",110,"km/h",70,140,5),num("base","Consumo base",16.8,"kWh/100",10,30,0.1)],
    calc:v=>{
      const factor=1+v.peso/1200*.22+Math.pow((v.vel-90)/90,2)*.18;
      const real=v.base*factor;
      return {out:[{l:"Consumo",v:nf1.format(real)+" kWh/100"},{l:"Sobreconsumo",v:nf0.format((factor-1)*100)+" %"},{l:"Autonomía",v:nf0.format(75/real*100)+" km"},{l:"Peso",v:v.peso+" kg"}],
        note:"Modelo físico: la masa afecta a rodadura y gravedad; la velocidad, a aerodinámica. Los remolques empeoran además el Cd."};
    }},

  { id:"informe", cat:"service", name:"Informe de decisión", h1:"Todo en un solo papel.",
    desc:"Genera un resumen con cifras y fuentes para llevarte.",
    inputs:[car("a"),num("km","Km al año",15000,"km",5000,40000,1000)],
    calc:v=>{
      const c=CARS[v.a];
      const txt=`VOLTIERI · INFORME DE DECISIÓN\n\nModelo: ${v.a} (${c.year})\nAutonomía real: ${c.range} km (${c.rangeSource})\nWLTP: ${c.wltp} km · Batería: ${c.battery} kWh\nConsumo derivado: ${c.use} kWh/100\nCarga DC: ${c.dc} kW · Maletero: ${nd(c.boot)} L\nPrecio España: ${c.price?eur(c.price)+" ("+c.priceSource+")":"Sin dato"}\nUso anual: ${v.km} km\n\nFuentes: OpenEV Data v1.24.0, ev-database.org, Autocasión, ESIOS, MITECO.`;
      return {out:[{l:"Modelo",v:v.a},{l:"Autonomía",v:c.range+" km"},{l:"Consumo",v:c.use+" kWh/100"},{l:"Fuentes",v:"4"}],
        html:`<pre class="mono" style="margin-top:16px;padding:14px;border:1px solid var(--rule);white-space:pre-wrap">${txt}</pre>`,
        note:"Informe generado con datos verificados. Se puede copiar y compartir sin cuenta."};
    }},

  { id:"casa-publica", cat:"finance", name:"Casa vs carga pública", h1:"Dónde te sale más barato.",
    desc:"Compara el PVPC de tu casa con la tarifa que pagas en la calle.",
    inputs:[num("kwh","Energía",50,"kWh",10,100,5),num("tarifa","Tarifa pública",0.55,"€/kWh",0.1,1,0.01)],
    calc:v=>{
      const pvpc=(typeof LIVE!=="undefined"&&LIVE.pvpcAvg)?LIVE.pvpcAvg:.212;
      const casa=v.kwh*pvpc, calle=v.kwh*v.tarifa;
      return {out:[{l:"En casa",v:eur(casa)},{l:"En la calle",v:eur(calle)},{l:"Diferencia",v:eur(calle-casa)},{l:"Ratio",v:(v.tarifa/pvpc).toFixed(1)+"×"}],
        note:`PVPC real ${typeof LIVE!=="undefined"?LIVE.pvpcDate:"snapshot"}. Las tarifas públicas no son abiertas: introduce la tuya.`};
    }},
];

const CATS = {
  compare: { label:"Comparadores", file:"compare.html" },
  finance: { label:"Costes y fiscalidad", file:"finance.html" },
  sim: { label:"Simuladores", file:"sim.html" },
  routes: { label:"Rutas", file:"routes.html" },
  service: { label:"Servicios", file:"service.html" },
};

// Herramientas con página propia: se enlazan, no se duplican aquí.
const DEDICATED = {
  catalogo: ["catalog.html","Catálogo"],
  autonomia: ["range.html","Autonomía real"],
  tco: ["tco.html","TCO"],
  carga: ["charge.html","Curva de carga"],
  cargadores: ["chargers.html","Mapa de cargadores"],
  coste100: ["tool-shell.html","Coste por 100 km"],
};
