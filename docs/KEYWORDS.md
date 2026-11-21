# Investigación de keywords — Voltieri

## Fuente y limitación

`data/keywords.txt` contiene **200 keywords reales en español** extraídas de **Google Suggest** (`suggestqueries.google.com`, parámetro `hl=es`), a partir de 25 semillas del sector. Se recogieron el 21/11/2026.

**No hay volumen de búsqueda ni dificultad**: Google Sugger solo revela sugerencias reales, no métricas. Para volumen y CPC haría falta una cuenta de DataForSEO, Ahrefs o SEMrush, o conectar Google Search Console cuando el sitio tenga tráfico. No inventamos cifras de volumen.

## Repos evaluados

| Repo | Utilidad |
|---|---|
| [every-app/open-seo](https://github.com/every-app/open-seo) (28,5k ★, MIT) | Alternativa abierta a Ahrefs; trae sus propias skills de keyword research. Necesita clave de DataForSEO para volumen. |
| [Ryze-AI-Adgent/open-seo-mcp-skills](https://github.com/Ryze-AI-Adgent/open-seo-mcp-skills) (10,6k ★, MIT) | Skills de keyword research y GEO sobre GSC/GA4 propios. |
| [AngelAnderson/fraseclave](https://github.com/AngelAnderson/fraseclave) | Generador español de ideas de keywords. |
| [dvillarrubia/seo-clustering](https://github.com/dvillarrubia/seo-clustering) | Clustering semántico en español con embeddings. Pesado (Docker, 8 GB RAM). |

Decisión: usamos Google Suggest (gratis, sin key) para las keywords y hacemos el clustering a mano por intención. Si el usuario aporta clave de DataForSEO, `open-seo` permite añadir volumen sin cambiar el enfoque.

## Clusters por intención

| Cluster | Keywords | Intención | Herramienta nuestra |
|---|---|---|---|
| Coche eléctrico barato | 19 | Comercial | Catálogo con 45 precios ES |
| Autonomía | 10 | Informacional → comercial | `range.html`, `mapa-autonomia.html` |
| Batería | 10 | Informacional | `sim.html#degradacion`, `quimica` |
| Carga en casa | 10 | Comercial | `instalacion`, `productos.html` |
| Ayudas 2026/2027 | 10 | Transaccional | `finance.html#ayudas` |
| Seguro | 10 | Comercial | `finance.html#seguros` |
| Wallbox | 10 | Comercial | `productos.html` (afiliados) |
| Mantenimiento | 10 | Informacional | `service.html#mantenimiento` |
| Neumáticos | 10 | Informacional | `sim.html#neumaticos` |
| Tarifa de luz | 10 | Transaccional | `optimizador-carga.html` |
| Planificador de ruta | 4 | Transaccional | `planificador.html` |
| Coche familiar / 7 plazas | 19 | Comercial | Catálogo + comparadores |
| Recarga pública | 2 | Informacional | `chargers.html` |
| Maletero | 3 | Comercial | `compare.html#maletero` |

`coche electrico niños`, `bateria coche electrico niño` y `coche electrico barato niño` son ruido semántico del autocompletado (products para niños). Se descartan para contenido.

## Plan editorial (primeros 12 artículos)

Cada artículo se escribe con datos propios del proyecto, lleva un enlace a la herramienta y cita fuentes. No es contenido genérico de relleno.

| # | Título propuesto | Keyword principal | Herramienta vinculada | Dato propio |
|---|---|---|---|---|
| 1 | Los 10 coches eléctricos más baratos de España en 2026 | coche eléctrico barato España | `catalog.html` | 45 precios reales de Autocasion |
| 2 | Autonomía real a 120 km/h: por qué WLTP engaña | autonomía coche eléctrico a 120 km/h | `range.html` | física con desglose |
| 3 | Cómo planificar un viaje largo en eléctrico sin miedo | planificador ruta coche eléctrico | `planificador.html` | OSRM + clima + 2.500 cargadores |
| 4 | Mapa de autonomía: hasta dónde llegas desde tu ciudad | mapa autonomía coche eléctrico | `mapa-autonomia.html` | anillos isócronos reales |
| 5 | LFP frente a NMC: qué batería te conviene | batería coche eléctrico LFP | `sim.html#quimica` | curvas y química de 100 modelos |
| 6 | Cuánto cuesta cargar en casa frente a la calle | precio recarga pública coche eléctrico | `optimizador-carga.html` | 24 precios PVPC + IONITY 0,39 |
| 7 | Ayudas al coche eléctrico 2026: guía práctica | ayudas coche eléctrico 2026 | `finance.html#ayudas` | deducción y CCAA |
| 8 | Instalar un wallbox: coste y trámites | cargador coche eléctrico en casa | `finance.html#instalacion` | presupuesto y REBT |
| 9 | El mejor coche eléctrico familiar según datos reales | mejor coche eléctrico familiar | `catalog.html` | maletero y precio reales |
| 10 | Seguro de coche eléctrico: por qué cambia el precio | seguro coche eléctrico precio | `finance.html#seguros` | modelo comparativo |
| 11 | Mantenimiento de un eléctrico frente a un diésel | mantenimiento coche eléctrico vs diésel | `service.html#mantenimiento` | hecho del 0,3 % de baterías |
| 12 | Neumáticos para eléctricos: qué importa realmente | mejores neumáticos coche eléctrico | `sim.html#neumaticos` | consumo y presión |

## Reglas para los artículos

1. Un dato verificable en el primer párrafo.
2. Un enlace profundo a la herramienta correspondiente.
3. Cifras con fuente y fecha visibles.
4. Sin "en conclusión" ni relleno: 700–1.200 palabras con tablas y ejemplos numéricos.
5. Un solo `H1`; `H2` con sustantivos; sin *eyebrow* decorativo.
6. Schema `Article` y `FAQPage` cuando haya preguntas reales.
7. El título SEO y la URL se sacan de la keyword principal, sin keyword stuffing.
