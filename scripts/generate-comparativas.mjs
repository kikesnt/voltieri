// Genera comparativas de equipamiento EV con productos reales de Amazon.es.
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("web");
const data = JSON.parse(await fs.readFile(path.join(OUT,"data/amazon-products.json"),"utf8"));
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

const META = {
  "cables-tipo2": {
    file:"comparativa-cables-tipo2.html",
    title:"Mejores cables Tipo 2 para coche eléctrico (2026)",
    desc:"Comparativa de cables Tipo 2 a Tipo 2 con precios y valoraciones reales de Amazon.es.",
    h2:["Cómo elegir un cable Tipo 2","Qué significa 22 kW en un cable","Longitud y peso","Precio frente a durabilidad","Preguntas frecuentes"],
    body:[
      "Un cable Tipo 2 sirve para cargar en punto público cuando el cargador no lleva cable propio. La potencia de 22 kW exige trifásico y 32 A; si tu coche solo admite monofásico, un cable de 7,4 kW basta y cuesta menos.",
      "La cifra de 22 kW es el límite del cable, no lo que cargará tu coche. El cargador y la batería marcan el ritmo real. Comprar más potencia no acelera una carga si el vehículo no la aprovecha.",
      "Cinco metros es la longitud habitual. Más metros facilitan aparcar, pero añaden peso y vueltas que hay que guardar en el maletero.",
      "Los cables de 90 a 100 € concentran las mejores valoraciones. Los de gama alta suben de precio por marca y materiales, no siempre por una diferencia usable.",
      "¿Necesito 22 kW? Solo si tu coche y el punto público lo aprovechan. ¿Puedo dejarlo en el coche? Sí, con funda y sin enrollarlo apretado."
    ]
  },
  "wallbox": {
    file:"comparativa-wallbox-7400.html",
    title:"Mejores wallbox 7,4 kW para casa (2026)",
    desc:"Comparativa de wallbox monofásicos con app, cable y protección, con precios reales de Amazon.es.",
    h2:["Cómo elegir un wallbox doméstico","Potencia monofásica frente a trifásica","App y control de carga","Protección RCD e instalación","Preguntas frecuentes"],
    body:[
      "Un wallbox de 7,4 kW es el punto de equilibrio para la mayoría de los hogares españoles con contrato monofásico. Carga unas 50 kWh en siete horas, suficiente para una noche.",
      "La opción trifásica de 22 kW solo aporta velocidad si la acometida y el coche la admiten. Instalarla sin esas condiciones desperdiciar dinero.",
      "La app permite programar la carga en horas valle y ajustar la intensidad. Es una de las pocas funciones que sí cambia la factura.",
      "La protección RCD tipo A con detección de 6 mA CC es importante. La instalación debe hacerla un electricista autorizado según el REBT.",
      "¿Puedo instalarlo yo? No. ¿Necesito aumentar la potencia contratada? Depende de tu consumo, pero 7,4 kW suelen bastar."
    ]
  },
  "adaptadores-ccs2": {
    file:"comparativa-adaptadores-ccs2.html",
    title:"Adaptadores CCS2: cuáles valen la pena (2026)",
    desc:"Comparativa de adaptadores CCS2 a Tipo 2, CCS1 y NACS con precios y valoraciones reales.",
    h2:["Cómo elegir un adaptador CCS2","CC y CA: no es lo mismo","Compatibilidad con Tesla y NACS","Por qué importa la valoración","Preguntas frecuentes"],
    body:[
      "Un adaptador CCS2 a Tipo 2 permite cargar en corriente alterna con un conector distinto. No convierte un cargador rápido en lento ni al revés: respeta el tipo de corriente.",
      "La corriente continua llega a cientos de amperios. Un adaptador mal fabricado puede calentarse, por eso la tensión y la intensidad declaradas importan más que el precio.",
      "Los adaptadores CCS2 a NACS o a Tesla tienen un mercado cambiante. Comprueba el modelo exacto de tu coche antes de confiar en la compatibilidad.",
      "Una valoración de 2,6 estrellas en un adaptador barato es una señal clara. Aquí el ahorro de 40 € no compensa una mala conexión.",
      "¿Sirve para cargar más rápido? No. ¿Puedo usarlo a diario? Solo si está bien valorado y compatible con tu coche."
    ]
  },
  "cargador-portatil": {
    file:"comparativa-cargador-portatil.html",
    title:"Mejores cargadores portátiles para coche eléctrico (2026)",
    desc:"Comparativa de cargadores portátiles Tipo 2 y Schuko con precios y valoraciones reales de Amazon.es.",
    h2:["Cómo elegir un cargador portátil","Schuko frente a Tipo 2","Corriente ajustable y pantalla","Cuándo usarlo como respaldo","Preguntas frecuentes"],
    body:[
      "Un cargador portátil sirve para visitas a familiares o como和安全 respaldo en viaje. No sustituye a un wallbox porque depende de un enchufe doméstico.",
      "Los modelos con enchufe Schuko cargan a 3,7 kW. Los que llevan conector Tipo 2 necesitan un punto con ese conector, por lo que son menos universales.",
      "Ajustar la intensidad de 6 a 16 A permite adaptarse a la instalación disponible. La pantalla ayuda a ver corriente y temperatura.",
      "Úsalo como plan B. Para cargar cada noche, un wallbox con instalación revisada es más seguro y cómodo.",
      "¿Puedo llevarlo en el coche? Sí. ¿Carga igual que un wallbox? No, suele ir a 3,7 kW."
    ]
  }
  ,"estaciones-22kw": {
    file:"comparativa-estaciones-22kw.html",
    title:"Mejores estaciones 22 kW para coche eléctrico (2026)",
    desc:"Comparativa de wallbox trifásicos 22 kW con precios y valoraciones reales de Amazon.es.",
    h2:["Cómo elegir una estación 22 kW","Acometida trifásica: el requisito clave","Potencia real frente a potencia nominal","Certificaciones y precio","Preguntas frecuentes"],
    body:[
      "Una estación de 22 kW solo acelera la carga si la instalación dispone de tres fases y el vehículo admite esa potencia. Sin esas dos condiciones, el mismo aparato se comporta como uno de 7,4 kW.",
      "La acometida trifásica suele exigir contrato y cuadro adaptados. Antes de comprar, pide a un electricista que revise la potencia disponible y la sección del cable.",
      "El rango de precios va de 207,57 € a 594,15 €. La diferencia no siempre es velocidad: también cuenta la app, el lector RFID, la longitud del cable y la certificación.",
      "Los modelos con CE y TÜV ofrecen una garantía documentada. El Wallbox Pulsar MAX es la opción más cara de la comparativa, pensada para un uso exigente.",
      "¿Necesito 22 kW? Solo si tu coche y tu acometida lo aprovechan. ¿Puedo instalarlo yo? No: debe hacerlo un profesional autorizado."
    ]
  },
  "v2l": {
    file:"comparativa-v2l.html",
    title:"Mejores adaptadores V2L para coche eléctrico (2026)",
    desc:"Comparativa de adaptadores V2L para alimentar enchufes desde el coche, con precios reales.",
    h2:["Cómo elegir un adaptador V2L","Qué puedes alimentar con 3,5 kW","Compatibilidad por marca","Protección y uso responsable","Preguntas frecuentes"],
    body:[
      "Un adaptador V2L convierte la batería del coche en una fuente de corriente alterna. Sirve para herramientas, iluminación o emergencias, siempre dentro de los 3,5 kW habituales.",
      "No todos los coches ofrecen esta función. BYD, MG y XPeng la han popularizado en algunos modelos; consulta el manual antes de asumir que tu coche la tiene.",
      "La compatibilidad importa más que el precio. Un adaptador específico para Atto 3 puede no servir en un MG4, aunque ambos usen conector Tipo 2.",
      "Antes de usarlo, revisa la potencia total de lo que conectas y evita prolongadores largos. La protección IP54 es útil si lo usas al aire libre.",
      "¿Descarga mucha batería? Depende del consumo conectado. ¿Sirve para cargar otro coche? No: un V2L no es un cargador EV."
    ]
  }
};

