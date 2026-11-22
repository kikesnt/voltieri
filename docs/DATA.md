# Fuentes de datos — Voltieri

Todo lo que se sirve en la web está **descargado de una fuente real, convertido a archivos estáticos y verificado**. No quedan cifras inventadas en las herramientas.

## Fuentes integradas

| Fuente | Qué da | Licencia | Archivo local | Uso |
|---|---|---|---|---|
| [OpenEV Data v1.24.0](https://github.com/open-ev-data/open-ev-data-dataset) | 1.189 vehículos: batería útil, WLTP, potencia DC, potencia, 0–100, química | CDLA-Permissive-2.0 | `web/data/vehicles.txt` | 113 modelos ES/PT 2024–2025 en catálogo y herramientas |
| [KilowattApp/open-ev-data](https://github.com/KilowattApp/open-ev-data) | 1.321 vehículos con **curvas de carga reales** y consumo medio | MIT con atribución | `web/data/curves.txt` | 100 curvas cruzadas con el catálogo; simulador de carga |
| [ev-database.org](https://ev-database.org/) | Dimensiones, Cargo Volume, autonomía real y RRP de Alemania | Fuente pública con licencia de uso; atribución requerida | `web/data/specs.txt` | 90 modelos cruzados con el catálogo |
| [MITECO · RIPREE](https://catalogo.datosabiertos.miteco.gob.es/catalogo/en/dataset/6ee8d46f-93bd-478f-8e29-3ba4f6d8405c) | Registro oficial de puntos de recarga: coordenadas, operador, conector, potencia | Datos públicos del Estado | `web/data/chargers.txt` | **2.500 puntos DC ≥ 50 kW de toda España**, exportados 21/11/2026 |
| [ESIOS · archive 70](https://api.esios.ree.es/archives/70/download_json) | PVPC horario de España, sin token | Datos públicos de REE | `web/data/pvpc.txt` | 24 precios del día; se lee **en vivo** desde el navegador |
| [MITECO · Precios de carburantes](https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/) | Precio de gasolina y diésel en 11.537 estaciones | Datos públicos del Estado | `web/data/fuel.txt` | Media de Madrid; se lee **en vivo** desde el navegador |
| [Autocasion](https://www.autocasion.com/coches-nuevos/) | Precios de coches nuevos en España | Web pública, sin API | `web/data/prices-es.txt` | **92 modelos** con precio español real, extraídos del listado público de cada marca filtrado a eléctrico (`scripts/coches-precios.mjs`) |
| [Wikimedia Commons](https://commons.wikimedia.org/) | Foto de cada modelo del catálogo | Dominio público, CC0, CC BY y CC BY-SA (uso comercial con atribución) | `web/data/coches-fotos.json` | **106 modelos** con foto, con autor, licencia y enlace a su ficha (`scripts/coches-fotos.mjs`) |
| [REData · Red Eléctrica](https://apidatos.ree.es/) | Emisiones de CO₂ y estructura de generación por día, sin token y con CORS | Datos públicos de REE | `web/data/grid.txt` | Factor de emisión real (kg/kWh) y % renovable en la herramienta de huella de carbono |
| [BDNS · InfoSubvenciones](https://www.infosubvenciones.es/bdnstrans/GE/es/convocatorias) | Convocatorias de ayudas a la movilidad eléctrica y la recarga, con organismo, fecha y enlace al detalle | Datos públicos del Estado | `web/data/ayudas.txt` | Lista de convocatorias reales en la herramienta de ayudas. Sin CORS: solo se descarga en el cron (con `Accept: application/json`) |
| [Our World in Data](https://ourworldindata.org/grapher/electric-car-sales-share) (a partir de la AIE) | Cuota de coches nuevos eléctricos por país y ventas de España. Incluye eléctricos puros e híbridos enchufables. CC BY | CC BY 4.0 | `web/data/market.txt` | Guía de venta de coches eléctricos en España |
| RIPREE (recuento por provincia) | Puntos de recarga únicos por provincia, con los de carga rápida (≥ 50 kW) | Datos públicos del Estado | `web/data/provincias.txt` | Guía de puntos de recarga por provincia |
| [IONITY](https://www.ionity.eu/) | Tarifa de carga: 0,39 €/kWh con plan | Web pública | `web/data/operators.txt` | Precio de referencia de operador |
| [Google News España](https://news.google.com/rss/search?q=coche+el%C3%A9ctrico&hl=es&gl=ES&ceid=ES:es) | Titulares de actualidad EV con medio y fecha | RSS público | `web/data/news.txt` | 10 noticias recientes, con enlace al artículo |
| [Euro NCAP](https://www.euroncap.com/en) | Resultados oficiales de seguridad | No expone API abierta por VIN | `web/data/safety.txt` | Enlace al buscador oficial por modelo; sin estrellas inventadas |
| Fabricantes (red oficial) | Localizadores de talleres autorizados | Web oficial de cada marca | `web/data/workshops.txt` | 33 marcas con enlace a su red oficial |

## PWA y API

- `web/manifest.webmanifest` + `web/icon.svg` + `web/sw.js` hacen la web instalable y la dejan funcionar sin cobertura. El service worker cachea las páginas, los CSS/JS y todos los archivos de `data/`.
- `web/api/data.json` es una API pública real servida como archivo estático: los 113 modelos del catálogo, 100 puntos de recarga y los 24 precios PVPC del día, sin clave ni backend. No lleva una licencia única: cada bloque conserva la de su fuente (OpenEV Data CDLA-Permissive-2.0, MITECO/RIPREE y ESIOS-REE, datos públicos) y el campo `sources` dice cuál es cuál. No relicenciamos datos de terceros. Lo regenera el cron diario.

## Actualización automática

No hay backend. Hay dos capas:

1. **En vivo (sin servidor):** `web/data-live.js` consulta ESIOS y MITECO directamente desde el navegador (ambos responden con CORS) y actualiza los precios al cargar. Si falla la red, usa el snapshot estático.
2. **Snapshots programados:** `.github/workflows/update-data.yml` ejecuta `scripts/update-data.mjs` cada día a las 06:00 UTC. El script descarga las cinco fuentes, reescribe `web/data/*.txt` y hace commit. Al hacer push, **Cloudflare Pages o Vercel reconstruyen el sitio estático automáticamente**.

Para lanzar la actualización a mano: `Actions → Actualizar datos → Run workflow`.

Esto significa que los datos se mantienen solos sin ningún servidor que administrar: el "API" son archivos versionados en el repositorio más dos endpoints públicos.

### Detalles de conversión

- **Vehículos:** del CSV de release se filtran modelos con batería, WLTP y potencia DC, año ≥ 2024 y marcas de mercado europeo. Se guarda un modelo por nombre y año.
  - `range` = WLTP × 0,85. Es un **modelo declarado**, no una medición propia.
  - `use` = batería útil / (WLTP/100). Magnitud derivada, no consumo homologado.
  - `price`, dimensiones, maletero y Euro NCAP **no están en la fuente**: las herramientas muestran “Sin dato” en vez de inventarlos.
- **Curvas:** se cruzan nombre de OpenEV con `brand` + `model` de Kilowatt. Se guardan pares `SoC:kW` (0, 50, 75/80, 100).
- **Cargadores:** la exportación oficial de RIPREE viene en UTF‑16LE y separada por `;`. Se filtran puntos DC ≥ 50 kW de ocho provincias. Formato local: `nombre|lat|lon|kW|operador|conector|provincia`.
- **Especificaciones:** se extraen las fichas de ev-database.org que coinciden por marca y modelo. El precio es **RRP de Alemania** (o Países Bajos), nunca precio español: se muestra como “Precio DE”. La autonomía real de esa fuente sustituye a WLTP × 0,85 cuando existe. Euro NCAP sigue sin dato porque la fuente no lo publica.

## Scraping

La extracción se hace con el navegador controlado (mismo principio que [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling)): se recorre el listado de 1.557 fichas de ev-database.org, se cruzan los nombres con nuestros 113 modelos y se leen las tablas de dimensiones, precio, maletero y autonomía. `scripts/update-data.mjs` reproduce este proceso en el cron diario.

## Repos localizados para ampliar

| Repo | Para qué | Estado |
|---|---|---|
| [OgamLabs/MITECO-Historical-prices](https://github.com/OgamLabs/MITECO-Historical-prices) | Precios históricos de carburantes por estación y provincia | Localizado, pendiente de integrar |
| [azogue/aiopvpc](https://github.com/azogue/aiopvpc) | Precio PVPC horario de España desde ESIOS | Localizado, pendiente de integrar |
| [ismaelpzex/fuel-price-spain-API](https://github.com/ismaelpzex/fuel-price-spain-API) | API REST de precios de gasolina | Localizado, pendiente de integrar |
| [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | Extracción cuando una fuente no expone API limpia | Registrado 20/11/2026 |
| [open-ev-data/open-ev-data-dataset](https://github.com/open-ev-data/open-ev-data-dataset) | Fuente canónica de fichas EV | Integrado |
| [KilowattApp/open-ev-data](https://github.com/KilowattApp/open-ev-data) | Curvas de carga reales | Integrado |

## Atribución obligatoria

En el pie de cada página que use estos datos:

- OpenEV Data · CDLA-Permissive-2.0 · v1.24.0
- KilowattApp/open-ev-data · MIT con atribución
- MITECO · RIPREE · datos públicos
- © OpenStreetMap · CARTO · AWS Terrain

## Regla

Si una cifra no se puede rastrear hasta una de estas fuentes, **no se publica como dato**. Se muestra “Sin dato” o se etiqueta explícitamente como modelo estimado.
