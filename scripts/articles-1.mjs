// Guías 1 a 6. Cada guía usa su palabra clave principal en título, descripción, primer párrafo y un H2,
// y las secundarias de data/keywords-metrics.txt de forma natural. Sin cifras inventadas: solo datos del proyecto.
const eur = n => new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(n) + " €";
export default ({ P, UL, NOTE, T, hbar, cheap, ioniq5 }) => {
  const [c1, c2, c3, c4, c5] = cheap;
  const diff5 = Math.round(ioniq5 - c1.price);
  return [
  {
    slug: "coches-electricos-baratos-espana-2026",
    cat: "Comprar",
    kw: "coche eléctrico barato",
    title: "Los coches eléctricos más baratos de España en 2026",
    desc: "Qué coche eléctrico barato comprar en 2026: ranking de los coches eléctricos más baratos de España con precio de Autocasion, autonomía y potencia de carga.",
    lede: "Buscar un coche eléctrico barato en España ya no obliga a conformarse con un modelo urbano. Hemos cruzado los precios de venta de Autocasion con las fichas de OpenEV Data y ev-database.org para ordenar los coches eléctricos baratos por lo que de verdad importa: precio, autonomía real y velocidad de carga.",
    summary: `El ${c1.name} es el coche eléctrico más barato de España en nuestro conjunto de datos, a ${eur(c1.price)}, pero sus ${c1.real} km de autonomía real estimada y ${c1.dc} kW en carga rápida lo destinan a la ciudad. Por ${eur(c2.price)}, el ${c2.name} ofrece ${c2.real} km y ${c2.dc} kW. La decisión depende de si haces ciudad o carretera.`,
    sections: [
      ["Ranking de coches eléctricos baratos con precio verificado", [
        P("Esta es la lista de los coches eléctricos más baratos con precio de venta comprobado. Todos son coches nuevos y los precios no incluyen ayudas."),
        T(["#", "Modelo", "Precio", "Autonomía real est.", "Carga DC"], cheap.map((c, i) => [String(i + 1), c.name, eur(c.price), c.real + " km", c.dc + " kW"])),
        hbar(cheap.map(c => ({ label: c.name, values: [c.price] })), { unit: " €", label: "Precio mínimo de los coches eléctricos más baratos" }),
        NOTE("Precios mínimos de coches nuevos en Autocasion, 21/11/2026, sin ayudas. Pueden corresponder a la versión de entrada del modelo. Autonomía real estimada como WLTP × 0,85, y potencia de carga rápida según la ficha de OpenEV Data."),
        P(`Si lo único que buscas es el coche eléctrico más barato en España, el ${c1.name} no tiene rival. Si piensas hacer algún viaje, el salto al ${c2.name} o al ${c4.name} compra potencia de carga y autonomía. Y si tu prioridad es la autonomía por euro, el ${c4.name} es el que más kilómetros da por menos de ${eur(c4.price + 1000)}.`),
      ]],
      ["Cómo hemos calculado qué coche eléctrico es más barato", [
        P("Los precios son los mínimos de anuncios de coches nuevos de Autocasion recogidos el 21/11/2026. Filtramos por modelo exacto para no atribuir a un coche el precio de otro modelo recomendado. Batería útil, WLTP y potencia de carga rápida vienen de OpenEV Data v1.24.0."),
        P("La autonomía real procede de ev-database.org cuando existe. Si no, aplicamos WLTP × 0,85 como modelo declarado. El consumo se deriva de la batería útil dividida entre el WLTP por 100 km y no es una cifra homologada, sino una forma de comparar."),
        P("No incluimos ayudas, financiación, gastos de transferencia ni la instalación de un cargador en casa. Si un modelo no tiene precio publicado, mostramos «Sin dato» en lugar de estimarlo."),
      ]],
      ["Qué significa barato en un coche eléctrico", [
        P(`El precio de compra es solo una parte de la cuenta. Un IONIQ 5 cuesta unos ${eur(diff5)} más que un ${c1.name}, pero carga a 220 kW frente a ${c1.dc} kW. En un viaje de 600 km esa diferencia se mide en minutos de parada, y en comodidad.`),
        P("Con el PVPC medio de 0,212 €/kWh (ESIOS, 21/11/2026), 16 kWh/100 km cuestan 3,39 €. Un gasolina de 7,5 L/100 km a 1,585 €/L cuesta 11,89 €. A 15.000 km al año la diferencia supera los 1.200 €. Cuantos más kilómetros haces, antes compensa pagar algo más por un eléctrico mejor equipado."),
        P("Por eso en la herramienta de coste total comparamos el precio de compra con el gasto de energía, mantenimiento y seguro a varios años. Un coche eléctrico barato que no se adapta a tu uso acaba saliendo caro."),
      ]],
      ["Coches eléctricos baratos de segunda mano y chinos", [
        P("Si el presupuesto no llega, hay dos vías. La primera es el mercado de ocasión, donde los eléctricos pierden valor más rápido que los de combustión. Es una buena noticia si compras y mala si vendes. Lo esencial es comprobar el estado de salud de la batería: tienes una guía propia para ello."),
        P("La segunda son las marcas chinas, como BYD, que han tensado los precios de entrada. Comprueba siempre la red de talleres de tu zona y la garantía de la batería, porque el ahorro inicial no debe costarte tiempo en el taller."),
      ]],
      ["Errores frecuentes al comprar un coche eléctrico barato", [
        UL(["Mirar solo el WLTP y no la autonomía real a 120 km/h.", "Ignorar la potencia de carga rápida si vas a hacer viajes.", "No calcular la instalación del cargador en casa, que puede sumar cientos de euros.", "Olvidar las ayudas y deducciones de tu comunidad.", "No comparar seguros antes de firmar, porque la prima cambia mucho entre modelos."]),
      ]],
      ["Lo que necesitas además del coche", [
        P("Casi todo el ahorro de un eléctrico llega al cargar en casa, donde el kWh es más barato que en la red pública. Un wallbox de 7,4 kW y un buen cable Tipo 2 para cargar fuera cubren la mayoría de los casos. Son las dos compras que más cambian el día a día y conviene decidirlas a la vez que el coche."),
      ]],
    ],
    shelves: [{ after: 5, cat: "wallbox", title: "Los wallbox mejor valorados", lede: "Cargar en casa es lo que de verdad abarata un eléctrico. Estas son las opciones más vendidas de 7,4 kW." }, { after: 5, cat: "cables-tipo2", title: "Y el cable para cargar fuera", lede: "Un Tipo 2 de 5 m te saca de apuros en cualquier punto público." }],
    faq: [["¿Cuál es el coche eléctrico más barato de España?", `El ${c1.name}, desde ${eur(c1.price)} sin ayudas, según los precios de Autocasion del 21/11/2026.`], ["¿Merece la pena un coche eléctrico barato como el BYD Dolphin?", `Si haces más de 10.000 km al año, probablemente sí: carga a ${c2.dc} kW frente a ${c1.dc} kW y tiene bastante más autonomía.`], ["¿Los precios incluyen ayudas?", "No. Son precios antes de ayudas y deducciones."], ["¿Qué coche eléctrico barato es mejor para viajar?", `El ${c4.name}, por su potencia de carga de ${c4.dc} kW y ${c4.real} km de autonomía estimada.`]],
    tools: ["catalog", "tco", "aids"], related: ["coche-electrico-segunda-mano", "ayudas-coche-electrico-2026", "wallbox-instalacion-coche-electrico", "mejor-coche-electrico-familiar"],
    note: "Datos recogidos el 21/11/2026 · Autocasion, OpenEV Data, ev-database.org, ESIOS.",
  },
  {
    slug: "autonomia-real-coche-electrico-120-km-h",
    cat: "Autonomía",
    kw: "autonomía coche eléctrico a 120 km/h",
    title: "Autonomía real a 120 km/h: por qué el WLTP engaña",
    desc: "Cuánta autonomía pierde un coche eléctrico a 120 km/h: desglose físico del consumo, comparación con el WLTP y cómo recuperar kilómetros en autovía.",
    lede: "La autonomía de un coche eléctrico a 120 km/h es sensiblemente menor que la del folleto. El WLTP se mide en un ciclo benévolo con tramos urbanos y velocidades moderadas. En autovía la aerodinámica domina y la autonomía real del coche eléctrico cae. Te mostramos el desglose de cada factor con el modelo físico que usa nuestra herramienta.",
    summary: "A 120 km/h el consumo puede subir entre un 20 % y un 35 % respecto al ciclo mixto. Se explica por la física, no por un defecto del coche.",
    sections: [
      ["Por qué el WLTP no sirve para viajar", [
        P("El ciclo WLTP mezcla ciudad, carretera y autopista con una velocidad máxima de 131 km/h durante un tiempo muy corto. La mayor parte del recorrido se hace a velocidades bajas, donde un eléctrico es muy eficiente gracias a la regeneración. Por eso el WLTP sirve para comparar coches entre sí, pero no para saber hasta dónde llegarás un domingo de agosto en la AP-7."),
        P("Cuando preguntas por la autonomía de un coche eléctrico a velocidad constante, la respuesta depende de tres cosas: tu velocidad, la temperatura y el desnivel. El folleto no conoce ninguna de las tres."),
      ]],
      ["Cómo se calcula el consumo a 120 km/h", [
        P("La fuerza aerodinámica crece con el cuadrado de la velocidad. Pasar de 100 a 120 km/h no suma un 20 % de resistencia sino cerca de un 44 %, porque 1,2 al cuadrado es 1,44. A esa velocidad la aerodinámica supone la mayor parte de la energía que gasta el coche."),
        P("A la aerodinámica se suman la resistencia a la rodadura, que depende de los neumáticos y su presión, la gravedad si hay desnivel y los consumos auxiliares como la climatización. Después se aplican la eficiencia del tren motriz y una regeneración parcial en las bajadas."),
        T(["Componente", "Cómo crece", "Qué puedes hacer"], [["Aerodinámica", "Con el cuadrado de la velocidad", "Bajar la velocidad"], ["Rodadura", "Con peso y presión baja", "Revisar la presión"], ["Gravedad", "Con el desnivel acumulado", "Elegir ruta"], ["Climatización", "Con la diferencia de temperatura", "Precalentar enchufado"]]),
      ]],
      ["Desglose de un viaje tipo: Madrid a Barcelona", [
        P("En Madrid–Barcelona, con 620 km y 1.200 m de desnivel acumulado, la aerodinámica aporta la mayor parte del consumo. La gravedad solo se recupera en parte en las bajadas, porque la regeneración no devuelve toda la energía."),
        P("Puedes reproducir este caso con tu coche en la herramienta de autonomía real: cambia la velocidad, la temperatura y el desnivel y verás cómo se mueve cada componente. Es una estimación física explicable, no una medición de laboratorio."),
      ]],
      ["Cómo compensar la pérdida de autonomía en autovía", [
        UL(["Bajar a 100 km/h en los tramos largos. La diferencia de tiempo suele ser menor de lo que parece.", "Revisar la presión de los neumáticos en frío antes de salir.", "Precalentar el coche enchufado en invierno para no gastar batería en la climatización.", "No cargar el techo ni el portón con barras o cofres si no los necesitas, porque empeoran la aerodinámica.", "Planificar la parada con el planificador de rutas en lugar de apurar la batería."]),
        P("Y si viajas por zonas con pocos puntos de carga, lleva siempre un cable Tipo 2 y un cargador portátil de respaldo."),
      ]],
    ],
    shelves: [{ after: 2, cat: "inflador-neumaticos", title: "Un inflador para revisar la presión", lede: "La presión correcta devuelve autonomía: un inflador con manómetro se paga solo." }, { after: 2, cat: "invierno", title: "Para el frío de invierno", lede: "Cubierta y raspador para no gastar batería calentando el coche antes de salir." }, { after: 3, cat: "cargador-portatil", title: "Un respaldo para cuando el cálculo se queda justo", lede: "Los cargadores portátiles no sustituyen a la red rápida, pero evitan quedarte tirado en zonas con pocos puntos." }],
    faq: [["¿Cuánta autonomía pierde un coche eléctrico a 120 km/h?", "El consumo puede subir entre un 20 % y un 35 % respecto al ciclo mixto del WLTP."], ["¿Cuánto pierde un eléctrico en invierno?", "Entre un 10 % y un 25 % según la temperatura."], ["¿Es mejor ir a 100 km/h?", "El consumo cae de forma notable, pero el tiempo de viaje sube. Compara ambas opciones con el planificador antes de decidir."], ["¿Por qué el consumo real es mayor que el homologado?", "Porque el WLTP se mide con velocidades medias bajas y sin viento, desnivel ni frío."]],
    tools: ["range", "aero", "winter"], related: ["neumaticos-coche-electrico", "planificador-ruta-coche-electrico", "mapa-autonomia-coche-electrico", "coche-electrico-segunda-mano"],
    note: "Modelo físico documentado en la herramienta de autonomía real. Es una estimación, no una medición de laboratorio.",
  },
  {
    slug: "planificador-ruta-coche-electrico",
    cat: "Viajar",
    kw: "planificador ruta coche eléctrico",
    title: "Cómo planificar un viaje largo en coche eléctrico",
    desc: "Cómo usar un planificador de ruta para coche eléctrico: paradas en cargadores reales, elevación, clima y qué llevar en el maletero para viajar sin miedo.",
    lede: "Un buen planificador de ruta para coche eléctrico no se limita a restar kilómetros a la batería. Tiene que conocer la carretera, el desnivel, el clima y dónde hay cargadores de verdad. Nuestro planificador lo calcula con fuentes públicas y sin cuenta, y esta guía te explica cómo sacarle partido.",
    summary: "Una ruta de 600 km no se decide por la autonomía máxima, sino por la posición de los cargadores y la potencia de cada uno.",
    sections: [
      ["Qué datos necesita un planificador de ruta para coche eléctrico", [
        P("Geometría real de la carretera, elevación, temperatura, viento y puntos de recarga con potencia y tipo de conector. Si falta alguno, el cálculo se queda en una media que rara vez describe tu viaje."),
        P("Por eso las aplicaciones que solo dibujan un círculo de autonomía sobre el mapa inducen a error. El mejor planificador de ruta para un coche eléctrico es el que conoce los cargadores concretos que vas a usar."),
      ]],
      ["Cómo funciona nuestro planificador", [
        P("OSRM calcula la distancia por carretera. Open-Meteo aporta altura y clima. El registro MITECO aporta unos 2.500 puntos de carga rápida. Con todo ello el modelo calcula las paradas con una ventana de carga del 10 al 80 %."),
        P("Introduces origen, destino y coche, y obtienes el tiempo total, la energía, las paradas y el coste aproximado de la carga. Puedes compartir la ruta con una dirección web, sin crear cuenta."),
      ]],
      ["Estrategias de carga: pronto y poco o al límite", [
        P("Hay dos filosofías. Cargar pronto y poco, parando más veces pero poco tiempo, o llegar al límite y cargar más tiempo en una sola parada. La segunda opción rara vez compensa, porque la potencia de carga cae a partir del 80 % y el último tramo es el más lento."),
        P("Para saber cuánto tarda de verdad tu coche, usa el simulador de carga: muestra la curva real del modelo y el tiempo del 10 al 80 %."),
      ]],
      ["Antes de salir: lista de comprobación", [
        UL(["Calcula la ruta y mira dónde caen las paradas.", "Comprueba que los cargadores elegidos tienen el conector de tu coche.", "Revisa el tiempo previsto y la temperatura en destino.", "Precalienta o preenfría el coche enchufado.", "Ten un plan B: un segundo cargador a menos de 50 km del primero."]),
      ]],
      ["Qué llevar en el maletero", [
        UL(["Un cable Tipo 2 de 5 m para puntos que no lo incluyen.", "Un adaptador si viajas por zonas con otros conectores.", "Un cargador portátil como último recurso."]),
      ]],
    ],
    shelves: [{ after: 4, cat: "maleta-viaje", title: "Para llevar el cable y los adaptadores ordenados", lede: "Una bolsa o maleta de viaje evita que el cable ruede por el maletero." }, { after: 4, cat: "soporte-cable", title: "Cuida el cable de carga", lede: "Soportes, fundas y candados para guardar o asegurar el cable." }, { after: 4, cat: "cables-tipo2", title: "Cables Tipo 2 para viajar", lede: "El imprescindible del maletero, con precio y valoraciones reales." }, { after: 4, cat: "adaptadores-ccs2", title: "Adaptadores para más puntos de carga", lede: "Para esos puntos que no son tu conector habitual." }],
    faq: [["¿Cuál es el mejor planificador de ruta para coche eléctrico?", "El que usa tu consumo real, el desnivel y cargadores concretos. Nuestro planificador lo hace con datos abiertos y sin cuenta."], ["¿Puedo compartir la ruta?", "Sí, por URL y sin cuenta."], ["¿Funciona sin cobertura?", "La web guarda en tu dispositivo las páginas y datos principales, pero calcular una ruta nueva necesita conexión."], ["¿Cuántas paradas necesito en 600 km?", "Depende de tu coche y de la velocidad. Calcúlalo con tu modelo en el planificador."]],
    tools: ["planner", "chargers", "map"], related: ["autonomia-real-coche-electrico-120-km-h", "mapa-autonomia-coche-electrico", "cargar-coche-electrico-en-casa-frente-a-la-calle", "cargador-coche-electrico-guia-compra"],
    note: "Fuentes: OSRM, Open-Meteo, registro MITECO.",
  },
  {
    slug: "mapa-autonomia-coche-electrico",
    cat: "Viajar",
    kw: "mapa autonomía coche eléctrico",
    title: "Mapa de autonomía: hasta dónde llegas desde tu ciudad",
    desc: "Mapa de autonomía de coche eléctrico por carretera real: hasta dónde llegas desde tu ciudad con una y dos paradas, con cargadores del registro MITECO.",
    lede: "Un mapa de autonomía de coche eléctrico que dibuja un círculo alrededor de tu ciudad no sirve: la carretera no es radial. Nuestro mapa consulta 48 destinos a OSRM y dibuja anillos deformados por la red vial y los cargadores reales. Así ves hasta dónde llegas, y por dónde.",
    summary: "Desde Madrid, el alcance con dos paradas supera los 780 km en 48 de 48 direcciones. Desde Barcelona, solo 29 de 48 direcciones tienen cargadores en el cono útil.",
    sections: [
      ["Por qué un mapa de autonomía no puede ser un círculo", [
        P("La distancia por carretera depende de la dirección. Una autovía estira el anillo y una zona sin vías rápidas lo acorta. Dos ciudades con la misma autonomía pueden tener alcances muy distintos, y por eso el mismo coche llega más lejos desde Madrid que desde algunas ciudades periféricas."),
        P("Un círculo tampoco sabe si hay cargador donde acaba la batería. Nuestro mapa lo tiene en cuenta: solo cuenta como alcanzable el destino al que se llega pasando por cargadores reales."),
      ]],
      ["Cómo se dibujan los anillos de autonomía", [
        P("Usamos 48 destinos a 240 km en línea recta, la distancia real por carretera de OSRM y un ajuste por temperatura y elevación. El resultado es un anillo irregular que sigue las autovías y se encoge donde la carretera da rodeos."),
      ]],
      ["Cómo se eligen las paradas de carga", [
        P("Buscamos cargadores de carga rápida en un cono de 22,5 grados hacia cada destino. La primera parada cae dentro del alcance de la batería y la segunda dentro de la ventana posterior. Si en alguna dirección no hay cargador en el cono útil, esa dirección queda marcada como no alcanzable con paradas."),
      ]],
      ["Qué dice el mapa de Madrid y de Barcelona", [
        P("Desde Madrid, con dos paradas, el alcance supera los 780 km en las 48 direcciones. Es el efecto de la red radial de autovías y de la densidad de cargadores alrededor de la capital."),
        P("Desde Barcelona, solo 29 de 48 direcciones tienen cargadores en el cono útil. El mar, los Pirineos y las zonas con menos puntos reducen el abanico. Es información útil para decidir si un viaje concreto requiere más preparación."),
      ]],
      ["Cómo ampliar tu alcance", [
        P("Si el mapa te deja con pocas opciones en alguna dirección, hay tres palancas: ir a una velocidad menor, usar un adaptador para más estándares de conector y llevar un cargador portátil como respaldo. Los adaptadores aumentan el número de puntos donde puedes enchufar."),
      ]],
    ],
    shelves: [{ after: 4, cat: "adaptadores-ccs2", title: "Adaptadores CCS2", lede: "Más puntos compatibles significa más direcciones en verde." }, { after: 4, cat: "cargador-portatil", title: "Cargadores portátiles", lede: "Un respaldo para las zonas con menos cargadores." }],
    faq: [["¿Cuál es la autonomía real de un coche eléctrico desde mi ciudad?", "Depende de la dirección. Abre el mapa de autonomía, elige tu punto de salida y tu coche y verás el anillo real por carretera."], ["¿Son datos en tiempo real?", "Los puntos son oficiales, pero el estado dinámico (si está libre u ocupado) no está disponible de forma abierta."], ["¿Qué diferencia hay con el planificador de rutas?", "El mapa muestra el alcance en todas las direcciones. El planificador calcula un viaje concreto entre dos puntos."]],
    tools: ["map", "chargers", "planner"], related: ["planificador-ruta-coche-electrico", "autonomia-real-coche-electrico-120-km-h", "cargar-coche-electrico-en-casa-frente-a-la-calle", "cargador-coche-electrico-guia-compra"],
    note: "Fuentes: OSRM, Open-Meteo, registro MITECO.",
  },
  {
    slug: "bateria-lfp-nmc-coche-electrico",
    cat: "Comprar",
    kw: "batería coche eléctrico LFP",
    title: "LFP frente a NMC: qué batería te conviene",
    desc: "Batería de coche eléctrico LFP o NMC: diferencias en ciclos, densidad energética, carga rápida, duración y precio para elegir la que te conviene.",
    lede: "La batería de un coche eléctrico es la pieza más cara y la que más condiciona su vida útil. La química decide cuántos años te durará el coche y cómo cargará en invierno. Comparamos la batería LFP y la NMC con criterios verificables, para que sepas cuál te conviene según tu uso.",
    summary: "El LFP aguanta más ciclos y es más barato. El NMC da más autonomía por peso y suele cargar más rápido.",
    sections: [
      ["Qué es una batería LFP", [
        P("LFP significa fosfato de hierro y litio. Tiene menos densidad energética que el NMC, así que pesa y ocupa más para almacenar los mismos kWh. A cambio resiste muchos más ciclos de carga, es más estable al calor y evita el cobalto y el níquel, dos materiales caros."),
        P("Es una química habitual en los modelos de acceso, y buena parte de la duración de la batería de un coche eléctrico depende de ella. Su coste menor ayuda a bajar el precio de la batería del coche y, con él, el del coche."),
      ]],
      ["Qué es una batería NMC", [
        P("NMC son las siglas de níquel, manganeso y cobalto. Ofrece más densidad energética, lo que se traduce en más autonomía con el mismo peso, y suele aceptar mejor potencias de carga altas y responder mejor en frío. Su contrapartida es el coste y una vida útil algo menor en ciclos."),
      ]],
      ["Comparativa rápida: LFP frente a NMC", [
        T(["Criterio", "LFP", "NMC"], [["Ciclos de vida", "Más", "Menos"], ["Densidad energética", "Menor", "Mayor"], ["Precio", "Menor", "Mayor"], ["Respuesta en frío", "Más débil", "Mejor"], ["Carga rápida", "Buena", "Suele ser más alta"], ["Carga al 100 %", "Recomendable a menudo", "Mejor no hacerlo siempre"]]),
      ]],
      ["Cómo elegir según tu uso", [
        UL(["Uso urbano y larga vida del coche: LFP.", "Viajes frecuentes y peso contenido: NMC.", "Vives en una zona fría y cargas fuera: NMC.", "Cargas siempre en casa y quieres pagar menos: LFP."]),
        P("Con la herramienta de química de batería puedes ver qué química lleva cada modelo del catálogo y con la de degradación estimar cómo envejecerá."),
      ]],
      ["Cargar en casa cambia la ecuación", [
        P("Con una batería LFP puedes cargar al 100 % con regularidad, y hacerlo en casa con un wallbox programable es la forma más barata y cómoda de aprovecharlo. Si tu coche es NMC, conviene mantenerlo entre el 20 % y el 80 % en el día a día y reservar el 100 % para los viajes."),
      ]],
    ],
    shelves: [{ after: 4, cat: "wallbox", title: "Wallbox para cargar en casa", lede: "Programa la carga en horas valle y olvídate del cable." }],
    faq: [["¿Cuál es mejor, LFP o NMC?", "Depende del uso. LFP para ciudad y larga vida, NMC para viajes y menor peso."], ["¿Puedo cargar un LFP al 100 %?", "Sí, y es recomendable hacerlo periódicamente para calibrar el indicador."], ["¿Cuánto cuesta una batería de coche eléctrico?", "Es la pieza más cara del coche. La LFP abarata el precio frente a la NMC. La sustitución completa es poco frecuente."], ["¿Cuánto dura una batería de coche eléctrico?", "Depende de la química, del uso y de la carga. Consulta la garantía de tu modelo y la herramienta de degradación."]],
    tools: ["chem", "degrade", "catalog"], related: ["mantenimiento-coche-electrico-vs-diesel", "coche-electrico-segunda-mano", "cargar-coche-electrico-en-casa-frente-a-la-calle", "autonomia-real-coche-electrico-120-km-h"],
    note: "Datos de baterías: OpenEV Data v1.24.0.",
  },
  {
    slug: "cargar-coche-electrico-en-casa-frente-a-la-calle",
    cat: "Cargar",
    kw: "precio recarga pública coche eléctrico",
    title: "Cuánto cuesta cargar en casa frente a la calle",
    desc: "Precio de la recarga pública del coche eléctrico frente a cargar en casa: PVPC por horas, tarifa de IONITY y cómo reducir la factura.",
    lede: "El precio de la recarga pública de un coche eléctrico puede casi duplicar el de cargar en casa. Usamos los 24 precios reales del PVPC y la tarifa publicada por IONITY para ponerle cifras al ahorro y explicarte cómo pagar menos.",
    summary: "Con un PVPC medio de 0,212 €/kWh frente a 0,39 €/kWh de IONITY, 50 kWh cuestan 10,60 € en casa y 19,50 € en la red.",
    sections: [
      ["Cuánto cuesta una carga en casa", [
        P("En casa pagas el precio de tu tarifa eléctrica. Con el PVPC, el precio cambia cada hora y se publica el día anterior. Con una media de 0,212 €/kWh, cargar 50 kWh cuesta 10,60 €. Es el precio por kWh más bajo al que puedes cargar un coche eléctrico."),
        P("Cargar un coche eléctrico en casa tiene además un precio por kilómetro muy bajo. Con 16,8 kWh/100 km, cada 100 km cuestan unos 3,50 € a ese precio medio."),
      ]],
      ["Precio de la recarga pública y carga rápida", [
        P("La red pública cobra más por kWh porque incluye la inversión en cargadores de alta potencia, el mantenimiento y el margen. IONITY publica una tarifa de 0,39 €/kWh, con la que 50 kWh cuestan 19,50 €. Otras redes tienen precios distintos según potencia y suscripción."),
        T(["Dónde cargas", "Precio por kWh", "50 kWh"], [["Casa, PVPC medio", "0,212 €", "10,60 €"], ["Casa, hora más barata", "0,13 €", "6,50 €"], ["IONITY", "0,39 €", "19,50 €"]]),
      ]],
      ["Cómo leer el PVPC y cargar en horas baratas", [
        P("El precio cambia cada hora. La ventana más barata del día de publicación se sitúa en torno a 0,13 €/kWh. Programar la carga en esas horas es la palanca más sencilla para bajar la factura, y la herramienta de optimización de carga te dice cuál es la mejor franja de hoy."),
      ]],
      ["Cuándo compensa cargar fuera", [
        P("En viajes largos, si no tienes punto propio o por pura conveniencia. En el día a día, cargar en casa gana por goleada. Si no tienes garaje, compara el precio de la recarga pública con tu tarifa y valora un cargador en el trabajo o un parking con punto."),
        P("Con un cable Tipo 2 de calidad puedes además usar cualquier punto público sin depender del cable que incluya el cargador."),
      ]],
      ["Cómo bajar el coste de la recarga en casa", [
        UL(["Usar un wallbox que programe la carga en horas valle.", "Ajustar la potencia contratada a la del cargador.", "Comparar tarifas con discriminación horaria.", "Aprovechar excedentes si tienes placas solares."]),
      ]],
    ],
    shelves: [{ after: 4, cat: "wallbox", title: "Wallbox con programación horaria", lede: "La forma más fácil de cargar cuando la luz es barata." }, { after: 3, cat: "cables-tipo2", title: "Cable Tipo 2 para cargar fuera", lede: "Indispensable si dependes de la red pública." }],
    faq: [["¿Cuánto cuesta cargar un coche eléctrico en un punto público?", "Depende de la red. IONITY publica 0,39 €/kWh, por lo que 50 kWh cuestan 19,50 €."], ["¿Cuánto cuesta cargar en casa?", "Con un PVPC medio de 0,212 €/kWh, 50 kWh cuestan 10,60 €."], ["¿Hay tarifas planas?", "Algunas redes las publican, pero no hay un agregador abierto y verificable."], ["¿Cuál es la hora más barata?", "Varía cada día. La ventana barata se sitúa en torno a 0,13 €/kWh y la herramienta de optimización la calcula."]],
    tools: ["optimizer", "homepub", "tariffs"], related: ["wallbox-instalacion-coche-electrico", "tarifa-luz-coche-electrico", "coches-electricos-baratos-espana-2026", "planificador-ruta-coche-electrico"],
    note: "Datos recogidos el 21/11/2026 · ESIOS, IONITY.",
  },
];
};
