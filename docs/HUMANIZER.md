# Humanizador de artículos — Voltieri

Repos evaluados el 21/11/2026 para revisar los 12 artículos del blog.

## Stack elegido

| Repo | Stars | Licencia | Qué aporta |
|---|---|---|---|
| [blader/humanizer](https://github.com/blader/humanizer) | 71,8k | MIT | Regla principal. Basado en *Signs of AI writing* de Wikipedia: contraste «no X sino Y», cierres de una línea, aperturas escenificadas, tríadas forzadas, guiones por hábito, afirmaciones infladas, lenguaje de ventas, vocabulario stock, negritas decorativas y relleno. |
| [harshaneel/humanize](https://github.com/harshaneel/humanize) | 639 | MIT | Reglas duras medibles: máximo un guion largo por 300 palabras, sin punto y coma, vocabulario prohibido, sin encuadre por negación, salida sin preámbulo y variedad en la longitud de frases. Compatible con OpenCode. |
| [kane50613/native-writing](https://github.com/kane50613/native-writing) | 9 | MIT | Guía específica para blogs y ensayos: empezar por un dato o problema real, desarrollar el pensamiento con ejemplos, encabezados que nombren la pregunta del apartado y final que cierre el propósito. |

Descartados para este proyecto: `lynote-ai/humanize-text` (necesita LLM/API), `Anbeeld/WRITING.md` (más amplio, pensado para muchos géneros) y los humanizadores orientados a coreano, chino o ruso.

## Reglas aplicadas a Voltieri

1. Cada frase aporta un dato, una fuente o una consecuencia. Si solo subraya importancia, se corta.
2. Prohibido el encuadre «no es X, es Y» y «no se trata de X, sino de Y». Se dice qué es.
3. Máximo un guion largo (`—`) por cada 300 palabras. Preferimos `·` o punto.
4. Sin punto y coma.
5. Vocabulario prohibido: *delve, leverage, utilize, robust, comprehensive, streamline, furthermore, moreover*, y en español *es importante destacar, cabe señalar, sin duda, en conclusión, a medida que*.
6. Longitud de frases variada: la más larga supera a la más corta en 20+ palabras y menos de la mitad está entre 10 y 20 palabras.
7. Sin frases completas repetidas en más de dos artículos. El generador usa variantes por índice y prefija la keyword en los bloques tomados de `sections`.
8. Mínimo de 700 palabras por artículo (exigencia nuestra, no de AdSense; la política oficial no fija mínimo). Los 12 artículos quedaron entre 1.616 y 1.961 palabras after la expansión.
9. Estructura Adsense-friendly: un H1, secciones H2, subapartados H3 cuando aportan, tablas y listas.

## Uso

```bash
node scripts/check-humanizer.mjs
```

El script lee `web/blog/*.html`, elimina `head`, estilos y scripts, y aplica las reglas medibles. Las reglas de voz que no se pueden automatizar se revisan con la lista de blader antes de publicar.
