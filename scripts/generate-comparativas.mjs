// Genera comparativas de equipamiento EV con productos reales de Amazon.es.
import fs from "node:fs/promises";
import path from "node:path";

const OUT = path.resolve("web");
const data = JSON.parse(await fs.readFile(path.join(OUT,"data/amazon-products.json"),"utf8"));
const cfg = JSON.parse(await fs.readFile(path.join(OUT,"data/affiliate-config.json"),"utf8"));
const TAG = cfg.tag;
const SHOW = data.showPrices === true; // precios y valoraciones solo si vienen de la API oficial
const MESES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const fechaLarga = (() => {
  const [a, m, d] = data.date.split("-");
  return `${Number(d)} de ${MESES[Number(m) - 1]} de ${a}`;
})();
const img = asin => `https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&MarketPlace=ES&ASIN=${asin}&ServiceVersion=20070822&ID=AsinImage&WS=1&Format=_SL250_&tag=${TAG}`;
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

// ── Hechos del catálogo ────────────────────────────────────────────────
// Los textos citan cifras del catálogo, no números escritos a mano: si el
// precio o la valoración cambian, el párrafo se rehace solo. Los tokens
// disponibles están en FACTS.
const num = s => {
  const v = parseFloat(String(s ?? "").replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, ""));
  return Number.isFinite(v) ? v : 0;
};
const eur = n => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);
const mill = n => new Intl.NumberFormat("es-ES").format(Math.round(n));
const dec = s => String(s ?? "").replace(".", ",");

function factsFor(cat) {
  const ps = cat.products || [];
  const conPrecio = ps.filter(p => num(p.price) > 0);
  const precios = conPrecio.map(p => num(p.price));
  const notas = ps.map(p => num(p.rating)).filter(n => n > 0);
  const valoraciones = ps.map(p => num(p.reviews)).filter(n => n > 0);
  const top = ps[0] || {};
  const barato = conPrecio.reduce((m, p) => (!m || num(p.price) < num(m.price) ? p : m), null);
  const caro = conPrecio.reduce((m, p) => (!m || num(p.price) > num(m.price) ? p : m), null);
  const marca = t => String(t || "").split(/[ ·]/)[0];
  const marcas = [...new Set(ps.map(p => marca(p.title)))];
  // Litros y metros que aparecen en los títulos curados de esta categoría.
  const vols = ps.flatMap(p => (String(p.title).match(/(\d+[.,]?\d*)\s*L\b/g) || []).map(v => num(v)));
  const metros = ps.flatMap(p => (String(p.title).match(/(\d+[.,]?\d*)\s*m\b/g) || []).map(v => num(v)));
  return {
    n: ps.length,
    min: precios.length ? Math.min(...precios) : 0,
    max: precios.length ? Math.max(...precios) : 0,
    medio: precios.length ? precios.reduce((a, b) => a + b, 0) / precios.length : 0,
    notaTop: num(top.rating),
    notas: notas.length ? notas : [0],
    volumenes: vols.length ? vols : [0],
    metros: metros.length ? metros : [0],
    top, barato, caro,
    reviewsTop: num(top.reviews),
    reviewsMedio: valoraciones.length ? Math.round(valoraciones.reduce((a, b) => a + b, 0) / valoraciones.length) : 0,
    reviewsTotal: valoraciones.reduce((a, b) => a + b, 0),
    marcas: marcas.length,
    marcaTop: marca(top.title),
    largo: String(top.title || "").length,
    // Etiquetas que aparecen en los títulos de esta categoría
    con: (re) => ps.filter(p => re.test(p.title)).length,
    // Todos los numeros de un tipo que salen en los titulos ("400 A", "32 A").
    tops: (re) => ps.flatMap(p => (String(p.title).match(re) || []).map(v => num(v))),
    titulo: (re) => (ps.find(p => re.test(p.title)) || {}).title || "",
  };
}

// Texto con tokens: {n}, {min}, {max}, {notaTop}, {top}, {barato}, {caro}…
function conDatos(texto, f, calc) {
  const tokens = {
    n: String(f.n),
    min: f.min ? eur(f.min) : "—",
    max: f.max ? eur(f.max) : "—",
    medio: f.medio ? eur(f.medio) : "—",
    min0: f.min ? String(Math.round(f.min)) : "—",
    max0: f.max ? String(Math.round(f.max)) : "—",
    notaTop: f.notaTop ? dec(f.notaTop) : "—",
    top: f.top.title || "",
    topMarca: f.marcaTop,
    topPrecio: f.top.price || "—",
    topNota: f.top.rating ? dec(f.top.rating) : "—",
    topReviews: f.reviewsTop ? mill(f.reviewsTop) : "—",
    barato: f.barato ? f.barato.title : "",
    baratoPrecio: f.barato ? f.barato.price : "—",
    caro: f.caro ? f.caro.title : "",
    caroPrecio: f.caro ? f.caro.price : "—",
    reviewsMedio: f.reviewsMedio ? mill(f.reviewsMedio) : "—",
    reviewsTotal: f.reviewsTotal ? mill(f.reviewsTotal) : "—",
    marcas: String(f.marcas),
    fecha: data.date.split("-").reverse().join("/"),
  };
  for (const [k, fn] of Object.entries(calc || {})) tokens[k] = String(fn(f));
  return String(texto).replace(/\{(\w+)\}/g, (m, k) => (k in tokens ? tokens[k] : m));
}

