# Asset Manager

Application desktop de gestion d'assets 3D. Importez vos FBX et textures, recherchez par nom, téléchargez en ZIP.

## Installation

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run electron:dev

# Build l'application (Windows/Mac)
npm run electron:build
```

## Structure

```
asset-manager-electron/
├── electron/
│   ├── main.ts          # Process principal Electron
│   └── preload.ts       # Bridge sécurisé IPC
├── src/
│   ├── main.tsx         # Entry point React
│   ├── App.tsx          # Composant principal
│   ├── index.css        # Styles Tailwind
│   └── components/
│       ├── AssetCard.tsx
│       ├── AssetGrid.tsx
│       ├── SearchBar.tsx
│       ├── ImportModal.tsx
│       └── EmptyState.tsx
├── vite.config.ts       # Config Vite + plugin Electron
└── package.json
```

## Fonctionnalités

- **Import** : Sélectionnez un FBX + textures, donnez un nom
- **Recherche** : Filtrage instantané par nom
- **Download** : Export ZIP de l'asset complet
- **Stockage** : Les assets sont stockés dans AppData (persistant)

## Où sont stockés les assets ?

- **Windows** : `C:\Users\<User>\AppData\Roaming\asset-manager\assets\`
- **Mac** : `~/Library/Application Support/asset-manager/assets/`

## Build & Distribution

```bash
# Build pour Windows (.exe portable + installateur)
npm run electron:build
```

Les fichiers générés seront dans le dossier `release/`.

## Auto-Update (GitHub Releases)

L'app vérifie automatiquement les mises à jour au démarrage.

### Setup initial

1. Modifie `package.json` → remplace `GITHUB_USERNAME` par ton username GitHub
2. Crée un repo GitHub pour l'app
3. Génère un token GitHub avec les droits `repo` : https://github.com/settings/tokens

### Publier une mise à jour

1. Bump la version dans `package.json` (ex: `1.0.0` → `1.1.0`)
2. Build et publie :
   ```bash
   # Windows
   set GH_TOKEN=ton_github_token && npm run electron:build
   
   # Mac/Linux
   GH_TOKEN=ton_github_token npm run electron:build
   ```
3. Les fichiers sont automatiquement uploadés sur GitHub Releases

### Comment ça marche

- Au démarrage, l'app check s'il y a une nouvelle release sur GitHub
- Si oui, elle télécharge en background
- Une fois téléchargée, elle propose de redémarrer pour installer

## Stack

- **Electron** - Shell applicatif desktop
- **Vite** - Bundler rapide
- **React** - UI
- **Tailwind CSS** - Styling
- **electron-store** - Stockage des métadonnées
- **archiver** - Création des ZIP
