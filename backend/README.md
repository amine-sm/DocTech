# DOCTECH Backend

Backend e-commerce complet en **Node.js + Express + MySQL** avec **JWT + bcrypt + rôles/permissions (RBAC)**.

## Modules inclus

- Authentification : connexion, déconnexion, profil connecté, changement de mot de passe.
- Utilisateurs : CRUD, statuts ACTIF / INACTIF / CONGE / MALADIE.
- Rôles et permissions : création de rôles, affectation dynamique des permissions.
- Fournisseurs : CRUD complet.
- Catégories et sous-catégories : CRUD hiérarchique.
- Marques : CRUD.
- Articles : CRUD, prix achat/vente, stock optionnel, images, variantes (couleur, taille, pointure, parfum).
- Promotions : pourcentage ou montant fixe, dates, liaison à plusieurs articles.
- Commandes : checkout public, calcul côté serveur, suivi, statuts, lignes de commande.
- Dashboard : CA livré, commandes, commandes du jour, stock faible, meilleurs articles, ventes sur 14 jours.
- Upload d'images : JPG/PNG/WEBP, limite 5 Mo.
- Sécurité : Helmet, CORS, cookies httpOnly, Bearer JWT, bcrypt 12 rounds, rate-limit sur login.

## Installation

```bash
npm install
cp .env.example .env
```

Configurez MySQL dans `.env`, puis :

```bash
npm run db:init
npm run admin:seed
npm run dev
```

API : `http://localhost:5000/api`

## Compte administrateur

Les identifiants sont lus depuis :

```env
ADMIN_EMAIL=admin@doctech.local
ADMIN_PASSWORD=ChangeMe123!
```

Changez impérativement ces valeurs avant le seed en production.

## Principales routes publiques

- `GET /api/public/categories`
- `GET /api/public/marques`
- `GET /api/public/articles?page=1&limit=20`
- `GET /api/public/articles?categorie=ordinateurs`
- `GET /api/public/articles?promotion=1`
- `GET /api/public/articles/:slug`
- `POST /api/public/commandes`
- `GET /api/public/suivi-commande?trackingNumber=...&phone=...`

### Exemple création commande

```json
{
  "customerName": "Client Test",
  "phone": "0550000000",
  "wilaya": "Oran",
  "commune": "Es Sénia",
  "address": "Adresse client",
  "deliveryType": "HOME",
  "note": "Appelez avant la livraison",
  "items": [
    { "articleId": 1, "quantity": 2, "variantId": null }
  ]
}
```

Le prix, la promotion active, le stock, le sous-total et les frais de livraison sont recalculés **côté serveur**. Le frontend ne décide jamais du total final.

## Authentification admin

`POST /api/auth/login`

```json
{
  "email": "admin@doctech.local",
  "password": "ChangeMe123!",
  "rememberMe": true
}
```

Le backend renvoie le JWT et le place aussi dans un cookie `httpOnly`. Les routes protégées acceptent également :

```text
Authorization: Bearer <token>
```

## Permissions

Exemples :

- `dashboard.view`
- `users.view`, `users.create`, `users.update`, `users.delete`
- `roles.*`
- `fournisseurs.*`
- `categories.*`
- `marques.*`
- `articles.*`
- `promotions.*`
- `commandes.view`, `commandes.update`
- `uploads.create`

Le rôle `ADMIN` reçoit toutes les permissions. `OPERATEUR` reçoit un ensemble commercial par défaut. Vous pouvez créer d'autres rôles depuis l'API.

## Routes administration

Toutes ces routes nécessitent JWT + permission correspondante :

```text
/api/users
/api/roles
/api/permissions
/api/fournisseurs
/api/categories
/api/marques
/api/articles
/api/promotions
/api/commandes
/api/dashboard/summary
/api/uploads/image
```

## Upload image

`POST /api/uploads/image` en `multipart/form-data`, champ : `image`.

Réponse :

```json
{
  "ok": true,
  "data": {
    "filename": "...webp",
    "url": "http://localhost:5000/uploads/...webp"
  }
}
```

Ensuite l'URL peut être liée à un article avec `POST /api/articles/:id/images`.

## Structure

```text
src/
  config/
  controllers/
  middleware/
  routes/
  utils/
db/schema.sql
scripts/initDb.js
scripts/seedAdmin.js
uploads/
```

## À brancher au frontend Next.js

Dans le frontend :

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Pour les requêtes utilisant le cookie JWT :

```ts
fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
  credentials: "include"
});
```

