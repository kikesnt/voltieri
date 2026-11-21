// Cuerpo variable de cada artículo. Cada frase se construye con los datos
// propios de la entrada para evitar canibalización entre las 12 páginas.
export function deepDive(a) {
  const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const sec = (i,j=1) => esc(a.sections[i % a.sections.length][j] || "");
  const q = esc(a.kw), vol = esc(a.volume), kd = esc(a.kd), lede = esc(a.lede);
  return `
<h2>Contexto de «${q}»</h2>
<p>${lede}</p>
<p>Los registros de esta consulta muestran ${vol} búsquedas mensuales y una dificultad de ${kd} sobre 100, medidos el 21 de noviembre de 2026. ${sec(0)}</p>
<h3>Qué respuesta espera quien busca esto</h3>
<ol>
<li>${sec(1)}</li>
<li>${sec(2)}</li>
<li>${sec(3)}</li>
</ol>
<h2>Métricas de la consulta</h2>
<p>Las cifras de ${q} proceden de Google Suggest y de Ubersuggest para España y se actualizan al regenerar el estudio.</p>
<table><thead><tr><th>Métrica</th><th class="num">Valor</th><th class="num">Fecha</th></tr></thead><tbody>
<tr><td>Consulta</td><td class="num">${q}</td><td class="num">21/11/2026</td></tr>
<tr><td>Volumen mensual</td><td class="num">${vol}</td><td class="num">21/11/2026</td></tr>
<tr><td>Dificultad</td><td class="num">${kd}/100</td><td class="num">21/11/2026</td></tr>
</tbody></table>
<h2>Detalle según la fuente consultada</h2>
<p>${sec(4)}</p>
<p>${sec(5)}</p>
<h3>Otra forma de verlo</h3>
<p>${sec(6)}</p>
<h2>Antes de decidir</h2>
<p>${sec(7)}</p>
<p>${sec(8)}</p>
`;
}
