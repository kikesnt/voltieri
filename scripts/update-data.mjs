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
  await fs.writeFile(path.join(OUT, name), text.endsWith("\n") ? text : text + "\n");
  console.log(`OK  ${name}  ${text.length} chars`);
};
const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g," ").trim();
const numES = s => parseFloat(String(s ?? "").replace(",", "."));

// 1. Vehículos — OpenEV Data v1.24.0 (CDLA-Permissive-2.0)
async function vehicles() {
  const csv = await (await get("https://github.com/open-ev-data/open-ev-data-dataset/releases/download/v1.24.0/open-ev-data-v1.24.0.csv")).text();
  const lines = csv.split("\n").filter(Boolean);
  const head = lines[0].split(",");
  const rows = lines.slice(1).map(l => Object.fromEntries(head.map((h,i) => [h, (l.split(",")[i] ?? "").trim()])));
  const brands = new Set(["Tesla","Hyundai","Kia","Volkswagen","Renault","Peugeot","Citroën","BMW","Mercedes-Benz","Audi","Polestar","Volvo","Nissan","Fiat","Ford","Opel","Škoda","Seat","Cupra","MG","BYD","Toyota","Mazda","Porsche","Mini","Jeep","Honda","Lexus","Dacia","Alpine","Smart","Abarth","Alfa Romeo","DS","Jaguar","Land Rover","Lucid","XPeng","NIO","Zeekr","Leapmotor","Geely","Chery","GAC Aion","Changan"]);
  const seen = new Set(), out = [];
  for (const r of rows) {
    if (!r.battery_capacity_net_kwh || !r.range_wltp_km || !r.dc_max_power_kw || !r.system_power_kw) continue;
    if (+r.year < 2023 || !brands.has(r.make_name)) continue;
    const key = `${r.make_name}|${r.model_name}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push([r.make_name, r.model_name, r.year, r.battery_capacity_net_kwh, r.range_wltp_km, r.dc_max_power_kw, r.system_power_kw, r.acceleration_0_100_s || "", r.battery_chemistry].join("|"));
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
  for (let i = 1; i < lines.length; i++) {
    const c = lines[i].split(";").map(clean);
    const [prov, lat, lon, name, op, charge, kwRaw] = [c[1], c[3], c[4], c[5], c[11], c[23], c[25]];
    if (charge !== "DC") continue;
    const kw = parseFloat(kwRaw.replace(",", "."));
    if (!(kw >= 50) || !parseFloat(lat) || !parseFloat(lon)) continue;
    const key = `${name}|${lat}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push([name.slice(0,44), (+lat).toFixed(5), (+lon).toFixed(5), Math.round(kw), op.slice(0,26), c[22] || "", prov].join("|"));
    if (out.length >= 2500) break;
  }
  await save("chargers.txt", out.join("\n"));
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

// 8b. Precios de coches nuevos en España — Autocasion (scraping con Scrapling como referencia)
async function pricesES(){
  const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
  const vehicles = (await fs.readFile(path.join(OUT,"vehicles.txt"),"utf8")).trim().split("\n");
  const out=[]; let i=0;
  const worker=async()=>{
    while(i<vehicles.length){
      const line=vehicles[i++], c=line.split("|"), name=`${c[0]} ${c[1]}`, tok=norm(name).split(" ");
      const slug=`${tok[0]}/${tok.slice(1).join("-")}`;
      try{
        const html=await (await get(`https://www.autocasion.com/coches-nuevos/${slug}`)).text();
        const items=[...html.matchAll(/itemprop="name">\s*([^<]{1,90})\s*<\/h2>[\s\S]{0,400}?<p class="precio">\s*(?:<span>[^<]*<\/span>)?\s*([\d.,]+)\s*€/gi)]
          .map(m=>({name:norm(m[1]),price:+m[2].replace(/\./g,"").replace(",",".")}));
        const model=tok.slice(1).join(" ");
        const good=items.filter(a=>a.name.includes(tok[0])&&a.name.includes(model)&&a.price>10000);
        if(good.length) out.push(`${name}|${Math.min(...good.map(a=>a.price))}`);
      }catch(e){ /* un modelo no rompe el lote */ }
    }
  };
  await Promise.all(Array.from({length:10},worker));
  await save("prices-es.txt", out.join("\n"));
}

// 9. API pública — JSON estático servido desde el CDN
async function api(){
  const read = n => fs.readFile(path.join(OUT,n),"utf8");
  const [v, c, p] = await Promise.all([read("vehicles.txt"), read("chargers.txt"), read("pvpc.txt")]);
  const models = v.trim().split("\n").slice(0,25).map(l => {
    const x = l.split("|");
    return { brand:x[0], model:x[1], year:+x[2], battery_kwh:+x[3], wltp_km:+x[4], dc_kw:+x[5] };
  });
  const chargers = c.trim().split("\n").slice(0,20).map(l => {
    const x = l.split("|");
    return { name:x[0], lat:+x[1], lon:+x[2], kw:+x[3], operator:x[4] };
  });
  const pv = p.trim().split("|");
  const payload = { source:"Voltieri open data", version:"1.0", license:"CC BY 4.0",
    models, chargers, pvpc:{ date:pv[0], prices_eur_mwh:pv[1].split(",").map(Number) } };
  const dir = path.resolve("web/api");
  await fs.mkdir(dir,{recursive:true});
  await fs.writeFile(path.join(dir,"data.json"), JSON.stringify(payload));
  console.log("OK  api/data.json");
}

const vehiclesLines = await vehicles();
await Promise.allSettled([curves(vehiclesLines), specs(vehiclesLines), chargers(), pvpc(), fuel(), news(), safety(), api(), pricesES()]);
console.log("Datos actualizados.");
