// Guías 7 a 17. Mismo criterio que articles-1.mjs: palabra clave natural, datos del proyecto, sin cifras inventadas.
export default ({ P, UL, NOTE, SRC, T, FECHA, FECHA_PVPC }) => [
  {
    slug: "ayudas-coche-electrico-2026",
    cat: "Comprar",
    kw: "ayudas coche eléctrico 2026",
    title: "Ayudas al coche eléctrico en 2026: guía práctica",
    desc: "Ayudas al coche eléctrico en 2026 en España: deducción en IRPF, ayudas por comunidad autónoma, requisitos y cómo calcular el precio real de tu coche.",
    lede: "Las ayudas para comprar un coche eléctrico en 2026 cambian cada año y por comunidad, y es fácil perderse entre deducciones, subvenciones y programas autonómicos. Te explicamos qué ayudas existen para el coche eléctrico en España, qué requisitos suelen pedir y cómo calcular el precio efectivo de tu coche.",
    summary: "Las ayudas combinan la deducción estatal en el IRPF y los programas de cada comunidad. Importes, precio máximo y plazos cambian cada año: confirma siempre las bases oficiales antes de contar con ellas.",
    sections: [
      ["Deducción en el IRPF por comprar un eléctrico", [
        P("La deducción estatal se aplica en la declaración de la renta, no como descuento en el concesionario. Eso significa que adelantas el importe completo del coche y recuperas la deducción al presentar la declaración. Si tu cuota del IRPF es baja, conviene comprobar que podrás aprovecharla entera."),
        P("Su importe y su precio máximo dependen de las condiciones vigentes para tu fecha de matriculación. Antes de contar con ella, comprueba las condiciones en la sede de la Agencia Tributaria."),
      ]],
      ["Ayudas por comunidad autónoma", [
        P("Madrid, Cataluña, Valencia, Andalucía y País Vasco tienen programas propios, con cuantías, plazos y requisitos distintos. Algunas se tramitan a través del concesionario y otras las solicitas tú. Consulta siempre las bases oficiales vigentes de tu comunidad, porque las convocatorias se abren y se agotan a lo largo del año."),
        P("La herramienta de ayudas por comunidad reúne lo que hay para cada región y te ayuda a ver qué te corresponde."),
      ]],
      ["Requisitos habituales para pedir ayudas", [
        UL(["Precio máximo del vehículo, que suele fijarse sin impuestos.", "Fecha de matriculación dentro del periodo de la convocatoria.", "Residencia o empadronamiento en la comunidad que convoca la ayuda.", "En algunos casos, achatarrar un vehículo antiguo."]),
      ]],
      ["Cómo calcular el precio efectivo de tu coche", [
        P("El precio efectivo es el precio de compra menos las ayudas que realmente cobras, más lo que gastarás en instalar un cargador. Para decidir entre dos coches, mira el coste total de varios años: energía, mantenimiento, seguro y valor residual."),
        P("Con el coste total de propiedad puedes comparar un eléctrico con uno de gasolina con tus kilómetros anuales y tu tarifa eléctrica."),
      ]],
      ["Ayudas para el punto de recarga", [
        P("Deducción y programas autonómicos pueden cubrir parte del coste del punto de recarga en casa. Conserva las facturas y el boletín de la instalación. Compara modelos de wallbox antes de contratar la instalación, porque la ayuda suele cubrir un porcentaje y el resto lo pagas tú."),
      ]],
    ],
    shelves: [{ after: 4, cat: "wallbox", title: "Compara wallbox antes de instalar", lede: "Si parte del coste se subvenciona, conviene elegir bien un modelo fiable." }],
    faq: [["¿Qué ayudas hay para comprar un coche eléctrico en 2026?", "La deducción estatal en el IRPF y los programas de cada comunidad autónoma."], ["¿Cuánto es la deducción del IRPF?", "Depende de la convocatoria y del precio del vehículo. Confírmalo en la Agencia Tributaria antes de contar con ella."], ["¿Se puede acumular con renting?", "Depende del programa. Consulta las bases oficiales."], ["¿Las ayudas son un descuento en el concesionario?", "La deducción del IRPF no. Algunas ayudas autonómicas sí se tramitan en el concesionario."]],
    tools: ["aids", "tco", "install"], related: ["coches-electricos-baratos-espana-2026", "wallbox-instalacion-coche-electrico", "seguro-coche-electrico-precio", "coche-electrico-segunda-mano"],
    note: "Verifica siempre las bases oficiales vigentes de tu comunidad antes de contar con una ayuda.",
  },
  {
    slug: "wallbox-instalacion-coche-electrico",
    cat: "Cargar",
    kw: "cargador coche eléctrico en casa",
    title: "Instalar un wallbox: coste y trámites",
    desc: "Cargador de coche eléctrico en casa: cuánto cuesta instalar un wallbox, qué trámites necesitas, qué dice el REBT y qué modelo elegir.",
    lede: "Instalar un cargador de coche eléctrico en casa no es solo comprar el aparato. Hay que dimensionar la potencia, el cable y las protecciones según el REBT, y comunicarlo a la comunidad si vives en un edificio. Esta guía resume el coste, los trámites y cómo elegir el wallbox adecuado.",
    summary: "Un wallbox de 7,4 kW con instalación sencilla ronda los 2.000 € antes de ayudas.",
    sections: [
      ["Qué necesitas para instalar un cargador en casa", [
        UL(["Un punto de conexión cercano al garaje o plaza.", "Cable de sección correcta y protecciones, según el REBT (ITC-BT-52).", "Contrato con potencia suficiente para cargar y mantener el resto de la casa.", "Comunicarlo a la comunidad de propietarios antes de empezar, si vives en un edificio."]),
        P("Si tu garaje está lejos del cuadro, o la instalación es larga, el presupuesto sube. Un instalador autorizado hace una visita previa y te da el coste cerrado."),
      ]],
      ["Cuánto cuesta instalar un wallbox", [
        P("El presupuesto se reparte entre el aparato, la instalación, la obra y la homologación. Con una instalación sencilla, un wallbox de 7,4 kW ronda los 2.000 € antes de ayudas. El aparato es la parte más pequeña y la que más margen tienes para elegir."),
        T(["Tramo", "Qué incluye"], [["Aparato", "Wallbox con protección y cable"], ["Instalación", "Mano de obra y material eléctrico"], ["Obra", "Canalización y acceso al cuadro"], ["Homologación", "Boletín y puesta en servicio"]]),
        P("Puedes estimar tu caso con las herramientas de coste de instalación y de dimensionado."),
      ]],
      ["Qué wallbox elegir para casa", [
        P("Para un contrato monofásico, un wallbox de 7,4 kW es el punto de equilibrio: carga unos 50 kWh en siete horas, suficiente para una noche. Busca protección integrada, cable de longitud suficiente y, si quieres, app para programar la carga en horas baratas."),
        P("Si tienes trifásica y un coche que admita 22 kW en corriente alterna, un wallbox de 22 kW acelera la carga, pero solo merece la pena si tu acometida y tu coche lo aprovechan."),
      ]],
      ["Ayudas para el punto de recarga", [
        P("Deducción y programas autonómicos pueden cubrir parte del coste. Conserva las facturas y el boletín de la instalación y consulta las bases de tu comunidad antes de pagar."),
      ]],
    ],
    shelves: [{ after: 2, cat: "soporte-cable", title: "Soporte para el cable junto al wallbox", lede: "Cuelga el cable y mantenlo fuera del suelo." }, { after: 2, cat: "wallbox", title: "Wallbox de 7,4 kW más vendidos", lede: "Los cargadores de coche eléctrico para casa mejor valorados en Amazon.es." }, { after: 2, cat: "estaciones-22kw", title: "Si tienes trifásica: 22 kW", lede: "Solo merece la pena si tu acometida y tu coche lo aprovechan." }],
    faq: [["¿Cuánto cuesta instalar un cargador de coche eléctrico en casa?", "Con una instalación sencilla, un wallbox de 7,4 kW ronda los 2.000 € antes de ayudas."], ["¿Puedo cargar con schuko?", "No es recomendable para uso diario por seguridad."], ["¿Necesito permiso de la comunidad?", "Debes comunicárselo a la comunidad de propietarios antes de empezar."], ["¿Qué potencia de cargador necesito en casa?", "Para la mayoría de hogares con contrato monofásico, 7,4 kW."]],
    tools: ["install", "sizing", "wallboxtool"], related: ["cargador-coche-electrico-guia-compra", "wallbox-que-es-cual-comprar", "cargar-coche-electrico-en-casa-frente-a-la-calle", "ayudas-coche-electrico-2026"],
    note: "Presupuesto orientativo. Pide siempre presupuesto a un instalador autorizado.",
  },
  {
    slug: "mantenimiento-coche-electrico-vs-diesel",
    cat: "Poseer",
    kw: "mantenimiento coche eléctrico",
    title: "Mantenimiento de un eléctrico frente a un diésel",
    desc: "Cuánto cuesta el mantenimiento de un coche eléctrico frente a un diésel: qué se elimina, qué queda y cuánto ahorras al año.",
    lede: "El mantenimiento de un coche eléctrico es más barato que el de un diésel, pero no es cero. Tiene menos piezas móviles, pero sigue necesitando neumáticos, frenos, suspensión y revisiones. Comparamos las partidas con hipótesis explícitas para que veas cuánto ahorras de verdad.",
    summary: "El ahorro anual estimado ronda los 270 € frente a un diésel, principalmente en aceite, filtros y frenos.",
    sections: [
      ["Qué mantenimiento desaparece en un coche eléctrico", [
        P("Cambios de aceite, filtros de combustible, correas y escape. Son las partidas que más pesan en la factura de taller de un diésel y que un eléctrico simplemente no tiene. Tampoco hay embrague ni caja de cambios de varias marchas que revisar."),
      ]],
      ["Qué mantenimiento queda", [
        UL(["Neumáticos, que suelen desgastarse algo más por el peso y el par.", "Frenos, aunque duran más gracias a la regeneración.", "Suspensión y dirección.", "Líquidos: refrigerante y líquido de frenos.", "Climatización y filtro de habitáculo."]),
      ]],
      ["Cuánto se ahorra al año", [
        P("El ahorro anual estimado ronda los 270 € frente a un diésel, principalmente en aceite, filtros y frenos. Es una estimación con hipótesis declaradas y varía con tu uso. Con la herramienta de mantenimiento puedes ver las partidas y con la de coste total sumarlas a energía y seguro."),
      ]],
      ["La batería: el miedo más extendido", [
        P("El estudio de Recurrent sobre más de 30.000 vehículos eléctricos, publicado el 11 de noviembre de 2025, sitúa el reemplazo de batería en el 0,3 % de los coches de 2022 en adelante (excluidas las campañas de servicio) y por debajo del 4 % en el total de la flota analizada. Es poco frecuente, pero conviene conocer la garantía de tu modelo y la química de la batería, porque determina cuánto aguantará."),
        SRC("Recurrent · How long do EV batteries last? (11/11/2025)", "https://www.recurrentauto.com/research/how-long-do-ev-batteries-last"),
      ]],
      ["Pequeñas compras que evitan sustos", [
        P("Un buen cable Tipo 2 y un cargador de respaldo evitan visitas innecesarias al taller por cargas fallidas o cables dañados. Es el mantenimiento más barato: no quedarte sin poder cargar."),
      ]],
    ],
    shelves: [{ after: 1, cat: "inflador-neumaticos", title: "Para cuidar los neumáticos", lede: "La presión correcta alarga la vida de los neumáticos y mejora la autonomía." }, { after: 4, cat: "cables-tipo2", title: "Un cable de repuesto de calidad", lede: "Cables a buen precio con valoraciones reales." }],
    faq: [["¿Cuánto cuesta el mantenimiento de un coche eléctrico?", "Menos que el de un diésel. El ahorro estimado ronda los 270 € al año."], ["¿Se desgastan menos los frenos?", "Sí, por la regeneración."], ["¿Hay que cambiar la batería?", "Es poco frecuente: el estudio de Recurrent (11/11/2025) la sitúa en el 0,3 % de los coches de 2022 en adelante."]],
    tools: ["maint", "tco", "tyres"], related: ["neumaticos-coche-electrico", "bateria-lfp-nmc-coche-electrico", "seguro-coche-electrico-precio", "coche-electrico-segunda-mano"],
    note: "Estimación orientativa con hipótesis explícitas.",
  },
  {
    slug: "mejor-coche-electrico-familiar",
    cat: "Comprar",
    kw: "mejor coche eléctrico familiar",
    title: "El mejor coche eléctrico familiar según datos reales",
    desc: "El mejor coche eléctrico familiar: maletero, plazas, autonomía con carga y precio, con datos reales para elegir bien.",
    lede: "El mejor coche eléctrico familiar no es el de más autonomía. Para una familia importan el maletero, las plazas, la potencia de carga en viaje y el precio. Comparamos modelos con datos reales para ayudarte a elegir.",
    summary: "El Volkswagen ID. Buzz declara 1.340 L de maletero, pero su precio es mucho mayor que el de un BYD Dolphin.",
    sections: [
      ["Cómo medimos el espacio de un coche familiar", [
        P("Usamos el volumen de carga de ev-database.org, con boca y altura de carga. Un maletero grande en litros puede ser incómodo si la boca es estrecha o el suelo es alto, y para una familia con sillas y carro eso importa más que el volumen en bruto."),
        P("Con el comparador de maleteros puedes enfrentar dos modelos y ver la diferencia."),
      ]],
      ["Autonomía con carga y niños", [
        P("Una familia con equipaje aumenta la masa y el consumo, y un cofre de techo empeora la aerodinámica. Aplicamos un factor explícito en lugar de usar la cifra del folleto, y recomendamos dejar margen en los viajes largos."),
      ]],
      ["Tres candidatos para una familia", [
        UL(["Volkswagen ID. Buzz: el más espacioso, con precio alto.", "Renault Kangoo E-Tech: práctico y de uso diario, ideal para ciudad y carretera suave.", "Hyundai IONIQ 5: carga rápida para viajes largos, con buen espacio interior."]),
        P("Si buscas un coche eléctrico familiar barato, filtra el catálogo por precio y maletero y compara el coste total, no solo la cuota."),
      ]],
      ["Equípalo para las vacaciones", [
        P("Con un adaptador V2L puedes alimentar una nevera, una cafetera o herramientas desde la batería, ideal para camping y escapadas. Y un cable Tipo 2 de buena longitud es el primer accesorio que conviene llevar en cualquier viaje."),
      ]],
    ],
    shelves: [{ after: 3, cat: "nevera-v2l", title: "Neveras y accesorios para el viaje en familia", lede: "Con V2L o con la toma de 12 V, una nevera eléctrica cambia las vacaciones." }, { after: 3, cat: "maleta-viaje", title: "Organiza el maletero", lede: "Una bolsa para cable y adaptadores libera espacio para la familia." }, { after: 3, cat: "v2l", title: "Adaptadores V2L", lede: "Convierte tu coche en una fuente de energía para el camping." }, { after: 3, cat: "cables-tipo2", title: "Cable Tipo 2 para viajar en familia", lede: "El primer accesorio que conviene llevar." }],
    faq: [["¿Cuál es el mejor coche eléctrico familiar?", "Depende de tu presupuesto y de cuántas plazas y qué maletero necesitas. El ID. Buzz es el más espacioso y el IONIQ 5 destaca en carga rápida."], ["¿Necesito siete plazas?", "Solo si los viajes largos con mucha gente son frecuentes."], ["¿Qué maletero mínimo necesita una familia?", "Depende del equipaje y de las sillas. Usa el comparador de maleteros para verlo."]],
    tools: ["trunk", "compare", "tco"], related: ["coche-electrico-7-plazas", "coches-electricos-baratos-espana-2026", "autonomia-real-coche-electrico-120-km-h", "planificador-ruta-coche-electrico"],
    note: "Datos: ev-database.org y OpenEV Data.",
  },
  {
    slug: "seguro-coche-electrico-precio",
    cat: "Poseer",
    kw: "seguro coche eléctrico precio",
    title: "Seguro de coche eléctrico: por qué cambia el precio",
    desc: "Precio del seguro de un coche eléctrico: por qué cambia la prima, qué cubre la batería y cómo comparar para pagar menos.",
    lede: "El precio del seguro de un coche eléctrico puede ser algo distinto al de uno de combustión. Las aseguradoras ajustan las primas por el coste de reparación de la batería y por el perfil de riesgo del conductor. Te explicamos qué influye y cómo comparar para encontrar un seguro de coche eléctrico barato sin perder cobertura.",
    summary: "La prima de un eléctrico puede ser algo superior por el coste de la batería, aunque algunas compañías la bonifican.",
    sections: [
      ["Qué influye en el precio del seguro de un eléctrico", [
        UL(["Valor del vehículo, que en un eléctrico suele ser mayor.", "Potencia y prestaciones.", "Uso y kilómetros anuales.", "Cobertura de batería y del cable de carga.", "Tu edad, historial y código postal."]),
        P("Dos modelos con el mismo precio pueden asegurarse por importes distintos porque la reparación de uno es más cara que la del otro."),
      ]],
      ["Qué conviene que cubra la póliza", [
        P("Verifica que la póliza cubre la batería, el cable y el wallbox, y si incluye asistencia en carretera con grúa adaptada a eléctricos. Algunas aseguradoras ofrecen cobertura específica de batería con valor de reposición."),
      ]],
      ["Cómo comparar seguros de coche eléctrico", [
        P("Compara siempre la misma cobertura, la misma franquicia y el mismo kilometraje. Si no, estás comparando productos distintos. Pide presupuesto a varias compañías y a un corredor, y revisa las exclusiones."),
      ]],
      ["Cuánto se puede ahorrar", [
        P("Comparar antes de renovar puede suponer cientos de euros. Y hacerlo cuando estás eligiendo coche, con el seguro incluido en el coste total, evita sorpresas."),
      ]],
    ],
    shelves: [{ after: 3, cat: "wallbox", title: "Mientras comparas: tu cargador en casa", lede: "Cuando eliges seguro es buen momento para dejar resuelta la carga en casa." }],
    faq: [["¿Cuánto cuesta el seguro de un coche eléctrico?", "Depende del modelo, tu perfil y la cobertura. Puede ser algo superior por el coste de la batería, aunque algunas compañías lo bonifican."], ["¿Cubre la batería?", "Depende de la póliza. Verifica la cobertura específica."], ["¿Cómo encontrar un seguro de coche eléctrico barato?", "Compara la misma cobertura y franquicia entre varias compañías antes de renovar."]],
    tools: ["tco", "aids", "catalog"], related: ["mantenimiento-coche-electrico-vs-diesel", "ayudas-coche-electrico-2026", "coches-electricos-baratos-espana-2026", "coche-electrico-segunda-mano"],
    note: "Orientativo. Pide presupuestos con las mismas condiciones.",
  },
  {
    slug: "neumaticos-coche-electrico",
    cat: "Poseer",
    kw: "neumáticos coche eléctrico",
    title: "Neumáticos para eléctricos: qué importa realmente",
    desc: "Neumáticos para coche eléctrico: qué mirar en la etiqueta, presión recomendada, desgaste y cómo afectan al consumo y a la autonomía.",
    lede: "Los neumáticos de un coche eléctrico trabajan más duro que los de uno de combustión. El par inmediato y el peso de la batería los castigan, y su resistencia a la rodadura se nota directamente en la autonomía. Explicamos qué ficha técnica mirar y cuánto cuestan los mejores neumáticos para un eléctrico.",
    summary: "Una clase energética peor y una presión baja pueden añadir hasta un 10 % de consumo.",
    sections: [
      ["Qué mirar en la etiqueta de un neumático eléctrico", [
        P("La etiqueta europea muestra tres datos: resistencia a la rodadura, adherencia en mojado y ruido. En un eléctrico la resistencia a la rodadura es la que más se nota, porque cada punto de mejora se traduce en kilómetros. La adherencia en mojado es la que más protege."),
        UL(["Clase energética A o B si priorizas autonomía.", "Adherencia en mojado A o B para seguridad.", "Índice de carga reforzado, por el peso del coche.", "Marcajes específicos para eléctricos de algunas marcas."]),
      ]],
      ["La presión: la comprobación más barata", [
        P("Revisa la presión en frío cada mes, con los valores de la etiqueta del marco de la puerta. Una presión baja aumenta la resistencia a la rodadura, empeora la autonomía y acelera el desgaste."),
      ]],
      ["Por qué se desgastan antes", [
        P("El par instantáneo y el mayor peso desgastan la banda de rodadura más rápido, sobre todo en las ruedas motrices. Rotar los neumáticos según las recomendaciones del fabricante reparte el desgaste."),
      ]],
      ["Coste por 10.000 km", [
        P("Se deriva del sobreconsumo y del desgaste. Con la herramienta de neumáticos puedes ponerle cifra a tu caso y comparar un neumático barato con uno eficiente."),
      ]],
      ["Otros accesorios que sí compensan", [
        P("Con el coche bien calzado, el siguiente paso es dejar cubierta la carga: un cable fiable es la compra más útil después de los neumáticos."),
      ]],
    ],
    shelves: [{ after: 1, cat: "inflador-neumaticos", title: "Infladores y medidores de presión", lede: "Mide en frío cada mes y corrige al momento con un inflador con manómetro." }, { after: 4, cat: "cables-tipo2", title: "Cables Tipo 2", lede: "Comparativa con precio y valoraciones reales." }],
    faq: [["¿Necesito neumáticos específicos para un coche eléctrico?", "No siempre, pero sí reforzados por el peso y el par."], ["¿Cuáles son los mejores neumáticos para coche eléctrico?", "Los de baja resistencia a la rodadura, buena adherencia en mojado e índice de carga adecuado."], ["¿Cada cuánto debo revisar la presión?", "Cada mes y antes de los viajes largos, siempre en frío."]],
    tools: ["tyres", "range", "maint"], related: ["autonomia-real-coche-electrico-120-km-h", "mantenimiento-coche-electrico-vs-diesel", "mejor-coche-electrico-familiar", "coche-electrico-segunda-mano"],
    note: "Estimación orientativa.",
  },
  {
    slug: "cargador-coche-electrico-guia-compra",
    cat: "Cargar",
    kw: "cargador coche eléctrico",
    title: "Cargador para coche eléctrico: tipos, potencia y cuál comprar",
    desc: "Guía para elegir un cargador de coche eléctrico: tipos (wallbox, portátil, 22 kW), potencia, conectores y cuál comprar según tu caso.",
    lede: "Elegir un cargador para tu coche eléctrico depende de tres cosas: dónde cargas, qué potencia admite tu coche y tu contrato eléctrico. Hay cargadores fijos de pared, portátiles y de gran potencia, y no todos sirven para todos los casos. Esta guía te ayuda a decidir con precios reales.",
    summary: "Para la mayoría de hogares con contrato monofásico, un wallbox de 7,4 kW es la mejor compra. El cargador portátil sirve de respaldo, no de solución principal.",
    sections: [
      ["Tipos de cargador de coche eléctrico", [
        T(["Tipo", "Potencia habitual", "Para qué sirve"], [["Wallbox fijo", "7,4 kW", "Carga diaria en casa"], ["Estación trifásica", "22 kW", "Casa o empresa con trifásica"], ["Cargador portátil", "Hasta 3,7 kW", "Respaldo en viaje"], ["Cable Modo 3", "Según el cable", "Conectar a puntos públicos"]]),
        P("El cargador de pared es el que más ahorra a largo plazo. Los portátiles son cómodos pero lentos, y el cable Modo 3 no es un cargador, sino lo que une tu coche con el punto de carga."),
      ]],
      ["Qué potencia necesitas", [
        P("La potencia útil es la menor entre la del cargador, la que admite tu coche en corriente alterna y la que permite tu contrato. Un coche que solo admite 7,4 kW no cargará más rápido con un cargador de 22 kW. Comprueba la ficha de tu modelo en el catálogo antes de comprar."),
      ]],
      ["Conectores y compatibilidad", [
        P("En Europa el conector estándar en corriente alterna es el Tipo 2. En carga rápida el estándar es CCS2. Si tu coche usa otro, un adaptador amplía los puntos donde puedes cargar."),
      ]],
      ["Qué cargador de coche eléctrico comprar según tu caso", [
        UL(["Tienes garaje y contrato monofásico: wallbox de 7,4 kW.", "Tienes trifásica y un coche que admite 22 kW en CA: estación de 22 kW.", "No tienes punto propio: cable Tipo 2 y planificación de la carga pública.", "Viajas a zonas con pocos puntos: cargador portátil de respaldo."]),
      ]],
      ["Cuánto cuesta cargar", [
        P("Con el PVPC medio de 0,212 €/kWh, cargar 50 kWh en casa cuesta 10,60 €. En la red pública, a 0,39 €/kWh, cuesta 19,50 €. Comprar el cargador adecuado amortiza la inversión con el ahorro frente a la carga pública."),
      ]],
    ],
    shelves: [{ after: 3, cat: "soporte-cable", title: "Soportes y fundas para el cable", lede: "Guarda el cable cargado y protegido." }, { after: 3, cat: "wallbox", title: "Cargadores de pared de 7,4 kW", lede: "Los más vendidos, con precio y valoración en Amazon.es." }, { after: 3, cat: "cargador-portatil", title: "Cargadores portátiles", lede: "Para llevar en el maletero como respaldo." }, { after: 3, cat: "estaciones-22kw", title: "Estaciones de carga de 22 kW", lede: "Si tu instalación es trifásica." }],
    faq: [["¿Qué cargador necesito para mi coche eléctrico?", "Para casa, un wallbox de 7,4 kW si tienes contrato monofásico. Revisa la potencia máxima que admite tu coche."], ["¿Un cargador portátil basta para el día a día?", "No es lo ideal: es lento. Sirve como respaldo."], ["¿Todos los cargadores valen para todos los coches?", "El conector Tipo 2 es el estándar en Europa, pero la potencia útil depende de tu coche."]],
    tools: ["wallboxtool", "sizing", "charge"], related: ["wallbox-que-es-cual-comprar", "wallbox-instalacion-coche-electrico", "cargar-coche-electrico-en-casa-frente-a-la-calle", "tarifa-luz-coche-electrico"],
    note: "Precios de Amazon.es sujetos a cambios. Verifica la compatibilidad con tu modelo.",
  },
  {
    slug: "wallbox-que-es-cual-comprar",
    cat: "Cargar",
    kw: "wallbox",
    title: "Wallbox: qué es, cuánto cuesta y cuál comprar",
    desc: "Qué es un wallbox, cuánto cuesta, qué potencia elegir (7,4 o 22 kW) y qué mirar antes de comprar. Con los modelos mejor valorados.",
    lede: "Un wallbox es un cargador de coche eléctrico que se instala en la pared del garaje y carga más rápido y con más seguridad que un enchufe doméstico. Si vas a comprar un eléctrico, es la inversión que más cambia tu día a día. Te explicamos qué es, cuánto cuesta y cómo elegir el wallbox adecuado.",
    summary: "Un wallbox de 7,4 kW es el punto de equilibrio para la mayoría de hogares. Sube a 22 kW solo si tienes trifásica y un coche que lo admita.",
    sections: [
      ["Qué es un wallbox y cómo funciona", [
        P("Un wallbox es un punto de recarga doméstico con protecciones eléctricas propias. Se conecta al cuadro de tu casa y entrega al coche una potencia estable, normalmente 7,4 kW en monofásico. A diferencia de un enchufe, está pensado para cargas largas y repetidas."),
      ]],
      ["Cuánto cuesta un wallbox", [
        P("El aparato cuesta mucho menos que la instalación. Los modelos de 7,4 kW más vendidos en Amazon.es se mueven en rangos moderados y los de 22 kW cuestan bastante más. La instalación completa, con obra y homologación, ronda los 2.000 € antes de ayudas en un caso sencillo."),
      ]],
      ["7,4 kW o 22 kW: qué potencia elegir", [
        T(["Criterio", "7,4 kW", "22 kW"], [["Contrato", "Monofásico", "Trifásico"], ["Carga de 50 kWh", "Unas 7 horas", "Unas 2,5 horas si el coche lo admite"], ["Precio", "Menor", "Mayor"], ["Casi siempre basta", "Sí", "Solo con coche y acometida adecuados"]]),
        P("Un coche que solo admite 7,4 kW en corriente alterna no cargará más rápido con un wallbox de 22 kW. Comprueba la ficha técnica de tu modelo."),
      ]],
      ["Qué mirar antes de comprar", [
        UL(["Protección integrada contra fugas de corriente continua.", "Longitud del cable o toma para tu propio cable.", "App y programación horaria para cargar cuando la luz es barata.", "Gestión de potencia dinámica si tu contrato es justo.", "Garantía y soporte en España."]),
      ]],
      ["Wallbox y ahorro en la factura", [
        P("Programar la carga en horas valle es la forma más sencilla de bajar el coste. Con el PVPC medio de 0,212 €/kWh, 50 kWh cuestan 10,60 €, frente a 19,50 € en una red pública a 0,39 €/kWh."),
      ]],
    ],
    shelves: [{ after: 3, cat: "wallbox", title: "Los wallbox de 7,4 kW mejor valorados", lede: "Con foto, precio y valoración en Amazon.es." }, { after: 2, cat: "estaciones-22kw", title: "Estaciones de 22 kW", lede: "Para instalaciones trifásicas." }],
    faq: [["¿Qué es un wallbox?", "Un cargador de coche eléctrico fijo, de pared, con protecciones propias."], ["¿Cuánto cuesta un wallbox?", "El aparato cuesta bastante menos que la instalación completa, que ronda los 2.000 € en un caso sencillo."], ["¿Qué wallbox es mejor?", "Para la mayoría, uno de 7,4 kW con protección integrada y programación horaria."], ["¿Puedo instalarlo yo mismo?", "No. La instalación debe hacerla un instalador autorizado."]],
    tools: ["wallboxtool", "install", "optimizer"], related: ["wallbox-instalacion-coche-electrico", "cargador-coche-electrico-guia-compra", "cargar-coche-electrico-en-casa-frente-a-la-calle", "tarifa-luz-coche-electrico"],
    note: "Precios de Amazon.es sujetos a cambios. Pide presupuesto a un instalador autorizado.",
  },
  {
    slug: "coche-electrico-segunda-mano",
    cat: "Comprar",
    kw: "coche eléctrico segunda mano",
    title: "Coche eléctrico de segunda mano: qué revisar antes de comprar",
    desc: "Comprar un coche eléctrico de segunda mano: cómo comprobar la salud de la batería, qué revisar, garantías y qué cargador necesitarás.",
    lede: "Un coche eléctrico de segunda mano puede ser una gran compra, porque los eléctricos pierden valor más rápido que los de combustión. Pero la clave no es el motor: es la batería. Te explicamos qué revisar, qué preguntar y qué equipamiento necesitarás desde el primer día.",
    summary: "En un eléctrico de ocasión, lo que más importa es el estado de salud de la batería, no los kilómetros. Pide el informe y revisa el cable y el conector de carga.",
    sections: [
      ["Por qué comprar un eléctrico de segunda mano", [
        P("Los eléctricos se deprecian más rápido que los de combustión, así que el mercado de ocasión ofrece precios atractivos. Para quien busca un coche eléctrico barato, es a menudo la vía más sensata, siempre que el estado de la batería esté comprobado."),
      ]],
      ["Salud de la batería: lo primero que revisar", [
        P("La capacidad de la batería disminuye con los años y los ciclos. Pide al vendedor el informe de salud de la batería (SOH) y compáralo con la capacidad original. Con la herramienta de salud de batería de ocasión puedes estimar qué porcentaje es razonable según edad y kilometraje."),
        P("Revisa también la garantía: muchos fabricantes cubren la batería durante varios años o kilómetros, y esa garantía suele pasar al nuevo propietario. Pregunta por las condiciones."),
      ]],
      ["Lista de comprobación de un eléctrico de ocasión", [
        UL(["Informe de salud de la batería y fecha de la última lectura.", "Historial de carga rápida: abusar de ella acelera el desgaste.", "Estado del cable de carga y del conector del coche.", "Autonomía real en una prueba, no solo el indicador.", "Neumáticos y frenos, porque el coche pesa más.", "Actualizaciones de software pendientes."]),
      ]],
      ["Qué cargador y accesorios necesitas", [
        P("Comprueba que el coche incluye el cable Tipo 2. Si no, es la primera compra. Y planifica la carga en casa: un wallbox amortiza rápido frente a la carga pública. Si tu coche usa otro conector, un adaptador te abre más puntos."),
      ]],
      ["Coste total frente a uno nuevo", [
        P("Calcula el coste total con la herramienta de TCO: un eléctrico de ocasión más barato puede no compensar si tiene menos autonomía y necesitas cargarlo más veces."),
      ]],
    ],
    shelves: [{ after: 3, cat: "cables-tipo2", title: "Cables Tipo 2", lede: "Por si tu coche de ocasión no trae el cable." }, { after: 4, cat: "wallbox", title: "Wallbox para tu nuevo coche", lede: "Cargar en casa es lo que más ahorra." }],
    faq: [["¿Merece la pena un coche eléctrico de segunda mano?", "Sí, si compruebas el estado de salud de la batería y la garantía que se transmite."], ["¿Cómo sé cuánta batería le queda?", "Pide el informe SOH al vendedor o haz una prueba de autonomía real."], ["¿Qué kilometraje es razonable?", "Depende del modelo y de la química. Un LFP tolera más ciclos que un NMC."]],
    tools: ["catalog", "tco", "degrade"], related: ["bateria-lfp-nmc-coche-electrico", "coches-electricos-baratos-espana-2026", "mantenimiento-coche-electrico-vs-diesel", "seguro-coche-electrico-precio"],
    note: "Verifica siempre la garantía del fabricante y el historial del coche antes de comprar.",
  },
  {
    slug: "tarifa-luz-coche-electrico",
    cat: "Cargar",
    kw: "tarifa luz coche eléctrico",
    title: "Mejor tarifa de luz para cargar el coche eléctrico",
    desc: "Qué tarifa de luz elegir para cargar tu coche eléctrico: PVPC, tarifa con discriminación horaria o mercado libre, y cómo ahorrar cargando en horas valle.",
    lede: "La tarifa de luz que elijas decide cuánto te cuesta cargar el coche eléctrico. No hay una tarifa mejor para todos: depende de cuándo cargas, cuánto consumes y qué potencia contratas. Te explicamos cómo comparar las opciones y cuánto puedes ahorrar.",
    summary: "Si cargas de noche, una tarifa con precio bajo en horas valle suele ser la mejor. Con el PVPC, el kWh medio es de 0,212 €, y la hora más barata ronda los 0,13 €.",
    sections: [
      ["Qué tarifas puedes elegir", [
        T(["Tarifa", "Cómo funciona", "Para quién"], [["PVPC", "Precio regulado que cambia cada hora", "Quien puede mover la carga a horas baratas"], ["Discriminación horaria", "Precio fijo por franjas (punta, llano, valle)", "Quien carga siempre de noche"], ["Tarifa específica EV", "Precio reducido en una franja nocturna", "Quien carga cada noche en casa"]]),
      ]],
      ["Cómo cargar barato con el PVPC", [
        P("El PVPC se publica el día anterior hora a hora. Con un PVPC medio de 0,212 €/kWh, cargar 50 kWh cuesta 10,60 €. En la hora más barata del día de publicación, en torno a 0,13 €/kWh, el mismo coste baja a unos 6,50 €. El optimizador de carga te dice la mejor franja de hoy."),
      ]],
      ["Potencia contratada y cargador", [
        P("Un wallbox de 7,4 kW necesita potencia contratada suficiente. Si tu contrato es ajustado, puedes limitar la potencia de carga o usar gestión dinámica, para no saltar el diferencial. Ajusta la potencia a tu uso: contratar de más cuesta dinero cada mes."),
      ]],
      ["Cómo comparar tarifas con tu consumo real", [
        UL(["Suma tu consumo mensual de casa y el del coche.", "Reparte cuánto consumes en cada franja horaria.", "Compara el coste total, incluyendo el término de potencia.", "Revisa permanencia y condiciones de cambio."]),
        P("La herramienta de tarifas eléctricas te muestra cuánto pagas por cada kWh en cada franja."),
      ]],
      ["Y si tienes placas solares", [
        P("Si generas energía, cargar el coche con tus excedentes de mediodía es la opción más barata. Un wallbox con modo solar o programación horaria ayuda a aprovecharla."),
      ]],
    ],
    shelves: [{ after: 4, cat: "wallbox", title: "Wallbox con programación horaria", lede: "Para cargar solo cuando la luz es barata." }],
    faq: [["¿Qué tarifa de luz es mejor para un coche eléctrico?", "La que tenga precio bajo en las horas en que cargas. Si cargas de noche, una con discriminación horaria o el PVPC en horas valle."], ["¿Cuál es la hora más barata para cargar?", "Varía cada día. En el día de publicación, la ventana barata se sitúa en torno a 0,13 €/kWh."], ["¿Necesito aumentar la potencia contratada?", "Depende de tu wallbox y de lo que uses a la vez. Puedes limitar la potencia de carga."]],
    tools: ["optimizer", "tariffs", "homepub"], related: ["cargar-coche-electrico-en-casa-frente-a-la-calle", "wallbox-que-es-cual-comprar", "cargador-coche-electrico-guia-compra", "ayudas-coche-electrico-2026"],
    note: `Datos recogidos el ${FECHA_PVPC} · ESIOS. Las tarifas del mercado libre cambian con frecuencia.`,
  },
  {
    slug: "coche-electrico-7-plazas",
    cat: "Comprar",
    kw: "coche eléctrico 7 plazas",
    title: "Coche eléctrico de 7 plazas: opciones y qué tener en cuenta",
    desc: "Coche eléctrico de 7 plazas en España: modelos disponibles, autonomía, maletero con las tres filas y qué accesorios llevar en viajes familiares.",
    lede: "Si buscas un coche eléctrico de 7 plazas, la oferta es todavía corta pero crece. Estas son las opciones que encontrarás, qué debes mirar más allá del número de asientos y qué equipamiento conviene llevar para viajar con toda la familia.",
    summary: "Hay pocos eléctricos de 7 plazas y casi todos son caros. Antes de elegir uno, comprueba el maletero con la tercera fila ocupada y la potencia de carga.",
    sections: [
      ["Qué coches eléctricos de 7 plazas hay", [
        P("Entre los modelos que ofrecen siete plazas, según versión, están el Peugeot e-5008, el Hyundai IONIQ 9, el Mercedes EQB, el Kia EV9 y el Tesla Model X, además de furgonetas de pasajeros como la Citroën ë-Spacetourer. Comprueba siempre qué versión incluye la tercera fila, porque no todas la ofrecen."),
      ]],
      ["Qué mirar además de las plazas", [
        UL(["Maletero con la tercera fila ocupada, que suele ser muy reducido.", "Potencia de carga rápida, porque una familia no quiere esperar.", "Autonomía real con el coche lleno, no la del folleto.", "Facilidad para acceder a la tercera fila con sillas infantiles.", "Precio total y coste de uso."]),
      ]],
      ["Autonomía con siete ocupantes", [
        P("Con siete ocupantes y equipaje, el consumo sube. Calcula tu viaje con el planificador de rutas e incluye margen. Un cofre de techo empeora la aerodinámica y reduce la autonomía, sobre todo en autovía."),
      ]],
      ["Alternativas más baratas", [
        P("Si no necesitas siete plazas todos los días, un eléctrico familiar de cinco plazas con buen maletero puede ser más barato y eficiente. Compara en el catálogo y en la guía del mejor coche familiar."),
      ]],
      ["Equipamiento para viajar en familia", [
        P("Un cable Tipo 2 de longitud suficiente es imprescindible. Y con un adaptador V2L puedes alimentar una nevera o una cafetera en un camping o una parada larga."),
      ]],
    ],
    shelves: [{ after: 4, cat: "nevera-v2l", title: "Nevera de 12 V y accesorios V2L", lede: "Para paradas largas y camping con toda la familia." }, { after: 4, cat: "maleta-viaje", title: "Organizadores de maletero", lede: "Con siete plazas ocupadas, cada hueco cuenta." }, { after: 4, cat: "v2l", title: "Adaptadores V2L para vacaciones", lede: "Alimenta una nevera o herramientas desde la batería." }, { after: 4, cat: "cables-tipo2", title: "Cables Tipo 2", lede: "El primer accesorio que llevar en un viaje familiar." }],
    faq: [["¿Qué coches eléctricos de 7 plazas hay en España?", "Según versión, el Peugeot e-5008, el Hyundai IONIQ 9, el Mercedes EQB, el Kia EV9 o el Tesla Model X, entre otros."], ["¿Hay coches eléctricos de 7 plazas baratos?", "Son escasos y suelen ser caros. Compara el coste total y valora un cinco plazas con buen maletero."], ["¿Cabe equipaje con siete ocupantes?", "Con la tercera fila ocupada el maletero es reducido. Comprueba los litros reales."]],
    tools: ["trunk", "catalog", "planner"], related: ["mejor-coche-electrico-familiar", "coches-electricos-baratos-espana-2026", "planificador-ruta-coche-electrico", "cargador-coche-electrico-guia-compra"],
    note: "La disponibilidad de la versión de 7 plazas depende del acabado. Confirma con el concesionario.",
  },
];
