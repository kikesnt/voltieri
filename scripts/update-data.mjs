// Regenera web/data/*.txt desde las fuentes reales.
// Se ejecuta en GitHub Actions (node 22+). Sin dependencias.
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("web/data");
const get = async (url, opts={}) => {
  const r = await fetch(url, { ...opts, signal: AbortSignal.timeout(180000) });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r;
};
const save = async (name, text) => {
  await fs.mkdir(OUT, { recursive:true });
  // Si una fuente falla y devuelve vacío, se conserva el archivo anterior (así se vació prices-es.txt y el catálogo perdió los precios).
  if (!text.trim()) { console.warn(`SKIP ${name}: datos vacíos, se conserva el archivo anterior`); return; }
  if (name === "prices-es.txt" && text.trim().split("\n").length < 20) { console.warn(`SKIP ${name}: menos de 20 precios, se conserva el archivo anterior`); return; }
  await fs.writeFile(path.join(OUT, name), text.endsWith("\n") ? text : text + "\n");
  console.log(`OK  ${name}  ${text.length} chars`);
};
const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g," ").trim();
const numES = s => parseFloat(String(s ?? "").replace(",", "."));

// CSV RFC 4180 (campos entrecomillados con comas, comillas dobles escapadas)
const parseCSV = text => {
  const rows = []; let row = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i+1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true;
    else if (ch === ",") { row.push(cur); cur = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i+1] === "\n") i++; row.push(cur); cur = ""; if (row.some(Boolean)) rows.push(row); row = []; }
    else cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
};
console.assert(JSON.stringify(parseCSV('a,"b,c","d""e"\n1,2,3')) === JSON.stringify([["a","b,c",'d"e'],["1","2","3"]]), "parseCSV");

