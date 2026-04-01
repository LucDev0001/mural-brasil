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
import { createBrazilMap, addMarkersToMap, fitBrazilBounds } from "./map.js";
import { reverseGeocode } from "./geo.js";
import { showToast, unlockTelegramButtons, sanitizeInput } from "./ui.js";

const form = document.getElementById("entryForm");
const map = createBrazilMap("map");
const btnLocation = document.getElementById("btnLocation");
let estadoDetectado = "";

async function loadSubmissoes() {
  const q = query(
    collection(db, "submissoes"),
    where("status", "==", "aprovado"),
  );
  const snapshot = await getDocs(q);
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

btnLocation?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showToast("Geolocalização não suportada pelo seu navegador.", "error");
    return;
  }

  const originalText = btnLocation.innerHTML;
  btnLocation.innerHTML = "Localizando...";
  btnLocation.disabled = true;

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      const geoData = await reverseGeocode(latitude, longitude);

      if (geoData && geoData.cidade) {
        document.getElementById("cidade").value = geoData.cidade;
        estadoDetectado = geoData.estado; // Guarda a UF para a próxima tela
        showToast("Localização encontrada!", "success");
      } else {
        showToast("Não foi possível determinar a cidade.", "error");
      }
      btnLocation.innerHTML = originalText;
      btnLocation.disabled = false;
    },
    (error) => {
      console.error("Erro de localização:", error);
      showToast("Permissão negada ou erro ao buscar localização.", "error");
      btnLocation.innerHTML = originalText;
      btnLocation.disabled = false;
    },
  );
});

form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = sanitizeInput(document.getElementById("nome").value);
  const cidade = sanitizeInput(document.getElementById("cidade").value);

  if (!nome || !cidade) {
    showToast("Preencha nome e cidade para continuar.", "warning");
    return;
  }

  sessionStorage.setItem(
    "mural_user",
    JSON.stringify({ nome, cidade, estado: estadoDetectado }),
  );
  window.location.href = "./form.html";
});

loadSubmissoes().catch((error) => {
  console.error(error);
  showToast("Erro ao carregar o mapa e as contribuições.", "error");
});

document.getElementById("map")?.addEventListener("click", async (e) => {
  const btn = e.target.closest(".vote-btn");
  if (!btn) return;

  const id = btn.dataset.voteId;
  if (localStorage.getItem(`voted_${id}`)) {
    showToast("Você já concordou com este relato.", "warning");
    return;
  }

  try {
    btn.disabled = true;
    btn.textContent = "Votando...";
    const ref = doc(db, "submissoes", id);
    await updateDoc(ref, { votos: increment(1) });
    localStorage.setItem(`voted_${id}`, "true");
    showToast("Voto registrado!", "success");
    btn.textContent = "Concordou";
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
