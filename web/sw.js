// Voltieri — service worker: la web funciona sin cobertura.
const CACHE = "voltieri-v1";
const CORE = [
  "index.html", "hoja.html", "planificador.html", "mapa-autonomia.html", "catalog.html", "compare.html", "finance.html", "sim.html", "routes.html", "service.html",
  "tool-shell.html", "range.html", "charge.html", "tco.html", "chargers.html", "components.html",
  "tokens.css", "components.css", "tools.css",
  "tools-data.js", "tools.js", "data-live.js", "routing.js", "car3d.js",
  "data/vehicles.txt", "data/specs.txt", "data/curves.txt", "data/chargers.txt",
  "data/pvpc.txt", "data/fuel.txt", "data/news.txt", "data/workshops.txt", "data/safety.txt", "api/data.json",
  "icon.svg", "manifest.webmanifest"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
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
  event.respondWith(
    caches.match(event.request).then(hit => hit || fetch(event.request).then(res => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(event.request, copy));
      }
      return res;
    }).catch(() => caches.match("hoja.html")))
  );
});
