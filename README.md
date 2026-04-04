# 🤖 Portfolio IA — Adem SASSI

Portfolio personnel avec IA intégrée, développé en React + Node.js + MongoDB.

## 🌐 Live

👉 **[ademsassi.com](https://ademsassi.com)**

## 🚀 Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Base de données | MongoDB Atlas |
| IA | Groq API (llama-3.3-70b-versatile) |
| Auth | JWT + bcryptjs |
| Déploiement | Vercel (frontend) + Railway (backend) |

## ✨ Fonctionnalités

- 🤖 **Chatbot IA** — Répond sur le profil en temps réel depuis MongoDB
- 🎛️ **Panel Admin** — Modifier tout le contenu sans toucher au code
- 📄 **Upload CV** — PDF uploadable depuis l'admin
- 📧 **Contact EmailJS** — Emails directs depuis le site
- 🔐 **Sécurité** — Helmet, Rate Limit, CORS, JWT
- 📱 **Responsive** — Mobile first

## 🛠️ Installation locale

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Remplir les variables dans .env
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## 📁 Structure

```
portfolio-final/
├── backend/
│   ├── routes/        # API routes
│   ├── models/        # MongoDB models
│   ├── middleware/    # Auth, security
│   ├── db/            # Connection & seed
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        │   ├── admin/ # Panel admin
        │   └── ai/    # Outils IA
        ├── hooks/
        └── pages/
```

## 🔑 Variables d'environnement

```env
GROQ_API_KEY=
MONGODB_URI=
ADMIN_PASSWORD=
JWT_SECRET=
FRONTEND_URL=
NODE_ENV=production
```

## 👤 Auteur

**Adem SASSI** — Étudiant Master 1 IA — École Hexagone
- 🌐 [ademsassi.com](https://ademsassi.com)
- 📧 sassiadem7@gmail.com
- 🐙 [github.com/ADEM-SASSI](https://github.com/ADEM-SASSI)
