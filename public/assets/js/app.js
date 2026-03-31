import { db, collection, getDocs } from "./firebase-init.js";
import { createBrazilMap, addMarkersToMap, fitBrazilBounds } from "./map.js";
import { showToast, unlockTelegramButtons, sanitizeInput } from "./ui.js";

const form = document.getElementById("entryForm");
const map = createBrazilMap("map");

async function loadSubmissoes() {
  const snapshot = await getDocs(collection(db, "submissoes"));
  const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  addMarkersToMap(map, items);
  fitBrazilBounds(map);
  updateCounters(items);
  unlockTelegramButtons();
}

function updateCounters(items) {
  const cidades = new Set(
    items.map((i) => i.cidade?.toLowerCase()).filter(Boolean),
  );
  const estados = new Set(
    items.map((i) => i.estado?.toUpperCase()).filter(Boolean),
  );

  document.getElementById("countCidades").textContent = cidades.size;
  document.getElementById("countEstados").textContent = estados.size;
  document.getElementById("countRelatos").textContent = items.length;
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = sanitizeInput(document.getElementById("nome").value);
  const cidade = sanitizeInput(document.getElementById("cidade").value);

  if (!nome || !cidade) {
    showToast("Preencha nome e cidade para continuar.", "warning");
    return;
  }

  sessionStorage.setItem("mural_user", JSON.stringify({ nome, cidade }));
  window.location.href = "./form.html";
});

loadSubmissoes().catch((error) => {
  console.error(error);
  showToast("Erro ao carregar o mapa e as contribuições.", "error");
});
