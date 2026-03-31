# Mural Brasil

Projeto web estático com HTML, Tailwind, JavaScript e Firebase Spark.
(Escreva aqui uma breve descrição sobre o que o seu projeto faz. Ex: Um mural interativo de mensagens para usuários do Brasil.)

## Pré-requisitos

- [Node.js](https://nodejs.org/) instalado em sua máquina.
- [Firebase CLI](https://firebase.google.com/docs/cli) instalado globalmente (`npm install -g firebase-tools`).

## Como rodar

1. Crie um projeto no Firebase
2. Ative Firestore
3. Copie `firebase-config.example.js` para `firebase-config.js`
4. Preencha as chaves
5. Rode com Live Server ou Firebase Hosting

## Deploy

```bash
firebase login
firebase init hosting
firebase deploy
```

## 🔐 Segurança no Firebase

É **extremamente importante** configurar as Regras de Segurança (Security Rules) do Firestore para proteger seus dados. Sem elas, qualquer pessoa pode ler, escrever ou apagar sua base de dados.

Acesse o console do Firebase -> Firestore Database -> Aba "Regras".

Um exemplo de regra para este projeto, que permite que qualquer um crie (`create`) uma submissão, mas apenas usuários autenticados possam ler (`read`) ou atualizar (`update`), seria:

```js
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /submissoes/{docId} {
      allow read, update: if request.auth != null;
      allow create: if true;
    }
  }
}
```
