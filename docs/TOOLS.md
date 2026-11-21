# Herramientas — Voltieri

**Regla:** paridad 1:1 con nogas.es **y** superarlo. No lanzamos nada público hasta tener las 28 piezas de nogas cubiertas o con sustituto superior. Después, 17 extra.

Total objetivo: **45 herramientas**.

---

## F. Ya construido en `web/`

| Archivo | Qué cubre del plan | Verificación |
|---|---|---|
| `hoja.html` | Home + ruta Madrid–Barcelona, perfil de elevación, modos de tema | Canvas, perfil 42 puntos, sin errores |
| `components.html` | Galería viva de componentes | 7 secciones, sin errores |
| `tool-shell.html` | Herramienta #29 (coste por 100 km) y plantilla de herramienta simple | 4,03 € vs 11,63 €, 65 % de ahorro |
| `catalog.html` | Herramienta #1 (catálogo) y plantilla de listado | 8 modelos → 5 con filtro ≥200 kW |
| `range.html` | Herramienta #6 (autonomía real desglosada) | 16,9 kWh/100 · 444 km · 14 % de pérdida |
| `charge.html` | Herramienta #19 (curva de carga) | 15 min · 52,5 kWh · 210,5 kW de media |
| `tco.html` | Herramienta #10 (TCO) | 27.309 € vs 29.006 € · 0,02 €/km |
| `chargers.html` | Herramienta #24 (mapa de cargadores) | 12 puntos, 12 marcadores, filtros |
| `planificador.html` | Planificador con ruta real (OSRM + clima + paradas) | 617,7 km, 1 parada, sin errores |
| `mapa-autonomia.html` | Mapa de autonomía con anillos isócronos por clic | 4 anillos, 48 destinos OSRM |
| `compare.html` · `finance.html` · `sim.html` · `routes.html` · `service.html` | Las 40 herramientas restantes | Todas sin `NaN`, 0 errores de consola |
| `tools-data.js` · `tools.js` · `tools.css` | Registro y renderizador del hub | URL compartible por `#id?par=valor` |

Todas pasan `node scripts/check-design.mjs web`.

Motor real: `web/routing.js` usa **OSRM** para la geometría, **Open-Meteo** para elevación y clima, **Nominatim** para geocodificar y `data/chargers.txt` para las paradas. La portada (`index.html`) y `web/planificador.html` ya calculan en vivo: Madrid→Barcelona da 617,7 km, 7h08m, 14,1 kWh/100, 87,3 kWh y una parada, con perfil de +1.785 m / −2.427 m.

**Mapa de autonomía** (`web/mapa-autonomia.html`): reproduce y supera la función estrella de nogas. Clic en cualquier punto de España → 48 destinos a 240 km consultados a OSRM `table` → anillos isócronos deformados por la red vial para 100 %, 80 %, 1 y 2 paradas, con desglose de km. No son círculos: la forma depende de la distancia real por carretera en cada dirección.

Las paradas **no son multiplicadores**: se apoyan en los 2.500 cargadores DC reales del registro MITECO. Para cada dirección se buscan cargadores en un cono de ±22,5°, se comprueba que el primero esté dentro del alcance de la batería, que el segundo esté dentro de la ventana posterior a la primera carga (10→80 %), y se toma la combinación que maximiza la distancia. La autonomía base se ajusta con temperatura y elevación de Open-Meteo. El desglose indica cuántas direcciones tienen cobertura real y qué cargador se usa más (en Barcelona, 29 de 48; en Madrid, 48 de 48).

**Deuda consciente:** los estilos de mapa están duplicados entre `index.html` y `chargers.html`; se extraerán a `web/map-base.js` antes de la herramienta de mapas número dos.

## Hub de herramientas (las 40 restantes)

En lugar de 40 archivos sueltos, las herramientas viven en **cinco páginas por categoría** con un renderizador común:

| Página | Categoría | Herramientas |
|---|---|---|
| `web/compare.html` | Comparadores | 7 |
| `web/finance.html` | Costes y fiscalidad | 13 |
| `web/sim.html` | Simuladores | 7 |
| `web/routes.html` | Rutas | 6 |
| `web/service.html` | Servicios | 7 |

Motor: `web/tools-data.js` (registro de las 45 herramientas con entradas y cálculo) + `web/tools.js` (renderiza formulario, resultados, tablas y enlaces). Cada herramienta tiene URL propia por `#id` y acepta parámetros por query, así que **se puede compartir sin cuenta**.

Verificación: las 40 herramientas se recorren una a una; ninguna devuelve `NaN` ni `undefined`, y las cinco páginas cargan sin errores de consola.

**Total construido: 46 herramientas** (45 del plan + `ayudas-ccaa`).

### Cierre de las 12 que eran esqueletos