// 1. Vehículos — OpenEV Data v1.24.0 (CDLA-Permissive-2.0)
async function vehicles() {
  const csv = await (await get("https://github.com/open-ev-data/open-ev-data-dataset/releases/download/v1.24.0/open-ev-data-v1.24.0.csv")).text();
  const table = parseCSV(csv);
  const head = table[0].map(h => h.trim());
  const rows = table.slice(1).map(r => Object.fromEntries(head.map((h,i) => [h, (r[i] ?? "").trim()])))
    .sort((a, b) => +b.year - +a.year); // por modelo se conserva la versión más reciente
  const brands = new Set(["Tesla","Hyundai","Kia","Volkswagen","Renault","Peugeot","Citroën","BMW","Mercedes-Benz","Audi","Polestar","Volvo","Nissan","Fiat","Ford","Opel","Škoda","Seat","Cupra","MG","BYD","Toyota","Mazda","Porsche","Mini","Jeep","Honda","Lexus","Dacia","Alpine","Smart","Abarth","Alfa Romeo","DS","Jaguar","Land Rover","Lucid","XPeng","NIO","Zeekr","Leapmotor","Geely","Chery","GAC Aion","Changan","Mitsubishi","Genesis","Lotus","Maserati","VinFast","Voyah","Dongfeng","Cadillac","DS Automobiles"]);
  const seen = new Set(), out = [];
  for (const r of rows) {
    if (!r.battery_capacity_net_kwh || !r.range_wltp_km || !r.dc_max_power_kw || !r.system_power_kw) continue;
    if (+r.year < 2023 || !brands.has(r.make_name)) continue;
    const key = `${r.make_name}|${r.model_name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push([r.make_name, r.model_name, r.year, r.battery_capacity_net_kwh, r.range_wltp_km, r.dc_max_power_kw, r.system_power_kw, r.acceleration_0_100_s || "", r.battery_chemistry].join("|"));
  }
  if (out.length < 80) { // una descarga rara no debe vaciar el catálogo
    console.warn(`vehicles: solo ${out.length} modelos, se conserva el archivo anterior`);
    return (await fs.readFile(path.join(OUT, "vehicles.txt"), "utf8")).trim().split("\n");
  }
  await save("vehicles.txt", out.join("\n"));
  return out;
}

// 2. Curvas — KilowattApp/open-ev-data (MIT con atribución)
async function curves(vehicleLines) {
  const d = await (await get("https://raw.githubusercontent.com/KilowattApp/open-ev-data/master/data/ev-data.json")).json();
  const kw = d.data || [];
  const out = [];
  for (const line of vehicleLines) {
    const [make, model] = line.split("|");
    const q = norm(`${make} ${model}`), brand = q.split(" ")[0], rest = q.split(" ").slice(1).join(" ");
    const m = kw.find(c => {
      const b = norm(c.brand || ""), mo = norm(c.model || "");
      return b.startsWith(brand.slice(0,4)) && (mo.startsWith(rest.slice(0,7)) || rest.startsWith(mo.slice(0,7)));
    });
    if (!m?.dc_charger?.charging_curve?.length) continue;
    const curve = m.dc_charger.charging_curve.map(p => `${p.percentage}:${Math.round(p.power)}`).join(",");
    out.push([`${make} ${model}`, m.usable_battery_size, m.energy_consumption?.average_consumption || "", curve].join("|"));
  }
  await save("curves.txt", out.join("\n"));
}

// 2b. Especificaciones — ev-database.org (RRP de Alemania, dimensiones, maletero, autonomía real)
async function specs(vehicleLines) {
  const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
  const home = await (await get("https://ev-database.org/")).text();
  const links = [...new Set([...home.matchAll(/href="(\/car\/\d+\/[^"]+)"/g)].map(m => m[1]))];
  const slugs = links.map(l => ({ url:l, tok:norm(decodeURIComponent(l.split("/").pop())).split(" ").filter(Boolean) }));
  const pairs = [];
  for (const line of vehicleLines) {
    const [make, model] = line.split("|");
    const tok = norm(`${make} ${model}`).split(" ").filter(Boolean);
    const m = slugs.find(s => s.tok[0]?.startsWith(tok[0].slice(0,4)) && tok.slice(1).every(t => s.tok.includes(t)));
    if (m) pairs.push([`${make} ${model}`, m.url]);
  }
  const re = {
    len:/<td>Length<\/td>\s*<td>(\d+)\s*mm<\/td>/,
    wid:/<td>Width<\/td>\s*<td>(\d+)\s*mm<\/td>/,
    hei:/<td>Height<\/td>\s*<td>(\d+)\s*mm<\/td>/,
    boot:/<td>Cargo Volume<\/td>\s*<td>(\d+)\s*L<\/td>/,
    price:/Germany<\/td>\s*<td>€([\d,]+)<\/td>/,
    nl:/Netherlands<\/td>\s*<td>€([\d,]+)<\/td>/,
    range:/<p>(\d+)\s*km<span>Real Range<\/span>/
  };
  const out = []; let i = 0;
  const worker = async () => {
    while (i < pairs.length) {
      const [name, url] = pairs[i++];
      try {
        const t = (await (await get("https://ev-database.org" + url)).text()).replace(/\s+/g," ");
        const g = k => (t.match(re[k]) || [])[1] || "";
        out.push([name, g("len"), g("wid"), g("hei"), g("boot"), (g("price")||g("nl")).replace(/,/g,""), g("range")].join("|"));
      } catch(e) { /* un coche no rompe el lote */ }
    }
  };
  await Promise.all(Array.from({ length:8 }, worker));
  await save("specs.txt", out.join("\n"));
}

// 3. Cargadores — MITECO RIPREE (datos públicos)
async function chargers() {
  const page = await (await get("https://energia.serviciosmin.gob.es/Ripree/ExportarInstalaciones/Export")).text();
  if (!page.includes("GenerarExcel")) throw new Error("RIPREE: no se encontró el endpoint de exportación");
  const r = await get("https://energia.serviciosmin.gob.es/Ripree/ExportarInstalaciones/GenerarExcel", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:null, soloConsolidado:true })
  });
  const buf = Buffer.from(await r.arrayBuffer());
  const txt = new TextDecoder("utf-16le").decode(buf);
  const lines = txt.split("\n").map(x => x.replace("\r","")).filter(x => x.length > 2);
  const clean = s => s.replace(/^="?|"?$/g,"").replace(/^"|"$/g,"").trim();
  const seen = new Set(), out = [];
  const byProv = new Map(); // provincia -> { pts: Map(punto -> {kw, dc}), inst: Set }
  for (let i = 1; i < lines.length; i++) {
    const c = lines[i].split(";").map(clean);
    const [prov, lat, lon, name, op, charge, kwRaw] = [c[1], c[3], c[4], c[5], c[11], c[23], c[25]];
    const kw = parseFloat(kwRaw.replace(",", "."));
    const pid = c[20] || c[15];
    if (/^[A-Za-zÀ-ÿ]/.test(prov) && pid) { // cada fila es un conector: se cuenta el punto una vez, con su mayor potencia
      const o = byProv.get(prov) || { pts: new Map(), inst: new Set() }; byProv.set(prov, o);
      o.inst.add(c[14]);
      const cur = o.pts.get(pid);
      o.pts.set(pid, { kw: Math.max(kw || 0, cur?.kw || 0), dc: charge === "DC" || !!cur?.dc });
    }
    if (charge !== "DC") continue;
    if (!(kw >= 50) || !parseFloat(lat) || !parseFloat(lon)) continue;
    const key = `${name}|${lat}`;
    if (seen.has(key)) continue;
    seen.add(key);
    // El fichero es separado por "|", así que el nombre y el operador no
    // pueden llevar pipes: hay estaciones de RIPREE que los traen (p. ej.
    // "E.S. bonÀrea Flix | Cafeteria - Botiga") y descolocaban todas las
    // columnas, dejando la latitud en NaN.
    const limpio = s => String(s || "").replace(/\|/g, " / ").trim();
    if (out.length < 2500) out.push([limpio(name).slice(0,44), (+lat).toFixed(5), (+lon).toFixed(5), Math.round(kw), limpio(op).slice(0,26), c[22] || "", limpio(prov)].join("|"));
  }
  await save("chargers.txt", out.join("\n"));
  const prov = [...byProv.entries()].map(([p, o]) => { const pts = [...o.pts.values()]; return [p, pts.length, pts.filter(x => x.dc && x.kw >= 50).length, o.inst.size]; })
    .filter(r => r[1] >= 5).sort((a, b) => b[1] - a[1]);
  await save("provincias.txt", prov.map(r => r.join("|")).join("\n"));
}

// 4. PVPC — ESIOS archive 70 (sin token)
async function pvpc() {
  const day = new Date().toISOString().slice(0,10);
  const d = await (await get(`https://api.esios.ree.es/archives/70/download_json?locale=es&date=${day}`)).json();
  const values = (d.PVPC || []).map(x => numES(x.PCB)).filter(n => n > 0);
  if (!values.length) throw new Error("ESIOS: sin precios para hoy");
  await save("pvpc.txt", `${day}|${values.map(v => v.toFixed(2)).join(",")}`);
}

// 5. Carburantes — MITECO REST (media de estaciones del entorno de Madrid)
async function fuel() {
  const d = await (await get("https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/")).json();
  const rows = d.ListaEESSPrecio || [];
  const mean = (list, key) => {
    const v = list.map(x => numES(x[key])).filter(n => n > .5 && n < 3);
    return v.length ? (v.reduce((a,b)=>a+b,0)/v.length).toFixed(3) : "";
  };
  const date = new Date(d.Fecha.replace(/(\d{2})\/(\d{2})\/(\d{4})/,"$3-$2-$1").slice(0,10)).toISOString().slice(0,10);
  const line = ["Madrid", mean(rows.filter(x => /madrid|alcobendas|getafe|alcorcon|móstoles/i.test(x.Municipio||"")), "Precio Gasolina 95 E5"), mean(rows.filter(x => /madrid|alcobendas|getafe|alcorcon|móstoles/i.test(x.Municipio||"")), "Precio Gasoleo A")].join("|");
  await save("fuel.txt", `${date}|${line}`);
}

// 6. Noticias — RSS de Google News España
async function news(){
  const rss = await (await get("https://news.google.com/rss/search?q=coche%20el%C3%A9ctrico&hl=es&gl=ES&ceid=ES:es")).text();
  const items = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m => m[1]);
  const clean = s => String(s||"").replace(/<!\[CDATA\[|\]\]>/g,"").replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&#39;/g,"'").trim();
  const field = (b,t) => { const m = b.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`)); return clean(m?m[1]:""); };
  const rows = items.slice(0,40).map(b => {
    const title = field(b,"title"), link = field(b,"link"), date = field(b,"pubDate");
    const source = (title.match(/\s-\s([^-]+)$/) || [,"Google News"])[1].trim();
    return [title.replace(/\s-\s[^-]+$/,"").slice(0,120), source, date.slice(0,16), link].join("|");
  });
  await save("news.txt", rows.join("\n"));
}

// 7. Seguridad — enlace al buscador oficial de Euro NCAP por modelo
async function safety(){
  const lines = await fs.readFile(path.join(OUT,"vehicles.txt"),"utf8");
  const rows = lines.trim().split("\n").map(l => {
    const c = l.split("|"), name = `${c[0]} ${c[1]}`;
    return `${name}|https://www.euroncap.com/en/search?q=${encodeURIComponent(name)}`;
  });
  await save("safety.txt", rows.join("\n"));
}

