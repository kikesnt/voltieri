# Voltieri

**Repo:** https://github.com/kikesnt/voltieri · **Demo:** https://kikesnt.github.io/voltieri/

**Copiloto EV para España y Europa.** Autonomía real, rutas con orografía, cargadores oficiales, costes y equipamiento. Sin cuentas, sin cookies, sin ruido.

> **Voltieri** — de *volt*, con sonoridad italiana de casa de ingeniería. Se pronuncia igual en español, inglés, alemán, francés e italiano.
> Dominios libres a 20/11/2026: `voltieri.com`, `.es`, `.eu`, `.app`, `.de`, `.fr`.
> Antes de comprar: búsqueda en **OEPM** (España) y **EUIPO** (UE), clases 9, 39 y 42.
>
> Descartados: *Voltia* (empresa real de furgonetas eléctricas), *Wattrip* (app EV en Android), *RutaVolt* (solo funciona en español).

---

## Estado

- [x] Investigación de competencia (nogas.es, jualas/electrolineras).
- [x] Prototipo visual con mapa real, ruta Madrid–Barcelona y perfil de elevación.
- [x] Fuentes de datos abiertas identificadas y licencias revisadas.
- [x] Inventario de las 45 herramientas y plan por fases (`docs/TOOLS.md`).
- [x] Fase 1: catálogo, comparadores, autonomía, TCO, tarifas, carga y cargadores.
- [x] Fase 2: rutas multiparada, isócronas, física, fiscalidad y recomendador.
- [x] Fase 3: simuladores, PWA, contenido, SEO programático y afiliados.
- [x] Motor de rutas real (OSRM + Open-Meteo) y mapa de autonomía con anillos isócronos por clic.
- [x] PWA instalable, API JSON pública y alertas sin cuenta.

Las herramientas están en `web/`: seis con página propia y cuarenta en el hub de cinco páginas por categoría (`tools-data.js` + `tools.js`). Cada una tiene URL compartible y funciona sin cuenta.

---

## Por qué puede ganar a nogas.es y a electrolineras

| | nogas.es | jualas/electrolineras | Voltieri |
|---|---|---|---|
| Cuentas | Google para app y favoritos | Login para zona privada/TeslaMate | **Ninguna** |
| Diseño | Claro, eco, tarjetas | Mapa por defecto, MVP | **Oscuro, cockpit, mapa 3D** |
| Alcance | 28 piezas + catálogo | Cargadores y rutas ES/PT | **45 herramientas, todas sin cuenta** |
| Orografía | La menciona | Factor de terreno manual | **Física real: elevación, viento, clima, carga** |
| Monetización | No afiliados | Ninguna | **Afiliados contextuales** |
| Infra | Web propia | Cloudflare Tunnel (cayó el 20/11/2026) | **Estático en CDN** |

### Los seis diferenciadores

1. **Cero fricción.** Todo funciona sin registro: estado en `localStorage` y URLs compartibles.
2. **Mapa con terreno real.** La ruta se drapea sobre el relieve y el perfil de elevación se sincroniza.
3. **Física transparente.** Aerodinámica, rodadura, gravedad, clima, viento y masa. Se muestra el desglose.
4. **Afiliados con criterio.** Recomendaciones en el momento de decisión, no banners.
5. **SEO programático.** Una página por modelo × escenario y por ruta × coche.
6. **Fiabilidad.** Sitio estático en CDN, sin túneles caseros ni servidores que se caen.

---

## Alcance: 45 herramientas

Paridad 1:1 con las **28 piezas** de nogas.es, más **17 que no tienen**. El inventario completo, con mejora, fuente de datos y fase, está en [`docs/TOOLS.md`](docs/TOOLS.md).

| Bloque | Piezas | Ejemplos |
|---|---|---|
| Catálogo y comparadores | 9 | fichas, tamaño, maletero, seguridad, autonomía, 360º, recomendador |
| Costes y fiscalidad | 8 | TCO, ayudas 2027, tarifas, instalación, CAE, seguros, reventa, flotas |
| Rutas y autonomía | 6 | planificador, isócronas, perfil de elevación, autonomía invernal |
| Cargadores | 4 | mapa ES/PT, precio por operador, curva DC, alertas |
| Simuladores | 6 | garaje 3D, degradación, aerodinámica, neumáticos, ruido, carga |
| Contenido y servicio | 5 | talleres, noticias, pruebas, PWA offline, API |
| Extras propios | 7 | amortización real, huella, química de batería, alquiler vs compra |

**Regla de lanzamiento:** no se publica la web hasta que las 28 piezas de nogas estén cubiertas o sustituidas por algo mejor.

---

## Sistema de diseño

Las 45 herramientas no se diseñan 45 veces: **tokens → componentes → plantillas → herramientas**.