// Contadores propios de cada categoría: qué proporción del catálogo cumple
// cada característica. Se leen de los títulos curados, que ya la nombran.
// "1 equipo" / "2 equipos": la frase entera, para que no queden concordancias
// rotas cuando el numero es uno.
const plural = (n, sing, plur) => `${n} ${n === 1 ? sing : plur}`;
// "1 adaptador" / "3 adaptadores": el numero delante del sustantivo.
const frase = (n, uno, varios) => (n === 1 ? `1 ${uno}` : `${n} ${varios}`);

const CALC = {
  "cables-tipo2": {
    con22: f => f.con(/22 kW/i), con11: f => f.con(/11 kW/i),
    con5m: f => f.con(/5 m/), con7m: f => f.con(/7 m/),
    dif: f => String(Math.round(f.max - f.min)),
    notaCaro: f => dec(num(f.caro && f.caro.rating)), notaBarato: f => dec(num(f.barato && f.barato.rating)),
  },
  "wallbox": {
    n11: f => f.con(/11 kW/i),
    conAppTxt: f => `${plural(f.con(/\bapp\b/i), "wallbox lleva", "wallbox llevan")} la app`,
    conRcdTxt: f => `${plural(f.con(/RCD/i), "modelo incluye", "modelos incluyen")} la protección RCD tipo A con 6 mA CC`,
  },
  "adaptadores-ccs2": {
    conNacsTxt: f => frase(f.con(/NACS/i), "es NACS", "son NACS"),
    conCcs1: f => f.con(/CCS1/i),
    maxA: f => { const a = f.tops(/\d+\s*A\b/g); return a.length ? Math.max(...a) : 0; },
    notaMin: f => dec(Math.min(...f.notas)), notaMax: f => dec(Math.max(...f.notas)),
  },
  "cargador-portatil": {
    conSchuko: f => f.con(/Schuko/i), conTipo2: f => f.con(/Tipo 2/i),
    conLcdTxt: f => (f.con(/LCD/i) === 1 ? "solo uno lleva pantalla LCD" : `${f.con(/LCD/i)} llevan pantalla LCD`),
  },
  "estaciones-22kw": { conApp: f => f.con(/\bapp\b/i), conRfid: f => f.con(/RFID/i) },
  "v2l": {
    conXpengTxt: f => frase(f.con(/XPeng/i), "adaptador específico para XPeng", "adaptadores específicos para XPeng"),
    conAttoTxt: f => frase(f.con(/Atto/i), "adaptador", "adaptadores"),
    conIPTxt: f => (f.con(/IP5\d/i) === 1 ? `La protección IP54 la tiene 1 de los ${f.n}` : `La protección IP54 la tienen ${f.con(/IP5\d/i)} de los ${f.n}`),
  },
  "inflador-neumaticos": {
    conManometro: f => f.con(/manómetro/i), conCompresor: f => f.con(/compresor/i),
    conBar: f => f.con(/bar/i),
  },
  "soporte-cable": {
    conPared: f => f.con(/pared/i), conFunda: f => f.con(/funda|bolsa/i),
    conCandado: f => f.con(/candado/i),
  },
  "maleta-viaje": {
    volMin: f => String(Math.min(...f.volumenes)), volMax: f => String(Math.max(...f.volumenes)),
  },
  "nevera-v2l": {
    volMin: f => String(Math.min(...f.volumenes)), volMax: f => String(Math.max(...f.volumenes)),
  },
  "invierno": { conCubierta: f => f.con(/cubierta|protector/i), conRaspador: f => f.con(/raspador/i) },
};

