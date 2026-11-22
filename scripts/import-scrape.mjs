// Importa el catálogo scrapeado (data/amazon-candidatos.json + data/amazon-fichas.json)
// a web/data/amazon-products.json y cura los títulos al estilo Voltieri.
//
//   node scripts/import-scrape.mjs                 # 8 productos por categoría
//   node scripts/import-scrape.mjs --por-categoria 6
//   node scripts/import-scrape.mjs --categoria nevera-v2l --ver
//
// Reglas de curación:
//   - nota mínima 4,4 ★ (el mismo corte que aplica curate-products.mjs)
//   - se descartan los que no están disponibles o no traen imagen
//   - los productos ya presentes conservan su título curado a mano; solo se
//     actualizan precio, valoración e imagen
//   - el título de Amazon se reescribe: marca + tipo + dato clave, en español
//     y con los separadores " · " que usa el resto del catálogo
import fs from "node:fs/promises";
import path from "node:path";

const RAIZ = path.resolve(".");
const MIN = 4.4;

const args = process.argv.slice(2);
const opt = (k, d) => {
  const i = args.indexOf("--" + k);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : d;
};
const flag = k => args.includes("--" + k);
const POR_CATEGORIA = Number(opt("por-categoria", 8));

const leer = async p => JSON.parse(await fs.readFile(path.join(RAIZ, p), "utf8"));

const [candidatos, fichas, catalogo, curado] = await Promise.all([
  leer("data/amazon-candidatos.json").catch(() => ({ candidatos: {} })),
  leer("data/amazon-fichas.json").catch(() => ({ fichas: {} })),
  leer("web/data/amazon-products.json"),
  leer("scripts/amazon-curado.json").catch(() => ({})),
]);

// ── el curador de títulos ──────────────────────────────────────────────────

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu;

// De lo que sale de Amazon a cómo lo cuenta Voltieri.
const PALABRAS = [
  [/portatiles/gi, "portátiles"], [/portatil/gi, "portátil"],
  [/inalambricas?/gi, "inalámbrica"], [/inalambrico/gi, "inalámbrico"],
  [/electricos?/gi, "eléctrico"], [/electricas?/gi, "eléctrica"],
  [/electricidad/gi, "electricidad"], [/electrico/gi, "eléctrico"],
  [/neumaticos?/gi, "neumáticos"], [/neumatico/gi, "neumático"],
  [/bateria/gi, "batería"], [/baterias/gi, "baterías"],
  [/manometro/gi, "manómetro"], [/manometros/gi, "manómetros"],
  [/organizador/gi, "organizador"], [/organizadores/gi, "organizadores"],
  [/cargador/gi, "cargador"], [/cargadores/gi, "cargadores"],
  [/adaptador/gi, "adaptador"], [/adaptadores/gi, "adaptadores"],
  [/compresor/gi, "compresor"], [/compresores/gi, "compresores"],
  [/maleta/gi, "maleta"], [/maletas/gi, "maletas"],
  [/bolsa/gi, "bolsa"], [/bolsas/gi, "bolsas"],
  [/soporte/gi, "soporte"], [/soportes/gi, "soportes"],
  [/candado/gi, "candado"], [/cubierta/gi, "cubierta"],
  [/cubiertas/gi, "cubiertas"], [/rascador/gi, "rascador"],
  [/nevera/gi, "nevera"], [/neveras/gi, "neveras"],
  [/pared/gi, "pared"], [/maletero/gi, "maletero"],
  [/cable/gi, "cable"], [/cables/gi, "cables"],
  [/rueda/gi, "rueda"], [/ruedas/gi, "ruedas"],
  [/verdadero/gi, ""], [/automatica/gi, "automática"],
  [/rapido/gi, "rápido"], [/rapida/gi, "rápida"],
  [/facil/gi, "fácil"], [/ligero/gi, "ligero"], [/ligera/gi, "ligera"],
  [/resistente/gi, "resistente"], [/ajustable/gi, "ajustable"],
  [/impermeable/gi, "impermeable"], [/plegable/gi, "plegable"],
  [/portatil/gi, "portátil"],
  [/\bwith\b/gi, "con"], [/\band\b/gi, "y"], [/\bfor\b/gi, "para"],
  [/\bthe\b/gi, ""], [/\bof\b/gi, ""], [/\bto\b/gi, ""], [/\bin\b/gi, ""],
  [/\bno\s+drill\b/gi, "sin taladro"], [/\bwithout\s+drill\b/gi, "sin taladro"],
  [/\bhand\s+pump\b/gi, "bomba de mano"], [/\bfor\s+car\b/gi, "para coche"],
  [/\binch(es)?\b/gi, ""], [/\bpcs\b/gi, "ud."], [/\bpack\b/gi, "pack"],
  [/\bset\b/gi, "set"], [/\bblack\b/gi, "negro"], [/\bblue\b/gi, "azul"],
  [/\bgrey\b/gi, "gris"], [/\bwhite\b/gi, "blanco"], [/\bred\b/gi, "rojo"],
  [/\bsilver\b/gi, "plateado"], [/\byellow\b/gi, "amarillo"],
  [/\bport\s*power\b/gi, "toma de mechero"], [/\bcigarette/i, "mechero"],
  [/\bheavy\s+duty\b/gi, "resistente"], [/\bhigh\s+quality\b/gi, ""],
  [/\bportable\b/gi, "portátil"], [/\belectric\b/gi, "eléctrico"],
  [/\bwireless\b/gi, "inalámbrico"], [/\bcar\b/gi, "coche"],
  [/\btire/gi, "neumático"], [/\btyres?\b/gi, "neumático"],
  [/\bbattery\b/gi, "batería"], [/\bcable\b/gi, "cable"],
  [/\bcharger\b/gi, "cargador"], [/\bcase\b/gi, "bolsa"],
  [/\btorganizer\b/gi, "organizador"], [/\borganizer\b/gi, "organizador"],
  [/\bbag\b/gi, "bolsa"], [/\bsuitcase\b/gi, "maleta"],
  [/\bfridge\b/gi, "nevera"], [/\bcooler\b/gi, "nevera"],
  [/\bcover\b/gi, "cubierta"], [/\bscraper\b/gi, "rascador"],
  [/\bgauge\b/gi, "manómetro"], [/\bpump\b/gi, "compresor"],
  [/\bpressure\b/gi, "presión"], [/\bportable\b/gi, "portátil"],
  [/\block\b/gi, "candado"], [/\bwall\s+mount\b/gi, "de pared"],
  [/\bholder\b/gi, "soporte"], [/\bhook\b/gi, "gancho"],
  [/\brechargeable\b/gi, "recargable"], [/\blcd\b/gi, "LCD"],
  [/\bdisplay\b/gi, "pantalla"], [/\bscreen\b/gi, "pantalla"],
  [/\bflashlight\b/gi, "linterna"], [/\bled\b/gi, "LED"],
  [/\bquick\s+release\b/gi, "desmontaje rápido"], [/\breflective\b/gi, "reflectante"],
];

