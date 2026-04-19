# Transmission des savoirs

Prototype Next.js pour capter le savoir-faire d’une personne-clé, puis relire le dossier côté manager.

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Commandes utiles :

```bash
npm run lint
npm run test
npm run build
```

## Déployer rapidement sur Vercel

1. Pousser le dépôt sur GitHub.
2. Aller sur [vercel.com/new](https://vercel.com/new).
3. Importer le dépôt.
4. Garder la configuration détectée par défaut pour Next.js.
5. Lancer le déploiement.

Variable d’environnement requise : aucune.

## Hypothèses de démo

- Les données de démonstration restent en `localStorage`.
- Au premier accès à l’espace manager, un exemple seedé est créé automatiquement si le navigateur n’a encore aucune donnée.
- Les entretiens, les dossiers et la personne sélectionnée côté manager restent propres après rafraîchissement tant que le navigateur conserve son `localStorage`.
- Comme il n’y a pas de backend, chaque navigateur garde sa propre copie de la démo.
