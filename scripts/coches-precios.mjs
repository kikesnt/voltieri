#!/usr/bin/env node
// Precios de coches nuevos en España — fuente Autocasión.
//
// POR QUÉ FUNCIONA ESTE MÉTODO (y por qué el anterior no)
//
// La versión anterior de scripts/update-data.mjs (función pricesES) iba al
// detalle de cada modelo con una URL inventada:
//     https://www.autocasion.com/coches-nuevos/<marca>/<modelo-con-guiones>
// Ese slug se adivinaba y fallaba en la mayoría de los casos: "gac/aion-v"
// devuelve 404, "byd/atto-3" sí funciona pero "byd/atto3" no. De ahí que solo
// 45 de 113 modelos tuvieran precio.
//
// Lo que sí funciona, comprobado sobre el portal:
//
//   1. La URL de listado por marca existe y es estable:
//      https://www.autocasion.com/coches-nuevos/<marca>
//   2. Se puede filtrar por combustible con un SEGMENTO DE RUTA, no con un
//      parámetro de consulta:
//      https://www.autocasion.com/coches-nuevos/bmw/electrico
//      → "42 BMW eléctrico nuevos" en 2 páginas, frente a "304 BMW nuevos" en
//      13 páginas sin filtrar. El filtro por query (?combustible=electrico)
//      NO funciona: sigue devolviendo los 304.
//   3. El listado pagina con ?page=N y el bloque .paginacion dice cuántas
//      páginas hay (enlace "total_pages" o el último ?page=).
//   4. Cada anuncio lleva su nombre y su precio juntos, en el mismo bloque:
//      <h2 itemprop="name"> TESLA Model 3 RWD </h2>
//      <p class="precio"><span>Oferta</span> 36.990 €</p>
//      Ojo: ese <p> mide 265 caracteres (lleva la nota al pie y el descuento),
//      así que no se puede cerrar el bloque por su </p> con un límite corto.
//   5. La URL del anuncio lleva el modelo en el segundo segmento:
//      /coches-nuevos/tesla-model-3/model-3-rwd-ref20355058
//      Ese prefijo es la identidad de modelo del portal y sirve además para
//      descartar los anuncios de otras marcas que el portal incrusta al final
//      de la página (Zeekr y Aion los tienen: en la página de Zeekr salen
//      anuncios de Mercedes, BMW, Fiat y Smart).
//
// CÓMO SE ASIGNA UN PRECIO A UN MODELO (aquí está la exactitud)
//
// No vale con "la página de la marca tiene un precio": hay que emparejar el
// modelo de vehicles.txt con SU anuncio. Se comparan tokens normalizados
// (minúsculas, sin acentos, sin signos, números sin ceros a la izquierda):
//
//   - "ë-C4 X" → {e, c4, x}      "Mustang Mach-E" → {mustang, mach, e}
//     "Smart #1" → {smart, 1}   "Polestar 02" → {polestar, 2}
//   - El modelo es válido si SUS tokens están todos en el nombre del anuncio.
//     Esto evita las trampas de subcadena: BMW "iX" no puede coger el precio
//     de "iX1" ni de "iX3", porque "ix" e "ix1" son tokens distintos.
//   - "Eléctrico" no cuenta: en un listado filtrado a eléctrico es redundante.
//     "Ford Capri EV" y "Ford Capri Select" son el mismo modelo.
//   - De los anuncios válidos se elige el grupo con MENOS tokens extra
//     (distancia mínima): "Skoda Elroq" gana a "Skoda Elroq RS", y
//     "Mercedes EQE" gana a "Mercedes EQE SUV". A igualdad, se queda el
//     precio más bajo: es el precio de acceso de la gama, que es lo que el
//     portal publica como precio del modelo.
//   - Contrapeso con ev-database (web/data/specs.txt, RRP de Alemania): si el
//     precio español se sale de una banda ancha de sanity, se descarta y se
//     avisa. Un precio atribuido al modelo equivocado es peor que no tener
//     precio.
//
// SALVAGUARDA
//
//   1. Si la fuente falla de forma general (menos del 60 % de las marcas
//      respondiendo), no se toca el fichero: se conserva y se avisa.
//   2. Si el resultado tiene menos líneas que el fichero actual, NO se
//      escribe: se conserva el anterior y se avisa. Un fallo de la fuente no
//      puede borrar datos buenos.
//   3. Los precios anteriores de los modelos que esta pasada no ha
//      encontrado se conservan y se listan como "conservados" en
//      prices-es-meta.json, para no perder un dato bueno por un fallo puntual.
//
// USO
//     node scripts/coches-precios.mjs                    # actualiza los precios
//     node scripts/coches-precios.mjs --fallo-simulado   # prueba la salvaguarda
//
// Sin dependencias externas. Solo el fetch global de Node 18+.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(RAIZ, "web", "data");
const VEHICULOS = path.join(DATA, "vehicles.txt");
const PRECIOS = path.join(DATA, "prices-es.txt");
const META = path.join(DATA, "prices-es-meta.json");
const SPECS = path.join(DATA, "specs.txt");

