// Bloques cortos y específicos por artículo. Sin frases compartidas.
export function extra(a, i) {
  const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const s = (j,k=1) => (j+7) < a.sections.length ? `Sobre ${esc(a.kw)}: ${esc(a.sections[j+7][k] || "")}` : `En ${esc(a.kw)}, el bloque ${j} se comprueba con la herramienta enlazada.`;
  if (i===0) return `<ul><li>${s(0)}</li><li>Volumen observado: ${esc(a.volume)}.</li><li>Dificultad estimada: ${esc(a.kd)}/100.</li></ul>`;
  if (i===1) return `<table><thead><tr><th>Aspecto</th><th class="num">Registro</th></tr></thead><tbody><tr><td>${esc(a.kw)}</td><td class="num">${esc(a.volume)}</td></tr><tr><td>KD</td><td class="num">${esc(a.kd)}</td></tr></tbody></table>`;
  if (i===2) return `<p class="note">${s(2)}</p>`;
  if (i===3) return `<ul><li>${s(3)}</li></ul>`;
  if (i===4) return `<p>${s(4)}</p>`;
  return `<p class="note">${s(i)}</p>`;
}
