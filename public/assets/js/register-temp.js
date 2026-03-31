import { auth } from "./firebase-init.js";
// Importe a função de criação. Se você usa CDN, ajuste o caminho conforme o seu firebase-init.js
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const registerForm = document.getElementById("registerForm");
const feedback = document.getElementById("feedback");

registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    feedback.textContent = "Preencha e-mail e senha.";
    return;
  }

  try {
    feedback.textContent = "Criando admin...";
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Admin criado com sucesso! Redirecionando para o login...");
    window.location.href = "./login.html"; // Redireciona para o login
  } catch (error) {
    console.error("Erro ao criar admin:", error);
    feedback.textContent = "Erro: " + error.message;
  }
});
