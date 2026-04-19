# Transmission des savoirs

Prototype Next.js pour capter le savoir-faire d’une personne-clé, puis relire le dossier côté manager.

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Générer l’export statique

```bash
npm run build
```

Le build statique est écrit dans le dossier `out/`.

## Prévisualiser l’export statique

```bash
npm run preview:static
```

## Déployer sur un hébergement statique

Servez le contenu du dossier `out/` sur votre hébergeur statique.

Variable d’environnement requise : aucune.

## Vérification

```bash
npm run lint
npm run test
npm run build
```

## Hypothèses de démo

- Les données de démonstration restent en `localStorage`.
- Au premier accès à l’espace manager, un exemple seedé est créé automatiquement si le navigateur n’a encore aucune donnée.
- Les entretiens, les dossiers et la personne sélectionnée côté manager restent propres après rafraîchissement tant que le navigateur conserve son `localStorage`.
- Comme il n’y a pas de backend, chaque navigateur garde sa propre copie de la démo.
