# Budget Famille - Frontend React

Application web pour gérer vos budgets en famille.

## 🚀 Démarrage Rapide

### Installation

\`\`\`bash
npm install
\`\`\`

### Configuration

Créez un fichier \`.env\` à la racine :

\`\`\`bash
VITE_API_URL=https://budget-api-778i.onrender.com/api/v1
\`\`\`

### Développement

\`\`\`bash
npm run dev
# App disponible sur http://localhost:3000
\`\`\`

### Build Production

\`\`\`bash
npm run build
# Fichiers dans /dist
\`\`\`

## 📁 Structure

\`\`\`
src/
├── components/     # Composants réutilisables
├── contexts/       # Context API (Auth)
├── pages/          # Pages de l'app
├── services/       # API client
├── styles/         # CSS global
└── utils/          # Utilitaires
\`\`\`

## 🔐 Authentification

- Signup/Login avec JWT
- Token stocké dans localStorage
- Auto-refresh sur erreur 401

## 📡 API

Backend : https://budget-api-778i.onrender.com

Endpoints :
- POST /auth/signup
- POST /auth/login
- GET /budgets
- POST /budgets
- GET /budgets/:id/data
- PUT /budgets/:id/data

## 🚢 Déploiement Vercel

\`\`\`bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
\`\`\`

Ou connectez votre repo GitHub à Vercel (auto-deploy).

## ✅ Fonctionnalités

### Phase A (Actuelle)
- [x] Authentification (Login/Signup)
- [x] Dashboard budgets
- [x] Création de budgets
- [x] Invitations par email
- [x] Gestion profil
- [x] Multi-utilisateurs

### Phase B (À venir)
- [ ] Interface budget complète (HTML migré)
- [ ] Visualisations graphiques
- [ ] Gestion revenus/dépenses
- [ ] Projets et charges
- [ ] Export/Import données

## 📚 Stack

- React 18
- Vite
- React Router
- Axios
- TailwindCSS

## 🎨 Design

- TailwindCSS pour le styling
- Design system avec couleurs primary
- Composants réutilisables
- Responsive mobile-first
\`\`\`

---

# 🎯 Phase A Complete!

## Fichiers créés : 24

1. package.json
2. vite.config.js
3. tailwind.config.js
4. postcss.config.js
5. index.html
6. .gitignore
7. .env.example
8. src/main.jsx
9. src/styles/index.css
10. src/services/api.js
11. src/utils/storage.js
12. src/contexts/AuthContext.jsx
13. src/components/PrivateRoute.jsx
14. src/components/Navbar.jsx
15. src/components/BudgetCard.jsx
16. src/components/InviteModal.jsx
17. src/pages/Login.jsx
18. src/pages/Signup.jsx
19. src/pages/Dashboard.jsx
20. src/pages/Budget.jsx
21. src/pages/Profile.jsx
22. src/pages/NotFound.jsx
23. src/App.jsx
24. README.md

## ✅ Ce qui fonctionne :

- Auth complète (Login/Signup)
- Dashboard avec liste budgets
- Création de budgets
- Page budget avec membres
- Invitations par email
- Profil utilisateur
- Changement mot de passe
- Design moderne avec TailwindCSS

## 📦 Installation

\`\`\`bash
# 1. Créer le projet
npm create vite@latest budget-frontend -- --template react
cd budget-frontend

# 2. Copier tous les fichiers ci-dessus

# 3. Installer les dépendances
npm install

# 4. Configurer .env
cp .env.example .env
# Éditer VITE_API_URL

# 5. Lancer
npm run dev
\`\`\`

## 🧪 Test

1. Ouvrir http://localhost:3000
2. Créer un compte
3. Créer un budget
4. Inviter un membre
5. Gérer le profil

---

# 🎨 Phase B : Migration HTML (Prochaine étape)

Je vais maintenant migrer votre interface HTML complète dans React :
- Composants de budget détaillés
- Gestion revenus/salaires
- Charges et dépenses
- Projets et épargne
- Visualisations graphiques
- Export/Import JSON

**Prêt pour la Phase B ?**