const tpl = (cat, meta) => `<!doctype html>
<html lang="es" data-skin="2027" data-theme="night">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(meta.title)} | Voltieri</title>
<meta name="description" content="${esc(meta.desc)}">
<link rel="canonical" href="https://kikesnt.github.io/voltieri/${meta.file}">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="components.css">
<style>
header{display:flex;align-items:center;gap:20px;padding:14px 30px;background:var(--paper);border-bottom:1px solid var(--ink)}
.brand{font-size:12px;font-weight:600;letter-spacing:.2em;color:var(--ink);text-decoration:none}
nav{margin-left:auto;display:flex;gap:16px;font-size:12px}nav a{color:var(--muted);text-decoration:none}
main{max-width:860px;margin:0 auto;padding:50px 26px 90px}
h1{font-size:clamp(32px,4vw,48px);line-height:1.06;letter-spacing:-.04em;font-weight:500}
.meta{font-family:var(--font-data);font-size:9px;letter-spacing:.12em;color:var(--muted);margin-top:16px;text-transform:uppercase}
.lede{font-size:15px;line-height:1.7;margin-top:22px;padding-bottom:22px;border-bottom:1px solid var(--rule)}
h2{font-size:24px;letter-spacing:-.03em;font-weight:500;margin-top:40px;padding-top:16px;border-top:1px solid var(--rule)}
h3{font-size:16px;font-weight:500;margin-top:22px}
p,li{font-size:14px;line-height:1.7;margin-top:12px}
table{width:100%;border-collapse:collapse;margin-top:20px;font-size:12px}
th,td{text-align:left;padding:9px 8px;border-bottom:1px solid var(--rule)}
th{font-family:var(--font-data);font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.buy{display:inline-block;padding:7px 10px;background:var(--ink);color:var(--paper);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;text-decoration:none}
.buy:hover{background:var(--amber)}
.best{font-family:var(--font-data);font-size:8px;color:var(--amber);text-transform:uppercase}
.source{font-size:10px;color:var(--muted);line-height:1.6;margin-top:12px}
footer{margin-top:60px;padding-top:20px;border-top:1px solid var(--ink);display:flex;gap:18px;flex-wrap:wrap;font-family:var(--font-data);font-size:9px;color:var(--muted)}
footer a{color:var(--muted)}
@media(max-width:700px){header{padding:14px 18px}nav{display:none}main{padding:34px 18px 70px}table{font-size:10px}}
</style>
</head>
<body>
<header><a class="brand" href="index.html">VOLTIERI</a><nav><a href="comparativas.html">Comparativas</a><a href="productos.html">Productos</a><a href="blog/">Blog</a></nav></header>
<main>
<h1>${esc(meta.title)}</h1>
<div class="meta">Comparativa · 21 de noviembre de 2026 · datos de Amazon.es · tag volteri-21</div>
<p class="lede">${esc(cat.intro)} Hemos recogido ${cat.products.length} productos con su ASIN, precio y valoración del día de publicación. Los enlaces son de afiliado y el precio no cambia para ti.</p>
${meta.h2.map((h,i)=>`<h2>${esc(h)}</h2><p>${esc(meta.body[i])}</p>${i===0?productTable(cat):""}${i===2?`<h3>Productos destacados</h3><ul>${cat.products.slice(0,3).map(p=>`<li>${esc(p.title)} — ${esc(p.price)} — ${p.rating?esc(p.rating)+" ★":"sin valoración"} · <a class="buy" data-asin="${p.asin}" href="https://www.amazon.es/dp/${p.asin}?tag=volteri-21" rel="sponsored nofollow" target="_blank">Ver en Amazon →</a></li>`).join("")}</ul>`:""}`).join("\n")}
<h2>Todos los productos comparados</h2>
${productTable(cat)}
<p class="source">Precios y valoraciones recogidos el 21/11/2026 de Amazon.es. Pueden cambiar. Enlaces con <code>rel="sponsored nofollow"</code>. Ver política de afiliados.</p>
<footer><a href="comparativas.html">Comparativas</a><a href="index.html">Inicio</a><a href="aviso-legal.html">Aviso legal</a><a href="privacidad.html">Privacidad</a><a href="afiliados.html">Afiliados</a><span>© 2027 Voltieri</span></footer>
</main>
<script type="module">import { loadAffiliateConfig } from "./affiliate.js"; loadAffiliateConfig();</script>
</body>
</html>`;
const productTable = cat => `<table><thead><tr><th>#</th><th>Producto</th><th class="num">Precio</th><th class="num">Valoración</th><th>Compra</th></tr></thead><tbody>${cat.products.map((p,i)=>`<tr><td>${String(i+1).padStart(2,"0")}</td><td><span class="best">${esc(p.best)}</span><br>${esc(p.title)}<br><span class="source">ASIN ${p.asin}</span></td><td class="num">${esc(p.price)}</td><td class="num">${p.rating?esc(p.rating)+" ★":"—"}</td><td><a class="buy" data-asin="${p.asin}" href="https://www.amazon.es/dp/${p.asin}?tag=volteri-21" rel="sponsored nofollow" target="_blank">Ver en Amazon →</a></td></tr>`).join("")}</tbody></table>`;

for (const cat of data.categories) {
  const meta = META[cat.id];
  await fs.writeFile(path.join(OUT, meta.file), tpl(cat, meta));
  console.log("OK", meta.file);
}
