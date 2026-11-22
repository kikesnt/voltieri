// Guías 22 y 23, generadas desde web/data/provincias.txt (RIPREE) y web/data/market.txt (Our World in Data).
const nf = n => new Intl.NumberFormat("es-ES").format(n);
const pct = n => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 }).format(n);
const NAMES = { ESP: "España", PRT: "Portugal", FRA: "Francia", DEU: "Alemania", ITA: "Italia", GBR: "Reino Unido", NOR: "Noruega", CHN: "China", USA: "Estados Unidos" };

export default ({ P, UL, NOTE, T, hbar, line, prov, market }) => {
  // ---- puntos de recarga por provincia
  const pretty = n => n.replace(/^(.*), (Las|Illes|A|La)$/, "$2 $1");
  const rows = prov.map(r => ({ ...r, name: pretty(r.name), share: r.fast / r.points * 100 }));
  const total = rows.reduce((a, r) => a + r.points, 0), totalFast = rows.reduce((a, r) => a + r.fast, 0);
  const byPoints = [...rows].sort((a, b) => b.points - a.points);
  const byFast = [...rows].sort((a, b) => b.fast - a.fast);
  const least = byPoints.filter(r => r.name !== "Ceuta").slice(-8).reverse();
  const first = byPoints[0], firstFast = byFast[0];

  // ---- mercado
  const share = (c, y) => +(market.find(m => m.kind === "cuota" && m.c === c && m.y === y)?.v ?? NaN);
  const units = y => +(market.find(m => m.kind === "ventas" && m.c === "ESP" && m.y === y)?.v ?? NaN);
  const last = Math.max(...market.filter(m => m.kind === "cuota").map(m => +m.y)), prev = last - 1;
  const years = [...new Set(market.filter(m => m.c === "ESP" && m.kind === "cuota").map(m => m.y))].sort();
  const ranking = Object.keys(NAMES).map(c => ({ c, v: share(c, String(last)) })).filter(r => !isNaN(r.v)).sort((a, b) => b.v - a.v);
  const posES = ranking.findIndex(r => r.c === "ESP") + 1;
  const ahead = ranking.slice(0, posES - 1).map(r => NAMES[r.c]), behind = ranking.slice(posES).map(r => NAMES[r.c]);
  const list = a => a.length > 1 ? a.slice(0, -1).join(", ") + " y " + a[a.length - 1] : a[0] || "ninguno";
  const dip = share("ESP", String(prev)) < share("ESP", String(prev - 1));
  const growth = (units(String(last)) / units(String(prev)) - 1) * 100;

  return [
    {
      slug: "puntos-de-recarga-por-provincia",
      cat: "Cargar",
      kw: "puntos de recarga por provincia",
      title: "Puntos de recarga por provincia: dónde hay más cargadores en España",
      desc: `Ranking de puntos de recarga para coche eléctrico por provincia con datos oficiales del registro RIPREE: ${first.name} lidera con ${nf(first.points)}. Con carga rápida y qué provincias quedan atrás.`,
      lede: "Cuántos cargadores hay no es lo mismo en Madrid que en Soria. Hemos contado los puntos de recarga registrados en el registro oficial del Ministerio (RIPREE) y los hemos ordenado por provincia, separando los de carga rápida, que son los que importan en un viaje largo.",
      summary: `El registro oficial recoge ${nf(total)} puntos de recarga en las provincias analizadas, de los que ${nf(totalFast)} son de carga rápida (50 kW o más). ${first.name} es la provincia con más puntos (${nf(first.points)}) y ${firstFast.name} la que más tiene de carga rápida (${nf(firstFast.fast)}).`,
      sections: [
        ["Ranking de provincias con más puntos de recarga", [
          P("Esta tabla ordena las provincias por número de puntos de recarga registrados. La columna de carga rápida cuenta los puntos de corriente continua de 50 kW o más."),
          T(["#", "Provincia", "Puntos", "Carga rápida", "% rápida"], byPoints.slice(0, 15).map((r, i) => [String(i + 1), r.name, nf(r.points), nf(r.fast), pct(r.share) + " %"])),
          hbar(byPoints.slice(0, 15).map(r => ({ label: r.name, values: [r.points, r.fast] })), { series: ["Puntos totales", "Carga rápida (50 kW o más)"], label: "Puntos de recarga por provincia, total y de carga rápida" }),
          NOTE("Fuente: RIPREE (Ministerio para la Transición Ecológica). Un punto de recarga cuenta una vez aunque tenga varios conectores. Datos del 22/11/2026."),
        ]],
        ["Dónde hay más carga rápida", [
          P("Para viajar importa más la carga rápida que el total. Estas son las provincias con más puntos de 50 kW o más."),
          T(["#", "Provincia", "Carga rápida", "Puntos totales"], byFast.slice(0, 10).map((r, i) => [String(i + 1), r.name, nf(r.fast), nf(r.points)])),
          P("Las provincias grandes lideran en números absolutos, pero varias provincias por las que pasan corredores de viaje tienen una proporción de carga rápida muy alta. Mira la columna de porcentaje de la tabla anterior."),
        ]],
        ["Las provincias con menos puntos", [
          T(["Provincia", "Puntos", "Carga rápida"], least.map(r => [r.name, nf(r.points), nf(r.fast)])),
          P("Que una provincia tenga pocos puntos no significa que no se pueda cruzar, pero sí que conviene planificar la parada y tener un plan B. Son las zonas donde un cable Tipo 2, un adaptador y un cargador portátil de respaldo se agradecen."),
        ]],
        ["Cómo leer estos datos", [
          UL(["El ranking es en números absolutos: no está corregido por población ni por número de coches eléctricos.", "El registro depende de lo que declaran los operadores. Puede haber puntos sin registrar o ya retirados.", "Un punto disponible en el registro no garantiza que esté libre ni que funcione en este momento."]),
          P("Para ver los cargadores concretos de tu ruta usa el planificador de rutas y el mapa de cargadores, que parten de la misma fuente oficial."),
        ]],
        ["Qué llevar si viajas por provincias con poca red", [
          P("Un cable Tipo 2 de 5 m te permite enchufar en puntos que no incluyen cable. Un adaptador amplía los puntos compatibles y un cargador portátil sirve de último recurso."),
        ]],
      ],
      shelves: [{ after: 4, cat: "cables-tipo2", title: "Cables Tipo 2", lede: "El imprescindible si viajas por zonas con poca red." }, { after: 4, cat: "adaptadores-ccs2", title: "Adaptadores", lede: "Más puntos compatibles en cada parada." }, { after: 4, cat: "cargador-portatil", title: "Cargadores portátiles", lede: "Un respaldo para zonas con pocos puntos." }],
      faq: [["¿Qué provincia tiene más puntos de recarga?", `${first.name}, con ${nf(first.points)} puntos registrados según RIPREE.`], ["¿Cuántos puntos de recarga hay en España?", `El registro analizado recoge ${nf(total)} puntos, de los que ${nf(totalFast)} son de carga rápida.`], ["¿Qué provincia tiene más carga rápida?", `${firstFast.name}, con ${nf(firstFast.fast)} puntos de 50 kW o más.`], ["¿De dónde salen los datos?", "Del registro oficial RIPREE del Ministerio para la Transición Ecológica, descargado el 22/11/2026."]],
      tools: ["chargers", "planner", "map"], related: ["mapa-autonomia-coche-electrico", "planificador-ruta-coche-electrico", "cargar-coche-electrico-en-casa-frente-a-la-calle", "cargador-coche-electrico-guia-compra"],
      note: "Datos: RIPREE (MITECO), 22/11/2026.",
    },
    {
      slug: "venta-coches-electricos-espana",
      cat: "Comprar",
      kw: "venta de coches eléctricos en España",
      title: "Venta de coches eléctricos en España: cifras y comparación con Europa",
      desc: `Venta de coches eléctricos en España: de ${nf(units("2019"))} unidades en 2019 a ${nf(units(String(last)))} en ${last}, cuota de mercado y cómo se compara con Portugal, Francia, Alemania, Italia y Noruega.`,
      lede: "La venta de coches eléctricos en España se ha disparado en pocos años, pero sigue por detrás de varios países europeos. Reunimos las cifras de Our World in Data, que parte de los datos de la Agencia Internacional de la Energía, para ver cuánto se vende, qué cuota tiene y dónde está España en la comparación.",
      summary: `En ${last} se vendieron ${nf(units(String(last)))} coches eléctricos en España, un ${pct(growth)} % más que en ${prev}, y ya son el ${pct(share("ESP", String(last)))} % de las matriculaciones nuevas. España ocupa el puesto ${posES} de ${ranking.length} países de esta comparación. La fuente incluye los híbridos enchufables dentro de "eléctricos".`,
      sections: [
        ["Cuántos coches eléctricos se venden en España", [
          T(["Año", "Ventas", "Cuota de coches nuevos"], years.filter(y => !isNaN(units(y))).map(y => [y, nf(units(y)), pct(share("ESP", y)) + " %"])),
          hbar(years.filter(y => !isNaN(units(y))).map(y => ({ label: y, values: [units(y)] })), { label: "Coches eléctricos vendidos en España por año" }),
          NOTE("Fuente: Our World in Data a partir de la Agencia Internacional de la Energía. Por «eléctricos» la fuente entiende eléctricos puros e híbridos enchufables."),
          P(`En ${last} la cuota de coches nuevos eléctricos subió del ${pct(share("ESP", String(prev)))} % al ${pct(share("ESP", String(last)))} %. La tendencia desde 2019 es de crecimiento${dip ? `, con un freno puntual en ${prev}` : ""}.`),
        ]],
        [`España frente a Europa en ${last}`, [
          line(["ESP", "PRT", "FRA", "DEU", "NOR"].map(k => ({ name: NAMES[k], strong: k === "ESP", points: market.filter(m => m.kind === "cuota" && m.c === k).map(m => [+m.y, +m.v]) })), { unit: " %", label: "Cuota de coches nuevos eléctricos 2019 a " + last + ": España frente a Portugal, Francia, Alemania y Noruega" }),
          T(["#", "País", "Cuota de coches nuevos eléctricos"], ranking.map((r, i) => [String(i + 1), NAMES[r.c], pct(r.v) + " %"])),
          P(`${NAMES[ranking[0].c]} marca el techo de esta comparación con un ${pct(ranking[0].v)} %. Por delante de España están ${list(ahead)}. Por detrás, ${list(behind)}.`),
        ]],
        ["Qué explica la diferencia", [
          UL(["Precio de compra: los eléctricos de entrada han bajado, pero siguen por encima de los de gasolina equivalentes.", "Ayudas y fiscalidad: cambian por país y por comunidad, y condicionan cuándo compra la gente.", "Red de recarga: con menos puntos en algunas zonas, hay quien duda de dar el paso.", "Disponibilidad de punto de carga en casa: en los países donde más viviendas tienen garaje, la adopción es mayor."]),
          P("Si estás valorando comprar, compara el coste total con la herramienta de TCO y revisa las ayudas vigentes en tu comunidad."),
        ]],
        ["Qué significa para ti", [
          P("Un mercado que crece trae más modelos, más competencia en precios y más mercado de segunda mano. También implica más demanda de puntos de carga, así que cargar en casa sigue siendo la opción más cómoda y barata."),
        ]],
      ],
      shelves: [{ after: 3, cat: "wallbox", title: "Wallbox para cargar en casa", lede: "Lo primero que resolver cuando compras un eléctrico." }],
      faq: [["¿Cuántos coches eléctricos se vendieron en España en el último año?", `En ${last} se vendieron ${nf(units(String(last)))}, según la fuente.`], ["¿Qué cuota tienen los eléctricos en España?", `El ${pct(share("ESP", String(last)))} % de los coches nuevos en ${last}.`], ["¿En qué país se venden más coches eléctricos?", `En cuota, ${NAMES[ranking[0].c]} lidera la comparación, con un ${pct(ranking[0].v)} % de los coches nuevos.`], ["¿Los datos incluyen híbridos enchufables?", "Sí. La fuente cuenta eléctricos puros e híbridos enchufables."]],
      tools: ["tco", "aids", "catalog"], related: ["coches-electricos-baratos-espana-2026", "hibrido-enchufable-o-electrico", "ayudas-coche-electrico-2026", "coche-electrico-chino"],
      note: "Datos: Our World in Data (AIE), descargados el 22/11/2026.",
    },
  ];
};