const FUENTE = "Autocasión";
const FUENTE_URL = "https://www.autocasion.com/coches-nuevos";
const LICENCIA_FUENTE = "Dato de tercero citado con enlace a la fuente; se publica la cifra, no la página.";

// User-Agent honesto y localizable: el portal tiene que poder saber de dónde
// viene el tráfico y contactarse si hace falta.
const UA = "VoltieriBot/1.0 (https://kikesnt.github.io/voltieri/; catalogo de precios de coches nuevos en Espana)";

// Ritmo: pocas peticiones, con espera entre ellas. Todo el catálogo son
// unas 60 peticiones; no hace falta más.
const ESPACIO_MS = 1400;
const TIMEOUT_MS = 30000;

// Porcentaje mínimo de marcas que deben responder para dar la pasada por
// válida. Por debajo, se da la fuente por caída y no se toca el fichero.
const UMBRAL_MARCAS = 0.6;

// Marca -> [slug en autocasion.com, prefijo de URL que debe tener el anuncio].
// El prefijo filtra los anuncios de otras marcas que el portal incrusta al
// final de algunas páginas (Zeekr, Aion).
const MARCAS = {
  "Audi":          { slug: "audi",          prefijo: "audi" },
  "BMW":           { slug: "bmw",           prefijo: "bmw" },
  "BYD":           { slug: "byd",           prefijo: "byd" },
  // Chery se comercializa en España bajo la marca Omoda.
  "Chery":         { slug: "omoda",         prefijo: "omoda" },
  "Citroën":       { slug: "citroen",       prefijo: "citroen" },
  "Cupra":         { slug: "cupra",         prefijo: "cupra" },
  "Dacia":         { slug: "dacia",         prefijo: "dacia" },
  "Fiat":          { slug: "fiat",          prefijo: "fiat" },
  "Ford":          { slug: "ford",          prefijo: "ford" },
  "GAC Aion":      { slug: "aion",          prefijo: "aion" },
  "Hyundai":       { slug: "hyundai",       prefijo: "hyundai" },
  "Jaguar":        { slug: "jaguar",        prefijo: "jaguar" },
  "Leapmotor":     { slug: "leapmotor",     prefijo: "leapmotor" },
  "Lexus":         { slug: "lexus",         prefijo: "lexus" },
  "Mercedes-Benz": { slug: "mercedes-benz", prefijo: "mercedes-benz" },
  "Mini":          { slug: "mini",          prefijo: "mini" },
  "Nissan":        { slug: "nissan",        prefijo: "nissan" },
  "Peugeot":       { slug: "peugeot",       prefijo: "peugeot" },
  "Polestar":      { slug: "polestar",      prefijo: "polestar" },
  "Porsche":       { slug: "porsche",       prefijo: "porsche" },
  "Renault":       { slug: "renault",       prefijo: "renault" },
  "Smart":         { slug: "smart",         prefijo: "smart" },
  "Tesla":         { slug: "tesla",         prefijo: "tesla" },
  "Toyota":        { slug: "toyota",        prefijo: "toyota" },
  "Volkswagen":    { slug: "volkswagen",    prefijo: "volkswagen" },
  "Volvo":         { slug: "volvo",         prefijo: "volvo" },
  "Zeekr":         { slug: "zeekr",         prefijo: "zeekr" },
  "Škoda":         { slug: "skoda",         prefijo: "skoda" },
};

