# Catalogue de démonstration DOCTECH

Le projet contient maintenant un seed réexécutable qui remet dans MySQL les catégories, images et produits qui existaient dans l'ancien frontend statique.

## Données ajoutées

- 7 catégories : Ordinateurs, PC Portables, PC Fixes, Écrans, Composants, Périphériques, Accessoires.
- 7 marques : HP, ASUS, MSI, Dell, DOCTECH, Logitech, Kingston.
- 12 produits historiques du frontend.
- Les galeries d'images existantes sous `/public/images/...`.
- Les anciens prix barrés sont convertis en promotions actives pour que les produits apparaissent aussi sur `/promotions`.

## Première installation

```bash
npm run db:setup-catalog
```

Cette commande initialise le schéma puis insère le catalogue.

## Base déjà créée

```bash
npm run catalog:seed
```

Le seed est idempotent : il met à jour les catégories/produits du catalogue de démonstration au lieu de créer des doublons. Il ne supprime pas vos autres catégories ou articles.