const META = {
  "cables-tipo2": {
    faq:[[
    "¿Necesito un cable de 22 kW o me basta uno de 11 kW?",
    "Depende de dos cosas: de lo que admita tu coche y de lo que ofrece el punto de carga. El cable no da más potencia de la que hay detrás. En esta comparativa hay {con22} cables de 22 kW y {con11} de 11 kW, y el de 11 kW más alto de precio es {top} ({topPrecio})."
    ], [
    "¿Cuánto cable necesito?",
    "Cinco metros es lo habitual y lo que aparece en {con5m} de los {n} productos. Si aparcas en paralelo al cargador, con 5 m vas justo; 7 m da margen y son {con7m} unidades aquí."
    ], [
    "¿Cuál es el mejor cable de esta comparativa?",
    "{top} ({topPrecio}, {topNota}★) es el más valorado, con {topReviews} opiniones. Si el presupuesto manda, {barato} ({baratoPrecio}) es el más barato de la comparativa y también es trifásico de 32 A."
    ], [
    "¿Puedo dejar el cable en el coche?",
    "Sí, con funda y sin enrollarlo apretado. Un cable en bucles pequeños se mella por dentro y acaba fallando en el conector, que es la parte cara."
    ]],
    file:"comparativa-cables-tipo2.html",
    title:"Mejores cables Tipo 2 para coche eléctrico (2026)",
    desc:"Comparativa de cables Tipo 2 a Tipo 2 con precios y valoraciones reales de Amazon.es.",
    h2:["Cómo elegir un cable Tipo 2","Qué significa 22 kW en un cable","Longitud y peso","Precio frente a durabilidad"],
    body:[
      "Un cable Tipo 2 sirve para cargar en punto público cuando el cargador no lleva cable propio. La potencia de 22 kW exige trifásico y 32 A; si tu coche solo admite monofásico, un cable de 7,4 kW basta y cuesta menos.",
      "La cifra de 22 kW es el límite del cable, no lo que cargará tu coche. De los {n} cables de esta comparativa, {con22} son de 22 kW y {con11} se quedan en 11 kW: el más caro ({caro}, {caroPrecio}) es de 7 m, y {top} ({topPrecio}) también, pero a 11 kW.",
      "Cinco metros es la longitud habitual: {con5m} de los {n} son de 5 m. Los de 7 m facilitationan aparcar sin dar tantas vueltas de cable, pero hay que guardarlos en el maletero.",
      "Los precios van de {min} a {max}, una diferencia de {dif} euros. En este tramo la nota casi no discrimina: el más caro puntúa {notaCaro} y el más barato {notaBarato}. Lo que separa los cables de gama alta son los materiales y los conectores, no la potencia nominal.",
    ]
  },
  "wallbox": {
    faq:[[
    "¿Qué potencia necesito en casa?",
    "Con contrato monofásico, 7,4 kW: unas 50 kWh en siete horas, de sobra para una noche. El salto a 22 kW solo tiene sentido con trifásico instalado, y aquí los {n11} modelos de 11 kW son el punto intermedio."
    ], [
    "¿La app cambia algo de verdad?",
    "Sí: programar la carga en horas valle es de las pocas funciones que bajan la factura de verdad. En esta comparativa {conAppTxt}."
    ], [
    "¿Qué hace el RCD tipo A con 6 mA CC?",
    "Es la protección que exige el REBT en una instalación de recarga con más de 32 A. Aquí {conRcdTxt}."
    ], [
    "¿Puedo instalarlo yo?",
    "No. La instalación debe hacerla un electricista autorizado. ¿Necesito aumentar la potencia contratada? Depende del consumo, pero 7,4 kW suelen bastar."
    ]],
    file:"comparativa-wallbox-7400.html",
    title:"Mejores wallbox 7,4 kW para casa (2026)",
    desc:"Comparativa de wallbox monofásicos con app, cable y protección, con precios reales de Amazon.es.",
    h2:["Cómo elegir un wallbox doméstico","Potencia monofásica frente a trifásica","App y control de carga","Protección RCD e instalación"],
    body:[
      "Un wallbox de 7,4 kW es el punto de equilibrio para la mayoría de los hogares españoles con contrato monofásico. Carga unas 50 kWh en siete horas, suficiente para una noche.",
      "La opción trifásica de 22 kW solo aporta velocidad si la acometida y el coche la admiten. Instalarla sin esas condiciones desperdicia dinero. Aquí hay {n11} modelos de 11 kW entre los {n}: suben la potencia sin llegar a los 22 kW, que ya exigen trifásico instalado.",
      "La app permite programar la carga en horas valle y ajustar la intensidad. Es una de las pocas funciones que sí cambia la factura: en esta comparativa {conAppTxt}.",
      "La protección RCD tipo A con detección de 6 mA CC es importante: aquí {conRcdTxt}. La instalación debe hacerla un electricista autorizado según el REBT.",
    ]
  },
  "adaptadores-ccs2": {
    faq:[[
    "¿Un adaptador CCS2 acelera la carga?",
    "No. El adaptador no convierte corriente alterna en continua ni al revés: solo cambia el conector físico para que puedas enchufar."
    ], [
    "¿Cuántos amperios necesito?",
    "Los que admita el cargador de destino, no los del coche. Aquí todos los de CCS declaran 1000 V y el de más intensidad llega a {maxA} A."
    ], [
    "¿Sirve un adaptador para otro país?",
    "Depende del conector que use ese país: aquí {conNacsTxt} y {conCcs1} son CCS1. Si vas a cruzar fronteras, un juego de adaptadores evita el problema."
    ], [
    "¿El precio importa más que la nota?",
    "Más la nota. El más barato cuesta {baratoPrecio} y el más caro {caroPrecio}, y la nota va de {notaMin} a {notaMax}. El precio no predice la calidad."
    ]],
    file:"comparativa-adaptadores-ccs2.html",
    title:"Adaptadores CCS2: cuáles valen la pena (2026)",
    desc:"Comparativa de adaptadores CCS2 a Tipo 2, CCS1 y NACS con precios y valoraciones reales.",
    h2:["Cómo elegir un adaptador CCS2","CC y CA: no es lo mismo","Compatibilidad con Tesla y NACS","Por qué importa la valoración"],
    body:[
      "Un adaptador CCS2 a Tipo 2 permite cargar en corriente alterna con un conector distinto. No convierte un cargador rápido en lento ni al revés: respeta el tipo de corriente.",
      "La corriente continua llega a cientos de amperios. Un adaptador mal fabricado puede calentarse, por eso la tensión y la intensidad declaradas importan más que el precio: todos los de CCS de esta comparativa declaran 1000 V y el de más intensidad llega a {maxA} A.",
      "Los adaptadores CCS2 a NACS o a Tesla tienen un mercado cambiante. Comprueba el modelo exacto de tu coche antes de confiar en la compatibilidad: aquí {conNacsTxt} y {conCcs1} son CCS1, porque cada país usa un conector distinto.",
      "Una valoración baja en un adaptador barato es una señal clara: el ahorro de unos 40 € no compensa una mala conexión. Aquí el más barato cuesta {baratoPrecio} y el más caro {caroPrecio}, y la nota va de {notaMin} a {notaMax}. El precio no predice la calidad.",
    ]
  },
  "cargador-portatil": {
    faq:[[
    "¿Schuko o Tipo 2?",
    "Schuko es el enchufe doméstico: sirve en cualquier casa, pero a 3,7 kW. Tipo 2 necesita un punto con ese conector. Aquí hay {conSchuko} con Schuko y {conTipo2} con Tipo 2."
    ], [
    "¿Puedo regular la intensidad?",
    "Sí, de 6 a 16 A, y eso es justo lo que hace falta para no saltar el diferencial en una instalación antigua."
    ], [
    "¿Merece la pena como respaldo?",
    "Como plan B, sí: pesa poco y te saca de un apuro en un viaje. Para cargar cada noche, un wallbox con instalación revisada es más seguro y cómodo."
    ], [
    "¿Cuánto cuesta el más caro?",
    "{max}, y el más barato {min}. Para uso de viaje, cualquier modelo de la horquilla cumple."
    ]],
    file:"comparativa-cargador-portatil.html",
    title:"Mejores cargadores portátiles para coche eléctrico (2026)",
    desc:"Comparativa de cargadores portátiles Tipo 2 y Schuko con precios y valoraciones reales de Amazon.es.",
    h2:["Cómo elegir un cargador portátil","Schuko frente a Tipo 2","Corriente ajustable y pantalla","Cuándo usarlo como respaldo"],
    body:[
      "Un cargador portátil sirve para visitas a familiares o como respaldo seguro en viaje. No sustituye a un wallbox porque depende de un enchufe doméstico.",
      "Los modelos con enchufe Schuko cargan a 3,7 kW. Los que llevan conector Tipo 2 necesitan un punto con ese conector, por lo que son menos universales. Aquí hay {conSchuko} con Schuko y {conTipo2} con Tipo 2.",
      "Ajustar la intensidad de 6 a 16 A permite adaptarse a la instalación disponible. La pantalla ayuda a ver corriente y temperatura: {conLcdTxt}.",
      "Úsalo como plan B. Para cargar cada noche, un wallbox con instalación revisada es más seguro y cómodo. El más caro de esta comparativa cuesta {max} y el más barato {min}.",
    ]
  }
  ,"estaciones-22kw": {
    faq:[[
    "¿22 kW o 7,4 kW?",
    "22 kW solo acelera si tienes trifásico y el coche lo admite. Sin esas dos condiciones, el aparato se comporta como uno de 7,4 kW."
    ], [
    "¿Qué diferencia hay entre el precio?",
    "De {min} a {max}. La diferencia no siempre es velocidad: también cuenta la app, el lector RFID, la longitud del cable y la certificación. Aquí {conApp} de {n} llevan app y {conRfid} llevan RFID."
    ], [
    "¿Cuál es el mejor de esta comparativa?",
    "{top} ({topPrecio}, {topNota}★) es el más valorado. {caro} ({caroPrecio}) es el más caro y está pensado para un uso exigente."
    ], [
    "¿Puedo instalarlo yo?",
    "No: debe hacerlo un profesional autorizado, y la acometida trifásica suele exigir contrato y cuadro adaptados."
    ]],
    file:"comparativa-estaciones-22kw.html",
    title:"Mejores estaciones 22 kW para coche eléctrico (2026)",
    desc:"Comparativa de wallbox trifásicos 22 kW con precios y valoraciones reales de Amazon.es.",
    h2:["Cómo elegir una estación 22 kW","Acometida trifásica: el requisito clave","Potencia real frente a potencia nominal","Certificaciones y precio"],
    body:[
      "Una estación de 22 kW solo acelera la carga si la instalación dispone de tres fases y el vehículo admite esa potencia. Sin esas dos condiciones, el mismo aparato se comporta como uno de 7,4 kW.",
      "La acometida trifásica suele exigir contrato y cuadro adaptados. Antes de comprar, pide a un electricista que revise la potencia disponible y la sección del cable.",
      "El rango de precios de esta comparativa va de {min} a {max}. La diferencia no siempre es velocidad: también cuenta la app, el lector RFID, la longitud del cable y la certificación. Con {conApp} de {n} con app y {conRfid} con RFID, el equipamiento de serie es lo que separa las opciones.",
      "Los modelos con CE y TÜV ofrecen una garantía documentada. {caro} es la opción más cara de la comparativa, pensada para un uso exigente, y {top} ({topPrecio}, {topNota}★) es la mejor valorada.",
    ]
  },
  "v2l": {
    faq:[[
    "¿Qué puedo alimentar con un V2L?",
    "Hasta 3,5 kW: herramientas, iluminación, una nevera pequeña o una cafetera. Es la misma potencia que un enchufe doméstico, no la de un wallbox."
    ], [
    "¿Mi coche tiene V2L?",
    "No todos lo ofrecen. BYD, MG y XPeng lo han popularizado en algunos modelos, pero la referencia es el manual de tu versión exacta."
    ], [
    "¿Sirve un adaptador para otro modelo?",
    "No necesariamente. Un adaptador para Atto 3 puede no servir en un MG4, aunque ambos usen conector Tipo 2. Aquí {conXpengTxt} y {conAttoTxt} para Atto 3, Dolphin y Seal."
    ], [
    "¿Cuánto cuesta?",
    "De {min} a {max}. {conIPTxt}, útil si lo usas al aire libre."
    ]],
    file:"comparativa-v2l.html",
    title:"Mejores adaptadores V2L para coche eléctrico (2026)",
    desc:"Comparativa de adaptadores V2L para alimentar enchufes desde el coche, con precios reales.",
    h2:["Cómo elegir un adaptador V2L","Qué puedes alimentar con 3,5 kW","Compatibilidad por marca","Protección y uso responsable"],
    body:[
      "Un adaptador V2L convierte la batería del coche en una fuente de corriente alterna. Sirve para herramientas, iluminación o emergencias, siempre dentro de los 3,5 kW habituales.",
      "No todos los coches ofrecen esta función. BYD, MG y XPeng la han popularizado en algunos modelos; consulta el manual antes de asumir que tu coche la tiene. En esta comparativa hay {conXpengTxt} y {conAttoTxt} para Atto 3, Dolphin y Seal.",
      "La compatibilidad importa más que el precio. Un adaptador específico para Atto 3 puede no servir en un MG4, aunque ambos usen conector Tipo 2. El precio va de {min} a {max} y no dice nada de esa compatibilidad.",
      "Antes de usarlo, revisa la potencia total de lo que conectas y evita prolongadores largos. {conIPTxt}, útil si lo usas al aire libre.",
    ]
  }  ,
  "inflador-neumaticos": {
    faq:[[
    "¿Manómetro o inflador?",
    "El manómetro sirve para medir; el inflador portátil además corrige sin buscar una gasolinera. Aquí hay {conManometro} manómetros y {conCompresor} compresores. Si solo quieres una compra, inflador con manómetro integrado."
    ], [
    "¿Importa la presión?",
    "Mucho: una clase energética peor y una presión baja pueden añadir hasta un 10 % de consumo. Es la comprobación más barata que existe."
    ], [
    "¿Qué mido y cuándo?",
    "En frío, con los neumáticos sin rodar, y con los valores de la etiqueta del marco de la puerta, no el máximo del neumático."
    ], [
    "¿Cuánto cuesta?",
    "De {min} a {max}. {conBar} de los {n} declaran el límite de presión en la ficha, que es el dato que te dice hasta dónde puede llegar la bomba."
    ]],
    file:"comparativa-inflador-neumaticos.html",
    title:"Mejores infladores y medidores de presión para coche eléctrico (2026)",
    desc:"Comparativa de infladores portátiles y manómetros para revisar la presión de los neumáticos de tu coche eléctrico.",
    h2:["Por qué importa la presión en un eléctrico","Inflador portátil o solo medidor","Qué mirar al comprar","Cómo usarlo bien"],
    body:[
      "Una clase energética peor y una presión baja pueden añadir hasta un 10 % de consumo en un eléctrico. Revisar la presión cada mes es la comprobación más barata que existe y la que más autonomía devuelve.",
      "Un manómetro digital basta para comprobar. Un inflador portátil de 12 V te permite además corregir en el momento, sin buscar una gasolinera. Aquí hay {conManometro} manómetros y {conCompresor} compresores: si quieres una sola compra, elige un inflador con manómetro integrado.",
      "Fíjate en la parada automática al llegar a la presión elegida, en que muestre bar y PSI, en la longitud del cable de alimentación y en que sea compatible con las válvulas de tu coche. {conBar} de los {n} declaran el límite de presión en la ficha.",
      "Mide siempre en frío, con los neumáticos sin rodar, y usa los valores de la etiqueta del marco de la puerta, no el máximo del neumático. Los precios van de {min} a {max}: un manómetro de {baratoPrecio} cumple para la medición.",
    ]
  },
  "soporte-cable": {
    faq:[[
    "¿Soporte de pared o bolsa?",
    "El soporte de pared mantiene el cable colgado junto al wallbox, fuera del suelo. La bolsa lo protege en el maletero. Aquí hay {conPared} soportes de pared y {conFunda} fundas."
    ], [
    "¿Merece la pena un candado?",
    "En punto público, sí: no impide un robo determinado, pero disuade al oportunista. {conCandado} de los {n} lo llevan."
    ], [
    "¿Cuánto pesa un cable?",
    "Un Tipo 2 de 5 m ronda los 3 kg. El soporte tiene que aguantarlo: si lo cuelgas en la pared, usa tacos adecuados al material."
    ], [
    "¿Cuánto cuestan?",
    "De {min} a {max}. Para guardar el cable en el maletero, con un {baratoPrecio} te apañas."
    ]],
    file:"comparativa-soporte-cable.html",
    title:"Mejores bolsas, soportes y candados para el cable de carga (2026)",
    desc:"Comparativa de bolsas, soportes de pared y candados para guardar y proteger el cable de carga de tu coche eléctrico.",
    h2:["Por qué cuidar el cable","Soporte de pared o bolsa","Candado para el cable","Qué mirar al comprar"],
    body:[
      "El cable de carga es una de las piezas más caras que llevas fuera del coche. Enrollado a la fuerza, arrastrado por el suelo o dejado a la intemperie se deteriora antes.",
      "Un soporte de pared junto al wallbox mantiene el cable colgado y fuera del suelo. Una bolsa o funda lo protege en el maletero y evita que se ensucie el resto del equipaje. Aquí hay {conPared} soportes de pared y {conFunda} fundas.",
      "Si cargas en un punto público, un candado para el cable lo asegura mientras está conectado. No impide un robo determinado, pero disuade al oportunista. Comprueba que sea compatible con tu conector: {conCandado} de los {n} lo llevan.",
      "Revisa la longitud del cable que vas a guardar, el material resistente a la intemperie y que el soporte aguante el peso del cable. Si lo cuelgas en la pared, usa tacos adecuados a tu pared. El soporte más caro cuesta {max} y el más barato {min}.",
    ]
  },
  "maleta-viaje": {
    faq:[[
    "¿Qué llevo siempre?",
    "El cable Tipo 2, los adaptadores que uses y, si quieres un respaldo, un cargador portátil. Sueltos ruedan por el maletero y se ensucian."
    ], [
    "¿Maleta rígida o bolsa blanda?",
    "La bolsa se adapta al hueco y pesa poco; la rígida protege mejor los conectores y ocupa más. Los volúmenes de esta comparativa van de {volMin} a {volMax} litros."
    ], [
    "¿Cómo lo ordeno?",
    "Cable enrollado en grandes vueltas, sin forzar, y los conectores en un compartimento propio. Deja el cable a mano al final, sin deshacer el equipaje."
    ], [
    "¿Cuál es el mejor?",
    "{top} ({topPrecio}) es el más valorado, con {topReviews} opiniones. Y el más barato, {barato} ({baratoPrecio}), también está bien."
    ]],
    file:"comparativa-maleta-viaje.html",
    title:"Mejores maletas y organizadores de maletero para el cable y los adaptadores (2026)",
    desc:"Comparativa de bolsas y maletas para llevar ordenados en el maletero el cable de carga, los adaptadores y el cargador portátil.",
    h2:["Qué llevar siempre en el maletero","Maleta rígida o bolsa blanda","Cómo organizarlo","Qué mirar al comprar"],
    body:[
      "En un viaje largo conviene llevar el cable Tipo 2, los adaptadores que uses y, si quieres un respaldo, un cargador portátil. Sueltos ruedan por el maletero y se ensucian.",
      "Una bolsa blanda se adapta a cualquier hueco y pesa poco. Una maleta rígida protege mejor los adaptadores y los conectores, a cambio de ocupar más espacio. Los حجم van de {volMin} a {volMax} litros.",
      "Guarda el cable enrollado en grandes vueltas sin forzar y los conectores en un compartimento propio. Deja el cable a mano al final, listo para sacar sin deshacer el equipaje.",
      "Mira las dimensiones interiores, la cremallera, el material resistente al agua y si tiene separadores para los adaptadores. Que se pueda limpiar fácilmente es un plus. El precio va de {min} a {max} y no tiene que ver con el tamaño: {top} ({topPrecio}) es el mejor valorado con {topReviews} opiniones.",
    ]
  },
  "nevera-v2l": {
    faq:[[
    "¿Qué nevera llevo de camping?",
    "Si va conectada al coche, una de compresor de 12 V: consume poco y no necesita enchufe. Si va al V2L, una de 220 V da más capacidad. Aquí conviven de {volMin} a {volMax} litros."
    ], [
    "¿Cuánto consume?",
    "Depende del modelo y de la temperatura exterior. Compara el consumo medio que dé el fabricante y no superes la potencia máxima de tu adaptador V2L."
    ], [
    "¿Cuánto puede costar?",
    "De {min} a {max} para {n} productos. La diferencia es de capacidad, de compresor y de si lleva app."
    ], [
    "¿Gasta mucho la batería del coche?",
    "Depende del consumo y de las horas. Con el coche apagado, el V2L sigue alimentando la nevera, pero el manual de tu modelo manda."
    ]],
    file:"comparativa-nevera-v2l.html",
    title:"Mejores neveras de 12 V y accesorios V2L para viajar y acampar (2026)",
    desc:"Comparativa de neveras eléctricas y accesorios para usar con la batería del coche o con un adaptador V2L en viajes y camping.",
    h2:["Qué puedes alimentar con V2L","Nevera de 12 V o de 220 V","Cuánto consume","Qué mirar al comprar"],
    body:[
      "Un adaptador V2L convierte la batería del coche en una toma de corriente. Sirve para una nevera, una cafetera, herramientas o iluminación en un camping o una parada larga, si tu coche admite la función.",
      "Las neveras de compresor de 12 V se conectan a la toma del coche y consumen poco. Las de 220 V se enchufan al V2L y suelen ofrecer más capacidad. Elige según el espacio y de dónde vayas a alimentarla: aquí conviven neveras de {volMin} a {volMax} litros.",
      "El consumo depende del modelo y de la temperatura exterior. Compara el dato de potencia o de consumo medio que dé el fabricante y no superes la potencia máxima de tu adaptador V2L. La diferencia de precio es enorme: de {min} a {max} para {n} productos.",
      "Mira la capacidad en litros, si es de compresor, el nivel de ruido, que tenga protección de batería y que el cable llegue a la toma. Consulta que tu coche permite el V2L antes de comprar.",
    ]
  },
  "invierno": {
    faq:[[
    "¿Cuánto pierde un eléctrico con el frío?",
    "Entre un 10 % y un 25 % de autonomía según la temperatura. Parte es la calefacción, parte la batería."
    ], [
    "¿Cubierta o raspador?",
    "Las dos cosas: la cubierta evita rascar el hielo por la mañana y el raspador es el complemento básico. Aquí hay {conCubierta} cubiertas y {conRaspador} raspadores."
    ], [
    "¿Calentar el coche enchufado gasta batería?",
    "No, usa la red. Es la mejor forma de salir con el habitáculo templado sin penalizar la autonomía."
    ], [
    "¿Cuánto cuestan?",
    "De {min} a {max}. {barato} ({baratoPrecio}) es el más barato y {top} ({topPrecio}, {topNota}★) el mejor valorado."
    ]],
    file:"comparativa-invierno.html",
    title:"Mejores cubiertas y raspadores para el coche eléctrico en invierno (2026)",
    desc:"Comparativa de cubiertas de parabrisas y raspadores para el invierno, junto con consejos para no perder autonomía con el frío.",
    h2:["Qué cambia en invierno","Cubierta de parabrisas y raspador","Precalentar sin gastar batería","Qué mirar al comprar"],
    body:[
      "Con el frío, un eléctrico pierde entre un 10 % y un 25 % de autonomía según la temperatura. Parte de esa pérdida es la calefacción, y parte, la batería.",
      "Una cubierta de parabrisas evita rascar el hielo por la mañana. Un raspador resistente es el complemento básico. En esta comparativa hay {conCubierta} cubiertas y {conRaspador} raspadores: las dos cosas reducen el tiempo que necesitas con el coche encendido.",
      "Precalentar el coche enchufado usa la electricidad de la red en lugar de la batería, y es la mejor forma de empezar el viaje con el habitáculo templado sin perder kilómetros.",
      "Fíjate en que la cubierta cubra todo el parabrisas y los retrovisores, que tenga sujeciones fiables y que el raspador no raye el cristal. El precio va de {min} a {max}: {barato} ({baratoPrecio}) es el más barato y {top} ({topPrecio}, {topNota}★) el mejor valorado.",
    ]
  }
};

