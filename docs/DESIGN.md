# Diseño — Voltieri

## Principios

1. **Una idea fuerte por pantalla.** El mapa es la interfaz, no un fondo decorativo.
2. **El dato manda.** Números grandes, mono, tabulares, con fuente y fecha.
3. **3D solo si explica algo.** Terreno, ruta, curva de carga. Nada de adornos.
4. **Menos glass, más materia.** Superficies oscuras, bordes finos, un solo acento.
5. **Tipografía con carácter.** Grotesk + serif editorial + mono para datos.
6. **Movimiento con propósito.** La ruta se dibuja, el perfil se scrubea, los números cuentan.
7. **Asimetría editorial.** Nada de hero centrado con tres tarjetas iguales.

## Anti-AI-slop checklist

- ❌ Degradados morados/azules genéricos por todas partes.
- ❌ Glassmorphism en cada tarjeta.
- ❌ Hero centrado con “Supercharge your…” y tres features con iconos de línea.
- ❌ Ilustraciones 3D de stock o blobs.
- ❌ Parallax porque sí.
- ✅ Un concepto visual claro (terreno + ruta).
- ✅ Datos reales y verificables.
- ✅ Tipografía y color con intención.
- ✅ Motion ligado al contenido.
- ✅ Rendimiento y accesibilidad como parte del diseño.

---

## Tres direcciones

### A. “Terreno vivo” — recomendada

El hero es un **mapa 3D de España** con el relieve real y la ruta drapeada. Al hacer scroll, la cámara vuela por la ruta y el perfil de elevación se sincroniza. Los cargadores son faros sobre el terreno.

