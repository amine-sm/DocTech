# Catalogue public dynamique

Le backend expose déjà les routes nécessaires au site public.

- `GET /api/public/categories`
- `GET /api/public/articles`
- `GET /api/public/articles?promotion=1`
- `GET /api/public/articles/:slug`

La route des catégories renvoie aussi `article_count` pour chaque catégorie active.
Les promotions sont appliquées uniquement lorsqu'elles sont actives et dans leur période `start_at` / `end_at`.
