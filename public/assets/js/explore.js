import {
  db,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  increment,
} from "./firebase-init.js";
import {
  createEmptyState,
  formatCategory,
  sanitizeInput,
  showToast,
} from "./ui.js";

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
      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">Por ${item.nome || "Anônimo"}</div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400 vote-count-${item.id}">${item.votos || 0} concordam</span>
          <button data-vote-id="${item.id}" class="vote-btn rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20 ${localStorage.getItem(`voted_${item.id}`) ? "opacity-50 cursor-not-allowed" : ""}" ${localStorage.getItem(`voted_${item.id}`) ? "disabled" : ""}>
            ${localStorage.getItem(`voted_${item.id}`) ? "Concordou" : "Concordar"}
          </button>
        </div>
      </div>
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
  const q = query(
    collection(db, "submissoes"),
    where("status", "==", "aprovado"),
  );
  const snapshot = await getDocs(q);
  items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  render(items);
}

[filterCidade, filterEstado, filterCategoria].forEach((el) => {
  el.addEventListener("input", applyFilters);
  el.addEventListener("change", applyFilters);
});

cards.addEventListener("click", async (e) => {
  const btn = e.target.closest(".vote-btn");
  if (!btn) return;

  const id = btn.dataset.voteId;
  if (localStorage.getItem(`voted_${id}`)) {
    showToast("Você já concordou com este relato.", "warning");
    return;
  }

  try {
    btn.disabled = true;
    btn.textContent = "...";
    const ref = doc(db, "submissoes", id);
    await updateDoc(ref, { votos: increment(1) });
    localStorage.setItem(`voted_${id}`, "true");
    showToast("Voto registrado!", "success");
    btn.textContent = "Concordou";
    btn.classList.add("opacity-50", "cursor-not-allowed");
    const countSpan = document.querySelector(`.vote-count-${id}`);
    if (countSpan) {
      const currentVotes = parseInt(countSpan.textContent) || 0;
      countSpan.textContent = `${currentVotes + 1} concordam`;
    }
  } catch (error) {
    console.error(error);
    showToast(
      "Erro ao registrar voto. Verifique as permissões do Firebase.",
      "error",
    );
    btn.disabled = false;
    btn.textContent = "Concordar";
  }
});

init().catch(console.error);
