#!/usr/bin/env node
// Fotos de cada modelo del catálogo — fuente Wikimedia Commons.
//
// POR QUÉ COMMONS
//
// Las fotos de EV Database no se pueden enlazar en caliente ni usar de forma
// comercial sin permiso, y las de los portales de anuncios son de anunciantes.
// Wikimedia Commons tiene API pública sin clave, devuelve autor, licencia y
// URL de la ficha de origen, y sus ficheros son de dominio público o
// Creative Commons (CC BY / CC BY-SA), que permiten uso comercial con
// atribución. El atribución se guarda con la foto y se muestra junto a ella
// en el catálogo.
//
// CÓMO SE ELIGE LA FOTO (criterios, y por qué)
//
//  1. La licencia tiene que permitir uso comercial. Se acepta dominio
//     público, CC0, CC BY y CC BY-SA; se descarta todo lo que lleve "NC"
//     (uso no comercial) o "ND" (sin derivadas). Se lee el campo "License"
//     de la API, que es el código de la licencia (cc-by-sa-4.0, cc0, pd...).
//  2. El título tiene que contener la marca y todos los tokens del modelo.
//     "Volkswagen ID.4" no puede coger la foto de un "ID.5 GTX", y el "ë-C3"
//     no puede coger la foto de un "C3" de combustión: por eso la marca de
//     eléctrico ("ë", "e-", "EV") es obligatoria, no opcional.
//  3. Se descartan las fotos que no son del coche entero: logos, distintivos,
//     puntos de carga, interiores, salpicaderos, motores, ruedas, diagramas,
//     estudios de daños y demás. La lista está en EXCLUIDOS.
//  4. Encuadre: se prefiere una foto apaisada de buena resolución (ancho
//     mínimo 640 px y relación entre 1,2 y 2,2). Las verticales y los
//     recortes dinámicos se puntúan peor.
//  5. Dentro de lo que pasa los filtros, gana la foto con el título más
//     cercano al nombre oficial del modelo, la que menciona el año, la que
//     Commons marca como "Quality image" o "Featured picture" y la de mayor
//     resolución.
//
// REANUDABLE
//
// El resultado se guarda en web/data/coches-fotos.json. Si el fichero ya
// existe, los modelos que ya tienen foto no se vuelven a buscar: se puede
// cortar la pasada y relanzarla sin perder el trabajo. Además, el fichero se
// escribe tras cada modelo encontrado, de modo que una interrupción deja
// siempre un JSON válido.
//
// USO
//     node scripts/coches-fotos.mjs              # busca lo que falta
//     node scripts/coches-fotos.mjs --rehacer    # rehace todas las fotos
//     node scripts/coches-fotos.mjs --limite 10  # solo prueba con 10 modelos
//
// Sin dependencias externas. Solo el fetch global de Node 18+.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VEHICULOS = path.join(RAIZ, "web", "data", "vehicles.txt");
const FOTOS = path.join(RAIZ, "web", "data", "coches-fotos.json");

const API = "https://commons.wikimedia.org/w/api.php";
const FUENTE = "Wikimedia Commons";
const ANCHO_MIN = 640;
const ASPECTO_MIN = 1.2;
const ASPECTO_MAX = 2.2;
const ESPACIO_MS = 900;   // la API pública de Commons limita por IP: se va con calma

const UA = "VoltieriBot/1.0 (https://kikesnt.github.io/voltieri/; catalogo de coches electricos)";

// Licencias permitidas: dominio público, CC0, CC BY y CC BY-SA. Se rechaza
// todo lo que contenga "nc" (no comercial) o "nd" (sin derivadas).
const LICENCIAS_OK = /^(pd|cc0|cc-by|cc-by-sa)(-|$)/i;