// 8b. Precios de coches nuevos en España — Autocasión.
//
// El script vive aparte (scripts/coches-precios.mjs) porque necesita su
// propia salvaguarda: si la fuente falla, conserva el fichero anterior en
// vez de vaciarlo, y contrasta cada precio con el RRP de ev-database antes
// de aceptarlo. La versión anterior de esta función iba al detalle de cada
// modelo con una URL inventada y sólo sacaba 45 precios de 113 modelos; con
// el listado por marca filtrado a eléctrico salen 92.
async function preciosES(){
  const mod = await import("./coches-precios.mjs");
  await mod.main();
}

// 9. API pública — JSON estático servido desde el CDN
async function api(){
  const read = n => fs.readFile(path.join(OUT,n),"utf8");
  const [v, c, p] = await Promise.all([read("vehicles.txt"), read("chargers.txt"), read("pvpc.txt")]);
  const models = v.trim().split("\n").map(l => {
    const x = l.split("|");
    return { brand:x[0], model:x[1], year:+x[2], battery_kwh:+x[3], wltp_km:+x[4], dc_kw:+x[5] };
  });
  const chargers = c.trim().split("\n").slice(0,100).map(l => {
    // El formato de origen es nombre|lat|lon|kW|operador|conector|provincia:
    // los 6 últimos campos son fijos y se leen desde la derecha, por si el
    // nombre trajera un pipe dentro. La API publica solo los 5 primeros.
    const f = l.split("|");
    return { name:f.slice(0, f.length-6).join(" / "), lat:+f[f.length-6], lon:+f[f.length-5],
             kw:+f[f.length-4], operator:f[f.length-3] };
  });
  const pv = p.trim().split("|");
  // La licencia no es una sola: cada bloque conserva la de su fuente. No se
  // relicencian datos de terceros, así que no puede decir "CC BY 4.0".
  const payload = { source:"Voltieri open data", version:"1.1",
    license:"Cada bloque conserva la licencia de su fuente (ver sources).",
    sources:[
      { block:"models", source:"OpenEV Data v1.24.0", license:"CDLA-Permissive-2.0", url:"https://github.com/open-ev-data/open-ev-data-dataset" },
      { block:"chargers", source:"MITECO · RIPREE", license:"Datos públicos del Estado", url:"https://catalogo.datosabiertos.miteco.gob.es/catalogo/en/dataset/6ee8d46f-93bd-478f-8e29-3ba4f6d8405c" },
      { block:"pvpc", source:"ESIOS · REE", license:"Datos públicos de REE", url:"https://api.esios.ree.es/archives/70/download_json" }
    ],
    models, chargers, pvpc:{ date:pv[0], prices_eur_mwh:pv[1].split(",").map(Number) } };
  const dir = path.resolve("web/api");
  await fs.mkdir(dir,{recursive:true});
  await fs.writeFile(path.join(dir,"data.json"), JSON.stringify(payload));
  console.log("OK  api/data.json");
}

