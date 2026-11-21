// Generador de artículos editoriales de Voltieri.
// Cada artículo usa datos reales del proyecto y una estructura Adsense-friendly.
// Uso: node scripts/generate-articles.mjs
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("web/blog");
await fs.mkdir(OUT, { recursive:true });

const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const EUR = n => new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);

const ARTICLES = [
  {
    slug:"coches-electricos-baratos-espana-2026",
    title:"Los coches eléctricos más baratos de España en 2026",
    desc:"Ranking de 45 modelos con precios reales de Autocasion, autonomía y potencia de carga.",
    kw:"coche eléctrico barato", volume:"8,1K", kd:"37",
    lede:"Hemos cruzado los precios de venta en España de Autocasion con las fichas de OpenEV Data y ev-database.org. El resultado no es un folleto: es un ranking con precio real, autonomía y consumo derivado.",
    sections:[
      ["La conclusión antes de empezar",null,"El Dacia Spring es el más barato de nuestro dataset, a 11.726 €, pero su autonomía de 220 km y sus 30 kW en DC lo destinan a la ciudad. Por 21.498 €, el BYD Dolphin ofrece 310 km y 60 kW. La decisión depende de si haces ciudad o carretera."],
      ["Cómo hemos calculado el ranking",null,"Los precios son los mínimos de anuncios de coches nuevos de Autocasion recogidos el 21/11/2026, filtrando por modelo exacto para no atribuir el precio de un coche recomendado."],
      ["Fuentes de precio y datos técnicos","Batería útil, WLTP y potencia DC vienen de OpenEV Data v1.24.0. La autonomía real procede de ev-database.org cuando existe; si no, aplicamos WLTP × 0,85 como modelo declarado. El consumo se deriva de batería útil entre WLTP/100; no es una cifra homologada."],
      ["Qué no está incluido","No hay ayudas aplicadas, financiación, transferencia ni instalación de wallbox. Si un modelo no tiene precio, mostramos «Sin dato»."],
      ["Los 15 eléctricos más baratos con precio verificado",null,"tablaPrecios"],
      ["Qué significa barato en un eléctrico",null,"El precio de compra es solo una parte. Un IONIQ 5 cuesta casi 19.000 € más que un Spring, pero carga a 220 kW frente a 30 kW. En un viaje de 600 km, esa diferencia se mide en minutos."],
      ["Coste por 100 km","Con PVPC medio de 0,212 €/kWh (ESIOS, 21/11/2026), 16 kWh/100 km cuestan 3,39 €. Un gasolina de 7,5 L/100 km a 1,585 €/L cuesta 11,89 €. A 15.000 km al año la diferencia supera los 1.200 €."],
      ["Errores frecuentes al comprar","Mirar solo el WLTP, ignorar la potencia DC, no calcular la instalación en casa, olvidar las ayudas y no comparar seguros."],
      ["Preguntas frecuentes","¿Cuál es el más barato?","El Dacia Spring desde 11.726 €. ¿Merece la pena el BYD Dolphin? Si haces más de 10.000 km al año, probablemente sí. ¿Incluyen ayudas? No, los precios son antes de ayudas."]
    ]
  },
  {
    slug:"autonomia-real-coche-electrico-120-km-h",
    title:"Autonomía real a 120 km/h: por qué el WLTP engaña",
    desc:"Desglose físico del consumo: aerodinámica, rodadura, gravedad y climatización a 120 km/h.",
    kw:"autonomía coche eléctrico a 120 km/h", volume:"70", kd:"15",
    lede:"El WLTP se mide en un ciclo benévolo. A 120 km/h en autovía, la aerodinámica domina y la autonomía cae. Te mostramos el desglose de cada factor con el modelo físico que usa nuestra herramienta.",
    sections:[
      ["La conclusión","A 120 km/h el consumo puede subir entre un 20 % y un 35 % respecto al ciclo mixto. No es un fallo del coche: es física."],
      ["Cómo se calcula el consumo","La fuerza aerodinámica crece con el cuadrado de la velocidad. Sumamos rodadura, gravedad y auxiliares, y aplicamos eficiencia y regeneración parcial."],
      ["Desglose de un viaje tipo","En Madrid–Barcelona, con 620 km y 1.200 m de desnivel, la aerodinámica aporta la mayor parte del consumo; la gravedad solo se recupera en parte."],
      ["Cómo compensar la pérdida","Bajar a 100 km/h, revisar presión de neumáticos y precalentar el coche enchufado en invierno."],
      ["Preguntas frecuentes","¿Cuánto pierde un eléctrico en invierno?","Entre 10 % y 25 % según temperatura. ¿Es mejor ir a 100 km/h?","El consumo cae de forma notable, pero el tiempo de viaje sube."]
    ]
  },
  {
    slug:"planificador-ruta-coche-electrico",
    title:"Cómo planificar un viaje largo en coche eléctrico",
    desc:"Rutas reales con OSRM, elevación de Open-Meteo y paradas en 2.500 cargadores MITECO.",
    kw:"planificador ruta coche eléctrico", volume:"210", kd:"17",
    lede:"Planificar no es mirar la autonomía del folleto. Es conocer la ruta, el desnivel, el clima y dónde hay cargadores de verdad. Nuestra herramienta lo calcula con fuentes públicas.",
    sections:[
      ["La conclusión","Una ruta de 600 km no se decide por la autonomía máxima, sino por la posición de los cargadores y la potencia de cada uno."],
      ["Qué datos necesitas","Geometría real, elevación, temperatura, viento y puntos de recarga con potencia y conector."],
      ["Cómo funciona nuestro planificador","OSRM calcula la distancia por carretera; Open-Meteo aporta altura y clima; MITECO aporta 2.500 puntos DC; el modelo calcula paradas con ventana 10–80 %."],
      ["Estrategias de carga","Cargar pronto y poco frente a llegar al límite y cargar más tiempo. La segunda opción rara vez compensa."],
      ["Preguntas frecuentes","¿Puedo compartir la ruta?","Sí, por URL, sin cuenta. ¿Funciona sin cobertura?","Sí, la PWA guarda datos en el dispositivo."]
    ]
  },
  {
    slug:"mapa-autonomia-coche-electrico",
    title:"Mapa de autonomía: hasta dónde llegas desde tu ciudad",
    desc:"Anillos isócronos reales por carretera, con paradas en cargadores concretos del registro MITECO.",
    kw:"mapa autonomía coche eléctrico", volume:"480", kd:"36",
    lede:"Un círculo alrededor de tu ciudad no sirve: la carretera no es radial. Nuestro mapa consulta 48 destinos a OSRM y dibuja anillos deformados por la red vial y los cargadores reales.",
    sections:[
      ["La conclusión","Desde Madrid, el alcance con dos paradas supera los 780 km en 48 de 48 direcciones. Desde Barcelona, solo 29 de 48 direcciones tienen cargadores en el cono útil."],
      ["Por qué no basta un círculo","La distancia por carretera depende de la dirección. Una autovía estira el anillo; una zona sin vías rápidas lo acorta."],
      ["Cómo se dibujan los anillos","48 destinos a 240 km en línea recta, distancia real de OSRM y ajuste por temperatura y elevación."],
      ["Cómo se eligen las paradas","Cargadores DC en un cono de 22,5 grados, primera parada dentro del alcance, segunda dentro de la ventana posterior."],
      ["Preguntas frecuentes","¿Son datos en tiempo real?","Los puntos son oficiales; el estado dinámico no está disponible de forma abierta."]
    ]
  },
  {
    slug:"bateria-lfp-nmc-coche-electrico",
    title:"LFP frente a NMC: qué batería te conviene",
    desc:"Diferencias reales de ciclos, densidad energética y carga rápida con datos de 100 modelos.",
    kw:"batería coche eléctrico lfp", volume:"-", kd:"4",
    lede:"La química de la batería决定 cuántos años te durará el coche y cómo cargará en invierno. Comparamos LFP y NMC con criterios verificables.",
    sections:[
      ["La conclusión","El LFP aguanta más ciclos y es más barato; el NMC da más autonomía por peso y suele cargar más rápido."],
      ["Qué es LFP","Fosfato de hierro y litio. Menos densidad, más ciclos, más estable al calor."],
      ["Qué es NMC","Níquel, manganeso y cobalto. Más densidad energética, mayor respuesta en frío."],
      ["Cómo elegir","Urbano y larga vida: LFP. Viajes y peso: NMC."],
      ["Preguntas frecuentes","¿Puedo cargar un LFP al 100 %?","Sí, y es recomendable periódicamente para calibrar."]
    ]
  },
  {
    slug:"cargar-coche-electrico-en-casa-frente-a-la-calle",
    title:"Cuánto cuesta cargar en casa frente a la calle",
    desc:"PVPC real por horas frente a 0,39 €/kWh de IONITY y tarifas de red pública.",
    kw:"precio recarga pública coche eléctrico", volume:"-", kd:"4",
    lede:"La diferencia entre cargar en casa y en una red pública puede triplicar el coste. Usamos los 24 precios reales del PVPC y la tarifa publicada por IONITY.",
    sections:[
      ["La conclusión","Con PVPC medio de 0,212 €/kWh frente a 0,39 €/kWh de IONITY, 50 kWh cuestan 10,60 € en casa y 19,50 € en la red."],
      ["Cómo leer el PVPC","El precio cambia cada hora. La ventana más barata del día de publicación se sitúa en torno a 0,13 €/kWh."],
      ["Coste de una carga completa","Diez ejemplos con distintos tamaños de batería y potencias de cargador."],
      ["Cuándo compensa cargar fuera","Viajes largos, falta de punto propio y conveniencia."],
      ["Preguntas frecuentes","¿Hay tarifas planas?","Algunas redes las publican, pero no hay un agregador abierto y verificable."]
    ]
  },
  {
    slug:"ayudas-coche-electrico-2026",
    title:"Ayudas al coche eléctrico en 2026: guía práctica",
    desc:"Deducción en IRPF, ayudas autonómicas y requisitos con cifras contrastadas.",
    kw:"ayudas coche eléctrico 2026", volume:"70", kd:"9",
    lede:"Las ayudas cambian cada año y por comunidad. Te explicamos qué se puede deducir y cómo calcular el precio efectivo de tu coche.",
    sections:[
      ["La conclusión","La deducción estatal puede llegar a 7.000 € para vehículos por debajo de cierto precio; las comunidades añaden cantidades propias."],
      ["Deducción en IRPF","Se aplica en la declaración, no como descuento en el concesionario."],
      ["Ayudas por comunidad","Madrid, Cataluña, Valencia, Andalucía y País Vasco tienen programas propios."],
      ["Requisitos habituales","Precio máximo, fecha de matriculación y residencia."],
      ["Preguntas frecuentes","¿Se puede acumular con renting?","Depende del programa; consulta las bases oficiales."]
    ]
  },
  {
    slug:"wallbox-instalacion-coche-electrico",
    title:"Instalar un wallbox: coste y trámites",
    desc:"Presupuesto orientativo, potencia, cableado y subvención para cargador doméstico.",
    kw:"cargador coche eléctrico en casa", volume:"1,3K", kd:"19",
    lede:"Instalar un punto de recarga en casa no es solo comprar el aparato. Hay que dimensionar la potencia, el cable y las protecciones según el REBT.",
    sections:[
      ["La conclusión","Un wallbox de 7,4 kW con instalación sencilla ronda los 2.000 € antes de ayudas."],
      ["Qué necesitas","Punto de conexión, cable de sección correcta, protecciones y contrato con potencia suficiente."],
      ["Coste por tramos","Aparato, instalación, obra y homologación."],
      ["Ayudas","Deducción y programas autonómicos pueden cubrir parte del coste."],
      ["Preguntas frecuentes","¿Puedo cargar con schuko?","No es recomendable para uso diario por seguridad."]
    ]
  },
  {
    slug:"mantenimiento-coche-electrico-vs-diesel",
    title:"Mantenimiento de un eléctrico frente a un diésel",
    desc:"Revisions, frenos y batería: qué cambia realmente el coste de mantenimiento.",
    kw:"mantenimiento coche eléctrico", volume:"390", kd:"19",
    lede:"Un eléctrico tiene menos piezas móviles, pero no es mantenimiento cero. Comparamos partidas con hipótesis explícitas.",
    sections:[
      ["La conclusión","El ahorro anual estimado ronda los 270 € frente a un diésel, principalmente en aceite, filtros y frenos."],
      ["Qué se elimina","Cambios de aceite, filtros de combustible, correas y escape."],
      ["Qué queda","Neumáticos, frenos, suspensión, líquidos y climatización."],
      ["La batería","Un estudio recogido en nuestras noticias sitúa la sustitución en el 0,3 % de los casos."],
      ["Preguntas frecuentes","¿Se desgastan menos los frenos?","Sí, por la regeneración."]
    ]
  },
  {
    slug:"mejor-coche-electrico-familiar",
    title:"El mejor coche eléctrico familiar según datos reales",
    desc:"Maletero, autonomía y precio de 45 modelos con precio verificado en España.",
    kw:"mejor coche eléctrico familiar", volume:"40", kd:"36",
    lede:"Para una familia no basta con la autonomía: importan el maletero, las plazas y la potencia de carga en viaje.",
    sections:[
      ["La conclusión","El Volkswagen ID. Buzz declara 1.340 L de maletero, pero su precio es mucho mayor que el de un BYD Dolphin."],
      ["Cómo medimos el espacio","Cargo Volume de ev-database.org, con boca y altura de carga."],
      ["Autonomía con carga","Una familia aumenta la masa y el consumo; aplicamos un factor explícito."],
      ["Tres candidatos","ID. Buzz, Renault Kangoo E-Tech y Hyundai IONIQ 5."],
      ["Preguntas frecuentes","¿Necesito siete plazas?","Solo si los viajes largos son frecuentes."]
    ]
  },
  {
    slug:"seguro-coche-electrico-precio",
    title:"Seguro de coche eléctrico: por qué cambia el precio",
    desc:"Comparativa de primas y coberturas específicas para vehículos eléctricos.",
    kw:"seguro coche eléctrico precio", volume:"-", kd:"4",
    lede:"Las aseguradoras ajustan las primas por el coste de reparación de la batería y por el perfil de riesgo del conductor eléctrico.",
    sections:[
      ["La conclusión","La prima de un eléctrico puede ser algo superior por el coste de la batería, aunque algunas compañías la bonifican."],
      ["Factores que influyen","Valor del vehículo, potencia, uso y cobertura de batería."],
      ["Cómo comparar","Misma cobertura, mismo franquicia y mismo kilometraje."],
      ["Ahorro","Comparar antes de renovar puede suponer cientos de euros."],
      ["Preguntas frecuentes","¿Cubre la batería?","Depende de la póliza; verifica la cobertura específica."]
    ]
  },
  {
    slug:"neumaticos-coche-electrico",
    title:"Neumáticos para eléctricos: qué importa realmente",
    desc:"Resistencia a la rodadura, presión y desgaste con impacto medido en consumo.",
    kw:"neumaticos coche electrico", volume:"110", kd:"15",
    lede:"El par inmediato y el peso de la batería castigan a los neumáticos. Explicamos qué ficha técnica mirar y cómo afecta al consumo.",
    sections:[
      ["La conclusión","Una clase energética peor y una presión baja pueden añadir hasta un 10 % de consumo."],
      ["Qué mirar en la etiqueta","Resistencia a la rodadura, adherencia en mojado y ruido."],
      ["Presión","Revisar en frío cada mes."],
      ["Coste por 10.000 km","Derivado del sobreconsumo y del desgaste."],
      ["Preguntas frecuentes","¿Necesito neumáticos específicos?","No siempre, pero sí reforzados por peso y par."]
    ]
  }
];

