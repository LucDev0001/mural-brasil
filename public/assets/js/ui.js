export function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");

  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className =
      "fixed top-20 right-4 z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");

  const variants = {
    success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    error: "border-red-400/30 bg-red-500/10 text-red-200",
    warning: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    info: "border-sky-400/30 bg-sky-500/10 text-sky-200",
  };

  toast.className = `rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur ${variants[type] || variants.info}`;
  toast.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <p class="text-sm leading-6">${message}</p>
      <button class="shrink-0 rounded-full border border-white/10 px-2 py-1 text-xs text-slate-200 hover:bg-white/10">Fechar</button>
    </div>
  `;

  const closeBtn = toast.querySelector("button");
  closeBtn.addEventListener("click", () => toast.remove());

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-6px)";
    toast.style.transition = "all 0.25s ease";
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

export function setButtonLoading(
  button,
  isLoading,
  loadingText = "Carregando...",
) {
  if (!button) return;

  if (isLoading) {
    button.dataset.originalText = button.innerHTML;
    button.disabled = true;
    button.classList.add("opacity-70", "cursor-not-allowed");
    button.innerHTML = `
      <span class="inline-flex items-center gap-2">
        <span class="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950"></span>
        <span>${loadingText}</span>
      </span>
    `;
    return;
  }

  button.disabled = false;
  button.classList.remove("opacity-70", "cursor-not-allowed");
  button.innerHTML = button.dataset.originalText || button.innerHTML;
}

export function unlockTelegramButtons() {
  const unlocked = sessionStorage.getItem("telegram_unlocked") === "true";
  if (!unlocked) return;

  const selectors = ["#telegramBtn", "#telegramHeaderBtn"];

  selectors.forEach((selector) => {
    const btn = document.querySelector(selector);
    if (!btn) return;

    btn.href = "https://t.me/ograndedia";
    btn.textContent = "Entrar no Telegram";
    btn.classList.remove("opacity-50", "pointer-events-none");
    btn.setAttribute("target", "_blank");
    btn.setAttribute("rel", "noopener noreferrer");
  });
}

export function sanitizeInput(value = "") {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
}

export function formatCategory(category = "") {
  const map = {
    relato: "Relato",
    testemunho: "Testemunho",
    indignacao: "Indignação",
    denuncia_cidada: "Denúncia cidadã",
  };

  return map[category] || category || "Relato";
}

export function createEmptyState(
  container,
  message = "Nenhum registro encontrado.",
) {
  if (!container) return;

  container.innerHTML = `
    <div class="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 backdrop-blur">
      ${message}
    </div>
  `;
}
