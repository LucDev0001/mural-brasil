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

    function isAdmin() {
      return request.auth != null &&
             get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }

    match /submissoes/{docId} {
      allow read: if resource.data.status == 'aprovado' || isAdmin();

      allow create: if request.resource.data.status == 'pendente'
                    && request.resource.data.keys().hasAll(['nome', 'cidade', 'estado', 'titulo', 'categoria', 'mensagem', 'lat', 'lng', 'municipio', 'estadoNome', 'status', 'createdAt', 'telegramLiberado', 'votos'])
                    && request.resource.data.votos == 0;

      // Admins podem tudo. Usuários comuns só podem atualizar se estiverem alterando APENAS o campo 'votos' em exatos +1.
      allow update: if isAdmin() ||
                    (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['votos']) &&
                     request.resource.data.votos == (('votos' in resource.data) ? resource.data.votos : 0) + 1);
      allow delete: if isAdmin();
    }

    match /admins/{userId} {
      allow read, write: if isAdmin();
    }
  }
}
```
