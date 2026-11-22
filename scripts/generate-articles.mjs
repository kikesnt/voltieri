// Generador de las guías del blog de Voltieri.
// Contenido propio y con datos del proyecto; cada guía enlaza herramientas, otras guías y equipamiento afiliado.
// Uso: node scripts/generate-articles.mjs   (escribe web/blog/*.html)
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("web/blog");
await fs.mkdir(OUT, { recursive: true });

import { hbar, line } from "./charts.mjs";
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const P = t => `<p>${t}</p>`;
const UL = items => `<ul>${items.map(i => `<li>${i}</li>`).join("")}</ul>`;
const NOTE = t => `<p class="note">${t}</p>`;
// Cita con enlace: el crédito va junto al dato, no escondido en las legales.
const SRC = (label, url) => `<p class="source">Fuente: <a href="${url}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a></p>`;
const isNum = c => /^[\d~]/.test(String(c));
const T = (head, rows) => `<div class="table-wrap"><table><thead><tr>${head.map((h, i) => `<th${i && isNum(rows[0][i]) ? ' class="num"' : ""}>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td${i && isNum(c) ? ' class="num"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

const TOOLS = {
  range:     ["../range.html", "Autonomía real", "Velocidad, frío y desnivel sobre la cifra del folleto."],
  planner:   ["../planificador.html", "Planificador de rutas", "Ruta con paradas, cargadores y coste."],
  map:       ["../mapa-autonomia.html", "Mapa de autonomía", "Hasta dónde llegas desde cualquier punto de España."],
  tco:       ["../tco.html", "Coste total de propiedad", "Eléctrico frente a gasolina, año a año."],
  charge:    ["../charge.html", "Simulador de carga", "Cuánto tarda de verdad tu carga rápida."],
  optimizer: ["../optimizador-carga.html", "Optimizador de carga", "La hora más barata para cargar en casa."],
  chargers:  ["../chargers.html", "Mapa de cargadores", "Puntos de recarga oficiales con potencia y conector."],
  catalog:   ["../catalog.html", "Catálogo de coches", "113 modelos con datos reales."],
  compare:   ["../compare.html#fichas", "Comparador de fichas", "Dos coches, una sola ficha."],
  trunk:     ["../compare.html#maletero", "Comparador de maleteros", "El maletero que de verdad usas."],
  aids:      ["../finance.html#ayudas", "Ayudas y deducciones", "Precio efectivo con enlaces a las fuentes oficiales."],
  install:   ["../finance.html#instalacion", "Coste de instalación", "Cuánto cuesta cargar en casa."],
  sizing:    ["../finance.html#dimensionado", "Dimensionado de la instalación", "La potencia que necesitas."],
  homepub:   ["../finance.html#casa-publica", "Casa frente a carga pública", "Dónde te sale más barato."],
  tariffs:   ["../finance.html#tarifas", "Tarifas eléctricas", "Qué pagas por cada kWh."],
  wallboxtool: ["../finance.html#wallbox", "¿Qué wallbox necesito?", "La potencia justa según tu contrato y tus km."],
  maint:     ["../service.html#mantenimiento", "Mantenimiento EV", "Lo que se ahorra en taller."],
  chem:      ["../sim.html#quimica", "Química de batería", "LFP o NMC, decidido."],
  degrade:   ["../sim.html#degradacion", "Degradación de batería", "Cómo envejece tu batería."],
  winter:    ["../sim.html#invierno", "Autonomía invernal", "Qué pasa a 0 °C."],
  tyres:     ["../sim.html#neumaticos", "Neumáticos", "Lo que cuesta una rueda."],
  aero:      ["../sim.html#aerodinamico", "Aerodinámica", "El viento también cuenta."],
};

import part1 from "./articles-1.mjs";
import part2 from "./articles-2.mjs";
import part3 from "./articles-3.mjs";
import part4 from "./articles-4.mjs";
// Los precios y fichas salen de web/data para que la tabla coincida siempre con el catálogo.
const rd = f => fs.readFile(path.resolve("web/data", f), "utf8").then(t => t.trim().split("\n").filter(Boolean).map(l => l.split("|")));
const vehicles = Object.fromEntries((await rd("vehicles.txt")).map(c => [`${c[0]} ${c[1]}`, { brand: c[0], wltp: +c[4], dc: +c[5], battery: +c[3], chem: c[8] || "" }]));
const prices = (await rd("prices-es.txt")).map(([name, price]) => ({ name, price: +price })).filter(p => vehicles[p.name]);
const cheap = prices.sort((a, b) => a.price - b.price).slice(0, 5).map(p => ({ ...p, real: Math.round(vehicles[p.name].wltp * 0.85), dc: vehicles[p.name].dc }));
if (cheap.length < 5) throw new Error("web/data/prices-es.txt vacío o incompleto: no se generan las guías con precios inventados");
const prov = (await rd("provincias.txt")).map(([name, points, fast, inst]) => ({ name, points: +points, fast: +fast, inst: +inst }));
const market = (await rd("market.txt")).map(([kind, c, y, v]) => ({ kind, c, y, v }));
const priceOf = Object.fromEntries(prices.map(p => [p.name, p.price]));
// Las fechas de los datos salen de los propios ficheros, no se escriben a mano:
// si el cron refresca los precios, el texto se actualiza con ellos.
const metaPrecios = JSON.parse(await fs.readFile(path.resolve("web/data/prices-es-meta.json"), "utf8"));
const FECHA = metaPrecios.fecha.split("-").reverse().join("/");
const FECHA_PVPC = (await rd("pvpc.txt"))[0][0].split("-").reverse().join("/");
const top = Object.entries(vehicles).sort((a, b) => b[1].wltp - a[1].wltp).slice(0, 8).map(([name, v]) => ({ name, ...v, real: Math.round(v.wltp * 0.85) }));
const CHINESE = ["BYD", "Zeekr", "Leapmotor", "GAC Aion"];
const chinese = Object.entries(vehicles).filter(([, v]) => CHINESE.includes(v.brand)).sort((a, b) => CHINESE.indexOf(a[1].brand) - CHINESE.indexOf(b[1].brand) || b[1].wltp - a[1].wltp).map(([name, v]) => ({ name, ...v, price: priceOf[name] || null }));
const ARTICLES = [...part1({ P, UL, NOTE, SRC, T, hbar, line, cheap, ioniq5: prices.find(p => p.name === "Hyundai IONIQ 5").price, FECHA, FECHA_PVPC }), ...part2({ P, UL, NOTE, SRC, T, FECHA, FECHA_PVPC }), ...part3({ P, UL, NOTE, SRC, T, hbar, line, top, chinese, FECHA, FECHA_PVPC }), ...part4({ P, UL, NOTE, SRC, T, hbar, line, prov, market, FECHA, FECHA_PVPC })];

const bySlug = Object.fromEntries(ARTICLES.map(a => [a.slug, a]));
const words = html => html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
const slugId = (t, i) => `s${i + 1}`;

const NAV = `<header><a class="brand" href="../index.html">Voltieri</a><nav><a href="../catalog.html">Coches</a><a href="../planificador.html">Rutas</a><a href="../range.html">Autonomía</a><a href="../tco.html">Costes</a><a href="../herramientas.html">Herramientas</a><a href="index.html">Guías</a><a class="nav-pill" href="../productos.html">Equipamiento</a></nav></header>`;
const FOOT = `<footer class="site-footer"><span>© 2026 Voltieri · Datos abiertos, sin cuentas</span><span class="links"><a href="../herramientas.html">Herramientas</a><a href="../blog/index.html">Guías</a><a href="../productos.html">Equipamiento</a><a href="../aviso-legal.html">Aviso legal</a><a href="../privacidad.html">Privacidad</a><a href="../cookies.html">Cookies</a><a href="../afiliados.html">Afiliados</a></span></footer>`;
const HEAD = (title, desc, canon, ld) => `<!doctype html>
<html lang="es" data-skin="2027" data-theme="day">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | Voltieri</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="https://kikesnt.github.io/voltieri/blog/${canon}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="article">
<link rel="icon" href="../icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="../apple-touch-icon.png"><meta name="theme-color" content="#0E7A53">
<meta property="og:image" content="https://kikesnt.github.io/voltieri/og-image.png"><meta name="twitter:image" content="https://kikesnt.github.io/voltieri/og-image.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../tokens.css"><link rel="stylesheet" href="../components.css"><link rel="stylesheet" href="../blog.css">
${ld ? `<script type="application/ld+json">${ld}</script>` : ""}
<script src="../theme.js"></script>
<script src="../cookies.js" defer></script>
</head>`;

const tpl = a => {
  const body = a.sections.map(([h, blocks], i) => {
    const shelves = (a.shelves || []).filter(s => s.after === i)
      .map(s => `<div data-shelf="${s.cat}" data-title="${esc(s.title)}" data-lede="${esc(s.lede)}" data-limit="3"></div>`).join("");
    return `<section id="${slugId(h, i)}"><h2>${esc(h)}</h2>${blocks.join("")}${shelves}</section>`;
  }).join("\n");
  const textHtml = body + a.faq.map(f => f.join(" ")).join(" ");
  const mins = Math.max(2, Math.round((words(textHtml) + words(a.summary + a.lede)) / 200));
  const toc = `<nav class="toc" aria-label="Contenido"><strong>En esta guía</strong><ol>${a.sections.map(([h], i) => `<li><a href="#${slugId(h, i)}">${esc(h)}</a></li>`).join("")}<li><a href="#faq">Preguntas frecuentes</a></li></ol></nav>`;
  const ld = JSON.stringify([
    { "@context": "https://schema.org", "@type": "Article", headline: a.title, description: a.desc, datePublished: "2026-11-21", dateModified: "2026-11-22", author: { "@type": "Organization", name: "Voltieri" }, publisher: { "@type": "Organization", name: "Voltieri" }, mainEntityOfPage: `https://kikesnt.github.io/voltieri/blog/${a.slug}.html` },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: a.faq.map(([q, r]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: r } })) },
  ]);
  return `${HEAD(a.title, a.desc, a.slug + ".html", ld)}
<body>
${NAV}
<main class="post">
<p class="crumbs"><a href="index.html">Guías</a> / ${esc(a.cat)}</p>
<h1>${esc(a.title)}</h1>
<p class="meta">${esc(a.cat)} · Actualizado el 22 de noviembre de 2026 · ${mins} min de lectura</p>
<p class="lede">${esc(a.lede)}</p>
<aside class="summary"><strong>En resumen</strong><p>${esc(a.summary)}</p></aside>
${toc}
${body}
<section id="faq"><h2>Preguntas frecuentes</h2>${a.faq.map(([q, r]) => `<h3>${esc(q)}</h3><p>${esc(r)}</p>`).join("")}</section>
<section class="tools"><h2>Calcula tu caso</h2><ul>${a.tools.map(k => `<li><a href="${TOOLS[k][0]}"><strong>${TOOLS[k][1]}</strong><span>${TOOLS[k][2]}</span></a></li>`).join("")}</ul></section>
<section class="related"><h2>Sigue leyendo</h2><ul>${a.related.map(s => `<li><a href="${s}.html"><strong>${esc(bySlug[s].title)}</strong><span>${esc(bySlug[s].cat)}</span></a></li>`).join("")}</ul></section>
<p class="note">${esc(a.note)} Algunos enlaces a Amazon.es son de afiliado: como afiliado de Amazon, Voltieri obtiene ingresos por las compras adscritas que cumplen los requisitos aplicables. El precio para ti no cambia. <a href="../afiliados.html">Cómo lo hacemos</a>.</p>
${FOOT}
</main>
<script type="module" src="../affiliate.js"></script>
</body>
</html>
`;
};

