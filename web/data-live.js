// Precios en vivo con fallback a snapshot estático. Sin backend.
const LIVE = { pvpcDate:null, pvpcAvg:null, pvpcMin:null, pvpcMax:null, fuelDate:null, gas95:null, diesel:null, source:{ pvpc:"—", fuel:"—" } };
const numES = s => parseFloat(String(s ?? "").replace(",", "."));

async function loadPvpc(){
  try {
    const day = new Date().toISOString().slice(0,10);
    const d = await (await fetch(`https://api.esios.ree.es/archives/70/download_json?locale=es&date=${day}`)).json();
    const values = (d.PVPC || []).map(x => numES(x.PCB) / 1000).filter(n => n > 0);
    if (values.length) {
      LIVE.pvpcDate = d.PVPC[0]?.Dia || day;
      LIVE.pvpcAvg = +(values.reduce((a,b)=>a+b,0)/values.length).toFixed(4);
      LIVE.pvpcMin = +Math.min(...values).toFixed(4);
      LIVE.pvpcMax = +Math.max(...values).toFixed(4);
      LIVE.pvpcValues = values;
      LIVE.source.pvpc = "ESIOS en vivo";
      return;
    }
  } catch(e) { /* sin red: usamos el snapshot */ }
  const txt = await (await fetch("data/pvpc.txt")).text();
  const [date, vals] = txt.trim().split("\n")[0].split("|");
  const values = vals.split(",").map(Number);
  LIVE.pvpcDate = date;
  LIVE.pvpcAvg = +(values.reduce((a,b)=>a+b,0)/values.length).toFixed(4);
  LIVE.pvpcMin = +Math.min(...values).toFixed(4);
  LIVE.pvpcMax = +Math.max(...values).toFixed(4);
  LIVE.pvpcValues = values;
  LIVE.source.pvpc = "ESIOS · snapshot";
}

async function loadFuel(){
  try {
    const d = await (await fetch("https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/")).json();
    const rows = d.ListaEESSPrecio || [];
    const near = rows.filter(x => /madrid|alcobendas|getafe|alcorcon|móstoles/i.test(x.Municipio || ""));
    const gas = near.map(x => numES(x["Precio Gasolina 95 E5"])).filter(n => n > .5 && n < 3);
    const diesel = near.map(x => numES(x["Precio Gasoleo A"])).filter(n => n > .5 && n < 3);
    if (gas.length && diesel.length) {
      LIVE.fuelDate = d.Fecha;
      LIVE.gas95 = +(gas.reduce((a,b)=>a+b,0)/gas.length).toFixed(3);
      LIVE.diesel = +(diesel.reduce((a,b)=>a+b,0)/diesel.length).toFixed(3);
      LIVE.source.fuel = "MITECO en vivo";
      return;
    }
  } catch(e) { /* sin red: usamos el snapshot */ }
  const txt = await (await fetch("data/fuel.txt")).text();
  const [date, , gas, diesel] = txt.trim().split("\n")[0].split("|");
  LIVE.fuelDate = date;
  LIVE.gas95 = +gas;
  LIVE.diesel = +diesel;
  LIVE.source.fuel = "MITECO · snapshot";
}

async function loadNews(){
  const txt = await (await fetch("data/news.txt")).text();
  LIVE.news = txt.trim().split("\n").map(line => {
    const [title, source, date, link] = line.split("|");
    return { title, source, date, link };
  });
}

async function loadGrid(){
  const txt = await (await fetch("data/grid.txt")).text();
  const rows = txt.trim().split("\n").map(l => { const [date, kg, ren] = l.split("|"); return { date, kg:+kg, ren:+ren }; }).filter(r => r.kg > 0);
  const last = rows[rows.length - 1];
  const w = rows.slice(-7);
  LIVE.grid = { date:last.date, kg:last.kg, ren:last.ren, kg7:w.reduce((a, r) => a + r.kg, 0) / w.length, ren7:w.reduce((a, r) => a + r.ren, 0) / w.length };
}

async function loadAids(){
  const txt = await (await fetch("data/ayudas.txt")).text();
  LIVE.aids = txt.trim().split("\n").map(l => { const [num, date, nivel, region, organo, title] = l.split("|"); return { num, date, nivel, region, organo, title }; });
}

async function loadWorkshops(){
  const txt = await (await fetch("data/workshops.txt")).text();
  LIVE.workshops = txt.trim().split("\n").map(line => {
    const [brand, url] = line.split("|");
    return { brand, url };
  });
}

async function loadSafety(){
  const txt = await (await fetch("data/safety.txt")).text();
  LIVE.safety = Object.fromEntries(txt.trim().split("\n").map(line => {
    const [model, url] = line.split("|"); return [model, url];
  }));
}

function patchDefaults(){
  if (typeof TOOLS !== "undefined") {
    const tarifas = TOOLS.find(t => t.id === "tarifas");
    if (tarifas && LIVE.pvpcAvg) {
      tarifas.inputs[0].value = +LIVE.pvpcAvg.toFixed(3);
      tarifas.inputs[1].value = +LIVE.pvpcMin.toFixed(3);
      tarifas.note = `PVPC real ${LIVE.pvpcDate}: media ${LIVE.pvpcAvg.toFixed(3)} €/kWh, mínimo ${LIVE.pvpcMin.toFixed(3)}, máximo ${LIVE.pvpcMax.toFixed(3)}. Fuente: ${LIVE.source.pvpc}.`;
    }
  }
  if (typeof TOOLS !== "undefined" && LIVE.grid) {
    const h = TOOLS.find(t => t.id === "huella");
    if (h) h.inputs[2].value = +LIVE.grid.kg7.toFixed(2);
  }
  const kwh = document.getElementById("precio") || document.getElementById("priceKwh");
  if (kwh && LIVE.pvpcAvg) {
    kwh.value = LIVE.pvpcAvg.toFixed(3);
    kwh.title = `PVPC ${LIVE.pvpcDate} · ${LIVE.source.pvpc}`;
  }
  const gas = document.getElementById("precioGas") || document.getElementById("priceL");
  if (gas && LIVE.gas95) {
    gas.value = LIVE.gas95.toFixed(3);
    gas.title = `MITECO ${LIVE.fuelDate} · ${LIVE.source.fuel}`;
  }
}

async function loadLivePrices(){
  await Promise.allSettled([loadPvpc(), loadFuel(), loadNews(), loadWorkshops(), loadSafety(), loadGrid(), loadAids()]);
  patchDefaults();
  return LIVE;
}

window.savePriceAlert = async function(target, hour){
  localStorage.setItem("voltieri-alert", JSON.stringify({ target, hour, at:new Date().toISOString() }));
  if (typeof Notification !== "undefined" && Notification.permission === "default") {
    try { await Notification.requestPermission(); } catch(e) {}
  }
  const current = LIVE.pvpcValues ? LIVE.pvpcValues[hour] : null;
  if (Notification.permission === "granted" && current !== null && current <= target) {
    new Notification("Voltieri · precio alcanzado", { body:`PVPC ${current.toFixed(3)} €/kWh a las ${hour}:00` });
  }
  const btn = document.querySelector("button[onclick^='savePriceAlert']");
  if (btn) btn.textContent = "Alerta guardada en este dispositivo ✓";
};