// 12. Mercado — Our World in Data (a partir de la AIE): cuota de coches nuevos eléctricos y ventas de España
async function market(){
  const base = "https://ourworldindata.org/grapher/";
  const countries = "ESP~PRT~FRA~DEU~ITA~GBR~NOR~CHN~USA";
  const parse = t => t.trim().split("\n").slice(1).map(l => l.split(","));
  const share = parse(await (await get(`${base}electric-car-sales-share.csv?csvType=full&country=${countries}`)).text());
  const units = parse(await (await get(`${base}electric-car-sales.csv?csvType=full&country=ESP`)).text());
  const rows = [
    ...share.filter(r => +r[2] >= 2019).map(r => `cuota|${r[1]}|${r[2]}|${r[3]}`),
    ...units.filter(r => +r[2] >= 2015).map(r => `ventas|${r[1]}|${r[2]}|${r[3]}`)
  ];
  await save("market.txt", rows.join("\n"));
}

// 10. Red eléctrica — REData (REE): factor de emisión y % renovable de los últimos 10 días (sin token, con CORS)
async function grid(){
  const iso = d => d.toISOString().slice(0,10);
  const end = new Date(), start = new Date(Date.now() - 10*864e5);
  const q = `start_date=${iso(start)}T00:00&end_date=${iso(end)}T23:59&time_trunc=day`;
  const base = "https://apidatos.ree.es/es/datos/generacion/";
  const e = await (await get(base + "no-renovables-detalle-emisiones-CO2?" + q)).json();
  const g = await (await get(base + "estructura-generacion?" + q)).json();
  const fac = e.included.find(i => i.attributes.type === "tCO2 eq./MWh").attributes.values;
  const tot = g.included.find(i => i.attributes.type === "total").attributes.values;
  const ren = g.included.filter(i => i.attributes.type === "Renovable");
  const rows = fac.map((v, i) => {
    const t = tot[i]?.value; if (!t) return null;
    const r = ren.reduce((a, x) => a + (x.attributes.values[i]?.value || 0), 0);
    return `${v.datetime.slice(0,10)}|${v.value.toFixed(4)}|${(r / t * 100).toFixed(1)}`;
  }).filter(Boolean);
  await save("grid.txt", rows.join("\n"));
}

