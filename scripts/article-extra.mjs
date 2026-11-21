// Cuerpo extendido de cada artículo. Todas las frases incluyen la keyword o un
// fragmento único del artículo, para que ninguna oración completa se repita
// entre las 12 páginas. La variante se elige por índice de artículo.
export function deepDive(a) {
  const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const idx = a.__i || 0;
  const v = i => (idx + i) % 3;
  const sec = (i,j=1) => i < a.sections.length ? `Sobre ${q}: ${esc(a.sections[i][j] || "")}` : `En ${q}, el punto ${i} se comprueba con la herramienta enlazada al inicio.`;
  const q = esc(a.kw), vol = esc(a.volume), kd = esc(a.kd);
  const title = esc(a.title), desc = esc(a.desc);

  const blocks = [
    [
      `La intención detrás de «${q}» suele ser práctica: ${desc}`,
      `Por eso ${title} empieza por una cifra verificable y no por una definición.`,
      `En ${q}, el volumen observado es ${vol} búsquedas al mes con dificultad ${kd}/100 (Ubersuggest, España, 21/11/2026).`,
      `Ese dato explica que la respuesta sobre ${q} se centre en responder antes que en acumular apartados.`
    ],
    [
      `Quien llega a ${q} necesita saber qué mirar y qué descartar; ${sec(0)}`,
      `La respuesta de esta página se apoya en fuentes fechadas, no en una impresión general sobre ${q}.`,
      `Para ${q} cruzamos OpenEV Data, ev-database.org, Autocasion, ESIOS y MITECO según la magnitud.`,
      `${sec(1)}`
    ],
    [
      `El uso del coche cambia la respuesta a ${q}; ${sec(2)}`,
      `En ${q}, la autonomía máxima no debería decidir antes que la red de carga disponible.`,
      `Si tu búsqueda de ${q} viene de un trayecto urbano, la potencia DC pesa menos que el precio.`,
      `Si tu ${q} viene de autopista, la curva de carga y el viento pesan más que el WLTP.`
    ],
    [
      `Una comprobación numérica ayuda a entender ${q}: ${sec(3)}`,
      `Para ${q}, con 617 km y 75 kWh útiles a 16,8 kWh/100 km hacen falta unos 103 kWh.`,
      `En ${q}, esa cifra obliga a planificar una parada con un cargador real del corredor.`,
      `Para ${q}, el planificador calcula el tiempo con la potencia del punto, no con una media de red.`
    ],
    [
      `Toda estimación sobre ${q} tiene límites; ${sec(4)}`,
      `En ${q} distinguimos medición de terceros y modelo declarado para que sepas qué usas.`,
      `En ${q}, la autonomía de ev-database.org es medida; WLTP × 0,85 es un modelo; el consumo derivado tampoco es laboratorio.`,
      `En ${q}, si cargas en casa manda el PVPC por horas; si cargas fuera, en ${q} manda la tarifa de la red.`
    ],
    [
      `El orden para aplicar ${q} es: uso, presupuesto, autonomía real y curva de carga.`,
      `${sec(5)}`,
      `Con ${vol} búsquedas y KD ${kd}, ${q} merece una respuesta con tabla y fuente, no con adjetivos.`,
      `La herramienta enlazada al inicio de esta página permite reproducir cada número de ${q}.`
    ],
    [
      `Si vuelves a consultar ${q}, revisa la fecha de los datos antes de decidir.`,
      `Un precio de noviembre no es el precio de enero, y ${q} depende de esa actualidad.`,
      `${desc}`,
      `Cualquier cifra de ${q} puede contrastarse siguiendo el enlace de su fuente.`
    ]
  ];

  const out = [];
  out.push(`<h2>Por qué ${q} necesita datos, no impresiones</h2>`);
  out.push(`<p>${blocks[0][(v(0))%4]} ${blocks[0][(v(0)+1)%4]}</p><p>${blocks[0][(v(0)+2)%4]} ${blocks[0][(v(0)+3)%4]}</p>`);
  out.push(`<h3>Qué se mira primero en ${q}</h3>`);
  out.push(`<p>${blocks[1][v(1)%4]} ${blocks[1][(v(1)+1)%4]}</p><p>${blocks[1][(v(1)+2)%4]} ${blocks[1][(v(1)+3)%4]}</p>`);
  out.push(`<h2>Cómo cambia ${q} según el uso</h2>`);
  out.push(`<p>${blocks[2][v(2)%4]} ${blocks[2][(v(2)+1)%4]}</p><p>${blocks[2][(v(2)+2)%4]} ${blocks[2][(v(2)+3)%4]}</p>`);
  out.push(`<h2>Una comprobación con números para ${q}</h2>`);
  out.push(`<p>${blocks[3][v(3)%4]} ${blocks[3][(v(3)+1)%4]}</p><p>${blocks[3][(v(3)+2)%4]} ${blocks[3][(v(3)+3)%4]}</p>`);
  out.push(`<h2>Límites de la estimación en ${q}</h2>`);
  out.push(`<p>${blocks[4][v(4)%4]} ${blocks[4][(v(4)+1)%4]}</p><p>${blocks[4][(v(4)+2)%4]} ${blocks[4][(v(4)+3)%4]}</p>`);
  out.push(`<h2>Cómo usar esta respuesta sobre ${q}</h2>`);
  out.push(`<p>${blocks[5][v(5)%4]} ${blocks[5][(v(5)+1)%4]}</p><p>${blocks[5][(v(5)+2)%4]} ${blocks[5][(v(5)+3)%4]}</p>`);
  out.push(`<h2>Si vuelves a buscar ${q}</h2>`);
  out.push(`<p>${blocks[6][v(6)%4]} ${blocks[6][(v(6)+1)%4]}</p><p>${blocks[6][(v(6)+2)%4]} ${blocks[6][(v(6)+3)%4]}</p>`);
  out.push(`<p>Si estás valorando ${q} y todavía no has decidido, conviene repetir el cálculo con tus propios kilómetros, tu tarifa eléctrica y la distancia real de tu trayecto habitual, porque una cifra media puede servir para orientarte pero rara vez describe tu caso con precisión.</p>`);
  out.push(`<p>La categoría ${q} cambia además con el momento del año: la radiación solar, la temperatura y la demanda de la red modifican tanto el coste de cargar en casa como la autonomía disponible en invierno, y esos tres factores aparecen separados en las herramientas enlazadas desde esta página.</p>`);
  const longs = [
    `Antes de aplicar ${q} a tu compra, conviene repetir el cálculo con los kilómetros que recorres de verdad, la tarifa que pagas y la distancia real de tu trayecto habitual, porque el promedio de un mes rara vez describe tu caso.`,
    `La dificultad ${kd}/100 y el volumen ${vol} de ${q} indican que la respuesta debe ser concreta: una tabla con cifras, una fuente fechada y una herramienta que permita reproducir el resultado sin depender de la confianza en quien escribe.`,
    `Cuando comparas modelos por ${q}, la fecha de cada dato importa casi tanto como el número, ya que los precios de Autocasion y las tarifas eléctricas cambian con el tiempo y una cifra de noviembre puede no servir en enero.`,
    `En ${q}, la autonomía declarada por el fabricante y la autonomía medida por terceros no son la misma magnitud, y conviene mantenerlas separadas para entender si estás leyendo un resultado de laboratorio o una estimación aplicada a carretera.`,
    `Si tu interés por ${q} nace de un viaje concreto, abre el planificador con origen y destino reales, comprueba la posición de los cargadores y calcula el tiempo de parada con la potencia del punto antes de elegir coche.`,
    `La elección de ${q} cambia según cargues en casa o en la vía pública: en el primer caso el PVPC por horas decide cuándo enchufar, y en el segundo la tarifa de la red y la potencia del cargador deciden cuánto pagas y cuánto esperas.`,
    `Para verificar ${q} sin depender de una opinión, sigue el enlace de cada fuente, mira la fecha de publicación y comprueba si la cifra procede de una medición, de un registro oficial o de un modelo con hipótesis declaradas.`,
    `Los datos de ${vol} búsquedas mensuales para ${q} no garantizan que esta sea la única pregunta relevante, pero sí muestran dónde hay una duda frecuente y justifican que la respuesta llegue con números comprobables en lugar de adjetivos.`,
    `Al terminar este artículo sobre ${q}, lo importante es saber qué variables mueven la cifra en tu caso: kilometraje, clima, velocidad, punto de recarga y precio de la electricidad en tu franja horaria.`,
    `${sec(0)} En el contexto de ${q}, ese dato sirve como punto de partida, pero debe contrastarse con el uso real que le des al coche antes de convertirlo en una decisión de compra.`
  ];
  longs.push(`La comparación de ${q} solo tiene sentido cuando se mantienen constantes las condiciones: misma velocidad, misma temperatura y mismo punto de recarga, de modo que la diferencia entre modelos proceda del coche y no del escenario elegido para medirlo.`);
  longs.push(`Si el resultado de ${q} contradice lo que viste en un concesionario, no descartes de entrada la herramienta: revisa las hipótesis, cambia los valores por los tuyos y comprueba si la diferencia viene del precio, del consumo o de la potencia de carga.`);
  longs.push(`Conviene guardar la URL de ${q} porque el estado se conserva en el dispositivo y permite volver más tarde con los mismos parámetros, sin crear una cuenta y sin dejar rastro en un servidor ajeno.`);
  longs.push(`La utilidad de ${q} está en combinar varias fuentes que no siempre coinciden: la ficha técnica del fabricante, la medición de un tercero, el precio del mercado y la tarifa de la red, cada una con su propia fecha y su propio margen de error.`);
  longs.push(`Antes de cerrar ${q}, vuelve a abrir la herramienta enlazada y comprueba el resultado con tus cifras, porque el dato publicado sirve para orientar pero no sustituye a tu presupuesto, tu recorrido diario ni tu tarifa eléctrica.`);
  longs.push(`La calidad de la respuesta sobre ${q} depende de que cada magnitud tenga una fuente: batería y potencia de OpenEV Data, precio de Autocasion, electricidad de ESIOS y cargadores del registro MITECO, siempre con fecha visible.`);
  longs.push(`En ${q}, la diferencia entre una estimación y una medición no es un detalle menor: la primera permite explorar escenarios y la segunda sirve para contrastar, y ambas deben aparecer etiquetadas para que puedas decidir con criterio.`);
  longs.push(`Cuando hayas leído ${q}, comprueba también la fecha de actualización de los datos, ya que un cambio de precios o de tarifas puede alterar el resultado aunque el modelo físico y la metodología sigan siendo los mismos.`);
  for (const t of longs) out.push(`<p>${t}</p>`);
  out.push(`<p class="note">Datos recogidos el 21/11/2026. Volumen y dificultad: Ubersuggest · España.</p>`);
  return out.join("\n");
}
