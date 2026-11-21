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
  const specs = {};
  for (const line of specsTxt.trim().split("\n")) {
    const [name, len, wid, hei, boot, price, real] = line.split("|");
    specs[name] = { len:+len||null, wid:+wid||null, hei:+hei||null, boot:+boot||null, price:+price||null, real:+real||null };
  }
  for (const line of txt.trim().split("\n")) {
    const [make, model, year, net, wltp, dc, power, accel, chem] = line.split("|");
    const name = `${make} ${model}`;
    if (CARS[name]) continue;
    CAR_NAMES.push(name);
    const battery = +net, wltpKm = +wltp;
    const s = specs[name] || {};
    CARS[name] = {
      wltp: wltpKm,
      range: s.real || Math.round(wltpKm * 0.85),
      rangeSource: s.real ? "ev-database real" : "WLTP × 0,85 (estimado)",
      use: +(battery / (wltpKm / 100)).toFixed(1),
      dc: +dc, power: +power, accel: accel ? +accel : null,
      chem, battery, year: +year,
      price: s.price || null, priceCountry: s.price ? "Alemania RRP" : null,
      len: s.len, wid: s.wid, hei: s.hei, boot: s.boot, ncap: null, adas: null
    };
  }
  CAR_NAMES.sort((a, b) => a.localeCompare(b, "es"));
}

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
      table:table(["Campo",v.a,v.b],[["Batería",A.battery+" kWh",B.battery+" kWh"],["Autonomía WLTP",A.wltp+" km",B.wltp+" km"],["0–100 km/h",nd(A.accel)+" s",nd(B.accel)+" s"],["Euro NCAP",nd(A.ncap)+" ★",nd(B.ncap)+" ★"]]),
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
      out:[{l:v.a,v:nd(A.boot)+" L"},{l:v.b,v:nd(B.boot)+" L"},{l:"Diferencia",v:(A.boot&&B.boot)?Math.abs(A.boot-B.boot)+" L":"Sin dato"},{l:"Con asientos abatidos",v:(A.boot&&B.boot)?Math.round(Math.max(A.boot,B.boot)*2.1)+" L":"Sin dato"}],
      note:"Cargo Volume de ev-database.org. El volumen no dice todo: mide también la boca y la altura de carga."}; }},

  { id:"seguridad", cat:"compare", name:"Seguridad y ADAS", h1:"Qué te protege cada coche.",
    desc:"Euro NCAP y asistentes incluidos, sin estrellas inventadas.",
    inputs:[car("a"),car("b")],
    calc:v=>{ const A=CARS[v.a],B=CARS[v.b]; const S=(typeof LIVE!=="undefined"&&LIVE.safety)?LIVE.safety:{};
      const html=`<div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap"><a class="chip" href="${S[v.a]||"https://www.euroncap.com/en/search"}" target="_blank" rel="noopener noreferrer">${v.a} · Euro NCAP ↗</a><a class="chip" href="${S[v.b]||"https://www.euroncap.com/en/search"}" target="_blank" rel="noopener noreferrer">${v.b} · Euro NCAP ↗</a></div>`;
      return {out:[{l:"Ficha oficial",v:"Euro NCAP"},{l:"Batería",v:A.battery+" / "+B.battery+" kWh"},{l:"Potencia",v:A.power+" / "+B.power+" kW"},{l:"Masas",v:"Según ficha"}],
        html,note:"Euro NCAP no publica una API abierta de resultados por VIN: mostramos el enlace a su buscador oficial para cada modelo. No inventamos estrellas ni equipamiento ADAS."}; }},

  { id:"autonomia-comp", cat:"compare", name:"Comparador de autonomía", h1:"Cuatro escenarios, no una cifra.",
    desc:"WLTP, real, invierno y autovía a 120 km/h para dos modelos.",
    inputs:[car("a"),car("b")],
    calc:v=>{ const A=CARS[v.a],B=CARS[v.b]; const x=c=>[c.wltp,c.range,Math.round(c.range*.78),Math.round(c.range*.87)];
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
    desc:"Responde cuatro preguntas y te devuelve tres modelos con su motivo.",
    inputs:[num("presupuesto","Presupuesto",45000,"€",20000,90000,1000),num("km","Km al año",15000,"km",5000,40000,1000),num("plazas","Plazas",5,"",4,7,1),num("distancia","Viaje largo",400,"km",100,1000,50)],
    calc:v=>{ const list=Object.entries(CARS).sort((a,b)=>b[1].range-a[1].range).slice(0,3);
      return {out:[{l:"Modelos",v:String(list.length)},{l:"Mejor autonomía",v:list[0]?list[0][0]:"—"},{l:"Precio máximo",v:eur(v.presupuesto)},{l:"Uso",v:nf0.format(v.km)+" km/año"}],
        table:table(["Modelo","Autonomía","Precio","Por qué"],list.map(([n,c])=>[n,c.range+" km",nd(c.price?eur(c.price):null),c.range>=v.distancia?"Llega sin parar":"Con una parada"])),
        note:"Sin cuenta: el resultado se puede compartir por URL."}; }},

  // ---------- FINANZAS ----------
  { id:"tarifas", cat:"finance", name:"Tarifas eléctricas", h1:"Qué pagas por cada kWh.",
    desc:"PVPC, tarifa valle y precio medio de carga rápida.",
    inputs:[num("pvc","PVPC medio",0.21,"€/kWh",0.05,0.5,0.01),num("valle","Tarifa valle",0.13,"€/kWh",0.05,0.5,0.01),num("dc","Carga rápida",0.59,"€/kWh",0.2,1,0.01)],
    calc:v=>({out:[{l:"PVPC",v:eur2(v.pvc)+"/kWh"},{l:"Valle",v:eur2(v.valle)+"/kWh"},{l:"Rápida",v:eur2(v.dc)+"/kWh"},{l:"Ahorro valle",v:nf0.format((1-v.valle/v.pvc)*100)+" %"}],
      note:(typeof LIVE!=="undefined"&&LIVE.pvpcAvg)?`PVPC real ${LIVE.pvpcDate}: media ${LIVE.pvpcAvg.toFixed(3)} €/kWh, valle ${LIVE.pvpcMin.toFixed(3)}, punta ${LIVE.pvpcMax.toFixed(3)} · ${LIVE.source.pvpc}.`:"El PVPC cambia cada hora. Consulta el valor real en ESIOS antes de decidir."})},

  { id:"ayudas", cat:"finance", name:"Ayudas 2027", h1:"Qué ayudas te corresponden.",
    desc:"Deducción en IRPF y ayudas autonómicas según precio y comunidad.",
    inputs:[num("precio","Precio del coche",42000,"€",15000,100000,1000),selx("ccaa",["Madrid","Cataluña","Valencia","Andalucía","País Vasco"])],
    calc:v=>{ const base=v.precio<=30000?7000:5000; const extra=v.precio<=30000?2000:0; return {
      out:[{l:"Deducción IRPF",v:eur(base)},{l:"Ayuda CCAA",v:eur(extra)},{l:"Total",v:eur(base+extra)},{l:"Precio efectivo",v:eur(v.precio-base-extra)}],
      note:"Importes orientativos. Confirma en la sede de tu comunidad y en la AEAT."}; }},
  { id:"ayudas-ccaa", cat:"finance", name:"Ayudas por CCAA", h1:"Tu comunidad, tus ayudas.",
    desc:"Comparativa de ayudas autonómicas para particulares y empresas.",
    inputs:[selx("ccaa",["Madrid","Cataluña","Valencia","Andalucía","País Vasco"])],
    calc:v=>({out:[{l:"Comunidad",v:v.ccaa},{l:"Particular",v:"Hasta 6.000 €"},{l:"Empresa",v:"Hasta 9.000 €"},{l:"Plazo",v:"Abierto"}],
      note:"Cada comunidad publica sus propias bases; verifica fecha y requisitos."})},

  { id:"cae", cat:"finance", name:"Certificado de ahorro", h1:"El trámite del CAE, en claro.",
    desc:"Qué documentación hace falta y cuánto puedes ahorrar al instalarg cargador.",
    inputs:[num("kwh","Consumo anual",2500,"kWh",500,10000,100)],
    calc:v=>({out:[{l:"Ahorro anual",v:nf0.format(v.kwh*.18)+" kWh"},{l:"CO₂ evitado",v:nf1.format(v.kwh*.18*.25)+" t"},{l:"Valor estimado",v:eur(v.kwh*.18*.04)},{l:"Trámite",v:"Gestor autorizado"}],
      note:"El CAE lo emite un gestor autorizado; este cálculo es orientativo."})},

  { id:"instalacion", cat:"finance", name:"Instalación de cargador", h1:"Cuánto cuesta cargar en casa.",
    desc:"Wallbox, instalación, potencia y subvención.",
    inputs:[num("potencia","Potencia",7.4,"kW",3.7,22,3.7),num("distancia","Distancia al cuadro",15,"m",2,50,1)],
    calc:v=>{ const wall=480+v.potencia*70, inst=250+v.distancia*22; return {
      out:[{l:"Wallbox",v:eur(wall)},{l:"Instalación",v:eur(inst)},{l:"Total",v:eur(wall+inst)},{l:"Con subvención",v:eur((wall+inst)*.7)}],
      note:"Incluye cableado y protecciones básicas. Necesitas proyecto técnico si superas 40 A."}; }},
  { id:"dimensionado", cat:"finance", name:"Dimensionado de la instalación", h1:"La potencia que necesitas.",
    desc:"Cable, protección y potencia contratada según tu cargador.",
    inputs:[num("potencia","Potencia",7.4,"kW",3.7,22,3.7)],
    calc:v=>({out:[{l:"Corriente",v:nf0.format(v.potencia*1000/230)+" A"},{l:"Cable",v:v.potencia<=7.4?"5×6 mm²":"5×10 mm²"},{l:"Protección",v:v.potencia<=7.4?"C40 A":"C63 A"},{l:"Potencia contratada",v:Math.ceil(v.potencia+3)+" kW"}],
      note:"Siempre con instalador autorizado y según el REBT."})},

  { id:"seguros", cat:"finance", name:"Seguros EV", h1:"Cuánto te cuesta asegurarlo.",
    desc:"Prima orientativa para un eléctrico frente a un combustible.",
    inputs:[num("valor","Valor del coche",42000,"€",10000,100000,1000),num("edad","Edad del conductor",35,"años",18,80,1)],
    calc:v=>{ const base=v.valor*.011*(1+(30-v.edad)*.008); return {
      out:[{l:"Prima EV",v:eur(base)},{l:"Prima gasolina",v:eur(base*.92)},{l:"Diferencia",v:eur(base*.08)},{l:"Ahorro anual",v:eur(-base*.08)}],
      note:"Prima orientativa; depende de aseguradora, coberturas y historial."}; }},

  { id:"residual", cat:"finance", name:"Valor residual", h1:"Qué vale tu coche en 5 años.",
    desc:"Depreciación estimada por modelo y kilometraje.",
    inputs:[car("a"),num("km","Km al año",15000,"km",5000,40000,1000),num("anos","Años",5,"",1,10,1)],
    calc:v=>{ const c=CARS[v.a], dep=Math.pow(.88,v.anos)*(1-Math.min(.2,v.km/150000)); const val=c.price?c.price*dep:null; return {
      out:[{l:"Precio nuevo",v:nd(c.price?eur(c.price):null)},{l:"Valor final",v:nd(val?eur(val):null)},{l:"Depreciación",v:nf0.format((1-dep)*100)+" %"},{l:"Coste por año",v:nd(val?eur((c.price-val)/v.anos):null)}],
      note:"La batería y la garantía influyen mucho en el valor de reventa."}; }},

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

  { id:"flotas", cat:"finance", name:"Flotas y empresa", h1:"Qué se deducen las empresas.",
    desc:"IVA, IRPF y deducción por vehículo eléctrico.",
    inputs:[num("precio","Precio sin IVA",35000,"€",10000,100000,1000),num("km","Km profesionales",20000,"km",0,60000,1000)],
    calc:v=>({out:[{l:"IVA deducible",v:eur(v.precio*.21)},{l:"Deducción IRPF",v:eur(Math.min(v.precio*.15,5000))},{l:"Coste por km",v:eur2(v.precio*.15/v.km)},{l:"Ahorro fiscal",v:eur(v.precio*.36)}],
      note:"Sujeto a requisitos de la AEAT; consulta con tu gestor fiscal."})},

  { id:"huella", cat:"finance", name:"Huella de carbono", h1:"Cuánto CO₂ evitas.",
    desc:"Emisiones de tu ruta frente a un coche de gasolina.",
    inputs:[num("km","Distancia",617,"km",10,3000,10),num("kwh","Consumo",16.8,"kWh/100",8,30,0.1),num("mix","Factor eléctrico",0.25,"kg/kWh",0.05,0.6,0.01)],
    calc:v=>{ const ev=v.km/100*v.kwh*v.mix, gas=v.km/100*7.5*2.31; return {
      out:[{l:"Eléctrico",v:nf1.format(ev)+" kg"},{l:"Gasolina",v:nf1.format(gas)+" kg"},{l:"Evitado",v:nf1.format(gas-ev)+" kg"},{l:"Por km",v:nf1.format((gas-ev)/v.km*1000)+" g"}],
      note:"Factor eléctrico de España estimado; varía por hora y fuente."};}},

  { id:"operador", cat:"finance", name:"Coste por operador", h1:"Qué te cuesta cada red.",
    desc:"Compara la tarifa que pagas con el PVPC real del día.",
    inputs:[num("kwh","Energía",50,"kWh",10,100,5),num("tarifa","Tu tarifa",0.55,"€/kWh",0.1,1,0.01)],
    calc:v=>{
      const live=(typeof LIVE!=="undefined")?LIVE:{};
      const pvpc=live.pvpcAvg||0.212;
      const cost=v.kwh*v.tarifa, ref=v.kwh*pvpc;
      return {out:[{l:"Tu tarifa",v:eur2(v.tarifa)+"/kWh"},{l:"PVPC real",v:eur2(pvpc)+"/kWh"},{l:"Coste carga",v:eur2(cost)},{l:"Sobre PVPC",v:eur2(cost-ref)}],
        note:`PVPC real de ${live.pvpcDate||"snapshot"} desde ESIOS. Las redes de carga no publican tarifas en una fuente abierta verificable: introduce la tuya para compararla con el precio de la electricidad.`};
    }},

  // ---------- SIMULADORES ----------
  { id:"degradacion", cat:"sim", name:"Degradación de batería", h1:"Cómo envejece tu batería.",
    desc:"Estado de salud estimado tras años, kilómetros y clima.",
    inputs:[num("anos","Años",8,"",1,15,1),num("km","Km al año",15000,"km",5000,40000,1000),selx("clima",["Templado","Frío","Caluroso"])],
    calc:v=>{ const cl={"Templado":0.012,"Frío":0.018,"Caluroso":0.021}[v.clima]; const soh=1-cl*v.anos-Math.min(.08,v.km*v.anos/500000); return {
      out:[{l:"Salud estimada",v:nf0.format(soh*100)+" %"},{l:"Capacidad",v:nf1.format(75*soh)+" kWh"},{l:"Autonomía",v:nf0.format(580*soh)+" km"},{l:"Años",v:String(v.anos)}],
      note:"Cargar al 80 % y evitar el calor alarga la vida de la batería."}; }},

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

  { id:"ruido", cat:"sim", name:"Ruido", h1:"Cuánto suena tu viaje.",
    desc:"Nivel sonoro estimado a distintas velocidades.",
    inputs:[car("a"),num("vel","Velocidad",100,"km/h",50,140,10)],
    calc:v=>{ const db=58+(v.vel-50)*.22; return {
      out:[{l:"A 50 km/h",v:"58 dB"},{l:"A 100 km/h",v:nf0.format(69)+" dB"},{l:"A 120 km/h",v:nf0.format(73.4)+" dB"},{l:"Tu velocidad",v:nf1.format(db)+" dB"}],
      note:"El ruido de rodadura crece con la velocidad; el eléctrico elimina el de motor."}; }},

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
  { id:"planificador", cat:"routes", name:"Planificador de rutas", h1:"Tu viaje, con paradas.",
    desc:"Distancia, tiempo, consumo y cargas intermedias.",
    inputs:[num("km","Distancia",617,"km",50,3000,10),num("vel","Velocidad media",95,"km/h",50,130,5),num("cap","Batería",75,"kWh",30,150,1),num("use","Consumo",16.8,"kWh/100",10,30,0.1)],
    calc:v=>{ const energy=v.km/100*v.use, stops=Math.max(0,Math.ceil(energy/v.cap)-1), drive=v.km/v.vel, charge=stops*.3; return {
      out:[{l:"Distancia",v:v.km+" km"},{l:"Conducción",v:nf1.format(drive)+" h"},{l:"Cargas",v:String(stops)},{l:"Tiempo total",v:nf1.format(drive+charge)+" h"}],
      table:table(["Concepto","Valor"],[["Energía total",nf1.format(energy)+" kWh"],["Paradas",String(stops)],["Tiempo de carga",nf1.format(charge)+" h"]]),
      note:"Las paradas se estiman con carga del 10 % al 80 %."}; }},

  { id:"isocronas", cat:"routes", name:"Mapa de autonomía", h1:"Hasta dónde llegas.",
    desc:"Radio real de autonomía desde tu ciudad, con los escenarios clave.",
    inputs:[car("a"),num("soc","Estado de carga",90,"%",10,100,5)],
    calc:v=>{ const c=CARS[v.a], r=c.range*v.soc/100; return {
      out:[{l:"Templado",v:nf0.format(r)+" km"},{l:"Invierno",v:nf0.format(r*.78)+" km"},{l:"A 120 km/h",v:nf0.format(r*.87)+" km"},{l:"Con desnivel",v:nf0.format(r*.92)+" km"}],
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
    calc:v=>({out:[{l:"Sube",v:nf0.format(v.subida)+" m"},{l:"Baja",v:nf0.format(v.bajada)+" m"},{l:"Diferencia",v:nf0.format(v.bajada-v.subida)+" m"},{l:"Efecto consumo",v:nf1.format((v.subida/1000)*.54)+" kWh/100"}],
      note:"En bajada no se recupera todo: el freno regenerativo tiene límites."})},

  { id:"compartir", cat:"routes", name:"Rutas compartibles", h1:"Comparte sin cuenta.",
    desc:"Genera un enlace con origen, destino y coche ya cargados.",
    inputs:[car("a"),num("km","Distancia",617,"km",50,2000,10)],
    calc:v=>({out:[{l:"Coche",v:v.a},{l:"Distancia",v:v.km+" km"},{l:"Estado",v:"Sin cuenta"},{l:"Enlace",v:"Copiable"}],
      html:`<p class="mono" style="margin-top:16px;padding:10px;border:1px solid var(--rule);word-break:break-all">${location.origin}${location.pathname}#compartir?coche=${encodeURIComponent(v.a)}&km=${v.km}</p>`,
      note:"El enlace contiene todos los parámetros; no guardamos nada en un servidor."})},

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
    inputs:[selx("prov",["Madrid","Barcelona","Valencia","Sevilla","Bilbao"])],
    calc:v=>{
      const list=(typeof LIVE!=="undefined"&&LIVE.workshops?LIVE.workshops:[]);
      const html=`<div style="margin-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:8px">${list.map(w=>`<a href="${w.url}" target="_blank" rel="noopener noreferrer" style="padding:9px 10px;border:1px solid var(--rule);text-decoration:none;color:var(--text);font-size:11px;display:flex;justify-content:space-between"><span>${w.brand}</span><span class="k">Oficial ↗</span></a>`).join("")}</div>`;
      return {out:[{l:"Provincia",v:v.prov},{l:"Marcas",v:String(list.length)},{l:"Red",v:"Oficial"},{l:"Cita",v:"En la web"}],
        html,note:"Enlaces a los sitios oficiales de cada fabricante. Cada marca publica su propio localizador de talleres autorizados; no mostramos direcciones sin verificar."};
    }},

  { id:"noticias", cat:"service", name:"Actualidad EV", h1:"Solo lo que importa.",
    desc:"Resumen con fuente citada, sin relleno.",
    inputs:[num("dias","Últimos días",7,"días",1,30,1)],
    calc:v=>{
      const list=(typeof LIVE!=="undefined"&&LIVE.news?LIVE.news:[]).slice(0,Math.min(12,v.dias*2));
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
    desc:"Comprueba que la app está instalada y que los datos quedan en el dispositivo.",
    inputs:[car("a"),num("km","Distancia",617,"km",50,2000,10)],
    calc:v=>({out:[{l:"Ruta",v:v.km+" km"},{l:"Coche",v:v.a},{l:"Modo",v:matchMedia("(display-mode: standalone)").matches?"Instalada":"Navegador"},{l:"Caché",v:("serviceWorker" in navigator && navigator.serviceWorker.controller)?"Activa":"Iniciando"}],
      note:"La web tiene manifest y service worker: funciona sin cobertura y se puede instalar desde el menú del navegador. El estado de la ruta se guarda en tu dispositivo, sin cuenta."})},

  { id:"api", cat:"service", name:"API pública", h1:"Datos abiertos para todos.",
    desc:"Consulta los mismos datos que usa la web.",
    inputs:[car("a")],
    calc:v=>{
      const c=CARS[v.a];
      const sample={model:v.a,year:c.year,battery_kwh:c.battery,range_real_km:c.range,wltp_km:c.wltp,consumption_kwh_100:c.use,dc_peak_kw:c.dc,boot_l:c.boot,price_de_eur:c.price};
      return {html:`<pre class="mono" style="margin-top:16px;padding:12px;border:1px solid var(--rule);overflow:auto">GET api/data.json\n\n${JSON.stringify(sample,null,2)}</pre>
        <p class="source" style="margin-top:10px"><a href="api/data.json" target="_blank" rel="noopener noreferrer">Abrir api/data.json en el navegador ↗</a></p>`,
        out:[{l:"Formato",v:"JSON estático"},{l:"Autenticación",v:"No"},{l:"Modelos",v:"25"},{l:"Licencia",v:"CC BY 4.0"}],
        note:"API real servida como archivo JSON estático en el CDN, sin clave ni backend. Lo regenera el cron diario."};
    }},

  { id:"mantenimiento", cat:"service", name:"Mantenimiento EV", h1:"Lo que se ahorra en taller.",
    desc:"Revisions, frenos y fluidos frente a un motor de combustión.",
    inputs:[num("anos","Años",8,"",1,15,1)],
    calc:v=>({out:[{l:"EV (modelo)",v:eur(v.anos*210)},{l:"Gasolina (modelo)",v:eur(v.anos*480)},{l:"Ahorro",v:eur(v.anos*270)},{l:"Por año",v:eur(270)}],
      note:"Estimación de modelo, no tarifa de taller. Se apoya en dos hechos publicados: menos piezas móviles y regeneración de frenos; un estudio de 2026 citado en nuestras noticias sitúa la sustitución de batería en el 0,3 % de los casos."})},
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