// Tipo de producto: donde acaba la marca y empieza el nombre.
const TIPOS = [
  "compresor de aire", "compresor", "inflador", "manómetro", "cargador portátil",
  "cargador", "adaptador", "maleta", "bolsa", "soporte", "candado", "cubierta",
  "rascador", "nevera", "organizador", "cable de carga", "cable", "wallbox",
  "punto de carga", "medidor", "calibrador", "aspirador", "bombilla",
];

const UNIDADES = [
  [/(\d+(?:[.,]\d+)?)\s*psi/i, "PSI"],
  [/(\d+(?:[.,]\d+)?)\s*bar/i, "bar"],
  [/(\d+(?:[.,]\d+)?)\s*k\s*w/i, "kW"],
  [/(\d+(?:[.,]\d+)?)\s*w(?![a-záéíóúñ])/i, "W"],
  [/(\d+(?:[.,]\d+)?)\s*v(?![a-záéíóúñ])/i, "V"],
  [/(\d+(?:[.,]\d+)?)\s*a(?![a-záéíóúñ])/i, "A"],
  [/(\d+(?:[.,]\d+)?)\s*l(?![a-záéíóúñ])/i, "L"],
  [/(\d+(?:[.,]\d+)?)\s*m(?![a-záéíóúñ])/i, "m"],
  [/(\d+(?:[.,]\d+)?)\s*mm(?![a-záéíóúñ])/i, "mm"],
  [/(\d+(?:[.,]\d+)?)\s*litros?\b/i, "L"],
  [/(\d+(?:[.,]\d+)?)\s*cm(?![a-záéíóúñ])/i, "cm"],
];

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const norm = s => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const euros = n => (n == null ? "" : n.toFixed(2).replace(".", ",") + " €");
const dec = n => (n == null ? "" : String(n).replace(".", ","));

