# 🤖 Portfolio IA — avec MongoDB + Admin Panel

---

## 🍃 ÉTAPE 1 — Créer la base MongoDB GRATUITE

### 1. Aller sur MongoDB Atlas
1. Va sur **https://cloud.mongodb.com**
2. Clique **"Try Free"** → Crée un compte avec Google
3. Choisis **"FREE"** (M0 Sandbox) → **Create**
4. Choisis une région proche (ex: Paris)

### 2. Créer un utilisateur DB
1. Dans le menu gauche → **"Database Access"**
2. Clique **"Add New Database User"**
3. Username: `portfolio-user`
4. Password: clique **"Autogenerate"** → **Copie le mot de passe**
5. Role: **"Atlas Admin"** → **"Add User"**

### 3. Autoriser ton IP
1. Menu gauche → **"Network Access"**
2. Clique **"Add IP Address"**
3. Clique **"Allow Access from Anywhere"** → **Confirm**

### 4. Récupérer l'URL de connexion
1. Menu gauche → **"Database"** → **"Connect"**
2. Choisis **"Drivers"**
3. Copie l'URL qui ressemble à :
   ```
   mongodb+srv://portfolio-user:MOTDEPASSE@cluster0.xxxxx.mongodb.net/
   ```
4. Remplace `<password>` par ton vrai mot de passe

---

## ⚙️ ÉTAPE 2 — Configurer le .env

Crée `backend/.env` :

```
GROQ_API_KEY=gsk_ta-clé-groq-ici
MONGODB_URI=mongodb+srv://portfolio-user:MOTDEPASSE@cluster0.xxxxx.mongodb.net/portfolio
PORT=8000
FRONTEND_URL=http://localhost:5173
ADMIN_PASSWORD=MonMotDePasseAdmin2025!
JWT_SECRET=une-clé-très-longue-et-secrète-ici-2025
```

---

## 📦 ÉTAPE 3 — Installation

```bash
# Racine
npm install

# Frontend
cd frontend && npm install && cd ..

# Backend
cd backend && npm install && cd ..
```

---

## 🌱 ÉTAPE 4 — Initialiser la base de données

```bash
cd backend
npm run seed
```

Tu dois voir :
```
✅ MongoDB connecté avec succès
✅ Section "hero" initialisée
✅ Section "about" initialisée
✅ Section "skills" initialisée
✅ Section "projects" initialisée
✅ Section "contact" initialisée
🎉 Base de données initialisée avec succès !
```

---

## 🚀 ÉTAPE 5 — Lancer le projet

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

→ **http://localhost:5173** — Portfolio
→ **http://localhost:5173/admin** — Panneau admin

---

## 🔐 Utiliser le panneau Admin

1. Va sur **http://localhost:5173/admin**
2. Entre ton `ADMIN_PASSWORD` du `.env`
3. Modifie le contenu
4. Clique **"Sauvegarder dans MongoDB"**
5. Actualise le site → les changements sont visibles !

---

## 🌐 ÉTAPE 6 — Déploiement en ligne

### Frontend → Vercel
```bash
cd frontend
npm run build
npx vercel
```

### Backend → Railway
1. railway.app → New Project → GitHub
2. Root: `backend`, Start: `node server.js`
3. Variables d'environnement :
```
GROQ_API_KEY=gsk_...
MONGODB_URI=mongodb+srv://...
PORT=8000
FRONTEND_URL=https://ton-portfolio.vercel.app
ADMIN_PASSWORD=...
JWT_SECRET=...
```

---

## 📁 Structure

```
portfolio-mongo/
├── backend/
│   ├── db/
│   │   ├── connect.js      ← Connexion MongoDB
│   │   └── seed.js         ← Initialisation des données
│   ├── models/
│   │   └── Content.js      ← Schéma MongoDB
│   ├── middleware/
│   │   └── auth.js         ← Vérification JWT
│   ├── routes/
│   │   ├── ai.js           ← 5 fonctionnalités IA (Groq)
│   │   ├── admin.js        ← CRUD admin protégé
│   │   └── content.js      ← API publique contenu
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── hooks/
│       │   └── useContent.js   ← Fetch MongoDB en temps réel
│       ├── components/
│       │   ├── Hero.jsx        ← Lit depuis MongoDB
│       │   ├── About.jsx       ← Lit depuis MongoDB
│       │   ├── Skills.jsx      ← Lit depuis MongoDB
│       │   ├── Projects.jsx    ← Lit depuis MongoDB
│       │   ├── Contact.jsx     ← Lit depuis MongoDB
│       │   └── admin/
│       │       ├── AdminLogin.jsx
│       │       └── AdminDashboard.jsx
│       └── pages/
│           └── AdminPage.jsx
```

---

## ❓ Problèmes fréquents

**❌ "MongoDB URI manquant"**
→ Vérifier que `MONGODB_URI` est dans `backend/.env`

**❌ "Authentication failed"**
→ Vérifier le mot de passe dans l'URI MongoDB

**❌ "Network timeout"**
→ Dans MongoDB Atlas → Network Access → ajouter ton IP

**❌ Les modifications ne s'affichent pas**
→ Actualise la page après sauvegarde (le cache se vide automatiquement)
