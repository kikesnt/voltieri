---
name: Voltieri
description: Hoja de relieve. Dos paletas por preferencia: papel crema para el día y carta nocturna luminosa (papel preto, contornos de cal fosfo, ruta ámbar). La interfaz no flota: **está impresa** en el papel.
world: hoja-de-relieve
mode: persuade
modes:
  - auto
  - day
  - night
colors:
  paper: "#F2EADA"
  paperDeep: "#E7DCC6"
  ink: "#1C1915"
  text: "#2A251D"
  muted: "#6B6154"
  contour: "#A8896A"
  water: "#B7CFCB"
  olive: "#8A9468"
  route: "#C4441E"
  rule: "rgba(28,25,21,0.16)"
  paperNight: "#080B09"
  inkNight: "#F2EDDF"
  textNight: "#EAE4D4"
  mutedNight: "#8C8670"
  contourNight: "#6A9B81"
  waterNight: "#143830"
  routeNight: "#E0953A"
  ruleNight: "rgba(242,237,223,0.13)"
typography:
  display:
    fontFamily: '"Archivo", sans-serif'
    fontWeight: 500
    letterSpacing: "-0.03em"
    lineHeight: 1.02
  map:
    fontFamily: '"Newsreader", serif'
    fontStyle: italic
    fontWeight: 400
  body:
    fontFamily: '"Archivo", sans-serif'
    fontSize: "15px"
    lineHeight: 1.6
  data:
    fontFamily: '"Geist Mono", monospace'
    fontSize: "11px"
    fontVariantNumeric: tabular-nums
radius:
  none: "0"
  hair: "1px"
---

# Design System: Voltieri

## Mundo: hoja de relieve

La página es una **hoja cartográfica**: papel que ocupa la pantalla, curvas de nivel y agua que siguen la orografía, y el itinerario trazado a tinta. El relieve se modela en 3D sobre la propia hoja, con relief hillshade. La interfaz no flota: **está impresa** en el papel.

No es un dashboard oscuro. No es un marketplace claro con tarjetas verdes. Es un documento de trabajo, con la precisión de un mapa y la autoridad de un plano.

## Paletas

**Día** (fondo claro):

- Papel `#F2EADA`; tinta `#1C1915`; curvas `#A8896A`; agua `#B7CFCB`; ruta `#C4441E` (vermellón, el único color que grita).
- Wood: hover of `.go` → vermellón.

**Noche** (fondo oscuro):

- Papel `#080B09`; tinta luminosa `#F2EDDF`; curvas fosfo `#6A9B81`; agua profunda `#143830`; ruta ámbar `#E0953A`.
- Wood: deepen contour opacity in dark, reduce contrast of hillshade.

## Modos: día, noche y automático

- **Auto** (predeterminado): sigue la preferencia del sistema (`prefers-color-scheme`).
- **Día** y **Noche**: obligado.
- Persistidos en `localStorage` (`voltieri-theme`), con un grupo de botones en la cabecera.
- En auto, el grupo resalta el modo resuelto.

## Primera pantalla

Mapa de relieve con la ruta Madrid–Barcelona al entrar, cámara descendiendo en 2,2 s, eased. Cartela de doble filete —leyenda de mapa— abajo a la izquierda con el titular, el hecho medido, un timeline de la ruta (Madrid 0 km, Zaragoza parada, Barcelona 617 km) y el formulario. Arriba, banda de papel con la marca y la navegación.

## Jerarquía

1. El relieve y la ruta (el trabajo).
2. El titular en la cartela.
3. El hecho: 617 km · 16,8 kWh/100 km · 18 min de parada.
4. El formulario.

## Sistema de variables

- Radius: 0. Los filetes son de 1 px. El `cartouche::before` dibuja un segundo borde inset (como las leyendas de los planos).
- Spacing: grid de 12 columnas, cartelas rellenas de padding.

## Métricas

Datos sin decoración. Los números en geo mono (`Geist Mono`, 11px, tabular). Las carreteras, curvas y hitoria son túneles de mapa.

## Motivación vs. nogas

El clásico “mapa antiguo + triple de tarjetas”: nuestra identidad es una **hoja de traceo y tinta de relieve**. La diferencia que tienen los usuarios de eléctricos hoy: la pregunta no es “¿dónde están los cargadores?” sino “¿con cuánto para llegar y cuánto me cuesta la carretera?”. Voltieri responde con un relieve narrativo, no con un cubo de tarjetas.

## Antireferencias

- El cockpit oscuro con glassmorphism y neón azul.
- El mapa por defecto con clusters y popups blancos.
- La landing de coches con foto de estudio, degradado y tres tarjetas.
- Verde de tráfico en rutas resoales de VL (la route in news).