| Herramienta | Solución real |
|---|---|
| 360º | Visor three.js con geometría procedural a escala real, arrastrable |
| Garaje 3D | Mismo visor con plaza de 5 × 2,5 m y margen calculado |
| Seguridad | Enlace al buscador oficial de Euro NCAP por modelo; sin estrellas inventadas |
| Carrera | 0–100, potencia y carga DC de OpenEV Data v1.24.0 |
| Coste por operador | Comparativa con PVPC real de ESIOS y tarifa introducida por el usuario |
| Mantenimiento | Modelo explícitamente etiquetado como estimación, con hecho contrastado |
| Talleres | 33 enlaces a redes oficiales de fabricantes |
| Noticias | 10 titulares reales del RSS de Google News España con medio y fecha |
| Pruebas | Cifras reales de ev-database.org y OpenEV Data con procedencia declarada |
| PWA | `manifest.webmanifest` + `sw.js`: instalable y offline |
| API | `web/api/data.json`, JSON estático servido desde el CDN |
| Alertas | `localStorage` + PVPC en vivo + Notification API, sin cuenta |

**Total: 56 herramientas** — 47 en el hub, 6 con página propia y 3 páginas nuevas (optimizador PVPC, carrera en ruta, V2G solar). Todas verificadas sin `NaN`.

### Segundo bloque de herramientas nuevas

- **Optimizador horario de carga** (`optimizador-carga.html`): 24 precios reales del PVPC, ventana más barata y ahorro. Madrid: 6,37 € por 50 kWh, 2,42 € de ahorro.
- **Carrera en ruta** (`carrera-ruta.html`): 4 coches por la misma ruta con paradas reales. En Madrid→Barcelona ganó BMW i4 por 1 minuto, con 442 cargadores en el corredor.
- **V2G y carga solar** (`v2g-solar.html`): radiación real de Open-Meteo + PVPC. 5 kWp en Madrid dan 232 kWh/mes y 2.093 km; V2G añade 488 €/año.
- **Siete más en el hub**: coste total del viaje, SOH de ocasión, ayudas por CCAA, remolque y carga útil, alerta de precio del coche, informe de decisión y casa vs carga pública.

---

## A. Paridad con nogas.es (28 piezas)

| # | nogas.es | Voltieri | Cómo lo mejoramos | Datos | Fase |
|---|---|---|---|---|---|
| 1 | Catálogo de coches (2.228) | Catálogo abierto con autonomía real | Filtros por autonomía real, potencia de carga y coste por 100 km, no solo ficha | OpenEV Data + fabricantes | 1 |
| 2 | Comparador de fichas | Comparador de hasta 4 coches | Diff visual campo a campo, no dos columnas de texto | Catálogo | 1 |
| 3 | Comparador de tamaño | Siluetas a escala | Dibujo superpuesto a escala real + radio de giro | Fabricantes | 1 |
| 4 | Comparador de maleteros | Maletero útil, no homologado | Litros, boca de carga, forma y ¿cabe el carrito? | Fabricantes + medición propia | 2 |
| 5 | Comparador de seguridad | Seguridad y ADAS | Euro NCAP + equipamiento ADAS real por acabado | Euro NCAP | 2 |
| 6 | Comparador de autonomía | WLTP vs real vs invierno vs 120 km/h | Cuatro escenarios con física, no una cifra | OpenEV + modelo físico | 1 |
| 7 | Buscador por autonomía | “¿Llego sin parar?” | Origen/destino real y respuesta sí/no con margen | OSRM + física | 1 |
| 8 | Vista 360º | Visor 360º interactivo | Solo si aporta; lazy-load y fallback de fotos | Fabricantes | 3 |
| 9 | Recomendador | Recomendador sin cuenta | 7 preguntas, 3 coches, explicación de por qué | Catálogo | 2 |
| 10 | TCO | TCO a 5 años con energía real | Energía por tu ruta, seguro, mantenimiento, depreciación y fiscalidad | Datos propios + mercado | 1 |
| 11 | Plan Auto+ 2026 | Ayudas y fiscalidad 2027 | Por CCAA, particular/empresa, y qué cambia si esperas | MITECO + BOE | 2 |
| 12 | CAE | Certificado de ahorro energético | Guía y calculadora del trámite para instalar cargador | MITECO | 3 |
| 13 | Tarifas eléctricas | Precio real de carga | PVPC, valle punta, tarifa por operador y coste por 100 km | REE/ESIOS + operadores | 1 |
| 14 | Instalación de cargador | Dimensionado de la instalación | Potencia, cable, protecciones, subvención y coste total | REBT + instaladores | 2 |
| 15 | Planificador de rutas | Planificador multiparada | SoC, clima, orografía, coste y alternativa “carga pronto vs aguanta” | OSRM + DATEX II + Open-Meteo | 2 |
| 16 | Carrera | Comparador de prestaciones | 0–100, 80–120, curva de potencia y consumo a ritmo | Fabricantes | 2 |
| 17 | Mapa de autonomía | Isócronas reales | Terreno, temperatura y velocidad; no un círculo | OSRM + DEM + clima | 2 |
| 18 | Garaje 3D | ¿Entra en mi plaza? | Medidas reales, giro, apertura de puertas y altura | Fabricantes | 3 |
| 19 | Simulador de carga | Curva DC real | Por modelo, temperatura y SoC inicial; tiempo 10–80 % | Datos de curva | 1 |
| 20 | Simulador de degradación | SOH a 5–10 años | Clima, km, hábitos de carga y química de batería | Literatura + datos | 2 |
| 21 | Simulador aerodinámico | Consumo a velocidad y viento | Cd·A editable, viento real de la ruta | Física + Open-Meteo | 2 |
| 22 | Simulador de neumáticos | Rodadura y coste | Clase energética, presión y coste por 10.000 km | Etiqueta UE | 3 |
| 23 | Simulador de ruido | Confort acústico | dB a 50/100/120 km/h y comparación | Medición propia | 3 |
| 24 | Mapa de cargadores | Mapa de carga ES/PT | 22.000+ puntos, estado, precio y potencia; filtros por conector | DATEX II + OCM + REVE | 1 |
| 25 | Talleres | Talleres EV | Red verificada por provincia y especialidad | Directorio propio | 3 |
| 26 | Noticias | Actualidad EV | Solo fuente citada, sin relleno ni SEO vacío | RSS + redacción | 3 |
| 27 | Pruebas | Pruebas con datos medidos | Consumo medido, no catálogo | Pruebas propias | 3 |
| 28 | App Nogas Route (login) | PWA sin cuenta | Offline, instalable, estado en el dispositivo | PWA | 3 |

