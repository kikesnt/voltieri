# Precios y fotos del catálogo de coches

El catálogo (`web/catalog.html`) muestra dos cosas que hay que mantener al día:
el **precio en España** de cada modelo y su **foto con atribución**. Las dos
salen de fuentes distintas, con licences distintas, y cada una tiene su
script.

| Qué | Fuente | Licencia | Archivo local | Script |
|---|---|---|---|---|
| Precio de venta en España | [Autocasión](https://www.autocasion.com/coches-nuevos) | Contenido de tercero: se publica la cifra citando la fuente, no la página | `web/data/prices-es.txt` + `web/data/prices-es-meta.json` | `scripts/coches-precios.mjs` |
| Foto del modelo | [Wikimedia Commons](https://commons.wikimedia.org/) | Dominio público, CC0, CC BY o CC BY-SA (todas permiten uso comercial con atribución) | `web/data/coches-fotos.json` | `scripts/coches-fotos.mjs` |

Los datos de ficha (batería, WLTP, carga DC, maletero) **no** vienen de aquí:
siguen viniendo de OpenEV Data v1.24.0 a través de `web/data/vehicles.txt`.
Esto solo cubre precio y foto.

## Cómo actualizo los precios

```bash
node scripts/coches-precios.mjs
```

Eso es todo: no hay claves, ni cuentas, ni cookies, ni API de pago. El script
se descarga las páginas públicas de Autocasión, empareja cada modelo con su
anuncio y escribe dos ficheros:

- `web/data/prices-es.txt` — una línea por modelo, `Marca Modelo|precio_en_euros`.
  El formato no ha cambiado, así que `web/tools-data.js` lo sigue leyendo igual.
- `web/data/prices-es-meta.json` — fuente, fecha de la captura, cuántos modelos
  tienen precio, cuántos se han conservado de la pasada anterior y cuáles se
  han resuelto por alias de nombre.

La fecha del meta es la que se pinta al pie de la tabla del catálogo.

### Por qué funciona

La versión anterior de `scripts/update-data.mjs` iba al detalle de cada modelo
con una URL inventada (`/coches-nuevos/<marca>/<modelo-con-guiones>`) y por eso
solo sacaba 45 modelos de 113: el slug se adivinaba y fallaba.

Ahora el script usa el listado de la marca filtrado a eléctrico, que es una
URL estable:

```
https://www.autocasion.com/coches-nuevos/<marca>/electrico
```

y pagina con `?page=N`. Cada anuncio trae su nombre y su precio juntos, y su
URL lleva la identidad de modelo del portal (`/coches-nuevos/cupra-born/...`).
El emparejamiento:

1. **Validez por nombre**: el nombre del anuncio tiene que contener todos los
   tokens del modelo. Así "BMW iX" no puede coger el precio de un "iX1".
2. **Identidad por slug**: los anuncios válidos se agrupan por slug y se elige
   el grupo que mejor encaja. Así "BYD Seal" gana a "BYD Seal U", y
   "Mercedes EQE" a "Mercedes EQE SUV".
3. **Precio**: el más bajo dentro del grupo, que es el precio de acceso de la
   gama.
4. **Contrapeso**: el precio se contrasta con el RRP de Alemania de
   ev-database (`web/data/specs.txt`). Si se sale de una banda ancha, se
   descarta y se avisa por consola.

**92 de 113 modelos** tienen precio español hoy. Los 21 que no lo tienen están
porque no se venden nuevos en España con ese nombre (Polestar 4, Porsche 718,
Zeekr 7X, Toyota Urban Cruiser…), no porque el script falle. Un modelo sin
precio sale como "Sin dato": es preferible a inventar.

Dos modelos se resuelven por alias de nombre, porque BYD usa el nombre
europeo en su web y OpenEV Data usa el original (`BYD Song Plus` = `BYD Seal U`
y `BYD Yuan Plus` = `BYD Atto 3`). Los alias están en la constante `ALIAS` del
script y los modelos afectados se listan en el meta.

### Al ritmo del portal

El script pide unas 56 páginas, con 1,4 s de espera entre peticiones y un
User-Agent que se identifica (`VoltieriBot/1.0`). No se insiste: si una marca
falla, se sigue con la siguiente.

## De dónde salen las fotos y cómo se atribuyen

```bash
node scripts/coches-fotos.mjs
```

El script busca cada modelo en Wikimedia Commons, elige la mejor foto y guarda
en `web/data/coches-fotos.json`, por modelo:

| Campo | Qué es |
|---|---|
| `miniatura` | URL de la imagen (500 px) |
| `pagina` | Enlace a la ficha del fichero en Commons |
| `autor` | Nombre del autor, tal cual lo da Commons |
| `autorUrl` | Enlace al perfil del autor en Commons |
| `licencia` | Nombre corto de la licencia ("CC BY-SA 4.0", "CC0"…) |
| `licenciaUrl` | Enlace al texto de la licencia |
| `titulo` | Título original del fichero |
| `resolucion` | Resolución del original |

### Por qué Commons

Las fotos de EV Database no se pueden enlazar en caliente ni usar
comercialmente sin permiso, y las de los portales de anuncios son de
anunciantes. Commons tiene API pública sin clave, devuelve autor y licencia, y
sus ficheros son de dominio público o Creative Commons, que **sí permiten uso
comercial con atribución**.

### Qué fotos se aceptan

1. Licencia que permita uso comercial. Se acepta dominio público, CC0, CC BY y
   CC BY-SA; se descarta todo lo que lleve "NC" (uso no comercial) o "ND" (sin
   derivadas). El campo de la API que se mira es `License`.
2. El título tiene que contener la marca y todos los tokens del modelo, con la
   marca de eléctrico incluida: el "ë" del "ë-C3" y la "e-" del "e-208"
   impiden que se cuele el coche de combustión con el mismo nombre.
3. Nada de logos, distintivos, puntos de carga, interiores, motores, ruedas,
   diagramas o coches destrozados.
4. Encuadre apaisado y resolución mínima de 640 px.
5. El año del título tiene que caer en la ventana del modelo, para no liar el
   "Toyota Urban Cruiser" de 2011 con el eléctrico de 2025.
6. Las categorías de Commons (que identifican el modelo) puntúan a favor.

Lo que no se encuentra, no se inventa: el modelo se queda sin foto y el
catálogo lo muestra con un guion en lugar de una imagen rota.

### La atribución, en la página

Bajo cada foto del catálogo van, en letra pequeña, el autor con enlace a su
perfil, el nombre de la licencia con enlace al texto de la licencia y un
enlace a la ficha del fichero en Commons. Es lo que exigen CC BY y CC BY-SA, y
está también en el aviso legal.

## Qué pasa si una fuente falla

Ninguna de las dos pasadas puede borrar datos buenos:

**Precios.** Hay dos redes:

1. Si menos del 60 % de las marcas responden, la fuente se considera caída y
   **no se toca** `web/data/prices-es.txt`. Se avisa por consola y queda
   constancia en el meta (`resultado: "descartado-fuente-caida"`).
2. Si el resultado tiene menos líneas que el fichero actual, **tampoco se
   escribe**: se conserva el anterior y se avisa.
3. Los precios de los modelos que esta pasada no ha encontrado se conservan de
   la anterior y se listan como `conservados` en el meta, para no perder un
   dato bueno por un fallo puntual de un modelo.

Para probar la salvaguarda sin tocar la fuente:

```bash
node scripts/coches-precios.mjs --fallo-simulado   # simula la caída
```

El fichero tiene que quedarse igual (comprobable con `md5`).

**Fotos.** El script es reanudable: `web/data/coches-fotos.json` se escribe
después de cada modelo encontrado, así que una interrupción deja siempre un
JSON válido. Al relanzarlo, los modelos que ya tienen foto no se vuelven a
buscar. Para rehacerlas todas:

```bash
node scripts/coches-fotos.mjs --rehacer
```

Y para probar con unos pocos:

```bash
node scripts/coches-fotos.mjs --limite 10
```

Si `web/data/coches-fotos.json` no existe o no se puede leer, el catálogo
sigue funcionando: sale la tabla sin fotos, sin romperse.

## Cómo se actualiza solo

El cron de GitHub Actions (`.github/workflows/update-data.yml`, todos los días
a las 06:00 UTC) ejecuta `scripts/update-data.mjs`, que ya llama a
`scripts/coches-precios.mjs` para los precios, y después ejecuta
`scripts/coches-fotos.mjs` para las fotos. Los dos scripts escriben en
`web/data/`, que es lo que el cron versiona.

La versión anterior de `update-data.mjs` traía su propio rastreador de
precios, que iba al detalle de cada modelo con una URL inventada y sólo
sacaba 45 precios de 113. Ese rastreador se ha quitado: si se dejara,
machacaría el fichero bueno cada día.

## Un aviso sobre el service worker

`web/sw.js` sirve los ficheros de `data/` con estrategia *cache first*: un
visitante que ya tenga la web cacheada seguirá viendo los precios y las fotos
anteriores hasta que se suba la versión de la caché (`CACHE = "voltieri-v40"`).
Subir esa versión es parte del despliegue de los datos nuevos.

## Referencias

- [Wikimedia Commons API](https://commons.wikimedia.org/w/api.php) — búsqueda de ficheros con `generator=search`, `prop=imageinfo`, `iiprop=url|extmetadata`.
- [Licencias Creative Commons](https://creativecommons.org/licenses/) — BY y BY-SA, las que se usan aquí.
- [Autocasión · coches nuevos](https://www.autocasion.com/coches-nuevos) — listado y precios.
- [ev-database.org](https://ev-database.org/) — RRP de Alemania usado como contrapeso.
