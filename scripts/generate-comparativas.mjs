// Genera comparativas de equipamiento EV con productos reales de Amazon.es.
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("web");
const data = JSON.parse(await fs.readFile(path.join(OUT,"data/amazon-products.json"),"utf8"));
const cfg = JSON.parse(await fs.readFile(path.join(OUT,"data/affiliate-config.json"),"utf8"));
const TAG = cfg.tag;
const SHOW = data.showPrices === true; // precios y valoraciones solo si vienen de la API oficial
const img = asin => `https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&MarketPlace=ES&ASIN=${asin}&ServiceVersion=20070822&ID=AsinImage&WS=1&Format=_SL250_&tag=${TAG}`;
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
      "Un cargador portátil sirve para visitas a familiares o como respaldo seguro en viaje. No sustituye a un wallbox porque depende de un enchufe doméstico.",
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
  }  ,
  "inflador-neumaticos": {
    file:"comparativa-inflador-neumaticos.html",
    title:"Mejores infladores y medidores de presión para coche eléctrico (2026)",
    desc:"Comparativa de infladores portátiles y manómetros para revisar la presión de los neumáticos de tu coche eléctrico.",
    h2:["Por qué importa la presión en un eléctrico","Inflador portátil o solo medidor","Qué mirar al comprar","Cómo usarlo bien","Preguntas frecuentes"],
    body:[
      "Una clase energética peor y una presión baja pueden añadir hasta un 10 % de consumo en un eléctrico. Revisar la presión cada mes es la comprobación más barata que existe y la que más autonomía devuelve.",
      "Un manómetro digital basta para comprobar. Un inflador portátil de 12 V te permite además corregir en el momento, sin buscar una gasolinera. Si quieres una sola compra, elige un inflador con manómetro integrado.",
      "Fíjate en la parada automática al llegar a la presión elegida, en que muestre bar y PSI, en la longitud del cable de alimentación y en que sea compatible con las válvulas de tu coche.",
      "Mide siempre en frío, con los neumáticos sin rodar, y usa los valores de la etiqueta del marco de la puerta, no el máximo del neumático. Vuelve a comprobar tras un cambio fuerte de temperatura.",
      "¿Necesito inflador si el coche tiene sensor de presión? El sensor avisa, pero no corrige. ¿Cada cuánto debo medir? Cada mes y antes de un viaje largo."
    ]
  },
  "soporte-cable": {
    file:"comparativa-soporte-cable.html",
    title:"Mejores bolsas, soportes y candados para el cable de carga (2026)",
    desc:"Comparativa de bolsas, soportes de pared y candados para guardar y proteger el cable de carga de tu coche eléctrico.",
    h2:["Por qué cuidar el cable","Soporte de pared o bolsa","Candado para el cable","Qué mirar al comprar","Preguntas frecuentes"],
    body:[
      "El cable de carga es una de las piezas más caras que llevas fuera del coche. Enrollado a la fuerza, arrastrado por el suelo o dejado a la intemperie se deteriora antes.",
      "Un soporte de pared junto al wallbox mantiene el cable colgado y fuera del suelo. Una bolsa o funda lo protege en el maletero y evita que se ensucie el resto del equipaje.",
      "Si cargas en un punto público, un candado para el cable lo asegura mientras está conectado. No impide un robo determinado, pero disuade el oportunista. Comprueba que sea compatible con tu conector.",
      "Revisa la longitud del cable que vas a guardar, el material resistente a la intemperie y que el soporte aguante el peso del cable. Si lo cuelgas en la pared, usa tacos adecuados a tu pared.",
      "¿Puedo dejar el cable colgado en la intemperie? Mejor protegido. ¿Sirve el mismo soporte para cables de 5 y 7 m? Normalmente sí, comprobando el diámetro."
    ]
  },
  "maleta-viaje": {
    file:"comparativa-maleta-viaje.html",
    title:"Mejores maletas y organizadores de maletero para el cable y los adaptadores (2026)",
    desc:"Comparativa de bolsas y maletas para llevar ordenados en el maletero el cable de carga, los adaptadores y el cargador portátil.",
    h2:["Qué llevar siempre en el maletero","Maleta rígida o bolsa blanda","Cómo organizarlo","Qué mirar al comprar","Preguntas frecuentes"],
    body:[
      "En un viaje largo conviene llevar el cable Tipo 2, los adaptadores que uses y, si quieres un respaldo, un cargador portátil. Sueltos ruedan por el maletero y se ensucian.",
      "Una bolsa blanda se adapta a cualquier hueco y pesa poco. Una maleta rígida protege mejor los adaptadores y los conectores, a cambio de ocupar más espacio.",
      "Guarda el cable enrollado en grandes vueltas sin forzar y los conectores en un compartimento propio. Deja el cable cargado al final, listo para sacar sin deshacer el equipaje.",
      "Mira las dimensiones interiores, la cremallera, el material resistente al agua y si tiene separadores para los adaptadores. Que se pueda limpiar fácilmente es un plus.",
      "¿Cabe un cable de 7,5 m? Casi siempre, enrollado. ¿Sirve también para el cargador portátil? Si el tamaño lo permite, sí."
    ]
  },
  "nevera-v2l": {
    file:"comparativa-nevera-v2l.html",
    title:"Mejores neveras de 12 V y accesorios V2L para viajar y acampar (2026)",
    desc:"Comparativa de neveras eléctricas y accesorios para usar con la batería del coche o con un adaptador V2L en viajes y camping.",
    h2:["Qué puedes alimentar con V2L","Nevera de 12 V o de 220 V","Cuánto consume","Qué mirar al comprar","Preguntas frecuentes"],
    body:[
      "Un adaptador V2L convierte la batería del coche en una toma de corriente. Sirve para una nevera, una cafetera, herramientas o iluminación en un camping o una parada larga, si tu coche admite la función.",
      "Las neveras de compresor de 12 V se conectan a la toma del coche y consumen poco. Las de 220 V se enchufan al V2L y suelen ofrecer más capacidad. Elige según el espacio y de dónde vayas a alimentarla.",
      "El consumo depende del modelo y de la temperatura exterior. Compara el dato de potencia o de consumo medio que dé el fabricante y no superes la potencia máxima de tu adaptador V2L.",
      "Mira la capacidad en litros, si es de compresor, el nivel de ruido, que tenga protección de batería y que el cable llegue a la toma. Consulta que tu coche permite el V2L antes de comprar.",
      "¿Descarga mucho la batería? Depende del consumo y las horas. ¿Puedo usarla con el coche apagado? Con V2L, según el manual de tu modelo."
    ]
  },
  "invierno": {
    file:"comparativa-invierno.html",
    title:"Mejores cubiertas y raspadores para el coche eléctrico en invierno (2026)",
    desc:"Comparativa de cubiertas de parabrisas y raspadores para el invierno, junto con consejos para no perder autonomía con el frío.",
    h2:["Qué cambia en invierno","Cubierta de parabrisas y raspador","Precalentar sin gastar batería","Qué mirar al comprar","Preguntas frecuentes"],
    body:[
      "Con el frío, un eléctrico pierde entre un 10 % y un 25 % de autonomía según la temperatura. Parte de esa pérdida es la calefacción, y parte, la batería.",
      "Una cubierta de parabrisas evita rascar el hielo por la mañana. Un raspador resistente es el complemento básico. Las dos cosas reducen el tiempo que necesitas con el coche encendido.",
      "Precalentar el coche enchufado usa la electricidad de la red en lugar de la batería, y es la mejor forma de empezar el viaje con el habitáculo templado sin perder kilómetros.",
      "Fíjate en que la cubierta cubra todo el parabrisas y los retrovisores, que tenga sujeciones fiables y que el raspador no raye el cristal. Mejor materiales resistentes a bajas temperaturas.",
      "¿La cubierta evita que se hiele? Evita que el hielo se pegue directamente al cristal. ¿Cuánto cuesta calentar el coche enchufado? Muy poco comparado con el consumo en carretera."
    ]
  }
};

