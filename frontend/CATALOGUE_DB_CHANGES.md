# Catalogue dynamique depuis MySQL

## Frontend
- `components/Header.tsx` : catégories chargées depuis `GET /api/public/categories`.
- `app/page.tsx` : catégories, produits et promotions chargés depuis l'API publique.
- `lib/catalog.ts` : mapping des catégories MySQL et des produits/promotions.
- `next.config.ts` : autorise l'affichage des images servies par le backend (`/uploads`).
- `app/promotions/page.tsx` était déjà connecté à `GET /api/public/articles?promotion=1`.

## API utilisée
- `GET /api/public/categories`
- `GET /api/public/articles?limit=12`
- `GET /api/public/articles?promotion=1&limit=12`
- `GET /api/public/articles/:slug`

Les articles doivent avoir `status = ACTIF`. Les promotions doivent avoir `active = 1` et la date courante doit être comprise entre `start_at` et `end_at`.
