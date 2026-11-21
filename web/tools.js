// Voltieri — renderizador genérico de herramientas.
const host = document.getElementById("tool-host");
const cat = document.body.dataset.cat || "compare";
const listHost = document.getElementById("tool-list");
const own = TOOLS.filter(t => t.cat === cat);

// Las entradas de coche se expanden a select cuando llegan los datos reales.
function inputsOf(t) {
  return t.inputs.map(i => i.type === "car"
    ? { id:i.id, type:"select", options:CAR_NAMES, value:CAR_NAMES[0] }
    : i);
}

function currentTool() {
  const id = location.hash.replace(/^#/, "").split("?")[0];
  return own.find(t => t.id === id) || own[0];
}

function renderList() {
  const active = currentTool().id;
  const dedicated = Object.entries(DEDICATED).map(([id,[file,name]]) =>
    `<a href="${file}">${name}</a>`).join("");
  const cats = Object.entries(CATS).map(([k,v]) =>
    `<a href="${v.file}" class="${k===cat?"on":""}">${v.label}</a>`).join("");
  listHost.innerHTML =
    `<span class="k">Categorías</span>` + cats +
    `<span class="k" style="margin-top:20px">${CATS[cat].label}</span>` +
    own.map(t => `<a href="#${t.id}" class="${t.id===active?"on":""}">${t.name}</a>`).join("") +
    `<span class="k" style="margin-top:20px">Herramientas completas</span>` + dedicated;
}

function renderTool() {
  const t = currentTool();
  document.title = `Voltieri — ${t.name}`;
  document.querySelector("h1").textContent = t.h1;
  document.getElementById("tool-desc").textContent = t.desc;

  const inputs = inputsOf(t);
  const fields = inputs.map(i => {
    const id = `in-${i.id}`;
    if (i.type === "select") {
      return `<div class="field"><label class="k" for="${id}">${i.label||i.id}</label><select id="${id}">${i.options.map(o=>`<option${o===i.value?" selected":""}>${o}</option>`).join("")}</select></div>`;
    }
    return `<div class="field"><label class="k" for="${id}">${i.label||i.id}</label><span><input id="${id}" type="number" min="${i.min}" max="${i.max}" step="${i.step}" value="${i.value}"> <span class="k">${i.unit||""}</span></span></div>`;
  }).join("");

  host.innerHTML = `
    <form class="panel controls" onsubmit="return false">
      <span class="k">Entradas</span>
      ${fields}
      <button class="btn btn--wide" type="button" id="run">Calcular</button>
    </form>
    <div class="panel result">
      <div class="data-grid" id="outputs"></div>
      <div id="extras"></div>
      <p class="calc-note" id="note"></p>
    </div>`;

  const rawHash = location.hash.replace(/^#/, "");
  const query = rawHash.split("?")[1];
  if (query) {
    const params = new URLSearchParams(query);
    for (const i of inputs) {
      if (params.has(i.id)) {
        const el = document.getElementById(`in-${i.id}`);
        if (el) el.value = params.get(i.id);
      }
    }
  }

  const read = () => {
    const v = {};
    for (const i of inputs) {
      const el = document.getElementById(`in-${i.id}`);
      v[i.id] = i.type === "select" ? el.value : +el.value;
    }
    return v;
  };
  const run = () => {
    const r = t.calc(read());
    document.getElementById("outputs").innerHTML = r.out.map(o =>
      `<div class="data-cell"><span class="k">${o.l}</span><span class="v">${o.v}</span></div>`).join("");
    let extra = "";
    if (r.table) extra += `<table class="table"><thead><tr>${r.table.head.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${r.table.rows.map(row=>`<tr>${row.map((c,j)=>`<td${j===row.length-1?" class=\"num\"":""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
    if (r.html) extra += r.html;
    document.getElementById("extras").innerHTML = extra;
    document.getElementById("note").textContent = r.note || "";
    if (window.__afterRender) window.__afterRender(t);
  };
  document.getElementById("run").addEventListener("click", run);
  run();
  renderList();
}

window.addEventListener("hashchange", () => { renderList(); if (CAR_NAMES.length) renderTool(); });
loadVehicles().then(async () => { await loadLivePrices(); renderTool(); applyTheme(); }).catch(async () => { try { await loadLivePrices(); } catch(e) {} renderTool(); applyTheme(); });

// Tema compartido
const KEY = "voltieri-theme";
const mql = matchMedia("(prefers-color-scheme: dark)");
function resolve(){const p=localStorage.getItem(KEY)||"auto";return p==="auto"?(mql.matches?"night":"day"):p;}
function applyTheme(){
  const r=resolve(),p=localStorage.getItem(KEY)||"auto";
  document.documentElement.dataset.theme=r;
  for(const b of document.querySelectorAll(".modes button")){
    const on=b.dataset.mode===p;b.classList.toggle("active",on);b.setAttribute("aria-pressed",on);
  }
}
document.querySelectorAll(".modes button").forEach(b=>b.addEventListener("click",()=>{localStorage.setItem(KEY,b.dataset.mode);applyTheme();}));
applyTheme();mql.addEventListener?.("change",applyTheme);
