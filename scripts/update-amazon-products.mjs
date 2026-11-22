// Actualiza los productos de Amazon desde Amazon Creators API.
// Sin credenciales: deja la instantánea local y escribe un estado claro.
// Con credenciales: pide GetItems y sustituye precio, título y valoración.
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(".");
const DATA = path.join(ROOT,"web/data");
const PRODUCTS = path.join(DATA,"amazon-products.json");
const STATUS = path.join(DATA,"amazon-api-status.json");

// Credenciales locales opcionales (.env.local está ignorado por git).
try {
  const txt = await fs.readFile(path.join(ROOT,".env.local"),"utf8");
  for (const line of txt.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g,"");
  }
} catch(e) {}

const cfg = {
  mode: process.env.AMAZON_DATA_MODE || "local",
  clientId: process.env.CREATORSAPI_CLIENT_ID || "",
  secret: process.env.CREATORSAPI_CLIENT_SECRET || "",
  version: process.env.CREATORSAPI_VERSION || "3.2",
  marketplace: process.env.CREATORSAPI_MARKETPLACE || "www.amazon.es",
  partnerTag: process.env.CREATORSAPI_PARTNER_TAG || "volteri-21",
  license: process.env.CREATORSAPI_LICENSE_KEY || ""
};

const versions = {
  "2.1":"https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token",
  "2.2":"https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token",
  "2.3":"https://creatorsapi.auth.us-west-2.amazoncognito.com/oauth2/token",
  "3.1":"https://api.amazon.com/auth/o2/token",
  "3.2":"https://api.amazon.co.uk/auth/o2/token",
  "3.3":"https://api.amazon.co.jp/auth/o2/token"
};
const scopes = v => v.startsWith("3.") ? "creatorsapi::default" : "creatorsapi/default";

async function writeStatus(status){
  await fs.writeFile(STATUS, JSON.stringify({ ...status, checkedAt:new Date().toISOString() }, null, 2));
}

async function token(){
  const endpoint = versions[cfg.version];
  if(!endpoint) throw new Error(`Versión no soportada: ${cfg.version}`);
  const isLwa = cfg.version.startsWith("3.");
  const init = isLwa
    ? { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({
        grant_type:"client_credentials", client_id:cfg.clientId, client_secret:cfg.secret, scope:scopes(cfg.version)
      }) }
    : { method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"}, body:new URLSearchParams({
        grant_type:"client_credentials", client_id:cfg.clientId, client_secret:cfg.secret, scope:scopes(cfg.version)
      }).toString() };
  const r = await fetch(endpoint, init);
  const t = await r.text();
  if(!r.ok) throw new Error(`Token HTTP ${r.status}`);
  const d = JSON.parse(t);
  if(!d.access_token) throw new Error("Sin access_token");
  return d.access_token;
}

async function getItemsPage(accessToken, asins){
  const resources = cfg.license
    ? ["itemInfo.title","images.primary.medium","offersV2.listings.price","offersV2.listings.availability","customerReviews.starRating"]
    : ["itemInfo.title","images.primary.medium"];
  const r = await fetch("https://creatorsapi.amazon/catalog/v1/getItems", {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "x-marketplace":cfg.marketplace,
      "Authorization":`Bearer ${accessToken}`,
      ...(cfg.license ? { "x-license-key":cfg.license } : {})
    },
    body:JSON.stringify({
      itemIds:asins,
      itemIdType:"ASIN",
      marketplace:cfg.marketplace,
      partnerTag:cfg.partnerTag,
      resources
    })
  });
  const t = await r.text();
  if(!r.ok) {
    const safe = t.replace(new RegExp(cfg.clientId,"g"),"[ID]").replace(new RegExp(cfg.secret,"g"),"[SECRET]").slice(0,600);
    throw new Error(`GetItems HTTP ${r.status}: ${safe}`);
  }
  return JSON.parse(t);
}

async function getItems(accessToken, asins){
  // GetItems acepta como máximo 10 identificadores por llamada.
  const all = [];
  for(let i=0;i<asins.length;i+=10){
    all.push(...await getItemsPage(accessToken, asins.slice(i,i+10)));
  }
  return all;
}

function sanitizeError(e){
  const s = String(e && e.message || e);
  return s.replace(new RegExp(cfg.secret,"g"),"[REDACTED]").slice(0,300);
}

const data = JSON.parse(await fs.readFile(PRODUCTS,"utf8"));

if(cfg.mode !== "api" || !cfg.clientId || !cfg.secret){
  await writeStatus({
    mode:"local",
    api:"Amazon Creators API",
    eligible:false,
    reason:cfg.mode !== "api" ? "Modo local seleccionado" : "Credenciales no configuradas",
    message:"Amazon aún no ha aprobado el acceso a Creators API. Se muestran precios de la instantánea del 21/11/2026.",
    next:"Cuando tengas acceso, configura los secrets y pon AMAZON_DATA_MODE=api."
  });
  console.log("Modo local: instantánea conservada.");
  process.exit(0);
}

try {
  const access = await token();
  const asins = data.categories.flatMap(c=>c.products.map(p=>p.asin));
  const itemSets = await getItems(access, asins);
  const items = itemSets.flatMap(r => r.itemsResult?.items || r.Items || r.items || []);
  const byAsin = new Map(items.map(i=>[i.ASIN || i.asin, i]));
  let updated = 0, priced = 0;
  for(const cat of data.categories) for(const p of cat.products){
    const it = byAsin.get(p.asin);
    if(!it) continue;
    const title = it.ItemInfo?.Title?.DisplayValue;
    const price = it.OffersV2?.Listings?.[0]?.Price?.DisplayAmount;
    const rating = it.CustomerReviews?.StarRating?.StarRating;
    if(title) p.title = String(title).slice(0,120);
    if(price){ p.price = price; priced++; }
    if(rating) p.rating = Number(rating).toFixed(1);
    const image = it.Images?.Primary?.Medium?.URL || it.images?.primary?.medium?.url;
    if(image) p.image = image;
    updated++;
  }
  data.showPrices = priced > 0; // la web solo muestra precios si vienen de la API
  data.date = priced ? new Date().toISOString().slice(0,10) : data.date;
  data.source = priced ? "Amazon Creators API · GetItems + OffersV2" : "Amazon Creators API · metadatos + instantánea 21/11/2026";
  await fs.writeFile(PRODUCTS, JSON.stringify(data,null,2));
  await writeStatus({
    mode:"api",
    api:"Amazon Creators API",
    eligible:true,
    updated,
    priced,
    priceLicense: cfg.license ? "configurada" : "no configurada",
    message: priced
      ? `Precios actualizados desde Creators API (${priced} productos).`
      : "API conectada: título e imágenes actualizados. Sin License Key no se pueden leer precios; se conserva la instantánea del 21/11/2026.",
    next: priced ? "Nada más." : "Añade CREATORSAPI_LICENSE_KEY para precios en vivo."
  });
  console.log(`Actualizados ${updated} productos (${priced} con precio).`);
} catch(e) {
  await writeStatus({
    mode:"local",
    api:"Amazon Creators API",
    eligible:false,
    reason:sanitizeError(e),
    message:"No se pudo consultar Creators API. Se conserva la instantánea local.",
    next:"Revisa Secrets, versión de credencial y licencia de precios."
  });
  console.log("API no disponible: instantánea conservada.");
}
