import { auth, signInWithEmailAndPassword } from "./firebase-init.js";
import { showToast, setButtonLoading } from "./ui.js";

const loginForm = document.getElementById("loginForm");
const feedback = document.getElementById("feedback");
const submitBtn = loginForm?.querySelector('button[type="submit"]');

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    feedback.textContent = "Preencha e-mail e senha.";
    showToast("Preencha e-mail e senha.", "warning");
    return;
  }

  try {
    setButtonLoading(submitBtn, true, "Autenticando...");
    await signInWithEmailAndPassword(auth, email, password);
    showToast("Login bem-sucedido!", "success");
    window.location.href = "./admin.html";
  } catch (error) {
    console.error("Erro de autenticação:", error);
    feedback.textContent = "Falha no login. Verifique suas credenciais.";
    if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        feedback.textContent = "E-mail ou senha inválidos.";
    }
    showToast(feedback.textContent, "error");
  } finally {
    setButtonLoading(submitBtn, false);
  }
});