const index = () => {
  const cats = [...new Set(ARTICLES.map(a => a.cat))];
  const cards = ARTICLES.map(a => `<li><a href="${a.slug}.html"><span class="cat">${esc(a.cat)}</span><strong>${esc(a.title)}</strong><span>${esc(a.desc)}</span></a></li>`).join("\n");
  return `${HEAD("Guías para conducir un coche eléctrico", "Guías prácticas sobre coches eléctricos en España: autonomía real, carga en casa, ayudas, seguros y equipamiento, con datos verificables.", "index.html", "")}
<body>
${NAV}
<main class="post">
<h1>Guías de coche eléctrico</h1>
<p class="lede">${ARTICLES.length} guías prácticas con datos fechados y enlaces a las herramientas que los calculan. Temas: ${cats.map(c => c.toLowerCase()).join(", ")}.</p>
<ul class="cards">
${cards}
</ul>
<section class="shelf-wrap"><div data-shelf="wallbox" data-title="Lo más buscado: wallbox para casa" data-lede="Si vas a comprar un eléctrico, empieza por resolver cómo cargarlo." data-limit="3"></div></section>
${FOOT}
</main>
<script type="module" src="../affiliate.js"></script>
</body>
</html>
`;
};

for (const a of ARTICLES) {
  await fs.writeFile(path.join(OUT, a.slug + ".html"), tpl(a));
  console.log("OK", a.slug);
}
await fs.writeFile(path.join(OUT, "index.html"), index());
console.log("Guías generadas:", ARTICLES.length);