function limpiar(titulo) {
  let t = String(titulo || "").replace(EMOJI, " ").replace(/\s+/g, " ").trim();
  t = t.replace(/^(?:nuevo|nueva|top|hot|más vendido|más vendido)[,\s·-]+/i, "");
  t = t.replace(/\s*[|]\s*/g, " · ");
  for (const [re, to] of PALABRAS) t = t.replace(re, to);
  t = t.replace(/\s{2,}/g, " ").replace(/\s*,\s*/g, ", ").trim();
  return t;
}

function specs(t) {
  const out = [];
  for (const [re, label] of UNIDADES) {
    const m = t.match(re);
    if (!m) continue;
    const v = dec(m[1]);
    const s = `${label} ${v}`;
    if (!out.some(x => x.startsWith(label + " "))) out.push(s);
  }
  return out.slice(0, 3);
}

function nucleo(t) {
  // El nombre: hasta la primera coma, paréntesis o guion, sin conectores colgando.
  let n = t.split(/[,;(–—-]/)[0].trim();
  n = n.replace(/\b(de|del|para|con|y|en|el|la|los|las|un|una)\s*$/i, "").trim();
  if (n.length < 8) n = t.split(/[,;(–—-]/).slice(0, 2).join(" ").trim();
  return n;
}

function curarTitulo(titulo, cat) {
  const t = limpiar(titulo);
  const core = cap(nucleo(t));
  const s = specs(t).filter(x => !core.toLowerCase().includes(x.toLowerCase()));
  let out = [core, ...s].join(" · ");
  if (out.length > 68) out = core.slice(0, 40).trim() + (s.length ? " · " + s.join(" · ") : "");
  return out.replace(/\s+·\s*$/, "").trim();
}

// ── selección ──────────────────────────────────────────────────────────────

// Qué tiene que parecerse al producto que buscamos. La búsqueda de Amazon
// devuelve de todo: una bolsa de techo no es una bolsa para el cable, y un
// módulo de espuma no es una maleta de viaje.
const RELEVANCIA = {
  "inflador-neumaticos": /compresor|inflador|man[oó]metro|medidor de (?:presi[oó]n|neum)|calibrador|borde/,
  "soporte-cable": /soporte|sostenedor|bolsa|caja de guarda|candado|organizador|enrollador|clip|bridas/,
  "maleta-viaje": /maleta|bolsa|organizador|neceser|mochila|carro de herramienta|armario port[aá]til/,
  "nevera-v2l": /nevera|refrigerador|v2l/,
  "invierno": /cubierta|rascador|antihielo|escarcha|parabrisas|abriga/,
  "cables-tipo2": /cable/,
  "wallbox": /wallbox|cargador de pared|estaci[oó]n de carga|box de carga/,
  "adaptadores-ccs2": /ccs|adaptador/,
  "cargador-portatil": /cargador/,
  "estaciones-22kw": /wallbox|estaci[oó]n|22 ?kw/,
  "v2l": /v2l|adaptador/,
};

// Nota ponderada por las valoraciones (fórmula de IMDb): un 5,0 con tres
// opiniones no puede ir por delante de un 4,8 con ochocientas.
const MEDIA = 4.3, MIN_VAL = 50;
const score = (nota, vals) => {
  const v = vals || 0, r = nota || 0;
  return (v / (v + MIN_VAL)) * r + (MIN_VAL / (v + MIN_VAL)) * MEDIA;
};

const nota = (p, f) => (f && f.nota) || p.nota || 0;
const valoraciones = (p, f) => (f && f.valoraciones) || p.valoraciones || 0;

const porCategoria = new Map();
for (const c of catalogo.categories) porCategoria.set(c.id, c);

const scraped = Object.values(candidatos.candidatos || {});
const resultado = [];

for (const cat of catalogo.categories) {
  if (opt("categoria") && cat.id !== opt("categoria")) continue;
  const manual = cat.products || [];
  const manualAsin = new Map(manual.map(p => [p.asin, p]));
  const fichaDe = asin => (fichas.fichas || {})[asin];
  const candDe = asin => (candidatos.candidatos || {})[asin];

  // Un producto concreto: precio, nota e imagen.
  // La búsqueda manda en precio y nota: la ficha abre la página del ASIN, pero
  // si el listado tiene varias variantes (una nevera de 25 L y otra de 50 L)
  // la página muestra la nota y el precio de otra de ellas. La búsqueda es
  // siempre la del ASIN exacto. De la ficha sale la imagen grande, que sí es
  // del producto, y la disponibilidad.
  const construir = (asin, tituloCurado) => {
    const c = candDe(asin) || {}, f = fichaDe(asin) || {};
    const p = manualAsin.get(asin);
    const pr = c.precio || f.precio || null;
    return {
      asin,
      title: p?.title || tituloCurado || curarTitulo(c.titulo || "", cat.id),
      price: pr ? euros(pr) : (p?.price || ""),
      rating: dec(c.nota || f.nota || p?.rating),
      image: f.imagen || c.imagen || p?.image || "",
    };
  };

  const listaCurada = curado[cat.id] || null;
  if (listaCurada) {
    // Curado editorial: el orden y los títulos son los de scripts/amazon-curado.json.
    const fuera = [];
    for (const item of listaCurada) {
      const asin = typeof item === "string" ? item : item.asin;
      const titulo = typeof item === "string" ? "" : (item.title || "");
      const c = candDe(asin), f = fichaDe(asin);
      if (!c && !f) { fuera.push(asin + " (sin datos)"); continue; }
      if (f && f.disponible === false) { fuera.push(asin + " (no disponible)"); continue; }
      const notaProd = (c && c.nota) || (f && f.nota) || 0;
      if (notaProd && notaProd < MIN) { fuera.push(asin + " (nota " + notaProd + ")"); continue; }
      const p = construir(asin, titulo);
      if (!p.image) { fuera.push(asin + " (sin imagen)"); continue; }
      resultado.push({ cat, p, manual: true });
    }
    for (const p of manual) if (!listaCurada.some(i => (typeof i === "string" ? i : i.asin) === p.asin)) fuera.push(p.asin + " (fuera del curado)");
    if (fuera.length) console.log(`  ${cat.id}: fuera -> ${fuera.join(", ")}`);
    continue;
  }

  // Los que viennent del scrape de esta categoría
  const cands = scraped
    .filter(c => c.categoria === cat.id)
    .map(c => ({ c, f: fichaDe(c.asin) }))
    .filter(({ c, f }) => {
      if (!f || !f.imagen) return false;          // sin imagen no entra: la tarjeta queda vacía
      if (f.disponible === false) return false;   // no disponible en España
      if (nota(c, f) < MIN) return false;
      const rel = RELEVANCIA[cat.id];
      if (rel && !rel.test(c.titulo || "")) return false;
      return true;
    })
    .sort((a, b) => score(nota(b.c, b.f), valoraciones(b.c, b.f)) - score(nota(a.c, a.f), valoraciones(a.c, a.f)));

  const nuevos = [];
  for (const { c, f } of cands) {
    if (nuevos.length >= POR_CATEGORIA) break;
    if (manualAsin.has(c.asin)) continue;         // ya está, curado a mano
    if (nuevos.some(n => n.asin === c.asin)) continue;
    nuevos.push(construir(c.asin));
  }
  resultado.push({ cat, nuevos });
}

// ── escritura ──────────────────────────────────────────────────────────────

if (flag("ver")) {
  for (const { cat, nuevos, p } of resultado) {
    if (p) console.log(`  ${cat.id.padEnd(20)} ${p.title}  (${p.asin} ${p.rating}★ ${p.price})`);
    for (const n of nuevos || []) console.log(`  ${cat.id.padEnd(20)} ${n.title}  (${n.asin} ${n.rating}★ ${n.price})`);
  }
  process.exit(0);
}

// La tabla de fotos de docs/FOTOS.md, para tenerla al día sin editar a mano.
if (flag("tabla")) {
  console.log("| Categoría | ASIN | Producto | Imagen | Abrir |");
  console.log("|---|---|---|---|---|");
  for (const cat of catalogo.categories) {
    for (const p of cat.products || []) {
      console.log(`| ${cat.name} | \`${p.asin}\` | ${p.title} | ${p.image ? "propia" : "widget"} | [amazon.es](https://www.amazon.es/dp/${p.asin}) |`);
    }
  }
  process.exit(0);
}

for (const cat of catalogo.categories) {
  const entradas = resultado.filter(r => r.cat.id === cat.id);
  const manual = entradas.filter(r => r.p).map(r => r.p);
  const nuevos = entradas.flatMap(r => r.nuevos || []);
  cat.products = [...manual, ...nuevos];
}

catalogo.date = new Date().toISOString().slice(0, 10);
catalogo.source = "Amazon.es · búsqueda pública con Chrome headless · precios y valoraciones scrapeados el " +
  catalogo.date.split("-").reverse().join("/");
await fs.writeFile(path.join(RAIZ, "web/data/amazon-products.json"), JSON.stringify(catalogo, null, 2));

for (const cat of catalogo.categories) console.log(`${cat.id.padEnd(20)} ${String(cat.products.length).padStart(2)} productos`);
console.log("Ahora: node scripts/curate-products.mjs");
