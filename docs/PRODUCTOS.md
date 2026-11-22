# Cómo añadir productos de Amazon

Hay dos caminos: el automático (el que se usa) y el manual, para meter un
producto concreto sin volver a raspar.

## Camino automático: raspar, curar y publicar

El catálogo sale de Amazon.es con Chrome headless, en local y sin coste. Es
el mismo sistema que usa emergencia72h, portado aquí.

```bash
# 1. Buscar en Amazon.es (las consultas están en scripts/amazon-consultas.txt)
python3 scripts/amazon-scrape.py --fase busqueda

# 2. Elegir los candidatos que merecen ficha (los mejor valorados de cada categoría)
python3 scripts/amazon-scrape.py --fase seleccion

# 3. Abrir la ficha de cada candidato: imagen en alta resolución, disponibilidad,
#    precio, nota, número de valoraciones y tiempo de entrega
python3 scripts/amazon-scrape.py --fase fichas

# 4. Volcar el catálogo a web/data/amazon-products.json (curando los títulos)
node scripts/import-scrape.mjs

# 5. Validar, ordenar, etiquetar y regenerar comparativas y equipamiento
node scripts/curate-products.mjs
```

El paso 4 no toca los productos que ya estaban curados a mano: de esos solo
actualiza precio, valoración e imagen. El 5 es el que manda: descarta lo que
baje de 4,4 ★, ordena, pone las etiquetas y regenera las páginas.

El rascado se deja en un trabajo de launchd (`es.voltieri.amazon`), que relanza
cada 30 minutos y sigue donde se quedó. Amazon corta el paso si se le
acumulan peticiones, así que el script espera 7 segundos entre peticiones, para
al quinto bloqueo seguido y guarda en disco cada 20 productos:

```bash
launchctl kickstart -k gui/$(id -u)/es.voltieri.amazon
```

Datos intermedios: `data/amazon-candidatos.json` (resultados de búsqueda) y
`data/amazon-fichas.json` (ficha de cada producto).

## Camino manual: un producto concreto

1. Abre `web/data/amazon-products.json` y añade el producto a `products` de su categoría:

```json
{ "asin": "B0XXXXXXXX", "title": "Marca Modelo · dato clave", "price": "29,99 €", "rating": "4,6", "image": "https://m.media-amazon.com/images/I/….jpg" }
```

   Solo `asin` y `title` son obligatorios.

2. Ejecuta, desde la raíz del repositorio:

```bash
node scripts/curate-products.mjs
```

## Categorías

| id | Dónde se ve |
|---|---|
| `cables-tipo2`, `wallbox`, `adaptadores-ccs2`, `cargador-portatil`, `estaciones-22kw`, `v2l` | Equipamiento, comparativas, herramientas y guías de carga |
| `inflador-neumaticos` | Guía de neumáticos, mantenimiento, autonomía a 120 km/h y herramientas de neumáticos y aerodinámica |
| `soporte-cable` | Guías de wallbox, cargador, parking comunitario y planificador |
| `maleta-viaje` | Guía del planificador, familiar y 7 plazas |
| `nevera-v2l` | Guías de coche familiar y 7 plazas |
| `invierno` | Guía de autonomía a 120 km/h y herramienta de autonomía invernal |

Una categoría sin productos no muestra estantería ni genera comparativa. Con 8
productos por categoría el filtro de valoración deja margen. Se recomienda un
mínimo de 3.

## Páginas nuevas

Al tener productos, la categoría nueva genera su comparativa
(`comparativa-<categoría>.html`). Está ya en `web/sitemap.xml` y en el `CORE`
de `web/sw.js`: si añades una categoría nueva, añádela también a los dos.