---

## B. Lo que nogas no tiene (17 extra)

| # | Herramienta | Por qué importa | Afiliado |
|---|---|---|---|
| 29 | Coste por 100 km **en tu ruta** | El dato medio no sirve; el real sí | — |
| 30 | Perfil de elevación sincronizado | Explica el consumo, no lo decora | — |
| 31 | Autonomía invernal (0 °C y −5 °C) | La duda nº1 en España | — |
| 32 | Coste por operador de carga | Tesla, Ionity, Zunder, Iberdrola, Repsol | Tarjetas y apps |
| 33 | Amortización con tus km reales | Responde “¿me sale a cuenta?” | — |
| 34 | Valor residual a 3 y 5 años | El coste oculto más grande | — |
| 35 | Comparador de seguros EV | Ahorro inmediato y medible | Seguros |
| 36 | Ayudas y fiscalidad por CCAA y empresa | Cambia cada año y por región | — |
| 37 | Dimensionado de la instalación en casa | Evita sustos y sobrecostes | Wallbox, cable, protecciones |
| 38 | Huella de carbono por ruta | Argumento honesto, no marketing | — |
| 39 | Rutas compartibles por URL | Sin cuenta, se comparte y se vuelve | — |
| 40 | Modo offline PWA | Túnel, garaje, sótano | — |
| 41 | Alertas de precio de carga por URL | Sin registro ni notificaciones invasivas | — |
| 42 | Química de batería (LFP vs NMC) | Longevidad y carga rápida | — |
| 43 | Alquiler vs compra vs suscripción | Modelo de acceso creciente | Renting |
| 44 | Flotas y empresa | IVA, deducciones, kilometraje | Gestores de flota |
| 45 | API pública de datos | Confianza y ecosistema | — |

---

## C. Orden de construcción

### Fase 1 — MVP público (10 piezas)
1, 2, 3, 6, 7, 10, 13, 19, 24, 29 + home.

Objetivo: que alguien pueda **decidir un coche** y **saber cuánto le cuesta**, con datos reales.

### Fase 2 — Rutas y decisión avanzada (12 piezas)
4, 5, 9, 11, 14, 15, 16, 17, 20, 21, 30, 31.

Objetivo: que alguien pueda **planificar un viaje** y comparar estrategias.

### Fase 3 — Escala y contenido (23 piezas)
8, 12, 18, 22, 23, 25, 26, 27, 28, 32–45.

Objetivo: cobertura total, PWA, SEO programático y monetización madura.

---

## D. Reglas de implementación

1. **Ninguna herramienta pide cuenta.** Estado en `localStorage` o en la URL.
2. **Cada cifra muestra fuente y fecha.** Si no se puede rastrear, no se publica.
3. **Cada herramienta tiene una URL propia** y se puede compartir con el resultado dentro.
4. **Cada herramienta carga en menos de 2,5 s en 4G**; el 3D y el mapa son lazy.
5. **Afiliado solo donde hay decisión de compra**, con `rel="sponsored nofollow"` y aviso visible.
6. **Sin cookies no esenciales.** Analítica privacy-first.
7. **Accesible:** teclado, foco visible, contraste AA, `prefers-reduced-motion`.

---

## E. Criterio de “terminado”

Una herramienta está terminada cuando:

- [ ] Funciona sin JavaScript de terceros bloqueados.
- [ ] Tiene estado compartible por URL.
- [ ] Tiene fuente de datos documentada en `docs/DATA.md`.
- [ ] Pasa Lighthouse ≥ 95 en rendimiento y accesibilidad.
- [ ] Tiene prueba manual en móvil real.
- [ ] Su resultado se puede explicar en una frase.
