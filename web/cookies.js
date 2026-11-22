// Aviso de cookies y almacenamiento. Elección guardada en localStorage ("all" | "necessary").
// "all" carga las imágenes de producto de Amazon (servidores de terceros que pueden usar cookies propias).
(() => {
  const K = "voltieri-consent";
  if (localStorage.getItem(K)) return;
  const link = location.pathname.includes("/blog/") ? "../cookies.html" : "cookies.html";
  addEventListener("DOMContentLoaded", () => {
    const bar = document.createElement("div");
    bar.className = "cookie-bar"; bar.setAttribute("role", "region"); bar.setAttribute("aria-label", "Aviso de cookies");
    bar.innerHTML = `<p>Solo usamos almacenamiento técnico: tu modo de pantalla y la caché sin conexión. Las imágenes de producto vienen de Amazon, que puede usar sus propias cookies, y solo se cargan si aceptas. <a href="${link}">Más información</a></p><div><button type="button" data-c="necessary">Solo necesarias</button><button type="button" data-c="all" class="primary">Aceptar todo</button></div>`;
    bar.addEventListener("click", e => {
      const b = e.target.closest("button[data-c]"); if (!b) return;
      localStorage.setItem(K, b.dataset.c); bar.remove(); dispatchEvent(new Event("voltieri-consent"));
    });
    document.body.appendChild(bar);
  });
})();
