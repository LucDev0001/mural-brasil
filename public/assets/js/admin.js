import {
  db,
  auth,
  onAuthStateChanged,
  signOut,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "./firebase-init.js";
import { showToast, createSubmissionCard } from "./ui.js";

const pendingSubmissionsContainer =
  document.getElementById("pendingSubmissions");
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, (user) => {
  if (user) {
    loadPendingSubmissions();
  } else {
    window.location.href = "./login.html";
  }
});

logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    // O onAuthStateChanged (logo acima) vai detectar a saída e redirecionar para o login automaticamente
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    showToast("Erro ao sair da conta.", "error");
  }
});

async function loadPendingSubmissions() {
  if (!pendingSubmissionsContainer) return;
  pendingSubmissionsContainer.innerHTML =
    '<p class="text-center">Carregando submissões pendentes...</p>';

  try {
    const q = query(
      collection(db, "submissoes"),
      where("status", "==", "pendente"),
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      pendingSubmissionsContainer.innerHTML =
        '<p class="text-center">Nenhuma submissão pendente.</p>';
      return;
    }

    const submissionsHTML = querySnapshot.docs
      .map((doc) => createSubmissionCard(doc))
      .join("");
    pendingSubmissionsContainer.innerHTML = submissionsHTML;

    // Add event listeners after rendering the buttons
    querySnapshot.docs.forEach((doc) => {
      const approveBtn = document.querySelector(
        `[data-id="${doc.id}"].approve-btn`,
      );
      const rejectBtn = document.querySelector(
        `[data-id="${doc.id}"].reject-btn`,
      );

      approveBtn?.addEventListener("click", () => approveSubmission(doc.id));
      rejectBtn?.addEventListener("click", () => rejectSubmission(doc.id));
    });
  } catch (error) {
    console.error("Erro ao carregar submissões:", error);

    if (error.code === "permission-denied") {
      pendingSubmissionsContainer.innerHTML =
        '<p class="text-center text-red-500 font-bold">Acesso Negado.<br>Seu usuário não possui um documento de Admin no Firestore!</p>';
      showToast("Sem permissão de administrador.", "error");
      return;
    }

    pendingSubmissionsContainer.innerHTML =
      '<p class="text-center text-red-500">Erro ao carregar submissões.</p>';
    showToast("Erro ao carregar submissões.", "error");
  }
}

async function approveSubmission(id) {
  try {
    const submissionRef = doc(db, "submissoes", id);
    await updateDoc(submissionRef, { status: "aprovado" });
    showToast("Submissão aprovada!", "success");
    loadPendingSubmissions();
  } catch (error) {
    console.error("Erro ao aprovar submissão:", error);
    showToast("Erro ao aprovar submissão.", "error");
  }
}

async function rejectSubmission(id) {
  try {
    const submissionRef = doc(db, "submissoes", id);
    await deleteDoc(submissionRef);
    showToast("Submissão rejeitada!", "success");
    loadPendingSubmissions();
  } catch (error) {
    console.error("Erro ao rejeitar submissão:", error);
    showToast("Erro ao rejeitar submissão.", "error");
  }
}
