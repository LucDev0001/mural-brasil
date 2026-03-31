import { db, collection, getDocs } from "./firebase-init.js";
import { createEmptyState, formatCategory, sanitizeInput } from "./ui.js";

const cards = document.getElementById("cards");
const filterCidade = document.getElementById("filterCidade");
const filterEstado = document.getElementById("filterEstado");
const filterCategoria = document.getElementById("filterCategoria");

let items = [];

function render(list) {
  cards.innerHTML = "";

  if (!list.length) {
    createEmptyState(cards, "Nenhuma contribuição encontrada.");
    return;
  }

  list.forEach((item) => {
    const el = document.createElement("article");
    el.className =
      "rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur";

    el.innerHTML = `
      <span class="text-xs text-emerald-300 uppercase">${formatCategory(item.categoria)}</span>
      <h3 class="mt-2 text-xl font-bold">${item.titulo || "Sem título"}</h3>
      <p class="mt-1 text-sm text-slate-400">${item.cidade || "Cidade não informada"} - ${item.estado || "--"}</p>
      <p class="mt-4 text-slate-200 leading-7">${item.mensagem || ""}</p>
      <div class="mt-4 text-xs text-slate-500">Por ${item.nome || "Anônimo"}</div>
    `;

    cards.appendChild(el);
  });
}

function applyFilters() {
  const cidade = sanitizeInput(filterCidade.value).toLowerCase();
  const estado = sanitizeInput(filterEstado.value).toUpperCase();
  const categoria = filterCategoria.value;

  const filtered = items.filter((item) => {
    const cityOk = cidade
      ? (item.cidade || "").toLowerCase().includes(cidade)
      : true;
    const stateOk = estado
      ? (item.estado || "").toUpperCase().includes(estado)
      : true;
    const categoryOk = categoria ? item.categoria === categoria : true;
    return cityOk && stateOk && categoryOk;
  });

  render(filtered);
}

async function init() {
  const snapshot = await getDocs(collection(db, "submissoes"));
  items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  render(items);
}

[filterCidade, filterEstado, filterCategoria].forEach((el) => {
  el.addEventListener("input", applyFilters);
  el.addEventListener("change", applyFilters);
});

init().catch(console.error);
