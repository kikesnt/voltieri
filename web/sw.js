// Voltieri — service worker: la web funciona sin cobertura.
const CACHE = "voltieri-v41";
const CORE = [
  "index.html", "herramientas.html", "productos.html", "aviso-legal.html", "privacidad.html", "afiliados.html", "planificador.html", "mapa-autonomia.html", "optimizador-carga.html", "carrera-ruta.html", "v2g-solar.html", "catalog.html", "compare.html", "finance.html", "sim.html", "routes.html", "service.html",
  "tool-shell.html", "range.html", "charge.html", "tco.html", "chargers.html", "components.html",
  "comparativas.html", "comparativa-cables-tipo2.html", "comparativa-wallbox-7400.html", "comparativa-adaptadores-ccs2.html", "comparativa-cargador-portatil.html", "comparativa-estaciones-22kw.html", "comparativa-v2l.html",
  "comparativa-inflador-neumaticos.html", "comparativa-soporte-cable.html", "comparativa-maleta-viaje.html", "comparativa-nevera-v2l.html", "comparativa-invierno.html",
  "blog/index.html", "blog/coches-electricos-baratos-espana-2026.html",
  "tokens.css", "components.css", "tools.css", "theme.js", "cookies.js", "cookies.html", "icon.svg", "logo.svg",
  "tools-data.js", "tools.js", "data-live.js", "routing.js", "car3d.js", "affiliate.js",
  "data/vehicles.txt", "data/specs.txt", "data/curves.txt", "data/chargers.txt",
  "data/pvpc.txt", "data/grid.txt", "data/provincias.txt", "data/market.txt", "data/ayudas.txt", "data/fuel.txt", "data/news.txt", "data/workshops.txt", "data/safety.txt", "api/data.json",
  "data/amazon-products.json", "data/affiliate-config.json", "data/amazon-api-status.json",
  "icon.svg", "manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Las páginas siempre a red primero: el HTML cambia con cada despliegue.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "reload" }).then(res => { // "reload": salta la caché HTTP, que servía HTML antiguo
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(event.request, copy));
        }
        return res;
      }).catch(() => caches.match(event.request).then(hit => hit || caches.match("index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(hit => hit || fetch(event.request).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(event.request, copy));
      }
      return res;
    }).catch(() => caches.match("index.html")))
  );
});
