// Voltieri — enlaces de afiliado de Amazon. Un solo tag para toda la web.
let CFG = { provider:"Amazon.es", tag:"" };
const BASE = new URL("./", import.meta.url).href;

export async function loadAffiliateConfig(){
  try { CFG = await (await fetch(BASE + "data/affiliate-config.json")).json(); } catch(e) {}
  paintLinks();
}

// Un identificador de seguimiento por tipo de página (se crean en Amazon Asociados) para ver qué contenido convierte.
// Si el de ese tipo está vacío, se usa el general.
export function pageKind(path = location.pathname){
  if (/\/blog\//.test(path)) return "guide";
  if (/comparativa-/.test(path)) return "compare";
  if (/productos\.html/.test(path)) return "hub";
  if (/(^\/$|index\.html$|\/voltieri\/$)/.test(path)) return "home";
  return "tool";
}
const tagFor = () => String((CFG.tags && CFG.tags[pageKind()]) || CFG.tag || "").trim();

export function amazonUrl(asin){
  const tag = tagFor();
  const base = `https://www.amazon.es/dp/${encodeURIComponent(asin)}`;
  return tag && !/^tu[_-]?tag/i.test(tag) ? `${base}?tag=${encodeURIComponent(tag)}` : base;
}

function paintLinks(){
  document.querySelectorAll("[data-asin]").forEach(el=>{
    const asin = el.getAttribute("data-asin");
    if(!asin) return;
    el.href = amazonUrl(asin);
    el.setAttribute("rel","sponsored nofollow");
    el.setAttribute("target","_blank");
  });
}

const COMPARATIVA = {
  "cables-tipo2":"comparativa-cables-tipo2.html","wallbox":"comparativa-wallbox-7400.html",
  "adaptadores-ccs2":"comparativa-adaptadores-ccs2.html","cargador-portatil":"comparativa-cargador-portatil.html",
  "estaciones-22kw":"comparativa-estaciones-22kw.html","v2l":"comparativa-v2l.html",
  "inflador-neumaticos":"comparativa-inflador-neumaticos.html","soporte-cable":"comparativa-soporte-cable.html","maleta-viaje":"comparativa-maleta-viaje.html",
  "nevera-v2l":"comparativa-nevera-v2l.html","invierno":"comparativa-invierno.html"
};
const esc = t => String(t).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let SHOW = false;
const photosOn = () => localStorage.getItem("voltieri-consent") === "all";
// La foto se pide solo con consentimiento; mientras tanto (o si falla) queda el hueco con el icono.
function fillPhotos(){
  if (!photosOn()) return;
  document.querySelectorAll(".thumb-slot:not([data-done])").forEach(slot => {
    slot.dataset.done = "1";
    const im = new Image(); im.alt = "";
    im.onload = () => { slot.classList.add("has-img"); slot.appendChild(im); };
    im.src = slot.dataset.src;
  });
}
addEventListener("voltieri-consent", fillPhotos);
// Imagen propia del producto (campo "image": SiteStripe o Creators API) y, si falta, el widget de Asociados.
const AMAZON_IMG = /^https:\/\/(m\.media-amazon\.com|images-eu\.ssl-images-amazon\.com|ws-eu\.amazon-adsystem\.com)\//;
const imgUrl = p => AMAZON_IMG.test(p.image || "") ? p.image : widgetUrl(p.asin);
const widgetUrl = asin => `https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&MarketPlace=ES&ASIN=${encodeURIComponent(asin)}&ServiceVersion=20070822&ID=AsinImage&WS=1&Format=_SL250_&tag=${encodeURIComponent(tagFor())}`;
const card = p => `
  <article class="product">
    <span class="thumb-slot" data-src="${imgUrl(p)}" aria-hidden="true"></span>
    ${SHOW ? `<span class="badge">${esc(p.best)}</span>` : ""}
    <h3>${esc(p.title)}</h3>
    ${SHOW ? `<div class="pmeta"><span class="price">${esc(p.price)}</span>${p.rating?`<span>★ ${esc(p.rating)}</span>`:""}</div>` : ""}
    <a class="buy" data-asin="${esc(p.asin)}" href="${amazonUrl(p.asin)}" rel="sponsored nofollow noopener" target="_blank">${SHOW ? "Ver oferta en Amazon" : "Ver precio en Amazon"}</a>
  </article>`;

// Estantería contextual: <div data-shelf="cables-tipo2" data-title="..." data-lede="..." data-limit="3">
export async function renderShelf(host, catId, { title = "", lede = "", limit = 3 } = {}){
  try {
    const data = await (await fetch(BASE + "data/amazon-products.json")).json();
    await loadAffiliateConfig();
    SHOW = data.showPrices === true;
    const cat = data.categories.find(c => c.id === catId);
    if(!cat || !cat.products.length) return false;
    const items = cat.products.slice(0, limit);
    host.classList.add("shelf");
    host.innerHTML = `
      <div class="shelf__head">
        <div><span class="k">Equipamiento recomendado</span><h2>${esc(title || cat.name)}</h2><p>${esc(lede || cat.intro)}</p></div>
        <a class="shelf__more" href="${BASE}${COMPARATIVA[catId]}">Ver la comparativa completa →</a>
      </div>
      <div class="products">${items.map(card).join("")}</div>
      <p class="source">Como afiliado de Amazon, Voltieri obtiene ingresos por las compras adscritas que cumplen los requisitos aplicables. El precio para ti no cambia.${SHOW ? ` Precios de Amazon.es del ${esc(data.date.split("-").reverse().join("/"))}, pueden variar.` : " El precio actual lo ves en Amazon.es."}</p>`;
    paintLinks(); fillPhotos();
    return true;
  } catch(e) { return false; }
}

function autoShelves(){
  document.querySelectorAll("[data-shelf]").forEach(async h => { if (!await renderShelf(h, h.dataset.shelf, { title:h.dataset.title, lede:h.dataset.lede, limit:+h.dataset.limit || 3 })) h.remove(); });
}

export async function renderProducts(containerId, categoryId, limit=99){
  const host = document.getElementById(containerId);
  if(!host) return;
  try {
    const data = await (await fetch(BASE + "data/amazon-products.json")).json();
    await loadAffiliateConfig();
    SHOW = data.showPrices === true;
    const cat = data.categories.find(c=>c.id===categoryId);
    if(!cat) return;
    host.innerHTML = cat.products.slice(0,limit).map(card).join("");
    paintLinks(); fillPhotos();
  } catch(e) { host.innerHTML = '<p class="source">No se pudieron cargar los productos.</p>'; }
}

const boot = () => { loadAffiliateConfig().then(fillPhotos); autoShelves(); };
if(document.readyState!=="loading") boot();
else document.addEventListener("DOMContentLoaded", boot);
