<div align="center">

# 🤖 Portfolio IA — Adem SASSI

[![Live](https://img.shields.io/badge/🌐_Live-ademsassi.com-00D4FF?style=for-the-badge)](https://ademsassi.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://mongodb.com)
[![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Railway](https://img.shields.io/badge/Railway-Backend-0B0D0E?style=for-the-badge&logo=railway)](https://railway.app)

**Portfolio Full-Stack IA — Étudiant Master 1 Intelligence Artificielle**  
**École Hexagone · Versailles**

</div>

---

## ✨ Fonctionnalités

### 🤖 Intelligence Artificielle
- **Chatbot IA** — Assistant personnel propulsé par LLaMA 3.3 70B (Groq API)
- **Analyseur de texte** — Analyse sémantique et résumé automatique
- **Code Reviewer** — Révision de code par IA
- **Bio Generator** — Génération de biographie professionnelle
- **Quiz IA** — Quiz interactif sur mes compétences

### 🎨 Portfolio Dynamique
- Contenu 100% gérable depuis le panneau admin
- Projets avec tags, stats, couleurs et mise en avant
- Blog technique avec compteur de vues
- Témoignages et recommandations
- CV PDF téléchargeable

### 🔐 Sécurité
- Authentification JWT avec expiration automatique
- **2FA OTP** — Code à 6 chiffres envoyé par email à chaque connexion
- Rate limiting (200 requêtes / 15 min)
- Blocage IP après 5 tentatives échouées
- Headers de sécurité Helmet
- Logs de connexion

### 📊 Analytics & Monitoring
- Dashboard admin avec graphique des visites
- Tracking des visiteurs (IP, pays, entreprise)
- Historique des modifications
- Alerte email quand nouveau visiteur
- GitHub Actions — CI/CD, backup MongoDB, monitoring uptime

---

## 🛠️ Stack Technique

| Catégorie | Technologies |
|-----------|-------------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Node.js, Express.js |
| **Base de données** | MongoDB Atlas |
| **IA** | Groq API (LLaMA 3.3 70B) |
| **Auth** | JWT, bcryptjs |
| **Email** | Resend API |
| **Déploiement** | Vercel (frontend) + Railway (backend) |
| **CI/CD** | GitHub Actions |
| **Conteneurisation** | Docker |

---

## 🚀 Installation locale

### Prérequis
- Node.js 18+
- MongoDB Atlas (ou local)
- Groq API Key
- Resend API Key

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Remplir les variables d'environnement
node server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Variables d'environnement Backend

```env
MONGODB_URI=mongodb+srv://...
GROQ_API_KEY=gsk_...
JWT_SECRET=votre_secret_jwt
ADMIN_PASSWORD=votre_mot_de_passe
RESEND_API_KEY=re_...
EMAIL_USER=votre@email.com
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

---

## 📁 Structure du projet

```
portfolio-final/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── components/        # Composants React
│   │   │   ├── admin/         # Panneau d'administration
│   │   │   └── ai/            # Outils IA
│   │   ├── pages/             # Pages (Blog, Mentions légales...)
│   │   └── hooks/             # Hooks personnalisés
│   └── public/                # Assets statiques
├── backend/                   # Node.js + Express
│   ├── routes/                # Routes API
│   │   ├── admin.js           # Auth + CRUD + 2FA
│   │   ├── ai.js              # Chatbot + ML
│   │   ├── blog.js            # Blog CRUD
│   │   ├── content.js         # API publique
│   │   └── security.js        # Tracking visiteurs
│   ├── models/                # Modèles MongoDB
│   └── server.js              # Serveur Express
└── .github/
    └── workflows/             # GitHub Actions
        ├── test.yml            # Tests automatiques
        ├── backup.yml          # Backup MongoDB
        ├── uptime.yml          # Monitoring uptime
        └── ci-cd.yml           # CI/CD Pipeline
```

---

## 🌐 Déploiement

### Frontend → Vercel
```bash
cd frontend && vercel --prod
```

### Backend → Railway
Push sur `main` → déploiement automatique

---

## 📡 API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/content` | Tout le contenu du portfolio |
| `GET` | `/api/blog` | Liste des articles |
| `GET` | `/api/blog/:slug` | Article par slug |
| `POST` | `/api/ai/chat` | Chatbot IA |
| `POST` | `/api/admin/login` | Connexion admin |
| `POST` | `/api/admin/verify-2fa` | Vérification 2FA |

---

## 👨‍💻 Auteur

**Adem SASSI**  
Étudiant Master 1 Intelligence Artificielle  
École Hexagone · Versailles

[![Portfolio](https://img.shields.io/badge/Portfolio-ademsassi.com-00D4FF?style=flat-square)](https://ademsassi.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-adem--sassi-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/adem-sassi)
[![GitHub](https://img.shields.io/badge/GitHub-ADEM--SASSI-181717?style=flat-square&logo=github)](https://github.com/ADEM-SASSI)
[![Email](https://img.shields.io/badge/Email-contact@ademsassi.com-EA4335?style=flat-square&logo=gmail)](mailto:contact@ademsassi.com)

---

## 📄 Licence

Ce projet est sous licence MIT — voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">
  <sub>⭐ Si ce projet t'a inspiré, n'hésite pas à laisser une étoile !</sub>
</div>
