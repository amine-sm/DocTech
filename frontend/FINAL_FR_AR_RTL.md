# DOCTECH Frontend — FR / AR / RTL

## Installation

```bash
npm install
npm run dev
```

Variables attendues :

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## Fonctionnement

- Le sélecteur FR / العربية mémorise la langue dans `localStorage`.
- En arabe, `<html dir="rtl">` est appliqué automatiquement.
- Catégories, marques, produits et promotions viennent de l'API / base de données.
- Le Header affiche dynamiquement les catégories et les marques créées par l'admin.
- La page d'accueil affiche les catégories avec images, produits, promotions et marques avec logos depuis la base.
- Le catalogue filtre les produits par catégorie et par marque.
- Les champs arabes sont utilisés automatiquement en mode AR avec repli sur le français lorsqu'une traduction est vide.
- Les images uploadées par l'admin (`/uploads/...`) sont servies depuis le backend.