const card = p => `<article class="product">
  <span class="thumb-slot" data-src="${p.image && /^https:\/\/(m\.media-amazon\.com|images-eu\.ssl-images-amazon\.com|ws-eu\.amazon-adsystem\.com)\//.test(p.image) ? p.image : img(p.asin)}" aria-hidden="true"></span>
  ${SHOW ? `<span class="badge">${esc(p.best)}</span>` : ""}
  <h3>${esc(p.title)}</h3>
  ${SHOW ? `<div class="pmeta"><span class="price">${esc(p.price)}</span>${p.rating ? `<span>★ ${esc(p.rating)}${p.reviews ? ` <span class="rev">(${mill(p.reviews)})</span>` : ""}</span>` : ""}</div>` : ""}
  <a class="buy" data-asin="${p.asin}" href="https://www.amazon.es/dp/${p.asin}?tag=${TAG}" rel="sponsored nofollow noopener" target="_blank">${SHOW ? "Ver oferta en Amazon" : "Ver precio en Amazon"}</a>
</article>`;

const tpl = (cat, meta, f, calc) => `<!doctype html>
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
<p class="meta">Comparativa · ${cat.products.length} productos de Amazon.es · actualizada el ${esc(fechaLarga)}</p>
<p class="lede">${esc(conDatos(cat.intro, f, calc))} Los enlaces son de afiliado y el precio no cambia para ti.</p>
<section><h2>${esc(meta.h2[0])}</h2><p>${esc(conDatos(meta.body[0], f, calc))}</p>
<div class="products">${cat.products.map(card).join("")}</div></section>
${meta.h2.slice(1).map((h,i)=>`<section><h2>${esc(h)}</h2><p>${esc(conDatos(meta.body[i+1], f, calc))}</p></section>`).join("\n")}
${meta.faq ? `<section><h2>Preguntas frecuentes</h2><dl class="faq">${meta.faq.map(([q,a])=>`<dt>${esc(conDatos(q, f, calc))}</dt><dd>${esc(conDatos(a, f, calc))}</dd>`).join("")}</dl></section>` : ""}
<p class="note">Como afiliado de Amazon, Voltieri obtiene ingresos por las compras adscritas que cumplen los requisitos aplicables.${SHOW ? ` Precios y valoraciones de Amazon.es del ${esc(data.date.split("-").reverse().join("/"))}, pueden cambiar.` : ` Los precios citados en el texto son los que tenía cada producto en Amazon.es el ${esc(data.date.split("-").reverse().join("/"))}: el precio actual y la disponibilidad los ves en Amazon.es.`} <a href="afiliados.html">Cómo lo hacemos</a>.</p>
<footer class="site-footer"><span>© 2026 Voltieri · Datos abiertos, sin cuentas</span><span class="links"><a href="herramientas.html">Herramientas</a><a href="blog/index.html">Guías</a><a href="productos.html">Equipamiento</a><a href="aviso-legal.html">Aviso legal</a><a href="privacidad.html">Privacidad</a><a href="cookies.html">Cookies</a><a href="afiliados.html">Afiliados</a></span></footer>
</main>
<script type="module" src="affiliate.js"></script>
</body>
</html>`;

