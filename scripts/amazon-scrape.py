#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Catálogo de productos de Amazon.es con Chrome headless. Gratis y local.

Portado del sistema de emergencia72h (tools/amazon_chrome.py + tools/fichas.py),
adaptado al catálogo de equipamiento de Voltieri:

  - Amazon devuelve 503 a urllib y a web_fetch (mitigación de bots), pero al
    renderizar la página con Chrome headless llega el HTML completo: hasta 60
    resultados por búsqueda, con ASIN, título, precio, nota, número de
    valoraciones e imagen.
  - Los anuncios patrocinados se descartan: se pagan y no sirven para comparar.
  - Una segunda pasada abre la ficha de cada producto candidato y saca lo que
    la búsqueda no da: la imagen en alta resolución, si está disponible, si
    llega en cuántos días y quién lo vende. De los tres, lo que decide si un
    producto entra en la comparativa es la imagen (que sea del producto), la
    nota (>= 4,4) y que llegue en condiciones normales.

Amazon corta el paso si se le acumulan peticiones, así que entre peticiones se
espera siempre (AMAZON_ESPACIO, 7 s por defecto) y se guarda en disco cada
20 elementos, para poder relanzar y continuar donde lo dejó.

    python3 scripts/amazon-scrape.py --fase busqueda
    python3 scripts/amazon-scrape.py --fase fichas
    python3 scripts/amazon-scrape.py --fase todo --reanudar
    python3 scripts/amazon-scrape.py --fase busqueda --solo inflador-neumaticos

