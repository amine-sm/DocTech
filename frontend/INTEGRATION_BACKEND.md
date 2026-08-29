# DOCTECH Frontend ↔ Backend

## 1. Backend

Dans `backend/` :

```bash
npm install
```

Copier `.env.example` vers `.env`, puis configurer MySQL.

```bash
npm run db:init
npm run admin:seed
npm run dev
```

Backend attendu : `http://localhost:5000`

## 2. Frontend

Dans `frontend/` :

```bash
npm install
npm run dev
```

`.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

Frontend attendu : `http://localhost:3000`

## 3. Administration

Connexion : `http://localhost:3000/admin/connexion`

Modules : dashboard, utilisateurs, rôles, permissions, fournisseurs, catégories, marques, articles, images/variantes d'article, promotions, commandes.

## 4. Catalogue public connecté

- `/articles` utilise `/api/public/articles`
- `/article?slug=...` utilise `/api/public/articles/:slug`
- `/promotions` utilise `/api/public/articles?promotion=1`
- `/commande` crée la commande via `POST /api/public/commandes`

Les prix et le stock sont recalculés côté backend lors de la commande.
