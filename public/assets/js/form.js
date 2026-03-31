import { db, collection, addDoc, serverTimestamp } from "./firebase-init.js";

import {
  showToast,
  setButtonLoading,
  unlockTelegramButtons,
  sanitizeInput,
} from "./ui.js";

import { geocodeBrazilCity } from "./geo.js";

const reportForm = document.getElementById("reportForm");
const feedback = document.getElementById("feedback");
const telegramBtn = document.getElementById("telegramBtn");
const submitBtn = reportForm?.querySelector('button[type="submit"]');
const telegramModal = document.getElementById("telegramModal");

const savedUser = JSON.parse(sessionStorage.getItem("mural_user") || "{}");

if (savedUser.nome) document.getElementById("nome").value = savedUser.nome;
if (savedUser.cidade)
  document.getElementById("cidade").value = savedUser.cidade;

unlockTelegramButtons();

// Configura o modal para fechar, fora do listener de submit
const closeModalBtn = document.getElementById("closeModalBtn");
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    telegramModal.classList.add("hidden");
  });
}

reportForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = sanitizeInput(document.getElementById("nome").value);
  const cidade = sanitizeInput(document.getElementById("cidade").value);
  const estado = sanitizeInput(
    document.getElementById("estado").value,
  ).toUpperCase();
  const categoria = document.getElementById("categoria").value;
  const titulo = sanitizeInput(document.getElementById("titulo").value);
  const mensagem = sanitizeInput(document.getElementById("mensagem").value);
  const publico = document.getElementById("publico").checked;

  if (nome.length < 2) {
    feedback.textContent = "Informe um nome válido.";
    showToast("Informe um nome válido.", "warning");
    return;
  }

  if (!cidade) {
    feedback.textContent = "Informe a cidade.";
    showToast("Informe a cidade.", "warning");
    return;
  }

  if (!estado || estado.length !== 2) {
    feedback.textContent = "Informe a UF com 2 letras.";
    showToast("Informe a UF com 2 letras.", "warning");
    return;
  }

  if (mensagem.length < 30) {
    feedback.textContent = "A mensagem deve ter pelo menos 30 caracteres.";
    showToast("A mensagem deve ter pelo menos 30 caracteres.", "warning");
    return;
  }

  if (!publico) {
    feedback.textContent =
      "Você precisa marcar a ciência de publicação pública.";
    showToast("Marque a ciência de publicação pública.", "warning");
    return;
  }

  try {
    setButtonLoading(submitBtn, true, "Localizando cidade...");

    const geo = await geocodeBrazilCity(cidade, estado);

    if (!geo) {
      setButtonLoading(submitBtn, false);
      feedback.textContent =
        "Não foi possível localizar essa cidade no mapa. Verifique cidade e UF.";
      showToast("Não foi possível localizar essa cidade no mapa.", "error");
      return;
    }

    setButtonLoading(submitBtn, true, "Publicando...");

    await addDoc(collection(db, "submissoes"), {
      nome,
      cidade,
      estado,
      titulo,
      categoria,
      mensagem,
      telegramLiberado: true,
      lat: geo.lat,
      lng: geo.lng,
      municipio: geo.municipio,
      estadoNome: geo.estadoNome,
      status: "pendente",
      createdAt: serverTimestamp(),
    });

    sessionStorage.setItem("telegram_unlocked", "true");
    unlockTelegramButtons(); // Mantém para desbloquear o botão em outras páginas
    reportForm.reset();

    // Exibe o modal
    if (telegramModal) {
      telegramModal.classList.remove("hidden");
    }
  } catch (error) {
    console.error(error);
    feedback.textContent =
      "Erro ao publicar. Verifique sua configuração do Firebase.";
    showToast(
      "Erro ao publicar. Verifique sua configuração do Firebase.",
      "error",
    );
  } finally {
    setButtonLoading(submitBtn, false);
  }
});
