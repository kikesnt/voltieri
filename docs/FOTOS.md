# Fotos de producto

Las tarjetas usan el campo `image` de cada producto en
`web/data/amazon-products.json`. Si está vacío, se prueba el widget de imágenes
de Asociados, que puede no cargar.

## De dónde sale la imagen

La imagen es la del propio producto en su página de Amazon.es, y se pide
automáticamente en la fase de fichas del scrape:

1. De la página del producto se lee la imagen grande (`data-old-hires`).
2. Se pide a la CDN de Amazon el mismo tamaño de siempre (`_AC_SL500_`), para
   que todas las tarjetas pesen lo mismo.
3. Se comprueba que la URL responde (HTTP 200 y un mínimo de 2 KB): si no,
   se cae a la miniatura del resultado de búsqueda y, si tampoco, a la ficha
   del producto sin imagen.

Las fotos solo se cargan si la persona acepta en el aviso de cookies.

```bash
# rehacer la foto de un producto suelto
python3 scripts/amazon-scrape.py --fase fichas --rehacer
```

## A mano

Si un producto no trae imagen, en Amazon.es, con la sesión de Asociados
iniciada, abre el producto, pulsa **SiteStripe > Imagen** (o "Solo imagen") y
copia la URL de la imagen. Pégala en `image`. Solo se aceptan URLs
`https://m.media-amazon.com/…`, `https://images-eu.ssl-images-amazon.com/…` o
`https://ws-eu.amazon-adsystem.com/…`.

**Con la Creators API:** `scripts/update-amazon-products.mjs` rellena `image`
solo cuando la API responda (ahora 403 AssociateNotEligible).

## La tabla

