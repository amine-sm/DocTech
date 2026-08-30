# DOCTECH — Version finale FR / AR + Images + Marques

## Base existante

```bash
npm install
npm run catalog:upgrade
npm run dev
```

`catalog:upgrade` ajoute les colonnes bilingues sans supprimer vos données, puis remet à jour le catalogue de démonstration existant.

## Nouvelle base

```bash
npm install
npm run db:setup-catalog
npm run admin:seed
npm run dev
```

## Administration

- Catégories : nom FR, nom AR, descriptions FR/AR, image.
- Marques : nom FR, nom AR, descriptions FR/AR, logo, ordre d'affichage.
- Articles : textes FR/AR, catégorie, marque liée par `marque_id`, image principale.
- Fiche article admin : galerie multi-images, image principale, suppression d'image, variantes FR/AR.
- Promotions : nom et badge FR/AR.
- Upload images : JPG, PNG, WEBP, 5 Mo maximum.

## API publique

- `GET /api/public/categories`
- `GET /api/public/marques`
- `GET /api/public/articles`
- `GET /api/public/articles?marque=<slug>`
- `GET /api/public/articles?categorie=<slug>`
- `GET /api/public/articles?promotion=1`
