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

// Reglas del sistema de diseño (docs/DESIGN.md). Se comprueban sobre el
// HTML y el CSS sin los <script>, porque lo que se ve es lo que cuenta.
const banned = [
  ["backdrop-filter (cristal)", /backdrop-filter\s*:/],
  ["eyebrow/kicker", /class="[^"]*\b(eyebrow|kicker)\b/],
  ["gradiente de texto", /-webkit-background-clip\s*:\s*text/],
  ["Inter como única voz", /font-family\s*:\s*['"]Inter['"]/],
];

// El radio va en tokens: 0 por defecto, 10-16 px en el skin 2027 y 999 px
// para las píldoras. Lo que no vale es el radio gigante de plantilla.
const radioOk = v => {
  if (/%/.test(v)) return true;                     // 50%: círculo o óvalo
  const n = parseFloat(v);
  if (!Number.isFinite(n)) return true;             // var(--radio) y compañía
  return n <= 24 || n === 999;                      // píldora
};
// Una sombra corta asienta el elemento; una difusa (blur grande) es la
// "cristal difuminado" que el diseño rechaza.
const shadowOk = v => {
  if (/^none/i.test(v.trim())) return true;
  const nums = v.match(/(-?\d+(?:\.\d+)?)px/g) || [];
  const blur = nums.length >= 3 ? parseFloat(nums[2]) : 0;
  return blur <= 24;
};

for (const f of files) {
  let src = fs.readFileSync(path.join(dir, f), "utf8");
  const withoutScripts = src.replace(/<script[\s\S]*?<\/script>/gi, "");
  for (const [label, re] of banned) {
    report(!re.test(withoutScripts), `${f}: sin ${label}`);
  }
  const radios = [...withoutScripts.matchAll(/border-radius\s*:\s*([^;}\n]+)/g)]
    .map(m => m[1].trim()).filter(v => !radioOk(v));
  report(radios.length === 0, `${f}: sin radio fuera de rango`, radios.slice(0,4).join(" "));
  const sombras = [...withoutScripts.matchAll(/box-shadow\s*:\s*([^;}\n]+)/g)]
    .map(m => m[1].trim()).filter(v => !shadowOk(v));
  report(sombras.length === 0, `${f}: sin sombra difusa`, sombras.slice(0,4).join(" "));
  if (f.endsWith(".html")) {
    // Las páginas de solo redirección (meta refresh) no son pantallas: no
    // llevan skin, ni un h1, ni breakpoint. Se comprueban solo los hex.
    const soloRedireccion = /<meta[^>]+http-equiv=["']?refresh/i.test(src);
    if (!soloRedireccion) {
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
    }
    // El <meta name="theme-color"> es la excepción: no admite variables CSS,
    // así que su color va en hexadecimal aunque el resto del sitio use tokens.
    const sinThemeColor = withoutScripts.replace(/<meta[^>]+name=["']theme-color["'][^>]*>/gi, "");
    const hexes = [...sinThemeColor.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map(m => m[0]);
    report(hexes.length === 0, `${f}: sin hexadecimales sueltos`, hexes.slice(0,4).join(" "));
  }
}

console.log(`\n${fails === 0 ? "TODO OK" : `${fails} FALLO(S)`}`);
process.exit(fails ? 1 : 0);
