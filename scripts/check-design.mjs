// Juez de diseño de Voltieri. Sin dependencias.
// Uso: node scripts/check-design.mjs [directorio]  (por defecto: web)
import fs from "node:fs";
import path from "node:path";

const dir = process.argv[2] || "web";
const files = fs.readdirSync(dir).filter(f => /\.(html|css)$/.test(f)).sort();
let fails = 0;
const report = (ok, name, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) fails++;
};

const tokensPath = path.join(dir, "tokens.css");
const tokens = fs.existsSync(tokensPath) ? fs.readFileSync(tokensPath, "utf8") : "";
report(!!tokens, "tokens.css existe");

function varsFrom(block) {
  const out = {};
  for (const m of block.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}
const rootBlock = (tokens.match(/:root\s*\{([\s\S]*?)\}/) || [,""])[1];
const nightBlock = (tokens.match(/:root\[data-theme="night"\]\s*\{([\s\S]*?)\}/) || [,""])[1];
const day = varsFrom(rootBlock), night = varsFrom(nightBlock);

const hex2rgb = h => {
  const s = h.replace("#", "");
  if (s.length === 3) return [...s].map(c => parseInt(c+c, 16));
  return [0,2,4].map(i => parseInt(s.slice(i, i+2), 16));
};
const lin = c => { c /= 255; return c <= .03928 ? c/12.92 : Math.pow((c+.055)/1.055, 2.4); };
const lum = h => { const [r,g,b] = hex2rgb(h); return .2126*lin(r) + .7152*lin(g) + .0722*lin(b); };
const contrast = (a,b) => { const [x,y] = [lum(a), lum(b)].sort((p,q)=>q-p); return (x+.05)/(y+.05); };

for (const [name, v] of [["día", day], ["noche", night]]) {
  const pairs = [
    ["texto / papel", "text", "paper", 4.5],
    [" secundario / papel", "muted", "paper", 4.5],
    ["botón (tinta sobre papel)", "ink", "paper", 4.5],
    ["énfasis (ruta sobre papel)", "route", "paper", 4.5],
  ];
  for (const [label, fg, bg, min] of pairs) {
    const f = v[fg], b = v[bg];
    if (!f || !b) { report(false, `contraste ${label} (${name})`, "token ausente"); continue; }
    const ratio = contrast(f, b);
    report(ratio >= min, `contraste ${label} (${name})`, `${ratio.toFixed(2)}:1 (mín ${min})`);
  }
}

const banned = [
  ["backdrop-filter (cristal)", /backdrop-filter\s*:/],
  ["eyebrow/kicker", /class="[^"]*\b(eyebrow|kicker)\b/],
  ["gradiente de texto", /-webkit-background-clip\s*:\s*text/],
  ["box-shadow decorativa", /box-shadow\s*:\s*(?!none)\S/],
  ["Inter como única voz", /font-family\s*:\s*['"]Inter['"]/],
  ["radio redondeado", /border-radius\s*:\s*(?!0|50%|999px)\d/],
];

for (const f of files) {
  let src = fs.readFileSync(path.join(dir, f), "utf8");
  const withoutScripts = src.replace(/<script[\s\S]*?<\/script>/gi, "");
  for (const [label, re] of banned) {
    report(!re.test(withoutScripts), `${f}: sin ${label}`);
  }
  if (f.endsWith(".html")) {
    report(/tokens\.css/.test(src), `${f}: enlaza tokens.css`);
    report(/components\.css/.test(src), `${f}: enlaza components.css`);
    report((src.match(/<h1[\s>]/g) || []).length === 1, `${f}: un solo h1`);
    const localCss = [...src.matchAll(/href="([^"]+\.css)"/g)].map(m=>m[1]).filter(h=>!/^https?:/.test(h));
    let styled = src;
    for (const h of localCss) {
      const p = path.join(dir, h);
      if (fs.existsSync(p)) styled += fs.readFileSync(p, "utf8");
    }
    report(/@media\s*\(max-width/.test(styled), `${f}: tiene breakpoint móvil`);
    const hexes = [...withoutScripts.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(m => m[0]);
    report(hexes.length === 0, `${f}: sin hexadecimales sueltos`, hexes.slice(0,4).join(" "));
  }
}

console.log(`\n${fails === 0 ? "TODO OK" : `${fails} FALLO(S)`}`);
process.exit(fails ? 1 : 0);
