// Linter de humanización para los artículos de Voltieri.
// Basado en blader/humanizer, harshaneel/humanize y kane50613/native-writing.
import fs from "node:fs/promises";
import path from "node:path";

const dir = path.resolve("web/blog");
let files = await fs.readdir(dir);
files = files.filter(f => f.endsWith(".html") && f !== "index.html").sort();
let fails = 0;
const report = (ok, name, detail="") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) fails++;
};
const clean = html => {
  let s = html.replace(/<head[\s\S]*?<\/head>/gi," ")
              .replace(/<script[\s\S]*?<\/script>/gi," ")
              .replace(/<style[\s\S]*?<\/style>/gi," ")
              .replace(/<footer[\s\S]*?<\/footer>/gi," ")
              .replace(/<a class="cta"[\s\S]*?<\/a>/gi," ")
              .replace(/<[^>]+>/g," ")
              .replace(/&nbsp;/g," ");
  return s.replace(/\s+/g," ").trim();
};
const sentences = text => text.split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(s=>s.length>0);

const all = new Map();
for (const f of files) {
  const html = await fs.readFile(path.join(dir,f),"utf8");
  const text = clean(html);
  const words = text.split(" ").filter(Boolean);
  const sents = sentences(text);
  const name = f.replace(/\.html$/,"");

  report(words.length >= 700, `${name}: ≥700 palabras`, `${words.length}`);
  const em = (text.match(/—/g)||[]).length;
  report(em <= Math.max(1, Math.floor(words.length/300)), `${name}: guiones largos`, `${em}`);
  report(!/[;]/.test(text), `${name}: sin punto y coma`);
  const banned = ["delve","leverage","utilize","robust","comprehensive","streamline","furthermore","moreover",
    "es importante destacar","cabe señalar","sin duda","en conclusión","a medida que"];
  const found = banned.filter(w => new RegExp(`\\b${w}\\b`,"i").test(text));
  report(found.length===0, `${name}: vocabulario prohibido`, found.join(", "));
  const framing = text.match(/no es (?:solo )?[^.!?]{1,70}(?:sino|:\s*es) [^.!?]{1,70}/gi) || [];
  report(framing.length===0, `${name}: sin encuadre «no X, es Y»`, `${framing.length}`);
  const h1 = (html.match(/<h1[\s>]/g)||[]).length;
  report(h1===1, `${name}: un solo H1`, `${h1}`);
  report((html.match(/<table>/g)||[]).length >= 1, `${name}: al menos una tabla`);
  const lengths = sents.map(s=>s.split(" ").length).filter(n=>n>0);
  const max = Math.max(...lengths), min = Math.min(...lengths);
  const mid = lengths.filter(n=>n>=10 && n<=20).length;
  report(max-min>=20, `${name}: variedad de longitud`, `${min}–${max}`);
  report(mid/lengths.length < .5, `${name}: menos de la mitad en 10–20 palabras`, `${mid}/${lengths.length}`);
  all.set(f, sents.map(s=>s.toLowerCase()).filter(s=>s.split(" ").length>=8));
}

// Duplicados entre artículos: una frase completa no puede aparecer en más de 2.
const counts = new Map();
for (const sents of all.values()) for (const s of new Set(sents)) counts.set(s,(counts.get(s)||0)+1);
const dup = [...counts.entries()].filter(([,n])=>n>2);
report(dup.length===0, "sin frases repetidas en más de 2 artículos", `${dup.length}`);
if (dup.length) console.log("  Ejemplos:", dup.slice(0,4).map(([s,n])=>`${n}× ${s.slice(0,70)}`).join("\n  "));

console.log(`\n${fails===0 ? "TODO OK" : `${fails} FALLO(S)`}`);
process.exit(fails ? 1 : 0);