`node scripts/import-scrape.mjs --tabla` imprime la tabla de abajo con el
catálogo actual.
| Categoría | ASIN | Producto | Imagen | Abrir |
|---|---|---|---|---|
| Cables Tipo 2 | `B0CQY54JDW` | MCEVKELN Cable Tipo 2 11 kW · 7 m · trifásico | propia | [amazon.es](https://www.amazon.es/dp/B0CQY54JDW) |
| Cables Tipo 2 | `B0FK4CP262` | ELEGRP Cable Tipo 2 22 kW · 5 m · 32 A trifásico | propia | [amazon.es](https://www.amazon.es/dp/B0FK4CP262) |
| Cables Tipo 2 | `B0CN2Q246Y` | GONEO Cable Tipo 2 22 kW · 5 m · 32 A trifásico | propia | [amazon.es](https://www.amazon.es/dp/B0CN2Q246Y) |
| Cables Tipo 2 | `B0CN2Q1GDS` | GONEO Cable Tipo 2 11 kW · 5 m · 16 A trifásico | propia | [amazon.es](https://www.amazon.es/dp/B0CN2Q1GDS) |
| Cables Tipo 2 | `B0DT6WYJH4` | bokman EV Cable Tipo 2 7,4 kW · 5 m | propia | [amazon.es](https://www.amazon.es/dp/B0DT6WYJH4) |
| Cables Tipo 2 | `B0CKSG4G98` | bokman EV Cable Tipo 2 22 kW · 5 m | propia | [amazon.es](https://www.amazon.es/dp/B0CKSG4G98) |
| Cables Tipo 2 | `B0CRR369BM` | Ezgogo Cable Tipo 2 32 A · 22 kW · 5 m | propia | [amazon.es](https://www.amazon.es/dp/B0CRR369BM) |
| Cables Tipo 2 | `B0DMNSBF55` | tomons Cable Tipo 2 22 kW · 7 m · 32 A trifásico | propia | [amazon.es](https://www.amazon.es/dp/B0DMNSBF55) |
| Wallbox 7,4 kW | `B0F7QL6THK` | dé Wallbox 7,4 kW con app · cable 7,5 m | propia | [amazon.es](https://www.amazon.es/dp/B0F7QL6THK) |
| Wallbox 7,4 kW | `B0FXH4FG2Z` | dé Mobile Wallbox 11 kW · app · cable 7 m | propia | [amazon.es](https://www.amazon.es/dp/B0FXH4FG2Z) |
| Wallbox 7,4 kW | `B0F66SBFVZ` | AIMILER Cargador 11 kW trifásico · app · OLED | propia | [amazon.es](https://www.amazon.es/dp/B0F66SBFVZ) |
| Wallbox 7,4 kW | `B0DTHYC2RD` | Wallbox 7,4 kW con app · 6 m | propia | [amazon.es](https://www.amazon.es/dp/B0DTHYC2RD) |
| Wallbox 7,4 kW | `B0DJTYBY2W` | Wallbox 7,4 kW · cable 7,5 m | propia | [amazon.es](https://www.amazon.es/dp/B0DJTYBY2W) |
| Wallbox 7,4 kW | `B0G7WY45P6` | Wallbox 7,4 kW · 7 m · 6–32 A | propia | [amazon.es](https://www.amazon.es/dp/B0G7WY45P6) |
| Wallbox 7,4 kW | `B0CTCL7RRB` | Wallbox 7,4 kW con RCD tipo A + 6 mA CC | propia | [amazon.es](https://www.amazon.es/dp/B0CTCL7RRB) |
| Adaptadores CCS2 | `B0FH597FVT` | Adaptador CCS1 a CCS2 · 1000 V · 250 A | propia | [amazon.es](https://www.amazon.es/dp/B0FH597FVT) |
| Adaptadores CCS2 | `B0D1JYR1S9` | Adaptador Tipo 1 a Tipo 2 · SAE J1772 | propia | [amazon.es](https://www.amazon.es/dp/B0D1JYR1S9) |
| Adaptadores CCS2 | `B0G5X3LZ95` | Adaptador CCS1 a CCS2 · 1000 V · 400 A | propia | [amazon.es](https://www.amazon.es/dp/B0G5X3LZ95) |
| Adaptadores CCS2 | `B0D1G9R7NJ` | Adaptador Tipo 2 a NACS · 60 A | propia | [amazon.es](https://www.amazon.es/dp/B0D1G9R7NJ) |
| Adaptadores CCS2 | `B0CJ536JSN` | Adaptador CCS2 a CCS1 · 1000 V · 500 A | propia | [amazon.es](https://www.amazon.es/dp/B0CJ536JSN) |
| Cargadores portátiles | `B0G7XX3XR3` | EzGoGo Cargador portátil 3,7 kW · 7 m · 6–16 A | propia | [amazon.es](https://www.amazon.es/dp/B0G7XX3XR3) |
| Cargadores portátiles | `B0CQK3VXQ4` | Cargador portátil Tipo 2 · 3,6 kW · 6 m con bolsa | propia | [amazon.es](https://www.amazon.es/dp/B0CQK3VXQ4) |
| Cargadores portátiles | `B0C8SFXJHM` | Cargador Schuko 3,7 kW · 6 m | propia | [amazon.es](https://www.amazon.es/dp/B0C8SFXJHM) |
| Cargadores portátiles | `B0H33CGXZM` | Junsun Cargador EV portátil 3,6 kW · 6–16 A | propia | [amazon.es](https://www.amazon.es/dp/B0H33CGXZM) |
| Cargadores portátiles | `B0DGT8PRHH` | Cargador Schuko 3,7 kW · 7 m con app | propia | [amazon.es](https://www.amazon.es/dp/B0DGT8PRHH) |
| Cargadores portátiles | `B0FKGT9Q5M` | Cargador EV Tipo 2 portátil 3,6 kW · 8–16 A | propia | [amazon.es](https://www.amazon.es/dp/B0FKGT9Q5M) |
| Cargadores portátiles | `B0FPM7K4TF` | GONEO Schuko 3,68 kW · sensor de temperatura | propia | [amazon.es](https://www.amazon.es/dp/B0FPM7K4TF) |
| Cargadores portátiles | `B0G7XK241Q` | Cargador 3,7 kW · 7 m · 6–16 A con LCD | propia | [amazon.es](https://www.amazon.es/dp/B0G7XK241Q) |
| Estaciones 22 kW | `B0GLP11DQQ` | Wallbox 22 kW · 6–32 A trifásico · app · 6 m | propia | [amazon.es](https://www.amazon.es/dp/B0GLP11DQQ) |
| Estaciones 22 kW | `B0DL8P9BRH` | dé Cargador 22 kW · 7 m · 6–32 A trifásico | propia | [amazon.es](https://www.amazon.es/dp/B0DL8P9BRH) |
| Estaciones 22 kW | `B0GLPC3PJN` | AIMILER Wallbox 11 kW trifásico · app · 7,6 m | propia | [amazon.es](https://www.amazon.es/dp/B0GLPC3PJN) |
| Estaciones 22 kW | `B0DHQXPM78` | Wallbox 22 kW app · 7,5 m · RFID | propia | [amazon.es](https://www.amazon.es/dp/B0DHQXPM78) |
| Estaciones 22 kW | `B0GN275JWS` | Wallbox 22 kW con app · 400 V · 6–32 A · 8 m | propia | [amazon.es](https://www.amazon.es/dp/B0GN275JWS) |
| Adaptadores V2L | `B0GX5ZPSK1` | Adaptador V2L XPeng · 3,5 kW · 16 A · IP54 | propia | [amazon.es](https://www.amazon.es/dp/B0GX5ZPSK1) |
| Adaptadores V2L | `B0D4Z6N488` | Adaptador Tipo 2 a Schuko · 3,5 kW · 16 A · 70 cm | propia | [amazon.es](https://www.amazon.es/dp/B0D4Z6N488) |
| Adaptadores V2L | `B0DYV2BG8D` | JULIK Adaptador V2L Atto 3, Dolphin, Seal · 3,5 kW | propia | [amazon.es](https://www.amazon.es/dp/B0DYV2BG8D) |
| Adaptadores V2L | `B0DCJRB2M2` | Adaptador V2L para Smart · 10 A · vehículo a enchufe | propia | [amazon.es](https://www.amazon.es/dp/B0DCJRB2M2) |
| Adaptadores V2L | `B0DM4TTP6H` | Adaptador de descarga V2L · 3,5 kW · 16 A · 220 V | propia | [amazon.es](https://www.amazon.es/dp/B0DM4TTP6H) |
| Infladores y medidores de presión | `B0D17RJP1T` | ETENWOLF Zephyr S3 · 7800 mAh · 11,03 bar | propia | [amazon.es](https://www.amazon.es/dp/B0D17RJP1T) |
| Infladores y medidores de presión | `B0D6BQV9JL` | ETENWOLF T500 · manómetro digital · 0-17,24 bar | propia | [amazon.es](https://www.amazon.es/dp/B0D6BQV9JL) |
| Infladores y medidores de presión | `B0GSV4CR98` | Xiaomi Mijia Compact · compresor portátil | propia | [amazon.es](https://www.amazon.es/dp/B0GSV4CR98) |
| Infladores y medidores de presión | `B0CBBP8BQX` | Xiaomi Portable Air Compressor 2 · inflador portátil | propia | [amazon.es](https://www.amazon.es/dp/B0CBBP8BQX) |
| Infladores y medidores de presión | `B0DLBGZG3N` | Xiaomi Air Compressor 2 Pro · 11,03 bar | propia | [amazon.es](https://www.amazon.es/dp/B0DLBGZG3N) |
| Infladores y medidores de presión | `B07Y9HS7GT` | AstroAI Manómetro digital · pilas AAA | propia | [amazon.es](https://www.amazon.es/dp/B07Y9HS7GT) |
| Infladores y medidores de presión | `B0D3KM6T9T` | Oasser Compresor portátil · 150 PSI · 4000 mAh | propia | [amazon.es](https://www.amazon.es/dp/B0D3KM6T9T) |
| Infladores y medidores de presión | `B07D3PVBJ4` | AstroAI Inflador digital · 250 PSI · con manómetro | propia | [amazon.es](https://www.amazon.es/dp/B07D3PVBJ4) |
| Bolsas, soportes y candados para el cable | `B0CZLHY8CP` | Soporte de pared tipo 2 · organizador de cable | propia | [amazon.es](https://www.amazon.es/dp/B0CZLHY8CP) |
| Bolsas, soportes y candados para el cable | `B09XF6HC5N` | igadgitz Xtra U7225 · funda para cable de carga | propia | [amazon.es](https://www.amazon.es/dp/B09XF6HC5N) |
| Bolsas, soportes y candados para el cable | `B09ZVLQWRW` | Wallbox Soporte de pared · tipo 2 · ahorra espacio | propia | [amazon.es](https://www.amazon.es/dp/B09ZVLQWRW) |
| Bolsas, soportes y candados para el cable | `B07FW3GTXB` | Alex Tech Manguito de cable · auto-cierre · 3,1 m | propia | [amazon.es](https://www.amazon.es/dp/B07FW3GTXB) |
| Bolsas, soportes y candados para el cable | `B09HL225ZY` | Adiwo Soporte de pared · cable de carga tipo 2 | propia | [amazon.es](https://www.amazon.es/dp/B09HL225ZY) |
| Bolsas, soportes y candados para el cable | `B0BXXBPSK1` | MCEVKELN Soporte de pared · cable de carga tipo 2 | propia | [amazon.es](https://www.amazon.es/dp/B0BXXBPSK1) |
| Bolsas, soportes y candados para el cable | `B08T1ML1P3` | Green Cell EV PowerCase · funda para cable tipo 2 | propia | [amazon.es](https://www.amazon.es/dp/B08T1ML1P3) |
| Bolsas, soportes y candados para el cable | `B0CB76N7NJ` | Soporte de cargador tipo 2 con candado · IEC 62196-2 | propia | [amazon.es](https://www.amazon.es/dp/B0CB76N7NJ) |
| Maletas y organizadores de viaje | `B09ZHVSV9V` | K KNODEL Organizador de maletero · mini | propia | [amazon.es](https://www.amazon.es/dp/B09ZHVSV9V) |
| Maletas y organizadores de viaje | `B00Q6ZZPP8` | achilles Organizador de maletero · XL · con bolsillo de red | propia | [amazon.es](https://www.amazon.es/dp/B00Q6ZZPP8) |
| Maletas y organizadores de viaje | `B07N142RPC` | Praknu Organizador de maletero · 45 L · 3 compartimentos | propia | [amazon.es](https://www.amazon.es/dp/B07N142RPC) |
| Maletas y organizadores de viaje | `B0D7VVD348` | FORTEM Organizador de maletero · 50 L · plegable | propia | [amazon.es](https://www.amazon.es/dp/B0D7VVD348) |
| Maletas y organizadores de viaje | `B0H2J1JY8K` | Oasser Organizador de maletero · 95 L · con bolsa nevera | propia | [amazon.es](https://www.amazon.es/dp/B0H2J1JY8K) |
| Maletas y organizadores de viaje | `B07Q32LFQ3` | FORTEM Organizador de maletero · 105 L · con bolsa térmica | propia | [amazon.es](https://www.amazon.es/dp/B07Q32LFQ3) |
| Maletas y organizadores de viaje | `B0GR8CLV3D` | Einesin Bolsa de herramientas de fieltro · 40 × 15 × 25 cm | propia | [amazon.es](https://www.amazon.es/dp/B0GR8CLV3D) |
| Maletas y organizadores de viaje | `B0999JVT25` | EINESIN Red de almacenamiento · organizador de maletero | propia | [amazon.es](https://www.amazon.es/dp/B0999JVT25) |
| Neveras de 12 V y accesorios V2L | `B0DYV2BG8D` | JULIK Adaptador V2L · Atto 3, Dolphin, Seal · 3,5 kW | propia | [amazon.es](https://www.amazon.es/dp/B0DYV2BG8D) |
| Neveras de 12 V y accesorios V2L | `B0DT4RMS4R` | Berger Nevera termoeléctrica · 25 L · 12/230 V | propia | [amazon.es](https://www.amazon.es/dp/B0DT4RMS4R) |
| Neveras de 12 V y accesorios V2L | `B09WB4112V` | KESSER Nevera de compresor · 50 L · con app | propia | [amazon.es](https://www.amazon.es/dp/B09WB4112V) |
| Neveras de 12 V y accesorios V2L | `B0FVLVVSKZ` | AAOBOSI Nevera portátil · 50 L · 12 V/230 V · IPX4 | propia | [amazon.es](https://www.amazon.es/dp/B0FVLVVSKZ) |
| Neveras de 12 V y accesorios V2L | `B0BNVKHBDQ` | AAOBOSI Nevera portátil · 75 L · 12 V/230 V · IPX4 | propia | [amazon.es](https://www.amazon.es/dp/B0BNVKHBDQ) |
| Neveras de 12 V y accesorios V2L | `B01DHXYHVE` | TZS First Austria Nevera eléctrica · 32 L · 12 V/230 V | propia | [amazon.es](https://www.amazon.es/dp/B01DHXYHVE) |
| Neveras de 12 V y accesorios V2L | `B08HMLNN91` | Alpicool K25 · nevera de viaje · 25 L · 12/24 V | propia | [amazon.es](https://www.amazon.es/dp/B08HMLNN91) |
| Neveras de 12 V y accesorios V2L | `B0B8W9WHBX` | BINGI Nevera de compresor · 12,8 L · 12 V/220 V | propia | [amazon.es](https://www.amazon.es/dp/B0B8W9WHBX) |
| Cubiertas y raspadores de invierno | `B0HDBBZV2Q` | Cubierta de parabrisas de invierno · 240 × 148 cm · 5 capas | propia | [amazon.es](https://www.amazon.es/dp/B0HDBBZV2Q) |
| Cubiertas y raspadores de invierno | `B0FLQ3KBNC` | Fiskars Raspador de hielo Solid · 26 cm | propia | [amazon.es](https://www.amazon.es/dp/B0FLQ3KBNC) |
| Cubiertas y raspadores de invierno | `B0CQ2J1FDV` | NIGRIN Raspador de hielo · mango ergonómico | propia | [amazon.es](https://www.amazon.es/dp/B0CQ2J1FDV) |
| Cubiertas y raspadores de invierno | `B006GD9UWE` | Carpoint Raspador de hielo Vileda | propia | [amazon.es](https://www.amazon.es/dp/B006GD9UWE) |
| Cubiertas y raspadores de invierno | `B0GFCW3ZSR` | Protector de parabrisas antihielo · magnético | propia | [amazon.es](https://www.amazon.es/dp/B0GFCW3ZSR) |
| Cubiertas y raspadores de invierno | `B0DD7MK8LC` | Parasol y protector de parabrisas · 116 × 160 cm | propia | [amazon.es](https://www.amazon.es/dp/B0DD7MK8LC) |
| Cubiertas y raspadores de invierno | `B01MTNYWUR` | Raspador de hielo Murska · 2 piezas | propia | [amazon.es](https://www.amazon.es/dp/B01MTNYWUR) |
| Cubiertas y raspadores de invierno | `B077RQ6WKQ` | Tevlaphee Protector magnético de parabrisas · 197 × 128 cm | propia | [amazon.es](https://www.amazon.es/dp/B077RQ6WKQ) |
