# Plan de diseño — Voltieri

## El problema

45 herramientas × 4 estados (vacío, cargando, resultado, error) × 3 anchos (1440, 768, 390) × 2 temas (día, noche) = **1.080 estados canónicos**.

Si cada herramienta se diseña desde cero, el proyecto se muere en la herramienta 12. La solución es un sistema de tres capas: **tokens → componentes → plantillas**. Las herramientas se ensamblan, no se dibujan.

---

## Capa 1 — Tokens

`web/tokens.css` — **hecho**. Contiene：

- Dos paletas completas (`day` / `night`) con `color-scheme`.
- Tipografía: Archivo (interfaz), Newsreader (topónimos), Geist Mono (mediciones).
- Escala de espacio (4 → 96), radio 0, filete de 1 px, curva de movimiento.
- Superficies del navegador themadas: selección, foco, caret, scrollbar.
- `prefers-reduced-motion` global.

**Regla:** ningún archivo vuelve a declarar un color. Si hace falta un color nuevo, entra en tokens.

## Capa 2 — Componentes

~22 componentes cubren el 80 % de las 45 herramientas:

| Grupo | Componentes |
|---|---|
| Acción | Botón primario, secundario, de texto, grupo de modos, interruptor |
| Entrada | Campo, selector, deslizador, casilla, segmentado |
| Dato | KPI, tabla, fila de dato, barra de SoC, lista de etapas |
| Gráfico | Perfil de elevación, curva de carga, comparador de barras, distribución |
| Mapa | Línea de ruta, marcador de ciudad, marcador de cargador, cartela, escala, brújula |
| Contenedor | Panel, cartela, pestañas, hoja de resultados, aviso de fuente |
| Retroalimentación | Estado vacío, skeleton, error, aviso de afiliado |

Cada componente se entrega con: día, noche, hover, foco, deshabilitado, cargando, error y 390 px.

## Capa 3 — Plantillas

8 plantillas reutilizables:

1. **Home** — mapa + cartela (ya en `web/hoja.html`).
2. **Herramienta simple** — entrada → resultado, con desglose y fuente.
3. **Herramienta de mapa** — mapa a sangre + panel lateral + filtros.
4. **Catálogo / listado** — filtros, tabla, ficha.
5. **Ficha de modelo** — cabecera, datos, gráficas, afiliados.
6. **Comparador** — hasta 4 columnas con diff visual.
7. **Simulador** — controles + visualización + lectura de resultados.
8. **Artículo / guía** — lectura, tablas, glosario.

---

## Flujo de diseño por herramienta

1. **Copia primero.** Titular con sustantivo, un hecho duro, botón verbo + objeto. Sin *eyebrow*.
2. **Plantilla, no lienzo.** Elegir una de las 8 y declararla en el comentario del archivo.
3. **Sistema de diseño.** Usar tokens; componentes existentes; radio 0.
4. **Un momento.** Solo una animación con propósito; nada de *scroll-reveal*.
5. **Revisión:** `impeccable critique` → `audit` (P0–P3).
6. **Chequeo:** `taste-skill consistency + check + shoot + perf` a 1440 / 1024 / 768 / 390.
7. **Ojos:** comparar con figma.com y x.ai; arreglar lo que se vea torcido.

---

## Referencias obligatorias (no negociables)

| Repo | Para qué | Estado |
|---|---|---|
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | Chequeos reales en Chrome: consistencia, layout, screenshots, perf. Base local: `/Users/enriquemayor/.claude/skills/taste-skill` | **Registrado 20/11/2026. Usar en cada pantalla.** |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Vocabulario de diseño, `critique`, `audit`, detector de slop (62 reglas). Apache-2.0 | Registrado. Launcher no instalado: sin DNS para npm, se leen las referencias por `fetch` |
| [mrdoob/three.js](https://github.com/mrdoob/three.js) | 3D solo en el garaje y el visualizador de batería, lazy-load | Referencia de implementación |
| [airbnb/lottie-web](https://github.com/airbnb/lottie-web) | Microanimaciones de producto; nunca como relleno | Referencia de implementación |

Comando de verificación de una pantalla:

```bash
node /Users/enriquemayor/.claude/skills/taste-skill/scripts/consistency.mjs <pagina> \
  --page software --category "rutas de coche eléctrico" --primary "Calcular mi ruta" \
  --widths 1440,1024,820,768,390 --profile <dir-propio>
```

`check-design.mjs` (nuestro juez local) corre antes y después: detecta colores fuera de tokens, cristal, gradients de texto, eyebrows y contrastes por debajo de 4,5:1.

**Limitación del entorno (20/11/2026):** el Chrome headless que lanzan los scripts del skill se aborta con `SIGABRT` (exit 134) desde este sandbox. No se han podido ejecutar `consistency.mjs` ni `check.mjs`. Se sustituye por: (a) `check-design.mjs` en cada cambio, y (b) verificación del DOM y del estado en el Chrome del herramienta de navegador, que sí funciona. Queda pendiente ejecutar los scripts del skill en un entorno con Chrome disponible.

---

## Orden de trabajo

### Bloque A — Fundamentos (en curso)
- [x] Paletas día/noche y modo automático.
- [x] Tokens.
- [ ] 22 componentes base con estados.
- [ ] 8 plantillas.

### Bloque B — Fase 1 (10 herramientas)
Catálogo, comparador, tamaño, autonomía real, buscador “¿llego sin parar?”, TCO, tarifas, curva de carga, mapa de cargadores, coste por 100 km.

### Bloque C — Fase 2 (12 herramientas)
Rutas multiparada, isócronas, perfil de elevación, física de consumo, ayudas 2027, recomendador, etc.

### Bloque D — Fase 3 (23 herramientas)
Simuladores 3D, PWA, contenido, SEO y afiliados.

---

## Definición de “terminado”

Una herramienta no se da por diseñada hasta que:

- [ ] Sus 4 estados están resueltos en día y noche.
- [ ] Se ve bien a 390 y 768 sin scroll horizontal.
- [ ] No hay colores fuera de tokens.
- [ ] No hay *eyebrow*, cristal decorativo, degradado de texto ni métricas gigantes de relleno.
- [ ] El mono solo mide datos.
- [ ] Foco visible, contraste AA y `prefers-reduced-motion`.
- [ ] Pasa `critique` y `audit` sin P0/P1.
- [ ] El visitante entiende el resultado en una frase.

---

## Riesgos

- **Diseñar componentes que no sirvan:** solo se crea un componente cuando dos herramientas lo piden.
- **El modo noche se vuelva neón genérico:** el acento es ámbar y el relieve es cal fosfo; está prohibido azul eléctrico, verde lima y morado.
- **El mundo “hoja de relieve” se canse:** se mantiene en home, mapa y ruta; el resto del sitio es editorial técnico con la misma tipografía y filetes.
- **El volumen parezca imposible:** 45 herramientas son 8 plantillas repetidas con datos distintos, no 45 webs.