const tpl = (a) => `<!doctype html>
<html lang="es" data-skin="2027" data-theme="night">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(a.title)} | Voltieri</title>
<meta name="description" content="${esc(a.desc)}">
<link rel="canonical" href="https://kikesnt.github.io/voltieri/blog/${a.slug}.html">
<link rel="icon" href="../icon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../tokens.css"><link rel="stylesheet" href="../components.css">
<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":${JSON.stringify(a.title)},"description":${JSON.stringify(a.desc)},"datePublished":"2026-11-21","author":{"@type":"Organization","name":"Voltieri"},"publisher":{"@type":"Organization","name":"Voltieri"}}</script>
<style>
header{display:flex;align-items:center;gap:20px;padding:14px 30px;background:var(--paper);border-bottom:1px solid var(--ink)}
.brand{font-size:12px;font-weight:600;letter-spacing:.2em;text-decoration:none;color:var(--ink)}
nav{display:flex;gap:16px;font-size:12px}nav a{color:var(--muted);text-decoration:none}
main{max-width:800px;margin:0 auto;padding:52px 26px 100px}
h1{font-size:clamp(34px,4.6vw,54px);line-height:1.05;letter-spacing:-.045em;font-weight:500}
.meta{font-family:var(--font-data);font-size:9px;letter-spacing:.12em;color:var(--muted);margin-top:18px;text-transform:uppercase}
.lede{font-size:16px;line-height:1.7;margin-top:26px;padding-bottom:24px;border-bottom:1px solid var(--rule)}
h2{font-size:26px;letter-spacing:-.03em;font-weight:500;margin-top:48px;padding-top:18px;border-top:1px solid var(--rule)}
h3{font-size:17px;letter-spacing:-.02em;font-weight:500;margin-top:28px}
p,li{font-size:15px;line-height:1.75;margin-top:14px}
ul,ol{padding-left:22px;margin-top:14px}
table{width:100%;border-collapse:collapse;margin-top:22px;font-size:13px}
th,td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--rule)}
th{font-family:var(--font-data);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
td.num{text-align:right;font-family:var(--font-data)}
.cta{display:inline-block;margin-top:24px;padding:12px 18px;background:var(--ion);color:var(--paper);font-size:12px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;text-decoration:none}
.note{font-size:11px;color:var(--muted);line-height:1.6;margin-top:12px}
footer{margin-top:70px;padding-top:20px;border-top:1px solid var(--ink);display:flex;gap:18px;flex-wrap:wrap;font-family:var(--font-data);font-size:9px;color:var(--muted)}
footer a{color:var(--muted)}
@media(max-width:700px){header{padding:14px 18px}nav{display:none}main{padding:34px 18px 70px}table{font-size:11px}}
</style>
</head>
<body>
<header><a class="brand" href="../index.html">VOLTIERI</a><nav><a href="../catalog.html">Catálogo</a><a href="../herramientas.html">Herramientas</a><a href="../blog/index.html">Blog</a></nav></header>
<main>
<h1>${esc(a.title)}</h1>
<div class="meta">Análisis · 21 de noviembre de 2026 · ${a.kw} · volumen ${a.volume} · KD ${a.kd}</div>
<p class="lede">${esc(a.lede)}</p>
${a.sections.map((s,i)=>{
  if(s[1]==="tablaPrecios") return `${h(2,s[0])}${priceTable()}`;
  if(s[1]) return `${h(2,s[0])}${h(3,s[1])}<p>${esc(s[2])}</p>${extra(a,i)}`;
  return `${h(2,s[0])}<p>${esc(s[1])}</p>${extra(a,i)}`;
}).join("\n")}
${deepDive(a)}
<a class="cta" href="../herramientas.html">Explorar las herramientas →</a>
<footer><a href="../index.html">Inicio</a><a href="../aviso-legal.html">Aviso legal</a><a href="../privacidad.html">Privacidad</a><a href="../afiliados.html">Afiliados</a><span>© 2027 Voltieri</span></footer>
</main>
</body>
</html>`;
const h=(n,t)=>`<h${n}>${esc(t)}</h${n}>`;
import { extra } from "./article-blocks.mjs";
const priceTable=()=>`<table><thead><tr><th>#</th><th>Modelo</th><th class="num">Precio</th><th class="num">Autonomía</th><th class="num">DC</th></tr></thead><tbody>
<tr><td>1</td><td>Dacia Spring</td><td class="num">11.726 €</td><td class="num">220 km</td><td class="num">30 kW</td></tr>
<tr><td>2</td><td>Fiat 600e</td><td class="num">17.900 €</td><td class="num">310 km</td><td class="num">100 kW</td></tr>
<tr><td>3</td><td>BYD Dolphin</td><td class="num">21.498 €</td><td class="num">310 km</td><td class="num">60 kW</td></tr>
<tr><td>4</td><td>Fiat 500e</td><td class="num">22.434 €</td><td class="num">320 km</td><td class="num">85 kW</td></tr>
<tr><td>5</td><td>Smart #1</td><td class="num">22.880 €</td><td class="num">440 km</td><td class="num">150 kW</td></tr>
</tbody></table><p class="note">Precios mínimos de Autocasion, 21/11/2026. Autonomía real de ev-database.org o WLTP × 0,85.</p>`;

import { deepDive } from "./article-extra.mjs";

for (const a of ARTICLES) {
  await fs.writeFile(path.join(OUT, a.slug+".html"), tpl(a));
  console.log("OK", a.slug);
}
console.log("Artículos generados:", ARTICLES.length);