Guarda en data/amazon-candidatos.json y data/amazon-fichas.json.
"""

import argparse
import html as htmllib
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DATA = RAIZ / "data"
CANDIDATOS = DATA / "amazon-candidatos.json"
FICHAS = DATA / "amazon-fichas.json"
CONSULTAS = RAIZ / "scripts" / "amazon-consultas.txt"
SELECCION = DATA / "amazon-seleccion.json"

CHROME = os.environ.get(
    "CHROME_BIN", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
DOMINIO = os.environ.get("AMAZON_DOMINIO", "www.amazon.es")
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36")

# Ritmo: Amazon bloquea por ráfaga, no por cuota. 7 s entre peticiones.
ESPACIO = float(os.environ.get("AMAZON_ESPACIO", "7"))
# Si se encadenan 5 bloqueos, se para la pasada: seguir insistiendo alarga el bloqueo.
MAX_BLOQUEOS = int(os.environ.get("AMAZON_MAX_BLOQUEOS", "5"))
GUARDAR_CADA = 20

_ultima = [0.0]


def _turno():
    """Espera a que le toque. Amazon no perdona las ráfagas."""
    espera = ESPACIO - (time.time() - _ultima[0])
    if espera > 0:
        time.sleep(espera)
    _ultima[0] = time.time()


def _chrome(url, budget=14000):
    """Renderiza una url con Chrome headless y devuelve el HTML."""
    with tempfile.TemporaryDirectory() as d:
        cmd = [
            CHROME, "--headless=new", "--disable-gpu", "--no-sandbox",
            "--disable-dev-shm-usage", "--hide-scrollbars",
            "--user-data-dir=" + d, "--virtual-time-budget=%d" % budget,
            "--window-size=1440,2400", "--run-all-compositor-stages-before-draw",
            "--user-agent=" + UA, "--dump-dom", url,
        ]
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        return p.stdout


def _numero(t):
    """'4,6' o '1.234' -> float. Amazon usa coma en España."""
    if t is None:
        return None
    t = str(t).replace("\xa0", " ").strip().replace("€", "").replace("%", "")
    t = t.replace(".", "").replace(",", ".")
    m = re.match(r"^-?\d+(\.\d+)?", t)
    if not m:
        return None
    try:
        return float(m.group(0))
    except ValueError:
        return None


def _limpiar(t):
    t = re.sub(r"<[^>]+>", " ", t or "")
    t = htmllib.unescape(t)
    return re.sub(r"\s+", " ", t).strip()


def _bloqueado(doc):
    if not doc:
        return True
    return ("Robot Check" in doc or "api-services-support@amazon.com" in doc
            or "s-search-result" not in doc and "landingImage" not in doc
            and "a-price" not in doc)


# ── fase 1: la búsqueda ────────────────────────────────────────────────────

RE_NOTA = re.compile(r'aria-label="([\d.,]+)\s*de\s*5\s*estrellas', re.I)
RE_NOTA_ALT = re.compile(r'class="a-icon-alt"[^>]*>\s*([\d.,]+)\s*de\s*5\s*estrellas', re.I)
RE_VAL = re.compile(r'aria-label="([\d.,]+)&nbsp;\s*(?:calificaciones|valoraciones|opciones|reseñas)', re.I)
RE_VAL_ALT = re.compile(r'class="a-size-base[^"]*s-underline-text[^"]*"[^>]*>\s*\(?([\d.,]+)\)?\s*<', re.I)


def _nota(tarjeta):
    m = RE_NOTA.search(tarjeta) or RE_NOTA_ALT.search(tarjeta)
    nota = _numero(m.group(1)) if m else None
    if nota is not None and not (0 < nota <= 5):
        nota = None
    m = RE_VAL.search(tarjeta) or RE_VAL_ALT.search(tarjeta)
    vals = _numero(m.group(1)) if m else None
    return (round(nota, 1) if nota else None, int(vals) if vals else None)


def _patrocinado(tarjeta):
    if "puis-sponsored-label" in tarjeta:
        return True
    h2 = re.search(r'<h2[^>]*aria-label="([^"]*)"', tarjeta)
    return bool(h2 and h2.group(1).lower().startswith("anuncio patrocinado"))


def parse_busqueda(html):
    """Las tarjetas de resultado de la página de búsqueda."""
    out = []
    for t in html.split('data-component-type="s-search-result"')[1:]:
        asin = re.search(r'data-asin="([A-Z0-9]{10})"', t)
        if not asin:
            continue
        asin = asin.group(1)
        h2 = re.search(r"<h2[^>]*>(.*?)</h2>", t, re.S)
        titulo = _limpiar(h2.group(1)) if h2 else ""
        if not titulo:
            continue
        pr = re.search(r'<span class="a-offscreen">\s*([^<]+?)\s*</span>', t)
        img = re.search(r'<img[^>]+class="[^"]*s-image[^"]*"[^>]+src="([^"]+)"', t)
        nota, vals = _nota(t)
        out.append({
            "asin": asin,
            "titulo": titulo[:200],
            "precio": _numero(pr.group(1)) if pr else None,
            "imagen": img.group(1) if img else "",
            "url": "https://%s/dp/%s" % (DOMINIO, asin),
            "nota": nota,
            "valoraciones": vals,
            "patrocinado": _patrocinado(t),
            "fecha": time.strftime("%Y-%m-%d"),
        })
    return out


def url_busqueda(q, dept=""):
    params = {"k": q}
    if dept:
        params["i"] = dept
    return "https://%s/s?%s" % (DOMINIO, urllib.parse.urlencode(params))


def leer_consultas():
    """categoria<TAB>consulta, una por línea."""
    filas = []
    for linea in CONSULTAS.read_text(encoding="utf-8").splitlines():
        linea = linea.strip()
        if not linea or linea.startswith("#"):
            continue
        if "\t" in linea:
            cat, q = linea.split("\t", 1)
        else:
            cat, q = "sin-categoria", linea
        filas.append((cat.strip(), q.strip()))
    return filas


def cargar(ruta, vacio):
    if ruta.exists():
        return json.loads(ruta.read_text(encoding="utf-8"))
    return vacio


def guardar(ruta, obj):
    DATA.mkdir(parents=True, exist_ok=True)
    ruta.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")


def fase_busqueda(args):
    datos = cargar(CANDIDATOS, {"generado": "", "consultas": {}, "candidatos": {}})
    consultas = leer_consultas()
    if args.solo:
        consultas = [c for c in consultas if c[0] in args.solo.split(",")]
    bloqueos = 0
    for cat, q in consultas:
        key = "%s::%s" % (cat, q)
        if key in datos["consultas"] and not args.rehacer:
            continue
        _turno()
        try:
            html = _chrome(url_busqueda(q))
        except Exception as e:  # noqa: BLE001
            print("  ERROR %s: %s" % (key, e), flush=True)
            bloqueos += 1
            if bloqueos >= MAX_BLOQUEOS:
                print("Se para la pasada: %d bloqueos seguidos." % bloqueos, flush=True)
                break
            continue
        if _bloqueado(html):
            print("  BLOQUEADO %s" % key, flush=True)
            bloqueos += 1
            if bloqueos >= MAX_BLOQUEOS:
                print("Se para la pasada: %d bloqueos seguidos." % bloqueos, flush=True)
                break
            time.sleep(ESPACIO * 3)
            continue
        bloqueos = 0
        res = parse_busqueda(html)
        organic = [r for r in res if not r["patrocinado"]]
        datos["consultas"][key] = {
            "categoria": cat, "consulta": q, "fecha": time.strftime("%Y-%m-%d"),
            "resultados": len(res), "organicos": len(organic),
        }
        for r in organic:
            r["consulta"] = q
            r["categoria"] = cat
            datos["candidatos"].setdefault(r["asin"], r)
        print("  OK %-18s %2d orgánicos  «%s»" % (cat, len(organic), q), flush=True)
        if len(datos["candidatos"]) % GUARDAR_CADA == 0:
            guardar(CANDIDATOS, datos)
    datos["generado"] = time.strftime("%Y-%m-%d %H:%M")
    guardar(CANDIDATOS, datos)
    print("Candidatos: %d ASIN" % len(datos["candidatos"]), flush=True)


# ── fase 2: la ficha del producto ──────────────────────────────────────────

RE_HIRES = re.compile(r'data-old-hires="(https://m\.media-amazon\.com/images/I/[^"]+)"')
RE_LANDING = re.compile(r'id="landingImage"[^>]*src="(https://m\.media-amazon\.com/images/I/[^"]+)"')
RE_DYN = re.compile(r'"hiRes":"(https://m\.media-amazon\.com/images/I/[^"]+)"')
RE_PRECIO = re.compile(r'class="a-price-whole">([\d.,]+)</span>.{0,400}?class="a-price-fraction">([\d.,]+)</span>', re.S)
RE_PRECIO_ALT = re.compile(r'class="a-offscreen">\s*([\d.,]+)\s*(?:&nbsp;|\s)*€')
RE_NOTA_FICHA = re.compile(r'id="acrPopover"[^>]*title="([\d.,]+)\s*de\s*5', re.I)
RE_REVIEWS = re.compile(r'id="acrCustomerReviewText"[^>]*>([^<]+)<')
RE_VENDEDOR = re.compile(r'id="sellerProfileTriggerId"[^>]*>([^<]+)<')
RE_DISPONIBLE = re.compile(r'id="add-to-cart-button"')
RE_NO_DISPONIBLE = re.compile(r'id="out-of-stock"|Currently unavailable', re.I)
RE_ENTREGA = re.compile(r'(?:Entrega|delivery)[^<]{0,120}', re.I)
RE_VENDEDOR_AMAZON = re.compile(r"Vendido y enviado por Amazon|Sold by Amazon", re.I)


def _tamano_imagen(url, ancho=500):
    """Amazon permite pedir otro tamaño de la misma imagen.

    Hay dos formatos de URL: "X._AC_SL1500_.jpg" (con presupuesto de
    contenido) y "X._SL1500_.jpg" (sin él). El prefijo se conserva: si se
    cambia, la CDN responde 404 y la tarjeta se queda sin foto.
    """
    m = re.match(r"(https://m\.media-amazon\.com/images/I/[^.]+)\.((?:_AC)?_SL\d+_)?\.(jpg|png|webp)", url)
    if not m:
        return url
    sufijo = re.sub(r"_SL\d+_", "_SL%d_" % ancho, m.group(2) or "")
    return "%s.%s.%s" % (m.group(1), sufijo, m.group(3))


def comprobar_imagen(url):
    """Comprueba que la imagen existe y devuelve la que responde."""
    if not url:
        return None
    for cand in (_tamano_imagen(url), url):
        try:
            req = urllib.request.Request(cand, method="HEAD", headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=20) as r:
                if r.status == 200 and int(r.headers.get("Content-Length") or 0) > 2000:
                    return cand
        except Exception:  # noqa: BLE001
            continue
    return None


def parse_ficha(html, asin):
    """Lo que la búsqueda no da: imagen grande, disponibilidad, entrega y vendedor."""
    out = {"asin": asin, "fecha": time.strftime("%Y-%m-%d")}

    hires = RE_HIRES.search(html) or RE_DYN.search(html)
    img = hires.group(1) if hires else ""
    if not img:
        m = RE_LANDING.search(html)
        img = m.group(1) if m else ""
    out["imagen_hires"] = img

    m = RE_PRECIO.search(html)
    if m:
        out["precio"] = _numero(m.group(1) + "," + m.group(2))
    else:
        m = RE_PRECIO_ALT.search(html)
        out["precio"] = _numero(m.group(1)) if m else None

    m = RE_NOTA_FICHA.search(html)
    out["nota"] = round(_numero(m.group(1)), 1) if m and _numero(m.group(1)) else None
    m = RE_REVIEWS.search(html)
    out["valoraciones"] = int(_numero(m.group(1))) if m and _numero(m.group(1)) else None

    # Disponible es el boton de comprar: Amazon escribe "No disponible" en
    # paginas que si se compran (variantes, otros sellers), asi que el boton
    # manda y el texto solo cuenta cuando el boton no esta.
    if RE_DISPONIBLE.search(html):
        out["disponible"] = True
    elif RE_NO_DISPONIBLE.search(html):
        out["disponible"] = False
    else:
        out["disponible"] = None

    m = RE_VENDEDOR.search(html)
    out["vendedor"] = _limpiar(m.group(1)) if m else ""
    out["vendedor_amazon"] = bool(RE_VENDEDOR_AMAZON.search(html))

    entrega = ""
    m = RE_ENTREGA.search(html)
    if m:
        entrega = _limpiar(m.group(0))[:120]
    out["entrega"] = entrega
    dias = re.findall(r"entre el (\d{1,2}) de ([a-z]+) y el (\d{1,2}) de ([a-z]+)", entrega, re.I)
    out["dias_entrega"] = None
    return out


def fase_seleccion(args):
    """Los candidatos que merecen ficha: por categoría, los mejor valorados.

    El corte es a 4,3 ★ (el mínimo de publicación es 4,4) para que la lista
    tenga margen y el filtro final pueda descartar sin quedarse corta.
    """
    datos = cargar(CANDIDATOS, {"candidatos": {}})
    por_cat = {}
    for asin, c in datos.get("candidatos", {}).items():
        nota = c.get("nota") or 0
        if nota < 4.3:
            continue
        por_cat.setdefault(c.get("categoria", "sin-categoria"), []).append(c)
    seleccion = {}
    for cat, items in por_cat.items():
        items.sort(key=lambda r: (-(r.get("nota") or 0), -(r.get("valoraciones") or 0)))
        # El mismo producto puede salir en varias categorías; la ficha es una.
        for r in items[:args.por_categoria]:
            seleccion[r["asin"]] = r["categoria"]
        print("  %-18s %3d candidatos -> %2d a ficha" % (
            cat, len(items), min(len(items), args.por_categoria)), flush=True)
    guardar(SELECCION, {"generado": time.strftime("%Y-%m-%d %H:%M"), "seleccion": seleccion})
    # Los productos que ya estaban curados a mano tambien necesitan ficha:
    # de ella sale la imagen en alta resolucion y el precio actualizado.
    try:
        cat = json.loads((RAIZ / "web" / "data" / "amazon-products.json").read_text(encoding="utf-8"))
        for c in cat.get("categories", []):
            for p in c.get("products", []):
                if p.get("asin") and p["asin"] not in seleccion:
                    seleccion[p["asin"]] = c["id"]
                    print("  + manual %s (%s)" % (p["asin"], c["id"]), flush=True)
    except Exception as e:  # noqa: BLE001
        print("  (sin catálogo local: %s)" % e, flush=True)
    # Lo que el curado editorial de scripts/amazon-curado.json elige siempre
    # necesita ficha: de ella sale la imagen en alta resolución.
    try:
        curado = json.loads((RAIZ / "scripts" / "amazon-curado.json").read_text(encoding="utf-8"))
        for cat, lista in curado.items():
            if cat.startswith("_"):
                continue
            for item in lista:
                asin = item if isinstance(item, str) else item.get("asin")
                if asin and asin not in seleccion:
                    seleccion[asin] = cat
                    print("  + curado %s (%s)" % (asin, cat), flush=True)
    except Exception as e:  # noqa: BLE001
        print("  (sin curado: %s)" % e, flush=True)
    guardar(SELECCION, {"generado": time.strftime("%Y-%m-%d %H:%M"), "seleccion": seleccion})
    print("Selección: %d ASIN" % len(seleccion), flush=True)


def fase_fichas(args):
    datos = cargar(CANDIDATOS, {"candidatos": {}})
    fichas = cargar(FICHAS, {"generado": "", "fichas": {}})
    sel = cargar(SELECCION, {}).get("seleccion", {})
    if sel:
        asins = list(sel.keys())
    else:
        asins = list(datos.get("candidatos", {}).keys())
    if args.solo:
        cats = set(args.solo.split(","))
        asins = [a for a in asins if datos["candidatos"][a].get("categoria") in cats]
    if args.limite:
        asins = asins[:args.limite]
    bloqueos = 0
    for i, asin in enumerate(asins, 1):
        if asin in fichas["fichas"] and not args.rehacer:
            continue
        _turno()
        try:
            html = _chrome("https://%s/dp/%s" % (DOMINIO, asin))
        except Exception as e:  # noqa: BLE001
            print("  ERROR %s: %s" % (asin, e), flush=True)
            bloqueos += 1
            if bloqueos >= MAX_BLOQUEOS:
                print("Se para la pasada: %d bloqueos seguidos." % bloqueos, flush=True)
                break
            continue
        if "Robot Check" in html or "api-services-support" in html:
            print("  BLOQUEADO %s" % asin, flush=True)
            bloqueos += 1
            if bloqueos >= MAX_BLOQUEOS:
                print("Se para la pasada: %d bloqueos seguidos." % bloqueos, flush=True)
                break
            time.sleep(ESPACIO * 3)
            continue
        bloqueos = 0
        f = parse_ficha(html, asin)
        c = datos.get("candidatos", {}).get(asin, {})
        if not c.get("titulo"):
            # Producto curado a mano: su titulo esta en el catalogo local.
            try:
                cat = json.loads((RAIZ / "web" / "data" / "amazon-products.json").read_text(encoding="utf-8"))
                for cc in cat.get("categories", []):
                    for pp in cc.get("products", []):
                        if pp.get("asin") == asin:
                            c = dict(c, titulo=pp.get("titulo") or pp.get("title"), categoria=cc["id"])
            except Exception:  # noqa: BLE001
                pass
        f["titulo"] = c.get("titulo")
        f["categoria"] = c.get("categoria")
        f["consulta"] = c.get("consulta")
        f["precio_busqueda"] = c.get("precio")
        f["nota_busqueda"] = c.get("nota")
        f["valoraciones_busqueda"] = c.get("valoraciones")
        f["imagen_busqueda"] = c.get("imagen")
        f["imagen"] = comprobar_imagen(f.get("imagen_hires") or c.get("imagen") or "")
        fichas["fichas"][asin] = f
        print("  %3d/%d %s  nota %s  %s%s" % (
            i, len(asins), asin, f.get("nota") or "-",
            (f.get("imagen") or "SIN IMAGEN")[:52],
            "" if f.get("disponible") is not False else "  NO DISPONIBLE"), flush=True)
        if i % GUARDAR_CADA == 0:
            fichas["generado"] = time.strftime("%Y-%m-%d %H:%M")
            guardar(FICHAS, fichas)
    fichas["generado"] = time.strftime("%Y-%m-%d %H:%M")
    guardar(FICHAS, fichas)
    print("Fichas: %d" % len(fichas["fichas"]), flush=True)


def fase_imagenes(args):
    """Rehace y comprueba la URL de la foto de cada producto.

    No vuelve a abrir Amazon: solo comprueba las direcciones de la CDN. Sirve
    para corregir el tamaño (500 px) y para detectar fotos que han dejado de
    existir, sin gastar una hora de raspado.
    """
    fichas = cargar(FICHAS, {"fichas": {}})
    cambiados = 0
    caidos = 0
    for asin, f in list(fichas.get("fichas", {}).items()):
        origen = f.get("imagen_hires") or f.get("imagen_busqueda") or f.get("imagen") or ""
        if not origen:
            continue
        nueva = comprobar_imagen(origen)
        if not nueva:
            caidos += 1
            f["imagen"] = ""
            print("  SIN FOTO %s" % asin, flush=True)
            continue
        if nueva != f.get("imagen"):
            cambiados += 1
            f["imagen"] = nueva
    fichas["generado"] = time.strftime("%Y-%m-%d %H:%M")
    guardar(FICHAS, fichas)
    print("Imágenes: %d ajustadas, %d sin foto" % (cambiados, caidos), flush=True)


def main():
    ap = argparse.ArgumentParser(description="Catálogo de Amazon.es con Chrome headless")
    ap.add_argument("--fase", choices=["busqueda", "seleccion", "fichas", "imagenes", "todo"], default="todo")
    ap.add_argument("--solo", default="", help="categorías separadas por comas")
    ap.add_argument("--limite", type=int, default=0, help="máximo de fichas")
    ap.add_argument("--por-categoria", type=int, default=12, help="candidatos por categoría que van a ficha")
    ap.add_argument("--reanudar", action="store_true", default=True)
    ap.add_argument("--rehacer", action="store_true", help="vuelve a hacer lo ya hecho")
    args = ap.parse_args()
    if args.fase in ("busqueda", "todo"):
        print("== Búsqueda ==", flush=True)
        fase_busqueda(args)
    if args.fase in ("seleccion", "todo"):
        print("== Selección ==", flush=True)
        fase_seleccion(args)
    if args.fase in ("fichas", "todo"):
        print("== Fichas ==", flush=True)
        fase_fichas(args)
    if args.fase == "imagenes":
        # Solo a mano: comprueba 191 URLs y Amazon no es un servidor de ficheros.
        print("== Imágenes ==", flush=True)
        fase_imagenes(args)


if __name__ == "__main__":
    main()
