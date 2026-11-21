// Voltieri — enlaces de afiliado de Amazon. Un solo tag para toda la web.
let CFG = { provider:"Amazon.es", tag:"" };

export async function loadAffiliateConfig(){
  try { CFG = await (await fetch("data/affiliate-config.json")).json(); } catch(e) {}
  paintLinks();
}

export function amazonUrl(asin){
  const tag = String(CFG.tag || "").trim();
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

export async function renderProducts(containerId, categoryId, limit=99){
  const host = document.getElementById(containerId);
  if(!host) return;
  try {
    const data = await (await fetch("data/amazon-products.json")).json();
    await loadAffiliateConfig();
    const cat = data.categories.find(c=>c.id===categoryId);
    if(!cat) return;
    host.innerHTML = cat.products.slice(0,limit).map((p,i)=>`
      <article class="product">
        <div class="rank">${String(i+1).padStart(2,"0")}</div>
        <div class="pbody">
          <span class="badge">${p.best}</span>
          <h3>${p.title}</h3>
          <div class="pmeta"><span class="price">${p.price}</span>${p.rating?`<span>★ ${p.rating}</span>`:""}<span>ASIN ${p.asin}</span></div>
        </div>
        <a class="buy" data-asin="${p.asin}" href="${amazonUrl(p.asin)}" rel="sponsored nofollow" target="_blank">Ver en Amazon →</a>
      </article>`).join("");
    paintLinks();
  } catch(e) { host.innerHTML = '<p class="source">No se pudieron cargar los productos.</p>'; }
}

if(document.readyState!=="loading") loadAffiliateConfig();
else document.addEventListener("DOMContentLoaded", loadAffiliateConfig);
