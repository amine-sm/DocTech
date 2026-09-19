# Intégration Elogistia — DOCTECH

L'intégration utilise uniquement le backend pour protéger la clé Elogistia. Le frontend appelle `/api/delivery/*` et ne connaît jamais `ELOGISTIA_API_KEY`.

## 1. Configuration

Dans `backend/.env`, renseigner :

```env
ELOGISTIA_BASE_URL=https://api.elogistia.com
ELOGISTIA_API_KEY=VOTRE_CLE_ELOGISTIA
ELOGISTIA_DELIVERY_MODE=4
ELOGISTIA_STOP_DESK=2
ELOGISTIA_DEFAULT_WEIGHT=1
HOME_DELIVERY_FEE=800
ELOGISTIA_REQUIRED_FOR_HOME=true
```

Ne pas mettre la clé dans Next.js, Git, le navigateur ou `NEXT_PUBLIC_*`.

## 2. Base de données

Après installation/mise à jour :

```bash
npm run update-db
```

La migration ajoute les informations Elogistia à `commandes` : tracking transporteur, statut de synchronisation, erreur, wilaya/commune IDs et paramètres de livraison.

## 3. Endpoints DOCTECH ajoutés

Publics :

- `GET /api/delivery/wilayas`
- `GET /api/delivery/municipalities?wilaya=16`
- `GET /api/delivery/shipping-costs`
- `GET /api/delivery/shipping-costs?wilaya=16`
- `GET /api/delivery/tracking?tracking=ELO-...`

Admin :

- `GET /api/delivery/orders`
- `GET /api/delivery/orders/:tracking`
- `GET /api/delivery/orders/:tracking/history`
- `GET /api/delivery/orders/:tracking/bordereau?format=10x10`
- `PATCH /api/delivery/orders/:tracking/status` avec `{ "status": 1 }` ou `{ "status": 2 }`
- `DELETE /api/delivery/orders/:tracking`
- `POST /api/delivery/orders/:id/sync` ou `POST /api/commandes/:id/sync-delivery`

## 4. Checkout

Le checkout charge désormais les wilayas et communes depuis Elogistia. Les frais sont calculés par wilaya au lieu d'utiliser systématiquement 800 DA.

À la création d'une commande à domicile :

1. DOCTECH vérifie le stock et calcule le prix côté serveur.
2. DOCTECH récupère le tarif Elogistia de la wilaya.
3. La commande est enregistrée localement.
4. Elle est envoyée à `insertCommande/`.
5. Le tracking Elogistia est enregistré dans `commandes.delivery_tracking`.
6. En cas d'échec transporteur, la commande reste enregistrée avec `delivery_sync_status=ERROR` et peut être resynchronisée depuis l'administration.

Le retrait magasin ne crée pas de commande Elogistia.

## 5. Suivi client

Une page `/suivi` permet au client de saisir le tracking et son téléphone. Le backend DOCTECH vérifie d'abord la commande locale.
