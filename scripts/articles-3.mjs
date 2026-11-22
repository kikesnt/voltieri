// Guías 18 a 21. Las tablas salen de web/data (vehicles.txt y prices-es.txt) para que coincidan con el catálogo.
// Sobre normativa y mercado se redacta de forma general y se pide verificar la fuente oficial.
const eur = n => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(n) + " €";

export default ({ P, UL, NOTE, T, hbar, top, chinese, FECHA, FECHA_PVPC }) => [
  {
    slug: "coches-electricos-con-mas-autonomia",
    cat: "Autonomía",
    kw: "coches eléctricos con más autonomía",
    title: "Los coches eléctricos con más autonomía en 2026",
    desc: "Ranking de los coches eléctricos con más autonomía: WLTP y autonomía real estimada de cada modelo, y qué mirar además de los kilómetros.",
    lede: "Los coches eléctricos con más autonomía superan ya los 700 km en el ciclo WLTP. Pero esa cifra es una referencia de laboratorio y no tu autonomía en autovía. Ordenamos el catálogo por autonomía y te explicamos cuánto de esa cifra llega a la carretera.",
    summary: `El coche con más autonomía WLTP de nuestro catálogo es el ${top[0].name}, con ${top[0].wltp} km. Aplicando un factor de 0,85 para estimar la autonomía real, bajaría a unos ${top[0].real} km, y en autovía a 120 km/h a menos todavía.`,
    sections: [
      ["Ranking de coches eléctricos con más autonomía", [
        P("Esta tabla ordena los modelos de nuestro catálogo por autonomía WLTP declarada. La columna de autonomía real aplica el factor de 0,85 que usamos como estimación cuando no hay medición independiente."),
        T(["#", "Modelo", "WLTP", "Real est.", "Batería", "Carga DC"], top.map((c, i) => [String(i + 1), c.name, c.wltp + " km", c.real + " km", c.battery + " kWh", c.dc + " kW"])),
        hbar(top.map(c => ({ label: c.name, values: [c.wltp, c.real] })), { series: ["WLTP", "Real estimada"], unit: " km", label: "Autonomía WLTP y real estimada de los coches con más autonomía" }),
        NOTE("Fuente: OpenEV Data v1.24.0. Autonomía real estimada como WLTP × 0,85."),
      ]],
      ["WLTP frente a autonomía real", [
        P("El WLTP mezcla ciudad, carretera y autopista con velocidades medias bajas. Por eso la autonomía real de un coche eléctrico en un viaje por autovía es menor. Con la herramienta de autonomía real puedes ver cuánto pierde cada modelo según velocidad, temperatura y desnivel."),
        P("A 120 km/h el consumo sube alrededor de un 20 % respecto a una conducción mixta y en invierno puede subir otro tanto. Un coche de 700 km WLTP puede quedarse cerca de los 450 km en un viaje de invierno por autovía."),
      ]],
      ["Cuánto cuesta la autonomía", [
        P("Más autonomía significa una batería más grande y más cara, y también más peso. Los coches de la parte alta de la lista son vehículos premium. Si lo que buscas es mucha autonomía por poco dinero, mira los modelos con batería LFP de gama media, que suelen dar buenas cifras por precio."),
        P("Consulta el catálogo para ordenar por precio y compara el coste total con la herramienta de TCO."),
      ]],
      ["Más autonomía no siempre es mejor", [
        UL(["Una batería grande tarda más en cargarse, aunque la potencia de carga sea alta.", "Pesa más y consume algo más en ciudad.", "Si cargas cada noche en casa, necesitas menos autonomía de la que crees.", "Para viajes largos pesa más la potencia de carga que los kilómetros de la ficha."]),
      ]],
      ["Cómo sacarle partido a la autonomía", [
        P("Planifica los viajes largos con un planificador que use tu consumo y cargadores reales, y lleva un cable Tipo 2 y un adaptador por si algún punto no es compatible. Un cargador portátil sirve de último recurso."),
      ]],
    ],
    shelves: [{ after: 4, cat: "cables-tipo2", title: "Cables Tipo 2 para viajar", lede: "Lo primero que llevar si haces viajes largos." }, { after: 4, cat: "adaptadores-ccs2", title: "Adaptadores para más puntos", lede: "Amplía los cargadores donde puedes enchufar." }],
    faq: [["¿Qué coche eléctrico tiene más autonomía?", `Según la ficha WLTP de nuestro catálogo, el ${top[0].name}, con ${top[0].wltp} km.`], ["¿La autonomía WLTP es la real?", "No. Es una cifra de ciclo homologado. En autovía y en invierno la autonomía real es claramente menor."], ["¿Cómo calculáis la autonomía real?", "Con el factor 0,85 sobre el WLTP cuando no hay medición independiente. En la herramienta de autonomía puedes ajustar velocidad, temperatura y desnivel."]],
    tools: ["range", "catalog", "planner"], related: ["autonomia-real-coche-electrico-120-km-h", "mapa-autonomia-coche-electrico", "coches-electricos-baratos-espana-2026", "planificador-ruta-coche-electrico"],
    note: "Datos: OpenEV Data v1.24.0. La autonomía real es una estimación.",
  },
  {
    slug: "coche-electrico-chino",
    cat: "Comprar",
    kw: "coche eléctrico chino",
    title: "Coche eléctrico chino: marcas, precios y qué comprobar",
    desc: "Coche eléctrico chino en España: qué marcas hay en el catálogo (BYD, Leapmotor, Zeekr, GAC Aion), precios, baterías LFP y qué revisar antes de comprar.",
    lede: "El coche eléctrico chino ha pasado de ser una rareza a ocupar un hueco serio en el mercado español. Repasamos qué marcas chinas incluye nuestro catálogo, qué precios tienen y qué conviene comprobar antes de comprar: garantía, talleres y batería.",
    summary: "Las marcas chinas del catálogo (BYD, Zeekr, Leapmotor y GAC Aion) apuestan por baterías LFP y precios ajustados. El BYD Dolphin es el más barato del grupo. Antes de comprar, comprueba la red de talleres y la garantía de la batería.",
    sections: [
      ["Marcas de coche eléctrico chino en nuestro catálogo", [
        T(["Modelo", "WLTP", "Carga DC", "Batería", "Precio"], chinese.map(c => [c.name, c.wltp + " km", c.dc + " kW", c.chem.toUpperCase(), c.price ? eur(c.price) : "Sin dato"])),
        NOTE(`Fuente: OpenEV Data v1.24.0. Precios mínimos de Autocasion, ${FECHA}, donde existen.`),
        P("BYD es la marca con más modelos del catálogo. Zeekr apuesta por prestaciones y autonomías altas. Leapmotor y GAC Aion completan la oferta con propuestas más económicas."),
      ]],
      ["Baterías LFP: la marca de la casa", [
        P("Buena parte de estos coches monta batería LFP, que aguanta más ciclos y cuesta menos que la NMC. Es una ventaja para quien cargará cada noche en casa. Tienes la comparativa completa en la guía de baterías LFP y NMC."),
      ]],
      ["Precio de los coches eléctricos chinos", [
        P("El BYD Dolphin, a 21.498 €, es el chino más barato con precio verificado en nuestros datos. Le siguen el BYD Seal, a 29.605 €, y el Leapmotor C10, a 31.395 €. En lo alto están modelos como el BYD Tang, que supera los 54.000 €."),
        P("Compara siempre el precio con la versión exacta y con el coste total a varios años, no solo con el precio de compra."),
      ]],
      ["Qué comprobar antes de comprar un eléctrico chino", [
        UL(["Red de concesionarios y talleres en tu provincia.", "Garantía del vehículo y de la batería, y qué cubre exactamente.", "Disponibilidad de repuestos y plazos de reparación.", "Actualizaciones de software y soporte de la aplicación.", "Valor de reventa y cómo lo valoran los profesionales.", "Conector de carga: en Europa el estándar es CCS2."]),
      ]],
      ["Qué necesitas para cargarlo", [
        P("Igual que con cualquier eléctrico: un wallbox de 7,4 kW en casa y un cable Tipo 2 para cargar fuera. Los puntos públicos europeos funcionan con los coches vendidos aquí."),
      ]],
    ],
    shelves: [{ after: 4, cat: "wallbox", title: "Wallbox para tu coche", lede: "Cargar en casa es lo que más ahorra, sea cual sea la marca." }, { after: 4, cat: "cables-tipo2", title: "Cable Tipo 2", lede: "Para cargar en puntos públicos." }],
    faq: [["¿Cuál es el coche eléctrico chino más barato?", `El BYD Dolphin, desde 21.498 € según Autocasion (${FECHA}).`], ["¿Los coches eléctricos chinos usan baterías LFP?", "Muchos sí. En nuestro catálogo, la mayoría de BYD, Leapmotor y GAC Aion usan LFP."], ["¿Se pueden cargar en los mismos cargadores?", "Sí, los vendidos en Europa usan el estándar CCS2."], ["¿Tienen garantía en España?", "Sí, pero varía por marca. Comprueba el detalle y la cobertura de la batería."]],
    tools: ["catalog", "tco", "chem"], related: ["bateria-lfp-nmc-coche-electrico", "coches-electricos-baratos-espana-2026", "coche-electrico-segunda-mano", "mejor-coche-electrico-familiar"],
    note: `OpenEV Data v1.24.0 · Autocasion: ${FECHA}.`,
  },
  {
    slug: "hibrido-enchufable-o-electrico",
    cat: "Comprar",
    kw: "coche híbrido enchufable o eléctrico",
    title: "Híbrido enchufable o eléctrico: cuál te conviene",
    desc: "Coche híbrido enchufable o eléctrico: diferencias, costes de uso, mantenimiento y cuándo compensa cada uno según cómo y dónde cargas.",
    lede: "Elegir entre un coche híbrido enchufable o uno eléctrico depende de una pregunta práctica: dónde y cuánto vas a poder enchufarlo. Comparamos cómo funcionan, cuánto cuesta usarlos y en qué casos compensa cada uno.",
    summary: "Si puedes cargar a diario en casa, el eléctrico gana en coste de uso y mantenimiento. El híbrido enchufable tiene sentido si no tienes punto de carga fiable o haces viajes largos por zonas sin red, pero solo ahorra si lo enchufas.",
    sections: [
      ["Cómo funciona cada uno", [
        P("Un coche eléctrico (BEV) usa solo batería y motor eléctrico. Un híbrido enchufable (PHEV) combina un motor térmico con una batería más pequeña que se carga en un enchufe, y puede circular en modo eléctrico durante un tramo limitado antes de recurrir a la gasolina."),
      ]],
      ["Coste de uso: la diferencia que se nota", [
        P(`Con el PVPC medio de 0,212 €/kWh (ESIOS, ${FECHA_PVPC}), un eléctrico de 16 kWh/100 km cuesta 3,39 € cada 100 km. Un gasolina de 7,5 L/100 km a 1,585 €/L cuesta 11,89 €. Un híbrido enchufable queda entre ambos solo si lo cargas con frecuencia.`),
        P("Un híbrido enchufable que nunca se enchufa funciona como un coche de gasolina con un peso extra de batería, y su consumo suele ser peor que el de un híbrido sin enchufe equivalente."),
      ]],
      ["Mantenimiento y averías", [
        P("El eléctrico elimina aceite, filtros de combustible, correas y escape. El híbrido enchufable mantiene el motor térmico y suma el sistema eléctrico, de modo que acumula el mantenimiento de ambos mundos. Consulta la guía de mantenimiento para ver el ahorro estimado de un eléctrico."),
      ]],
      ["Cuándo elegir un híbrido enchufable", [
        UL(["No tienes forma de cargar en casa o en el trabajo.", "Haces con frecuencia viajes largos por zonas con pocos cargadores.", "Tus trayectos diarios son cortos y puedes enchufar cada noche."]),
      ]],
      ["Cuándo elegir un eléctrico", [
        UL(["Puedes instalar un wallbox o cargar en el trabajo.", "Tu uso diario cabe dentro de la autonomía real del coche.", "Quieres minimizar mantenimiento y coste por kilómetro.", "Haces viajes largos que puedes planificar con cargadores de carga rápida."]),
      ]],
      ["Y en los dos casos, un buen cargador", [
        P("Los híbridos enchufables también se cargan con conector Tipo 2 y se benefician de un wallbox. Un cable de calidad sirve para ambos tipos de coche."),
      ]],
    ],
    shelves: [{ after: 5, cat: "wallbox", title: "Wallbox para casa", lede: "Sirve tanto para eléctricos como para híbridos enchufables." }, { after: 5, cat: "cables-tipo2", title: "Cables Tipo 2", lede: "Para cargar en cualquier punto público." }],
    faq: [["¿Qué es mejor, un híbrido enchufable o un eléctrico?", "Si cargas a diario en casa, el eléctrico. Si no tienes dónde cargar, un híbrido enchufable puede ser una transición."], ["¿Un híbrido enchufable consume más si no se carga?", "Suele consumir más que un híbrido equivalente sin enchufe, por el peso de la batería."], ["¿Un híbrido enchufable se puede cargar en casa?", "Sí, con un wallbox o con cable de carga lenta, usando el conector Tipo 2."]],
    tools: ["tco", "homepub", "install"], related: ["cargar-coche-electrico-en-casa-frente-a-la-calle", "mantenimiento-coche-electrico-vs-diesel", "coches-electricos-baratos-espana-2026", "wallbox-que-es-cual-comprar"],
    note: `Datos recogidos el ${FECHA_PVPC} · ESIOS. Consumos de referencia de la guía de costes.`,
  },
  {
    slug: "cargador-coche-electrico-parking-comunitario",
    cat: "Cargar",
    kw: "cargador coche eléctrico parking comunitario",
    title: "Cargador para coche eléctrico en parking comunitario: pasos y derechos",
    desc: "Cómo instalar un cargador de coche eléctrico en un parking comunitario: derecho a instalarlo, comunicación a la comunidad, contador, costes y gestión de potencia.",
    lede: "Instalar un cargador de coche eléctrico en un parking comunitario es posible y la normativa española protege tu derecho a hacerlo. Aun así, hay pasos que seguir: comunicarlo a la comunidad, elegir cómo se alimentará el cargador y contratar a un instalador autorizado. Te los explicamos.",
    summary: "En general basta con comunicarlo a la comunidad de propietarios antes de empezar, y los costes de la instalación corren a cargo de quien la solicita. Confirma los detalles con tu administrador de fincas y con un instalador autorizado.",
    sections: [
      ["Tu derecho a instalar un punto de recarga", [
        P("La Ley de Propiedad Horizontal reconoce el derecho a instalar un punto de recarga para vehículo eléctrico en una plaza de aparcamiento comunitaria para uso privado. En términos generales, no necesitas la aprobación de la junta: basta con comunicárselo a la comunidad antes de empezar. Las condiciones concretas pueden variar según tu caso, así que confírmalo con tu administrador de fincas."),
      ]],
      ["Pasos para instalarlo", [
        UL(["Comunica por escrito a la comunidad que vas a instalar un punto de recarga.", "Pide presupuesto a un instalador autorizado y que revise el cuadro y la distancia a tu plaza.", "Decide cómo se alimentará: desde el contador de tu vivienda o desde un contador independiente.", "Instala el cargador con boletín del instalador, según el REBT (ITC-BT-52).", "Ajusta la potencia contratada a tu cargador."]),
      ]],
      ["De dónde sale la electricidad", [
        P("Hay dos opciones habituales. La primera es tirar una línea desde el contador de tu vivienda hasta la plaza, que es sencilla si el recorrido es corto. La segunda es instalar un contador propio para el cargador, lo que permite una tarifa distinta y separa el gasto del resto de la casa. Un instalador te dirá cuál es viable en tu edificio."),
      ]],
      ["Gestión de potencia compartida", [
        P("Si varios vecinos instalan cargadores, la potencia disponible del edificio puede quedarse corta. Un sistema de gestión dinámica de carga reparte la potencia entre los puntos y evita saltos del diferencial. Si tu edificio tiene una instalación común de recarga, los costes suelen repartirse entre quienes la usan."),
      ]],
      ["Qué cargador elegir para un parking comunitario", [
        P("Un wallbox de 7,4 kW es lo más habitual. Busca modelos con protección integrada, cable de buena longitud para llegar bien a la toma del coche y, si es posible, programación horaria para cargar en horas valle. Para el coste de instalación y la potencia necesaria tienes las herramientas de instalación y de dimensionado."),
      ]],
    ],
    shelves: [{ after: 4, cat: "soporte-cable", title: "Soporte, funda y candado para el cable", lede: "Cuelga el cable en tu plaza y asegúralo cuando cargas." }, { after: 4, cat: "wallbox", title: "Wallbox de 7,4 kW para garaje comunitario", lede: "Los modelos mejor valorados, con foto y enlace a Amazon.es." }, { after: 4, cat: "cables-tipo2", title: "Cables Tipo 2", lede: "Para llegar bien a la toma del coche desde tu plaza." }],
    faq: [["¿Necesito permiso de la comunidad para instalar un cargador?", "En general basta con comunicárselo antes de empezar. Confirma las condiciones con tu administrador de fincas."], ["¿Quién paga la instalación?", "Normalmente quien la solicita. Si la comunidad instala una infraestructura común, los costes se reparten entre los usuarios."], ["¿Puedo usar el contador de mi vivienda?", "Sí, si el recorrido es viable. También puedes instalar un contador independiente."], ["¿Qué potencia necesito?", "Un wallbox de 7,4 kW es el más habitual. Usa la herramienta de dimensionado para tu caso."]],
    tools: ["wallboxtool", "install", "sizing"], related: ["wallbox-instalacion-coche-electrico", "wallbox-que-es-cual-comprar", "cargador-coche-electrico-guia-compra", "tarifa-luz-coche-electrico"],
    note: "Información general, no asesoramiento jurídico. Confirma tu caso con el administrador de fincas y la normativa vigente.",
  },
];
