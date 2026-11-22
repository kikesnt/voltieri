// Gráficos SVG sin dependencias. Los colores salen de variables CSS (ver blog.css), así que respetan el modo noche.
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const nf = n => new Intl.NumberFormat("es-ES").format(Math.round(n * 10) / 10);

// Barras horizontales. rows: [{ label, values: [v] | [total, parte] }]. Con 2 series, la primera va suave y la segunda sólida.
export function hbar(rows, { series = [], unit = "", label = "Gráfico de barras" } = {}) {
  const W = 720, L = 170, R = 70, rh = 30, top = series.length > 1 ? 30 : 8, H = top + rows.length * rh + 8;
  const max = Math.max(...rows.flatMap(r => r.values)), sx = v => (v / max) * (W - L - R);
  const legend = series.length > 1 ? series.map((s, i) => `<g transform="translate(${L + i * 190} 6)"><rect width="12" height="12" rx="3" class="${i ? "bar-strong" : "bar-soft"}"/><text x="18" y="10.5">${esc(s)}</text></g>`).join("") : "";
  const bars = rows.map((r, i) => {
    const y = top + i * rh, last = r.values[r.values.length - 1];
    return `<text x="${L - 10}" y="${y + 17}" text-anchor="end" class="lbl">${esc(r.label)}</text>` +
      r.values.map((v, k) => `<rect x="${L}" y="${y + 4}" width="${Math.max(2, sx(v))}" height="20" rx="4" class="${k === r.values.length - 1 ? "bar-strong" : "bar-soft"}"/>`).join("") +
      `<text x="${L + sx(Math.max(...r.values)) + 8}" y="${y + 18}" class="val">${nf(last)}${unit}</text>`;
  }).join("");
  return `<figure class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${legend}${bars}</svg></figure>`;
}

// Líneas por años. lines: [{ name, points: [[año, valor]], strong }]
export function line(lines, { unit = "", label = "Gráfico de líneas" } = {}) {
  const W = 720, H = 300, L = 44, R = 110, T = 16, B = 30;
  const xs = [...new Set(lines.flatMap(l => l.points.map(p => p[0])))].sort((a, b) => a - b);
  const maxY = Math.max(...lines.flatMap(l => l.points.map(p => p[1]))), top = Math.ceil(maxY / 20) * 20 || 20;
  const x = v => L + ((v - xs[0]) / (xs[xs.length - 1] - xs[0] || 1)) * (W - L - R), y = v => T + (1 - v / top) * (H - T - B);
  const grid = [0, .25, .5, .75, 1].map(f => { const v = top * f; return `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${nf(v)}${unit}</text>`; }).join("");
  const ticks = xs.map(v => `<text x="${x(v)}" y="${H - 8}" text-anchor="middle">${v}</text>`).join("");
  // Etiquetas del final: se separan al menos 15 px para que no se pisen
  const ly = new Map(), byY = [...lines].sort((a, b) => y(a.points.at(-1)[1]) - y(b.points.at(-1)[1]));
  byY.forEach((l, i) => ly.set(l, Math.max(y(l.points.at(-1)[1]), i ? ly.get(byY[i - 1]) + 15 : -Infinity)));
  const paths = [...lines].sort((a, b) => (a.strong ? 1 : 0) - (b.strong ? 1 : 0)).map(l => {
    const d = l.points.map((p, i) => `${i ? "L" : "M"}${x(p[0]).toFixed(1)},${y(p[1]).toFixed(1)}`).join(" "), e = l.points[l.points.length - 1];
    return `<path d="${d}" class="${l.strong ? "ln-strong" : "ln"}"/><circle cx="${x(e[0])}" cy="${y(e[1])}" r="${l.strong ? 4 : 3}" class="${l.strong ? "dot-strong" : "dot"}"/>` +
      `<text x="${x(e[0]) + 10}" y="${ly.get(l) + 4}" class="${l.strong ? "tag-strong" : "tag"}">${esc(l.name)} ${nf(e[1])}${unit}</text>`;
  }).join("");
  return `<figure class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${grid}${ticks}${paths}</svg></figure>`;
}
