# Architecture backend DOCTECH

Le backend est organisé par responsabilité afin d'éviter de mélanger la logique HTTP, la sécurité et l'accès MySQL.

## src/controllers
Contient la logique métier appelée par les routes.

- auth.controller.js : connexion, session JWT, déconnexion, mot de passe
- users.controller.js : CRUD utilisateurs
- roles.controller.js : CRUD rôles + affectation des permissions
- permissions.controller.js : lecture des permissions
- fournisseurs.controller.js : CRUD fournisseurs
- categories.controller.js : CRUD catégories / sous-catégories
- marques.controller.js : CRUD marques
- articles.controller.js : CRUD articles, images, variantes
- promotions.controller.js : CRUD promotions
- commandes.controller.js : commandes admin + création publique + suivi
- dashboard.controller.js : statistiques du dashboard
- public.controller.js : catalogue public
- uploads.controller.js : réponse après upload d'image

## src/routes
Déclare les URLs, les méthodes HTTP et les middlewares nécessaires.

## src/middleware
- auth.js : vérifie JWT depuis cookie ou Bearer token
- authorize.js : contrôle les permissions RBAC
- upload.js : configuration Multer pour les images
- errorHandler.js : 404 + gestion centralisée des erreurs

## src/config
- db.js : pool MySQL mysql2/promise

## src/utils
- asyncHandler.js : gestion des erreurs async Express
- jwt.js : création / vérification JWT
- pagination.js : paramètres page/limit
- slug.js : génération des slugs

## db
- schema.sql : tables, index, rôles, permissions et données initiales

## scripts
- initDb.js : création / mise à jour initiale de la base
- seedAdmin.js : création du compte administrateur initial

## server.js
Point d'entrée Node.js.

## src/app.js
Configuration Express, CORS, Helmet, cookies, rate limit, routes et fichiers uploads.