// Palabras que delatan una foto que no es "el coche de este modelo".
const EXCLUIDOS = [
  "logo", "badge", "emblem", "charging", "charger", "charge point", "wallbox",
  "charging station", "plug", "socket", "cable", "interior", "cockpit",
  "dashboard", "instrument", "steering", "seat", "upholstery", "wheel", "tyre",
  "tire", "rim", "alloy", "engine", "motor", "battery", "chassis", "brake",
  "headlight", "headlamp", "taillight", "tail light", "rear light", "mirror",
  "door", "boot", "trunk", "cargo", "diagram", "drawing", "illustration",
  "blueprint", "cutaway", "disassembly", "component", "parts", "cutting",
  "assembly line", "conveyor", "factory", "showroom", "wreck", "crashed",
  "burnt", "burned", "damaged", "abandoned", "junk", "scrap", "scale model",
  "model kit", "miniature", "toy", "painting", "poster", "advertisement",
  "packaging", "box", "stamp", "banknote", "coin", "ticket", "map", "graph",
  "chart", "infographic", "plan", "floorplan", "interior view", "accident",
  "police", "ambulance", "fire brigade", "towing", "crane", "garage",
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
let ultimaPeticion = 0;

async function pedir(url) {
  // La API pública de Commons limita por IP: si responde 429 hay que esperar
  // lo que diga la cabecera Retry-After y reintentar. No se insiste.
  for (let intento = 0; ; intento++) {
    const espera = ESPACIO_MS - (Date.now() - ultimaPeticion);
    if (espera > 0) await sleep(espera);
    ultimaPeticion = Date.now();
    const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
    if (r.status === 429) {
      if (intento >= 4) throw new Error("429 (límite de peticiones)");
      const retry = Number(r.headers.get("retry-after")) || 10;
      console.log(`  (límite de la API, esperando ${retry}s)`);
      await sleep(retry * 1000);
      continue;
    }
    if (!r.ok) throw new Error(`${r.status}`);
    return await r.json();
  }
}

// ── normalización (misma idea que en scripts/coches-precios.mjs) ───────────
const SINONIMOS = {
  ev: "electrico", evs: "electrico", electric: "electrico",
  electrico: "electrico", electrica: "electrico", eq: "electrico", e: "electrico",
};
const ENTIDADES = {
  "&amp;": "&", "&euml;": "ë", "&eacute;": "é", "&egrave;": "è",
  "&aacute;": "á", "&agrave;": "à", "&acirc;": "â", "&uuml;": "ü",
  "&ouml;": "ö", "&oacute;": "ó", "&iacute;": "í", "&ntilde;": "ñ",
  "&ccedil;": "ç", "&quot;": '"', "&#39;": "'", "&nbsp;": " ",
};

function norm(s) {
  let t = String(s);
  for (const [ent, ch] of Object.entries(ENTIDADES)) t = t.split(ent).join(ch);
  // El "+" del nombre oficial ("Toyota C-HR+") marca la versión eléctrica:
  // se conserva como token "electrico" para no confundirla con el C-HR
  // chino de combustión.
  t = t.replace(/\+/g, " electrico ");
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function tok(s) {
  return norm(s).split(" ").filter(Boolean).map(t => {
    if (/^\d+$/.test(t)) return String(parseInt(t, 10));
    return SINONIMOS[t] || t;
  });
}

// Texto plano a partir del HTML de los metadatos de Commons.
function plano(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// La API devuelve la miniatura con parámetros de analítica pegados
// (?utm_source=commons.wikimedia.org...). Se quitan: el sitio no mete
// seguimiento a nadie.
function urlLimpia(url) {
  if (!url) return "";
  return String(url).split("?")[0];
}

// URL canónica de la licencia. Se deriva del código de licencia (el campo
// "License" de la API: cc-by-sa-4.0, cc0, pd...), que es el dato legible por
// máquina, y no de "LicenseUrl", que trae la página "/deed.es" o "/deed.de"
// según el idioma del fichero y deja el idioma pegado a la URL.
function urlLicencia(meta) {
  const cod = String(meta.License?.value || "").toLowerCase().trim();
  // El código puede traer el idioma detrás ("cc-by-sa-3.0-de", "cc-by-sa-3.0/de").
  const m = cod.match(/^(cc-by-sa|cc-by|cc0|pd)-?([\d.]*)(?:\/[a-z-]+|-[a-z-]+)?$/);
  if (m) {
    const [, tipo, ver] = m;
    if (tipo === "cc0") return "https://creativecommons.org/publicdomain/zero/1.0/";
    if (tipo === "pd") return "";           // dominio público: no hay texto que enlazar
    // El código es "cc-by-sa-4.0" pero la URL es "/licenses/by-sa/4.0/".
    const familia = tipo.replace(/^cc-/, "");
    return `https://creativecommons.org/licenses/${familia}/${ver}/`;
  }
  const base = meta.LicenseUrl?.value || "";
  if (!base) return "";
  const limpio = base.replace(/\/deed\.[a-z-]+.*$/i, "").replace(/\/deed\/?$/i, "");
  return limpio.startsWith("http") ? limpio : "https:" + limpio;
}

// El nombre corto de la licencia lleva a veces el idioma ("CC BY-SA 3.0 de").
function nombreLicencia(meta) {
  const n = plano(meta.LicenseShortName?.value || meta.UsageTerms?.value || meta.License?.value || "");
  return n.replace(/\s+(de|en|es|fr|it|nl|pl|cs|pt|sv|fi|da|ru|ja|zh)\b/i, "").trim();
}

// ── búsqueda en Commons ────────────────────────────────────────────────────
async function buscar(consulta, limite = 12) {
  const url = `${API}?action=query&generator=search&gsrsearch=${encodeURIComponent(consulta)}`
    + `&gsrnamespace=6&gsrlimit=${limite}&prop=imageinfo&iiprop=url|extmetadata|size`
    + `&iiurlwidth=480&format=json&formatversion=2`;
  const d = await pedir(url);
  return d?.query?.pages || [];
}

// ── elección de la mejor candidata ─────────────────────────────────────────
function licenciaPermitida(meta) {
  const cod = String(meta.License?.value || "").toLowerCase();
  if (!cod) return false;
  if (/nc|nd|fair|noncom|non-com/.test(cod)) return false;
  return LICENCIAS_OK.test(cod);
}

function excluir(texto) {
  const t = " " + norm(texto) + " ";
  return EXCLUIDOS.some(p => t.includes(" " + norm(p) + " ") || t.includes(norm(p) + " "));
}

// Una descripción que empieza por un nombre de persona es una foto de una
// persona (aunque el coche salga de fondo): "Martin Mašek / Eliška Mašková,
// Škoda Enyaq Coupé iV RS". Se cuela en las categorías de modelo, así que hay
// que descartarla aparte. Se exige un nombre de dos palabras seguidas de "/",
// para no liarse con "Front / rear view".
const PERSONA = /^[#\d\s]*\p{Lu}\p{Ll}+\s+\p{Lu}\p{Ll}+[^\/]{0,20}\//u;
function esPersona(descripcion) {
  return PERSONA.test(String(descripcion || "").trim());
}

// La foto tiene que ser de un coche eléctrico. Todos los modelos de
// vehicles.txt lo son, pero algunos comparten nombre con un coche de
// combustión ("Toyota C-HR+" frente al "C-HR" chino, "Toyota Urban Cruiser"
// frente al de 2011). Por eso, cuando el nombre oficial lleva marca de
// eléctrico ("ë", "e-", "EV", "Electric", "EQ", "+"), esa marca es
// obligatoria en el título; y cuando no la lleva, el año descarta el coche
// viejo que reutiliza el nombre.
function tokensModeloEstricto(modelo) {
  const base = tok(modelo);
  const crudo = String(modelo);
  const marcador = /[ë+]|(\be-)|(\bev\b)|(\belectric)|\beq\b/i.test(crudo);
  if (marcador && !base.includes("electrico")) return [...base, "electrico"];
  return base;
}

function evaluar(candidata, modelo, marca, anio) {
  const titulo = candidata.titulo;
  const tokensTitulo = tok(titulo.replace(/^File:/i, ""));
  const tokensModelo = tokensModeloEstricto(modelo);
  const tokensMarca = tok(marca);
  if (!tokensModelo.length) return null;

  // 1. Todos los tokens del modelo tienen que estar en el título. Es lo que
  //    separa "Volkswagen ID.4" de "Volkswagen ID.5 GTX", y el "ë-C3"
  //    eléctrico del "C3" de combustión.
  for (const t of tokensModelo) {
    if (!tokensTitulo.includes(t)) return null;
  }
  // 2. La marca también.
  if (tokensMarca.length && !tokensMarca.some(t => tokensTitulo.includes(t))) return null;

  // 3. Que no sea un logo, un punto de carga o el interior del coche.
  if (excluir(titulo)) return null;
  if (excluir(candidata.descripcion || "")) return null;
  if (esPersona(candidata.descripcion || "")) return null;

  // 4. Año: si el título lleva un año y ninguno cae en la ventana del
  //    modelo, la foto es de otra generación (o de otro coche con el mismo
  //    nombre). Margen de 8 años hacia atrás para no perder fotos antiguas
  //    de modelos que llevan años en el mercado.
  const anios = (String(titulo).match(/\b(19|20)\d{2}\b/g) || []).map(Number);
  const ventana = [+anio - 8, +anio + 2];
  if (anios.length && !anios.some(y => y >= ventana[0] && y <= ventana[1])) return null;

  // 5. Categorías de Commons: son la identificación fiable del modelo, pero
  //    no como filtro duro: hay ficheros bien titulados y bien categorize
  //    ("Škoda Enyaq iV" está en la categoría "Škoda Enyaq", sin la "iV") y
  //    otros con la categoría equivocada. Se puntúan: la categoría que
  //    identifica el modelo suma, y una categoría de la marca que no
  //    identifica este modelo resta un poco.
  const cats = String(candidata.categorias || "").split("|").map(c => c.trim()).filter(Boolean);
  let catModelo = false, catMarca = false;
  for (const c of cats) {
    const t = tok(c);
    const tieneMarca = tokensMarca.some(x => t.includes(x));
    if (tieneMarca) catMarca = true;
    if (!catModelo && tokensMarca.every(x => t.includes(x)) && tokensModelo.every(x => t.includes(x))) catModelo = true;
  }

  // 6. Encuadre y resolución.
  const w = candidata.ancho, h = candidata.alto;
  if (!w || !h) return null;
  if (w < ANCHO_MIN) return null;
  const aspecto = w / h;
  if (aspecto < ASPECTO_MIN || aspecto > ASPECTO_MAX) return null;

  // 7. Puntuación.
  let puntos = 0;
  const tituloNormalizado = norm(titulo.replace(/^File:/i, ""));
  const oficial = norm(`${marca} ${modelo}`);
  if (tituloNormalizado.startsWith(oficial)) puntos += 4;
  else if (tituloNormalizado.includes(oficial)) puntos += 2;
  // El año en el título: buena señal de que la foto es de esa generación.
  if (anios.some(y => y === +anio)) puntos += 2;
  // La categoría que identifica el modelo: la señal más fiable.
  if (catModelo) puntos += 6;
  else if (catMarca) puntos -= 3;
  // Commons marca las mejores con estas etiquetas de categoría.
  const catsMinusculas = cats.join(" ").toLowerCase();
  if (catsMinusculas.includes("featured pictures")) puntos += 4;
  if (catsMinusculas.includes("quality images")) puntos += 3;
  // Resolución: bonificación suave, sin dejar que tape lo demás.
  puntos += Math.min(3, Math.round(w / 700));
  // Preferencia por fotos con más recorrido horizontal del coche.
  if (aspecto >= 1.4 && aspecto <= 1.9) puntos += 2;

  return puntos;
}

function aFicha(pagina, modelo, marca, anio) {
  const ii = pagina.imageinfo?.[0];
  if (!ii) return null;
  const meta = ii.extmetadata || {};
  if (!licenciaPermitida(meta)) return null;

  const titulo = pagina.title || "";
  const miniatura = urlLimpia(ii.thumburl || ii.url);
  if (!miniatura) return null;

  const autor = plano(meta.Artist?.value || meta.Credit?.value || "");
  const licencia = nombreLicencia(meta);
  const ficha = {
    miniatura,
    pagina: ii.descriptionurl || "",
    autor: autor || "Autor no indicado en Commons",
    licencia,
    licenciaUrl: urlLicencia(meta),
    titulo: titulo.replace(/^File:/, ""),
    autorUrl: (String(meta.Artist?.value || "").match(/href="([^"]*\/wiki\/User:[^"]+)"/) || [null])[1],
    resolucion: ii.width && ii.height ? `${ii.width}x${ii.height}` : "",
    consulta: modelo,
  };
  if (ficha.autorUrl) {
    ficha.autorUrl = ficha.autorUrl.startsWith("//") ? "https:" + ficha.autorUrl : ficha.autorUrl;
  }
  return ficha;
}

// ── programa ───────────────────────────────────────────────────────────────
async function main() {
  const rehacer = process.argv.includes("--rehacer");
  const limite = process.argv.includes("--limite") ? +process.argv[process.argv.indexOf("--limite") + 1] : Infinity;

  const lineas = (await fs.readFile(VEHICULOS, "utf8")).split("\n").map(l => l.trim()).filter(Boolean);
  const vehiculos = lineas.map(l => {
    const [marca, modelo, anio] = l.split("|");
    return { marca, modelo, anio, nombre: `${marca} ${modelo}` };
  });

  // Reanudable: lo que ya está en el fichero se respeta.
  let datos = { generado: "", fuente: FUENTE, fotos: {} };
  try {
    const previo = JSON.parse(await fs.readFile(FOTOS, "utf8"));
    if (previo && typeof previo === "object" && previo.fotos) datos = previo;
  } catch { /* primera pasada */ }

  const guardar = async () => {
    datos.generado = new Date().toISOString().slice(0, 10);
    await fs.writeFile(FOTOS, JSON.stringify(datos, null, 2) + "\n");
  };

  let hechas = 0, sinFoto = [], nuevas = 0;
  const licencias = {};
  const procesadas = [];

  for (const v of vehiculos) {
    if (procesadas.length >= limite) break;
    procesadas.push(v.nombre);
    if (!rehacer && datos.fotos[v.nombre]) {
      const l = datos.fotos[v.nombre].licencia;
      licencias[l] = (licencias[l] || 0) + 1;
      continue;
    }
    // Dos consultas: primero tal cual, y si no hay nada, con el nombre de la
    // marca delante ("Model 3" solo no encuentra nada).
    // Tres consultas, de la más específica a la más amplia. La primera
    // (intitle:) busca el nombre exacto en el título del fichero y acierta
    // mucho: para "Renault 4 E-Tech" devuelve los ficheros del coche
    // eléctrico, mientras que la búsqueda suelta devuelve el Renault 4
    // clásico de los años 60 (que luego el filtro de tokens descarta).
    const consultas = [
      `intitle:"${v.marca} ${v.modelo}" filetype:bitmap`,
      `"${v.marca} ${v.modelo}" filetype:bitmap`,
      `${v.marca} ${v.modelo} electric filetype:bitmap`,
    ];
    let elegida = null, mejor = -1, probadas = [];
    for (const q of consultas) {
      let paginas = [];
      try { paginas = await buscar(q); } catch (e) { console.log(`  ERROR ${v.nombre}: ${e.message}`); continue; }
      for (const p of paginas) {
        const ii = p.imageinfo?.[0];
        if (!ii) continue;
        const meta = ii.extmetadata || {};
        if (!licenciaPermitida(meta)) continue;
        const candidata = {
          titulo: p.title || "",
          descripcion: plano(meta.ImageDescription?.value || ""),
          categorias: meta.Categories?.value || "",
          ancho: ii.width || ii.thumbwidth || 0,
          alto: ii.height || ii.thumbheight || 0,
        };
        const puntos = evaluar(candidata, v.modelo, v.marca, v.anio);
        if (puntos === null) continue;
        probadas.push(`${candidata.titulo} (${puntos})`);
        if (puntos > mejor) {
          mejor = puntos;
          elegida = aFicha(p, v.modelo, v.marca, v.anio);
        }
      }
      if (elegida) break;
    }

    if (elegida) {
      datos.fotos[v.nombre] = elegida;
      licencias[elegida.licencia] = (licencias[elegida.licencia] || 0) + 1;
      nuevas++;
      hechas++;
      console.log(`  FOTO  ${v.nombre.padEnd(26)} ${elegida.licencia.padEnd(16)} ${elegida.titulo.slice(0, 60)}`);
      await guardar();   // se guarda en cada paso: si se corta, no se pierde
    } else {
      sinFoto.push(v.nombre);
      console.log(`  ----  ${v.nombre.padEnd(26)} sin foto (${probadas.length} candidatas descartadas)`);
      await guardar();
    }
  }

  await guardar();

  // ── resumen ──
  const total = Object.keys(datos.fotos).length;
  console.log("");
  console.log(`Modelos con foto: ${total} de ${vehiculos.length}`);
  console.log(`  nuevas en esta pasada: ${nuevas}`);
  console.log("Licencias:");
  for (const [l, n] of Object.entries(licencias).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(3)}  ${l}`);
  }
  console.log(`Sin foto: ${sinFoto.length}`);
  if (sinFoto.length) console.log(`  ${sinFoto.join(", ")}`);
  console.log(`OK  web/data/coches-fotos.json`);
}

main().catch(e => { console.error("ERROR FATAL", e); process.exit(1); });