const card = p => `<article class="product">
  <span class="thumb-slot" data-src="${p.image && /^https:\/\/(m\.media-amazon\.com|images-eu\.ssl-images-amazon\.com|ws-eu\.amazon-adsystem\.com)\//.test(p.image) ? p.image : img(p.asin)}" aria-hidden="true"></span>
  ${SHOW ? `<span class="badge">${esc(p.best)}</span>` : ""}
  <h3>${esc(p.title)}</h3>
  ${SHOW ? `<div class="pmeta"><span class="price">${esc(p.price)}</span>${p.rating ? `<span>★ ${esc(p.rating)}</span>` : ""}</div>` : ""}
  <a class="buy" data-asin="${p.asin}" href="https://www.amazon.es/dp/${p.asin}?tag=${TAG}" rel="sponsored nofollow noopener" target="_blank">${SHOW ? "Ver oferta en Amazon" : "Ver precio en Amazon"}</a>
</article>`;

const tpl = (cat, meta) => `<!doctype html>
<html lang="es" data-skin="2027" data-theme="day">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(meta.title)} | Voltieri</title>
<meta name="description" content="${esc(meta.desc)}">
<link rel="canonical" href="https://kikesnt.github.io/voltieri/${meta.file}">
<link rel="icon" href="icon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="apple-touch-icon.png"><meta name="theme-color" content="#0E7A53">
<meta property="og:image" content="https://kikesnt.github.io/voltieri/og-image.png"><meta name="twitter:image" content="https://kikesnt.github.io/voltieri/og-image.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="components.css"><link rel="stylesheet" href="blog.css">
<script src="theme.js"></script>
<script src="cookies.js" defer></script>
</head>
<body>
<header><a class="brand" href="index.html">Voltieri</a><nav><a href="catalog.html">Coches</a><a href="planificador.html">Rutas</a><a href="range.html">Autonomía</a><a href="tco.html">Costes</a><a href="herramientas.html">Herramientas</a><a href="blog/index.html">Guías</a><a class="nav-pill" href="productos.html">Equipamiento</a></nav></header>
<main class="post">
<p class="crumbs"><a href="productos.html">Equipamiento</a> / ${esc(cat.name)}</p>
<h1>${esc(meta.title)}</h1>
<p class="meta">Comparativa · ${cat.products.length} productos de Amazon.es · actualizada el 22 de noviembre de 2026</p>
<p class="lede">${esc(cat.intro)} Los enlaces son de afiliado y el precio no cambia para ti.</p>
<section><h2>${esc(meta.h2[0])}</h2><p>${esc(meta.body[0])}</p>
<div class="products">${cat.products.map(card).join("")}</div></section>
${meta.h2.slice(1).map((h,i)=>`<section><h2>${esc(h)}</h2><p>${esc(meta.body[i+1])}</p></section>`).join("\n")}
<p class="note">Como afiliado de Amazon, Voltieri obtiene ingresos por las compras adscritas que cumplen los requisitos aplicables.${SHOW ? ` Precios y valoraciones de Amazon.es del ${esc(data.date.split("-").reverse().join("/"))}, pueden cambiar.` : " El precio actual y la disponibilidad los ves en Amazon.es."} <a href="afiliados.html">Cómo lo hacemos</a>.</p>
<footer class="site-footer"><span>© 2026 Voltieri · Datos abiertos, sin cuentas</span><span class="links"><a href="herramientas.html">Herramientas</a><a href="blog/index.html">Guías</a><a href="productos.html">Equipamiento</a><a href="aviso-legal.html">Aviso legal</a><a href="privacidad.html">Privacidad</a><a href="cookies.html">Cookies</a><a href="afiliados.html">Afiliados</a></span></footer>
</main>
<script type="module" src="affiliate.js"></script>
</body>
</html>`;

