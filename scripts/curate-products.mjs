// Revisa y ordena los productos de web/data/amazon-products.json y regenera comparativas y equipamiento.
// Uso: node scripts/curate-products.mjs   (después de añadir productos a mano)
// Cada producto necesita al menos: asin, title. Opcionales: price ("29,99 €"), rating ("4,6"), image (URL de Amazon).
import fs from "node:fs/promises";

const FILE = "web/data/amazon-products.json", MIN = 4.4;
const AMAZON_IMG = /^https:\/\/(m\.media-amazon\.com|images-eu\.ssl-images-amazon\.com|ws-eu\.amazon-adsystem\.com)\//;
const d = JSON.parse(await fs.readFile(FILE, "utf8"));
const num = s => parseFloat(String(s || "").replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "")) || Infinity;
const rate = p => parseFloat(String(p.rating || "").replace(",", ".")) || 0;
const problems = [];

for (const c of d.categories) {
  const seen = new Set(), keep = [], rejected = [...(c.rejected || [])];
  for (const p of [...c.products]) {
    p.title = String(p.title || "").replace(/\s+/g, " ").trim();
    const why = !/^[A-Z0-9]{10}$/.test(p.asin || "") ? "ASIN no válido"
      : !p.title ? "sin título"
      : seen.has(p.asin) ? "ASIN repetido"
      : p.image && !AMAZON_IMG.test(p.image) ? "imagen no es de Amazon"
      : rate(p) < MIN ? `valoración ${p.rating || "sin dato"} (mínimo ${String(MIN).replace(".", ",")})`
      : null;
    if (why) { rejected.push({ ...p, why }); problems.push(`${c.id} ${p.asin || "?"}: ${why}`); continue; }
    seen.add(p.asin); keep.push(p);
  }
  keep.sort((a, b) => rate(b) - rate(a) || num(a.price) - num(b.price));
  const cheapest = keep.reduce((m, p) => (!m || num(p.price) < num(m.price) ? p : m), null);
  keep.forEach((p, i) => { p.best = i === 0 ? "Mejor valorado" : p === cheapest ? "Mejor precio" : "Selección Voltieri"; p.image ??= ""; });
  c.products = keep;
  if (rejected.length) c.rejected = rejected; else delete c.rejected;
  console.log(`${c.id.padEnd(20)} ${String(keep.length).padStart(2)} productos${keep.length < 3 ? "  ← pocos: añade más" : ""}`);
}
d.curated = new Date().toISOString().slice(0, 10);
d.criteria = `Valoración mínima ${String(MIN).replace(".", ",")} ★. Orden: valoración y, a igualdad, precio.`;
await fs.writeFile(FILE, JSON.stringify(d, null, 2));
if (problems.length) console.warn("\nDescartados (quedan en \"rejected\" de cada categoría):\n - " + problems.join("\n - "));
await import("./generate-comparativas.mjs");