| Archivo | Qué es |
|---|---|
| `web/tokens.css` | Paletas día/noche, tipografía, espacio, movimiento, superficies del navegador |
| `web/components.css` | Componentes base (botones, campos, tablas, chips, estados, afiliados) |
| `web/components.html` | Galería viva de componentes en los dos temas |
| `web/hoja.html` | Portada: mapa de relieve + rail de leyenda + cinta de telemetría |
| `web/tool-shell.html` | Plantilla de herramienta simple: coste por 100 km (#29) |
| `web/catalog.html` | Plantilla de catálogo con filtros (#1) |
| `web/range.html` | Autonomía real desglosada (#6) |
| `web/charge.html` | Curva de carga y tiempo 10–80 % (#19) |
| `web/tco.html` | Coste total de propiedad (#10) |
| `web/chargers.html` | Mapa de cargadores (#24) |
| `docs/DESIGN-PLAN.md` | Plan de diseño completo y referencias obligatorias |
| `scripts/check-design.mjs` | Juez determinista: tokens, sin cristal, sin eyebrows, contraste AA |

**Regla:** ninguna pantalla se da por terminada sin `node scripts/check-design.mjs web` en verde.

Modos: **Auto** (sigue `prefers-color-scheme`), **Día** y **Noche**, guardados en `localStorage`.

---

## Stack objetivo

- **Astro 5 + React islands** para contenido y herramientas interactivas.
- **Tailwind CSS v4** + variables CSS. Sin Bootstrap.
- **MapLibre GL JS** + Carto Dark Matter (sin etiquetas) + terreno `raster-dem`.
- **Three.js / react-three-fiber** solo donde aporte (terreno, configurador, visualizaciones).
- **uPlot** para curvas de carga, autonomía y costes.
- **GSAP ScrollTrigger + Lenis** para scroll y motion con propósito.
- **Sin backend en la v1.** Datos estáticos + APIs públicas; estado en cliente.
- **Hosting:** Cloudflare Pages o Vercel.

### Librerías de diseño recomendadas

| Necesidad | Repo | Licencia |
|---|---|---|
| Componentes accesibles | [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | MIT |
| Datos y KPIs | [tremorlabs/tremor](https://github.com/tremorlabs/tremor) | Apache-2.0 |
| Acentos animados | [magicuidesign/magicui](https://github.com/magicuidesign/magicui) | MIT |
| Componentes creativos | [nolly-studio/cult-ui](https://github.com/nolly-studio/cult-ui) | MIT |
| 3D | [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | MIT |
| Mapas WebGL | [visgl/deck.gl](https://github.com/visgl/deck.gl) | MIT |
| Scroll suave | [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) | MIT |
| Animación con timeline | [theatre-js/theatre](https://github.com/theatre-js/theatre) | Apache-2.0 |

Ver [`docs/DESIGN.md`](docs/DESIGN.md) para las tres direcciones visuales y el sistema de diseño.

---

## Arrancar el prototipo

```bash
cd prototype
python3 -m http.server 8123
# Abrir http://localhost:8123
```

No necesita build ni dependencias: MapLibre, Carto y las teselas de elevación se cargan por CDN.

---

## Estructura

```
voltieri/
├── prototype/        # Maqueta visual (HTML/CSS/JS, sin build)
├── docs/
│   ├── DESIGN.md     # Principios, direcciones visuales, sistema y mapas
│   └── DATA.md       # Fuentes, licencias, modelo de datos y afiliados
├── web/              # App real (Astro/React) — pendiente
├── data/             # Datos normalizados (vehículos, cargadores, rutas)
└── scripts/          # Ingesta DATEX II, elevación, precios, etc.
```

---

## Roadmap

### Fase 1 — MVP (primera versión pública)
- Home + catálogo/buscador de coches (OpenEV Data).
- Ficha de coche con autonomía real y curva de carga.
- Mapa de cargadores (DATEX II España + Portugal).
- Calculadora TCO vs combustión.
- Módulo de afiliados + páginas de equipamiento.
- Despliegue estático en CDN.

### Fase 2 — Rutas y orografía
- Planificador de rutas con paradas y SoC.
- Terreno 3D + perfil de elevación sincronizado.
- Física de consumo: aerodinámica, rodadura, gravedad, viento, temperatura, carga.
- Comparador de estrategias de carga (cargar pronto vs aguantar).

### Fase 3 — Escala
- Comparadores (tamaño, maletero, autonomía, seguridad).
- Recomendador inteligente.
- PWA offline y modo garaje.
- Asistente IA sobre datos propios (opcional, con clave del usuario).
- SEO programático y contenido editorial.

---

## Reglas del proyecto

1. **Sin cuentas.** Si una función necesita persistencia, `localStorage` o URL.
2. **Sin cookies no esenciales.** Analítica privacy-first (Plausible/Umami).
3. **Datos con fuente y fecha.** Cada cifra debe poder rastrearse.
4. **3D solo si explica algo.** Nada de efectos decorativos que penalicen móvil.
5. **Afiliados transparentes.** Disclosure visible y `rel="sponsored nofollow"`.
6. **Rendimiento primero.** LCP < 2,5 s en 4G; Three.js lazy-load.

---

## Atribuciones obligatorias

- **OpenStreetMap** © colaboradores OSM (ODbL).
- **CARTO / OpenFreeMap** para teselas base.
- **Mapzen / AWS Terrain Tiles** para el DEM.
- **OpenEV Data** (CDLA-Permissive-2.0).
- **Open Charge Map** (CC BY 4.0).
- **MITECO / NAP DGT** (DATEX II) y **MOBI.E**.
- **Open-Meteo** para elevación y clima.

Los detalles están en [`docs/DATA.md`](docs/DATA.md).