- **Qué transmite:** autonomía real, orografía, tecnología.
- **Tech:** MapLibre GL JS + `raster-dem` (AWS Terrarium) + `setTerrain`; Three.js solo para overlays o un configurador.
- **Referencias:** [MapLibre terrain](https://maplibre.org/maplibre-gl-js/docs/examples/3d-terrain/), [takram-jp/three-geospatial](https://github.com/takram-jp/three-geospatial), [HamishMW/portfolio](https://github.com/HamishMW/portfolio).
- **Riesgo:** el terreno con pitch alto puede romper el render en algunos equipos. Fallback: hillshade + mapa plano.

### B. “Túnel de viento” — experimental

Un túnel de viento oscuro con partículas que fluyen alrededor de una silueta de coche. La ruta es un flujo de partículas y los datos aparecen como HUD.

- **Qué transmite:** aerodinámica, velocidad, ingeniería.
- **Tech:** Three.js + shaders (GLSL), `react-three-fiber`, `drei`, `lygia`.
- **Referencias:** [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber), [pmndrs/drei](https://github.com/pmndrs/drei), [lygia](https://github.com/patriciogonzalezvivo/lygia).
- **Riesgo:** pesado en móvil; requiere fallback estático.

### C. “Editorial técnica” — la base creíble

Layout suizo, tipografía enorme, blanco/negro, tablas de datos, cero glass. Un solo elemento 3D puntual (coche wireframe o batería).

- **Qué transmite:** rigor, independencia, revista técnica.
- **Tech:** Astro + Tailwind + shadcn/ui + Tremor; SVG/CSS para todo.
- **Referencias:** [shadcn-ui/ui](https://github.com/shadcn-ui/ui), [tremorlabs/tremor](https://github.com/tremorlabs/tremor), [davidhckh/portfolio-2025](https://github.com/davidhckh/portfolio-2025).
- **Riesgo:** menos “wow”; hay que compensar con contenido y datos.

### Recomendación: A + C

- **Hero y mapa:** dirección A (terreno 3D + ruta).
- **Resto del sitio:** dirección C (editorial, datos, rápido).
- **Three.js:** solo en el hero y en un configurador/visualizador. Lazy-load y fallback.

---

## Sistema de diseño

### Paleta

| Token | Hex | Uso |
|---|---|---|
| `--bg` | `#06080B` | Fondo base |
| `--surface` | `#0F151E` | Superficies |
| `--line` | `rgba(255,255,255,.08)` | Bordes |
| `--text` | `#EEF3F9` | Texto |
| `--muted` | `#8C99AB` | Texto secundario |
| `--dim` | `#5C6878` | Metadatos |
| `--ion` | `#5B8CFF` | Acento principal |
| `--ion-2` | `#8FB0FF` | Acento claro |
| `--amber` | `#FFB020` | Paradas / avisos |
| `--mint` | `#3DDC97` | Estado disponible |
| `--danger` | `#FF5C5C` | Crítico |

Regla: **verde solo para estado**, nunca como color de marca. Así nos separamos del verde “eco” de nogas.

### Tipografía

- **Display:** [Clash Display](https://www.fontshare.com/fonts/clash-display) o Geist. Tracking negativo (-0.04 a -0.06 em).
- **Acento editorial:** [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) italic. Una palabra por titular.
- **Cuerpo:** [Satoshi](https://www.fontshare.com/fonts/satoshi) o Geist.
- **Datos:** [JetBrains Mono](https://www.jetbrains.com/lp/mono/) o Geist Mono, `tabular-nums`.

Evitar Inter como única fuente: es el default de medio internet y contribuye al efecto “AI slop”.

### Grid y layout

- 12 columnas, max 1440 px, gutter 24 px.
- Hero asimétrico: 7 columnas de copy + 5 de panel, o 8/4.
- Secciones con mucho aire: 96–120 px de padding vertical.
- Tarjetas con borde de 1 px y radio 16–20 px; sin sombras difusas excesivas.

### Componentes

- **Command bar:** origen, destino, coche, CTA.
- **Route panel:** tiempo, SoC, parada, coste, ahorro.
- **SoC bar:** gradiente mint→ion, marcador de parada.
- **Stop card:** operador, potencia, kWh, minutos, precio.
- **Elevation strip:** SVG con área, línea, marcador y hover.
- **Station marker:** punto + glow + label mono.
- **KPI stat:** número mono grande + label pequeño.
- **Affiliate card:** producto, motivo, precio, disclosure.

### Motion

- Ruta: `stroke-dashoffset` 1,8–2,6 s, easing suave.
- Perfil: se dibuja al entrar en viewport; hover scrubea la altitud.
- Números: count-up de 600 ms.
- Hover: elevación de 2–3 px y borde ion al 30 %.
- `prefers-reduced-motion`: desactivar todo salvo fundidos.

---

## Implementación del mapa

### Base

- **MapLibre GL JS** + estilo **CARTO Dark Matter without labels**.
- Alternativa sin API key: **OpenFreeMap** (`https://tiles.openfreemap.org/styles/...`).
- Atribución visible: © CARTO · © OpenStreetMap.

### Terreno

```js
map.addSource('terrain', {
  type: 'raster-dem',
  tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
  encoding: 'terrarium',
  tileSize: 256,
  maxzoom: 15,
});
map.setTerrain({ source: 'terrain', exaggeration: 1.0 });
```

**Aprendizaje del prototipo:** con `pitch: 48` y `exaggeration: 1.55` el canvas salía negro (cámara dentro del relieve). Configuración estable: `pitch: 28–32`, `exaggeration: 1.0–1.2`. Probar en móvil y ofrecer fallback de mapa plano + hillshade.

### Ruta y estaciones

- GeoJSON `LineString` con la geometría de OSRM.
- Capa glow (`line-blur`) + línea fina encima.
- Estaciones como `circle` con glow y labels HTML (`maplibregl.Marker`).
- Para producción: simplificar la geometría y cachear.

### Perfil de elevación

1. Muestrear la ruta cada 1 km.
2. Pedir elevaciones a **Open-Meteo Elevation API** (gratis, sin clave).
3. Dibujar SVG/Canvas con área + línea + marcador.
4. Sincronizar hover con el mapa (highlight del tramo).
5. En producción: precalcular rutas populares y cachear.

### Física de consumo

```
F_rodadura = Crr · m · g · cos(θ)
F_aero     = 0,5 · ρ · Cd · A · (v + viento)²
F_gravedad = m · g · sin(θ)
E_tramo    = (F_rodadura + F_aero + F_gravedad) · d / η
E_regen    = η_regen · m · g · |Δh|   (solo en descenso)
E_aux      = P_aux · t
```

Sumar tramo a tramo, no solo el desnivel neto: en bajadas no se recupera todo. Mostrar el desglose (aero / rodadura / gravedad / aux) para que el dato sea creíble.

---

## Repos de referencia

### 3D y motion
- [HamishMW/portfolio](https://github.com/HamishMW/portfolio) — 3,5k★. Scroll 3D con React Three Fiber.
- [davidhckh/portfolio-2025](https://github.com/davidhckh/portfolio-2025) — 888★. Experiencia inmersiva.
- [fireship-io/threejs-scroll-animation-demo](https://github.com/fireship-io/threejs-scroll-animation-demo) — 1,7k★. Base de scroll.
- [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) — 33,8k★.
- [pmndrs/drei](https://github.com/pmndrs/drei) — helpers 3D.
- [takram-jp/three-geospatial](https://github.com/takram-jp/three-geospatial) — terreno/geospatial en Three.js.
- [vasturiano/three-globe](https://github.com/vasturiano/three-globe) — globo 3D.
- [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) — scroll suave.
- [theatre-js/theatre](https://github.com/theatre-js/theatre) — timelines.

### Configuradores de coche/producto
- [Prajyot-Desai/AutoVerse](https://github.com/Prajyot-Desai/AutoVerse) — showroom/configurador 3D.
- [CodyMQ/threejs-3d-room-designer](https://github.com/CodyMQ/threejs-3d-room-designer) — 465★. Patrones de configurador.

### Mapas y datos
- [maplibre/maplibre-gl-js](https://github.com/maplibre/maplibre-gl-js) — mapas vectoriales.
- [visgl/deck.gl](https://github.com/visgl/deck.gl) — 14,8k★. Capas WebGL.
- [OpenFreeMap](https://openfreemap.org) — teselas gratis sin clave.
- [CARTO basemaps](https://github.com/CartoDB/basemaps) — Dark Matter.

### UI
- [shadcn-ui/ui](https://github.com/shadcn-ui/ui) — 128k★. Base accesible.
- [tremorlabs/tremor](https://github.com/tremorlabs/tremor) — 3,7k★. Dashboards/KPIs.
- [magicuidesign/magicui](https://github.com/magicuidesign/magicui) — 23k★. Acentos.
- [nolly-studio/cult-ui](https://github.com/nolly-studio/cult-ui) — 7,5k★. Creatividad.

---

## Presupuesto de rendimiento

- LCP < 2,5 s en 4G; CLS < 0,1; INP < 200 ms.
- JS inicial < 180 KB gzip (sin Three.js).
- Three.js y el configurador: lazy-load, solo desktop o interacción explícita.
- Imágenes en AVIF/WebP, `srcset`, dimensiones explícitas.
- Mapa: cargar solo cuando el hero entra en viewport; fallback estático.