const sleep = ms => new Promise(r => setTimeout(r, ms));
let ultimaPeticion = 0;
let simularFallo = false;

// Alias de nombre: el portal usa el nombre europeo y OpenEV Data el original.
// Son equivalencias de la propia marca, no suposiciones:
//   - BYD Yuan Plus = BYD Atto 3   (nombre europeo del mismo coche)
//   - BYD Song Plus = BYD Seal U   (el Seal U sustituyó al Song Plus en
//                                     el mercado europeo)
// Los modelos resueltos por alias se listan en prices-es-meta.json para que
// se puedan revisar de un vistazo.
const ALIAS = {
  "BYD Song Plus": "BYD Seal U",
  "BYD Yuan Plus": "BYD Atto 3",
};

async function pedir(url) {
  if (simularFallo) throw new Error("fallo simulado");
  const espera = ESPACIO_MS - (Date.now() - ultimaPeticion);
  if (espera > 0) await sleep(espera);
  ultimaPeticion = Date.now();
  const r = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "es-ES,es;q=0.9" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return await r.text();
}

// ── normalización ──────────────────────────────────────────────────────────
// Sin acentos, sin signos, en minúsculas. Los números pierden los ceros de la
// izquierda ("02" y "2" son el mismo modelo: Polestar 02 = Polestar 4).
//
// "EV" / "Eléctrico" / "EQ" / la "ë" de Citroën se canonicalizan a "electrico":
// en un listado filtrado a eléctrico esa marca es redundante, pero tiene que
// quedar igual en los dos lados de la comparación. La "ë" de "Citroën" no
// genera token propio (es una vocal con diéresis), así que el nombre de la
// marca no se ve afectado; la "ë" de "ë-C3" sí, y por eso el modelo vale
// "Peugeot e-208" para el "e-208" y para el "Peugeot 208" del portal.
const SINONIMOS = {
  ev: "electrico", evs: "electrico", electric: "electrico",
  electrico: "electrico", electrica: "electrico", eq: "electrico",
  e: "electrico",
};

// "&amp;" y "&euml;" no son letras: se descodifican antes de normalizar.
const ENTIDADES = {
  "&amp;": "&", "&euml;": "ë", "&eacute;": "é", "&egrave;": "è",
  "&aacute;": "á", "&agrave;": "à", "&acirc;": "â", "&uuml;": "ü",
  "&ouml;": "ö", "&oacute;": "ó", "&iacute;": "í", "&ntilde;": "ñ",
  "&ccedil;": "ç", "&szlig;": "ß", "&quot;": '"', "&#39;": "'", "&nbsp;": " ",
};