const live = data.categories.filter(c => c.products.length && META[c.id]); // las categorías sin productos no generan página
for (const cat of live) {
  const meta = META[cat.id];
  await fs.writeFile(path.join(OUT, meta.file), tpl(cat, meta));
  console.log("OK", meta.file);
}

// Página de equipamiento: solo las categorías que ya tienen productos
const hubHead = (await fs.readFile(path.join(OUT, "productos.html"), "utf8")).split("<main")[0];
const hubFoot = (await fs.readFile(path.join(OUT, "productos.html"), "utf8")).match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0];
const hub = `${hubHead}<main class="post post--wide">
<h1>Equipamiento para tu coche eléctrico</h1>
<p class="lede">Lo que de verdad necesitas para cargar en casa, en la calle y de viaje, con los modelos mejor valorados de cada categoría. Cada bloque enlaza a su comparativa completa.</p>
<nav class="toc" aria-label="Categorías"><strong>Categorías</strong><ol>${live.map(c => `<li><a href="#${c.id}">${esc(c.name)}</a></li>`).join("")}</ol></nav>
${live.map(c => `<section id="${c.id}"><div data-shelf="${c.id}" data-title="${esc(c.name)}" data-lede="${esc(c.intro)}" data-limit="3"></div></section>`).join("")}
<p class="note">Como afiliado de Amazon, Voltieri obtiene ingresos por las compras adscritas que cumplen los requisitos aplicables. El precio para ti no cambia. <a href="afiliados.html">Cómo lo hacemos</a>.</p>
${hubFoot}
</main>
<script type="module" src="affiliate.js"></script>
</body>
</html>
`;
await fs.writeFile(path.join(OUT, "productos.html"), hub);
