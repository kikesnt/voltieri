// Modo Auto/Día/Noche para las páginas que no llevan su propio script de tema.
(() => {
  const K = "voltieri-theme", mql = matchMedia("(prefers-color-scheme: dark)"), root = document.documentElement;
  const pref = () => localStorage.getItem(K) || "auto";
  const apply = () => {
    root.dataset.theme = pref() === "auto" ? (mql.matches ? "night" : "day") : pref();
    document.querySelectorAll(".modes button").forEach(b => { const on = b.dataset.mode === pref(); b.classList.toggle("active", on); b.setAttribute("aria-pressed", on); });
  };
  apply(); // en <head>: evita el parpadeo
  mql.addEventListener?.("change", apply);
  addEventListener("DOMContentLoaded", () => {
    const h = document.querySelector("header");
    if (h && !h.querySelector(".modes")) h.insertAdjacentHTML("beforeend", '<div class="modes" role="group" aria-label="Modo de pantalla"><button type="button" data-mode="auto">Auto</button><button type="button" data-mode="day">Día</button><button type="button" data-mode="night">Noche</button></div>');
    document.addEventListener("click", e => { const b = e.target.closest(".modes button"); if (b) { localStorage.setItem(K, b.dataset.mode); apply(); } });
    apply();
  });
})();