export function norm(s) {
  let t = String(s);
  for (const [ent, ch] of Object.entries(ENTIDADES)) t = t.split(ent).join(ch);
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

export function tok(s) {
  return norm(s).split(" ").filter(Boolean).map(t => {
    if (/^\d+$/.test(t)) return String(parseInt(t, 10));
    return SINONIMOS[t] || t;
  });
}

// ── parseo del listado ─────────────────────────────────────────────────────
// Cada anuncio es un <a href="/coches-nuevos/..."> que contiene su <h2
// itemprop="name"> y su <p class="precio">. Se trocea por el h2 para no
// depender de la anidación exacta del HTML.
export function parseListado(html, prefijo) {
  const items = [];
  const reH2 = /<h2 itemprop="name">([\s\S]*?)<\/h2>/g;
  const nombres = [];
  let m;
  while ((m = reH2.exec(html))) {
    nombres.push({ pos: m.index, nombre: m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() });
  }
  const reHref = /<a href="(\/coches-nuevos\/[^"#?]+)"/g;
  const hrefs = [];
  while ((m = reHref.exec(html))) hrefs.push({ pos: m.index, url: m[1] });

  for (let i = 0; i < nombres.length; i++) {
    const ini = nombres[i].pos;
    const fin = i + 1 < nombres.length ? nombres[i + 1].pos : html.length;
    // El href más cercano por delante es el del propio anuncio.
    let url = "";
    for (const h of hrefs) {
      if (h.pos < ini && h.pos > ini - 4000) url = h.url;
    }
    const partes = url.split("/").filter(Boolean);   // [coches-nuevos, marca-modelo, version]
    const slug = partes[1] || "";
    // Filtro de marca: el portal incrusta anuncios de otras marcas al final
    // de algunas páginas (Zeekr, Aion).
    if (prefijo && !slug.startsWith(prefijo)) continue;

    // El <p class="precio"> no se puede cerrar por su </p> con un límite
    // corto: mide 265 caracteres. Se abre una ventana y se busca la primera
    // cifra con euro.
    const ventana = html.slice(ini, Math.min(fin, ini + 2000));
    const pIdx = ventana.indexOf('<p class="precio">');
    let precio = null;
    if (pIdx >= 0) {
      const seg = ventana.slice(pIdx, pIdx + 600);
      // Quitar las etiquetas y buscar la primera cifra en euros que no sea
      // una cuota mensual.
      const texto = seg.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ");
      for (const mm of texto.matchAll(/([\d.]+)\s*€/g)) {
        const antes = texto.slice(Math.max(0, mm.index - 30), mm.index).toLowerCase();
        if (/cuota|al mes|financiaci/.test(antes)) continue;
        const n = Math.round(parseFloat(mm[1].replace(/\./g, "")));
        if (n > 500) { precio = n; break; }
      }
    }
    items.push({
      nombre: nombres[i].nombre,
      precio,
      url: url ? "https://www.autocasion.com" + url : "",
      slug,
      tokens: tok(nombres[i].nombre),
    });
  }
  return items;
}

// El bloque .paginacion dice el número de páginas: "total_pages" en las
// listas largas, o el último enlace ?page=N.
function paginasTotales(html) {
  let max = 1;
  for (const m of html.matchAll(/[?&]page=(\d+)/g)) max = Math.max(max, +m[1]);
  const t = html.match(/total_pages">(\d+)/);
  if (t) max = Math.max(max, +t[1]);
  return Math.min(max, 20); // tope de seguridad
}

// ── emparejamiento ─────────────────────────────────────────────────────────
//
// El portal llama "modelo" a lo que va en el segundo segmento de la URL del
// anuncio: /coches-nuevos/cupra-born/cupra-born-... El precio de un modelo es
// el más bajo de SUS anuncios, así que el emparejamiento va en tres pasos:
//
//   1. VALIDEZ POR NOMBRE: el nombre del anuncio tiene que contener todos los
//      tokens del modelo. Esto separa "iX" de "iX1" y "EQE" de "EQE SUV".
//   2. IDENTIDAD POR SLUG: los anuncios válidos se agrupan por slug, que es
//      la identidad de modelo del portal. Entre los grupos válidos se elige
//      el que mejor encaja con nuestro modelo, con dos criterios en orden:
//      primero, los tokens del modelo que el slug NO cubre ("falta"); a
//      igualdad, los tokens que el slug aporta de más ("sobra"). Así:
//        - "Mercedes EQE" (falta 0, sobra 0) gana a "EQE SUV" (falta 0, sobra 1)
//        - "Mercedes EQE SUV" (falta 0) gana a "EQE" (falta 1)
//        - "Škoda Elroq" gana a "Elroq RS", y "Elroq RS" al revés.
//      Con un solo criterio los dos primeros casos se empataban y dos modelos
//      distintos se quedaban con el mismo precio.
//   3. PRECIO: el más bajo dentro del grupo elegido. Es el precio de acceso
//      de la gama, que es lo que el portal publica como precio del modelo.
//
// Se descartaron dos criterios anteriores que fallaban:
//   - "el anuncio con menos palabras extra" elegía la versión equivocada
//     (Cupra Born: "Born e-Boost Pack" tiene más palabras que "Born 140kW",
//     y el más barato es el e-Boost Pack, no el otro).
//   - "el precio más bajo de todos los anuncios válidos" se colaba con el
//     modelo hermano (el SUV del EQE es más barato que la berlina).
function encajeSlug(tokensSlug, tokensModelo, tokensMarca) {
  // "falta": tokens del modelo que el slug no nombra.
  const faltan = tokensModelo.filter(t => !tokensSlug.includes(t)).length;
  // "sobra": tokens que el slug aporta y el modelo no pide.
  let sobra = 0;
  for (const t of tokensSlug) {
    if (tokensModelo.includes(t)) continue;
    if (tokensMarca.includes(t)) continue;
    if (t === "electrico") continue;   // la marca eléctrica no penaliza
    sobra++;
  }
  return { faltan, sobra };
}

export function emparejar(vehiculo, anuncios) {
  const tokensModelo = tok(vehiculo.modelo);
  const tokensMarca = tok(vehiculo.marca);
  if (!tokensModelo.length) return null;
  // El modelo sin la marca "eléctrico" (CLA EV -> CLA): en un listado
  // filtrado a eléctrico no aporta nada y deja fuera anuncios que no lo
  // llevan escrito.
  const sinElectrico = tokensModelo.filter(t => t !== "electrico");
  const objetivo = sinElectrico.length ? sinElectrico : tokensModelo;

  const validos = anuncios.filter(a => objetivo.every(t => a.tokens.includes(t)));
  if (!validos.length) return null;

  // Agrupar por slug (identidad de modelo del portal).
  const grupos = new Map();
  for (const a of validos) {
    const clave = a.slug || a.nombre;
    if (!grupos.has(clave)) grupos.set(clave, { slug: a.slug, slugTokens: tok(a.slug), anuncios: [] });
    grupos.get(clave).anuncios.push(a);
  }

  // Elegir el grupo que mejor encaja con nuestro modelo: primero el que
  // menos tokens del modelo deja sin cubrir, luego el que menos aporta de más.
  let mejor = null, mejorFaltan = Infinity, mejorSobra = Infinity;
  for (const g of grupos.values()) {
    if (!g.slug) continue;
    const e = encajeSlug(g.slugTokens, objetivo, tokensMarca);
    if (e.faltan < mejorFaltan || (e.faltan === mejorFaltan && e.sobra < mejorSobra)) {
      mejorFaltan = e.faltan; mejorSobra = e.sobra; mejor = g;
    }
  }
  if (!mejor) {
    // Ningún grupo tiene slug: se usa el anuncio más barato de los válidos.
    const conPrecio = validos.filter(a => a.precio).sort((a, b) => a.precio - b.precio);
    if (!conPrecio.length) return { sinPrecio: true, anuncio: validos[0] };
    return { precio: conPrecio[0].precio, anuncio: conPrecio[0], alternativos: conPrecio.length };
  }

  const conPrecio = mejor.anuncios.filter(a => a.precio).sort((a, b) => a.precio - b.precio);
  if (!conPrecio.length) return { sinPrecio: true, anuncio: mejor.anuncios[0] };
  return { precio: conPrecio[0].precio, anuncio: conPrecio[0], alternativos: conPrecio.length, slug: mejor.slug };
}

// Banda de sanity contra el RRP de Alemania (ev-database). Anchura amplia a
// propósito: solo tiene que atrapar errores gordos (un Taycan con precio de
// Macan), no filtrar precios legítimamente distintos.
function sanity(precio, precioDE) {
  if (!precioDE) return true;
  return precio >= precioDE * 0.3 && precio <= precioDE * 1.9;
}

// ── programa ───────────────────────────────────────────────────────────────
async function leerLineas(ruta) {
  try {
    const t = await fs.readFile(ruta, "utf8");
    return t.split("\n").map(l => l.trim()).filter(Boolean);
  } catch { return []; }
}

export async function main() {
  simularFallo = process.argv.includes("--fallo-simulado");
  const lineasVeh = (await fs.readFile(VEHICULOS, "utf8")).split("\n").map(l => l.trim()).filter(Boolean);
  const vehiculos = lineasVeh.map(l => {
    const [marca, modelo] = l.split("|");
    return { marca, modelo, nombre: `${marca} ${modelo}` };
  });

  // RRP de Alemania para el contrapeso de sanity.
  const specs = {};
  for (const l of await leerLineas(SPECS)) {
    const c = l.split("|");
    if (c.length >= 6 && c[5]) specs[c[0]] = +c[5];
  }

  // Fichero actual: base de la salvaguarda y de los precios a conservar.
  const antes = await leerLineas(PRECIOS);
  const previos = {};
  for (const l of antes) {
    const [nombre, precio] = l.split("|");
    if (nombre && precio && +precio > 0) previos[nombre] = +precio;
  }

  const porMarca = new Map();
  for (const v of vehiculos) {
    if (!porMarca.has(v.marca)) porMarca.set(v.marca, []);
    porMarca.get(v.marca).push(v);
  }

  const porSlug = new Map();
  let peticiones = 0;
  let marcasOk = 0;
  let marcasPrevistas = 0;

  for (const [marca, grupo] of porMarca) {
    const cfg = MARCAS[marca];
    if (!cfg) {
      console.log(`  SIN SLUG  ${marca}: no hay marca equivalente en ${FUENTE_URL}`);
      continue;
    }
    marcasPrevistas++;
    const base = `${FUENTE_URL}/${cfg.slug}/electrico`;
    try {
      const html = await pedir(base);
      peticiones++;
      const paginas = paginasTotales(html);
      const items = parseListado(html, cfg.prefijo);
      for (let p = 2; p <= paginas; p++) {
        const htmlP = await pedir(`${base}?page=${p}`);
        peticiones++;
        items.push(...parseListado(htmlP, cfg.prefijo));
      }
      porSlug.set(marca, items);
      marcasOk++;
      console.log(`  ${marca.padEnd(14)} ${String(items.length).padStart(3)} anuncios (${paginas} pág.) -> ${items.filter(i => i.precio).length} con precio`);
    } catch (e) {
      console.log(`  ERROR ${marca}: ${e.message}`);
    }
  }

  // ── salvaguarda 1: la fuente ha caído de forma general ──
  if (marcasPrevistas && marcasOk / marcasPrevistas < UMBRAL_MARCAS) {
    console.log("");
    console.log(`AVISO: solo respondieron ${marcasOk} de ${marcasPrevistas} marcas. La fuente se considera caída.`);
    console.log(`       Se conserva web/data/prices-es.txt sin cambios.`);
    await fs.writeFile(META, JSON.stringify({
      fuente: FUENTE, fuenteUrl: FUENTE_URL, licenciaFuente: LICENCIA_FUENTE,
      fechaIntento: new Date().toISOString().slice(0, 10),
      resultado: "descartado-fuente-caida", marcasOk, marcasPrevistas,
    }, null, 2));
    return;
  }

  // ── emparejar ──
  const precios = {};
  const conservados = [];
  const avisos = [];
  const porAlias = [];
  for (const v of vehiculos) {
    const items = porSlug.get(v.marca) || [];
    let r = emparejar(v, items);
    let nombreBuscado = v.modelo;
    // Si no hay precio con el nombre de OpenEV Data, se prueba el alias
    // europeo del portal.
    if ((!r || !r.precio) && ALIAS[v.nombre]) {
      const alias = ALIAS[v.nombre];
      const [marcaAlias, ...resto] = alias.split(" ");
      r = emparejar({ marca: marcaAlias, modelo: resto.join(" ") }, items);
      if (r && r.precio) {
        nombreBuscado = alias;
        porAlias.push(`${v.nombre} -> ${alias}`);
      }
    }
    if (r && r.precio) {
      const ref = specs[v.nombre];
      if (!sanity(r.precio, ref)) {
        avisos.push(`${v.nombre}: precio ${r.precio} € fuera de banda (RRP Alemania ${ref} €) — descartado`);
        continue;
      }
      precios[v.nombre] = r.precio;
    }
  }

  // ── salvaguarda 2: el resultado no puede tener menos líneas que el actual ──
  if (!simularFallo) {
    // Conservar los precios anteriores de los modelos que esta pasada no ha
    // encontrado: la fuente puede fallar para un modelo sin que el dato viejo
    // deje de ser bueno.
    for (const [nombre, precio] of Object.entries(previos)) {
      if (precios[nombre] === undefined && vehiculos.some(v => v.nombre === nombre)) {
        precios[nombre] = precio;
        conservados.push(nombre);
      }
    }
  }

  const lineas = Object.entries(precios)
    .map(([nombre, precio]) => `${nombre}|${precio}`)
    .sort((a, b) => a.localeCompare(b, "es"));

  console.log("");
  console.log(`Modelos con precio: ${lineas.length} de ${vehiculos.length} (antes: ${antes.length})`);
  console.log(`Conservados de la pasada anterior: ${conservados.length}`);
  if (porAlias.length) console.log(`Resueltos por alias de nombre: ${porAlias.join(", ")}`);
  for (const a of avisos) console.log(`  AVISO ${a}`);
  const sinPrecio = vehiculos.filter(v => precios[v.nombre] === undefined);
  console.log(`Sin precio: ${sinPrecio.length}` + (sinPrecio.length ? ` -> ${sinPrecio.map(v => v.nombre).join(", ")}` : ""));

  if (lineas.length < antes.length) {
    console.log("");
    console.log(`AVISO: el resultado tiene ${lineas.length} líneas y el fichero anterior tenía ${antes.length}.`);
    console.log(`       Se conserva web/data/prices-es.txt sin cambios (un fallo de la fuente no puede borrar datos buenos).`);
    await fs.writeFile(META, JSON.stringify({
      fuente: FUENTE, fuenteUrl: FUENTE_URL, licenciaFuente: LICENCIA_FUENTE,
      fechaIntento: new Date().toISOString().slice(0, 10),
      resultado: "descartado-por-salvaguarda", lineasNuevas: lineas.length, lineasAnteriores: antes.length,
    }, null, 2));
    console.log("AVISO: se deja constancia del intento en web/data/prices-es-meta.json.");
    return;
  }

  await fs.writeFile(PRECIOS, lineas.join("\n") + "\n");
  await fs.writeFile(META, JSON.stringify({
    fuente: FUENTE,
    fuenteUrl: FUENTE_URL,
    licenciaFuente: LICENCIA_FUENTE,
    fecha: new Date().toISOString().slice(0, 10),
    peticiones,
    marcasConsultadas: marcasPrevistas,
    modelos: vehiculos.length,
    conPrecio: lineas.length,
    conservados,
    porAlias,
    metodo: "Listado por marca filtrado a eléctrico (/coches-nuevos/<marca>/electrico), paginado con ?page=N; emparejado por tokens de modelo y contraste de precio con el RRP de Alemania de ev-database.",
  }, null, 2));

  console.log("");
  console.log(`OK  web/data/prices-es.txt  ${lineas.length} precios  (${peticiones} peticiones)`);
  console.log(`OK  web/data/prices-es-meta.json  fecha ${new Date().toISOString().slice(0, 10)}`);
}

// Solo se ejecuta al lanzar el script; importarlo no dispara nada.
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch(e => { console.error("ERROR FATAL", e); process.exit(1); });
}