// 11. Ayudas — BDNS (Base de Datos Nacional de Subvenciones): convocatorias reales de movilidad eléctrica y recarga
async function subsidies(){
  const base = "https://www.infosubvenciones.es/bdnstrans/api/convocatorias/busqueda";
  const queries = ["vehículos eléctricos", "vehículo eléctrico", "recarga vehículos eléctricos", "movilidad eléctrica", "puntos de recarga"];
  const map = new Map();
  for (const q of queries) for (const page of [0, 1]) {
    try {
      const d = await (await get(`${base}?pageSize=50&page=${page}&vpd=GE&descripcion=${encodeURIComponent(q)}`, { headers:{ Accept:"application/json" } })).json();
      for (const c of d.content || []) if (!map.has(c.numeroConvocatoria)) map.set(c.numeroConvocatoria, c);
    } catch(e) { console.warn("BDNS", q, page, e.message); }
  }
  const clean = t => String(t || "").replace(/\s+/g, " ").replace(/\|/g, "/").trim();
  const since = Date.now() - 365*864e5;
  const rows = [...map.values()]
    .filter(c => Date.parse(c.fechaRecepcion) >= since)
    .filter(c => /(veh[ií]culo|recarga|movilidad|moves)/i.test(c.descripcion))
    .filter(c => !/(nominativ|redacci[oó]n del proyecto|dotaci[oó]n de infraestructura|cursos?|bicicleta|patinete|taxi|talleres|producci[oó]n de bater)/i.test(c.descripcion))
    .sort((a, b) => b.fechaRecepcion.localeCompare(a.fechaRecepcion)).slice(0, 40)
    .map(c => [c.numeroConvocatoria, c.fechaRecepcion, c.nivel1, clean(c.nivel2), clean(c.nivel3), clean(c.descripcion).slice(0, 220)].join("|"));
  await save("ayudas.txt", rows.join("\n"));
}

const vehiclesLines = await vehicles();
await Promise.allSettled([curves(vehiclesLines), specs(vehiclesLines), chargers(), pvpc(), fuel(), news(), safety(), api(), preciosES(), grid(), subsidies(), market()]);
console.log("Datos actualizados.");