const live = data.categories.filter(c => c.products.length && META[c.id]); // las categorías sin productos no generan página
for (const cat of live) {
  const meta = META[cat.id];
  const f = factsFor(cat), calc = CALC[cat.id] || {};
  await fs.writeFile(path.join(OUT, meta.file), tpl(cat, meta, f, calc));
  console.log("OK", meta.file);
}

// Página de equipamiento: solo las categorías que ya tienen productos
const hubHead = (await fs.readFile(path.join(OUT, "productos.html"), "utf8")).split("<main")[0];
const hubFoot = (await fs.readFile(path.join(OUT, "productos.html"), "utf8")).match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0];
const hub = `${hubHead}<main class="post post--wide">
<h1>Equipamiento para tu coche eléctrico</h1>
<p class="lede">Lo que de verdad necesitas para cargar en casa, en la calle y de viaje, con los modelos mejor valorados de cada categoría. Cada bloque enlaza a su comparativa completa.</p>
<nav class="toc" aria-label="Categorías"><strong>Categorías</strong><ol>${live.map(c => `<li><a href="#${c.id}">${esc(c.name)}</a></li>`).join("")}</ol></nav>
${live.map(c => `<section id="${c.id}"><div data-shelf="${c.id}" data-title="${esc(c.name)}" data-lede="${esc(conDatos(c.intro, factsFor(c), CALC[c.id] || {}))}" data-limit="3"></div></section>`).join("")}
<p class="note">Como afiliado de Amazon, Voltieri obtiene ingresos por las compras adscritas que cumplen los requisitos aplicables. El precio para ti no cambia. <a href="afiliados.html">Cómo lo hacemos</a>.</p>
${hubFoot}
</main>
<script type="module" src="affiliate.js"></script>
</body>
</html>
`;
await fs.writeFile(path.join(OUT, "productos.html"), hub);
