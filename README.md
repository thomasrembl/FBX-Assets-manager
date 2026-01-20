# Asset Manager

Application de gestion d'assets 3D, textures et stockshots pour les artistes VFX et 3D.

## Installation

1. Téléchargez la dernière version depuis la page [Releases](https://github.com/thomasrembl/FBX-Assets-manager/releases)
2. Téléchargez le fichier `Asset-Manager-Setup-X.X.X.exe`
3. Executez l'installeur en mode administrateur et suivez les instructions
4. Si Windows Defender affiche un avertissement, cliquez sur "Informations complémentaires" → "Exécuter quand même"

## Fonctionnalités

### Assets 3D
- Importez vos fichiers FBX avec leurs textures associées
- Visualisez vos assets avec des thumbnails générées automatiquement
- Téléchargez vos assets en archive ZIP
- Renommez et supprimez vos assets

### Textures
- Importez des sets de textures (PNG, JPG, TGA, EXR, HDR, etc.)
- Organisez vos textures par nom
- Exportez en ZIP

### Stockshots
- Importez des vidéos (MP4, MOV, AVI, etc.)
- Importez des séquences d'images (PNG, JPG, EXR, TIFF)
- Détection automatique des séquences d'images
- Génération de thumbnails automatique

## Utilisation

### Importer un asset

1. Sélectionnez l'onglet souhaité (Assets, Textures ou Stockshots)
2. Cliquez sur le bouton "Importer" en haut à droite
3. Sélectionnez vos fichiers
4. Donnez un nom à votre asset
5. Cliquez sur "Enregistrer"

### Télécharger un asset

1. Survolez la carte de l'asset
2. Cliquez sur l'icône de téléchargement
3. Choisissez l'emplacement de sauvegarde

### Rechercher

Utilisez la barre de recherche pour filtrer vos assets par nom.

## Mises à jour automatiques

L'application vérifie automatiquement les mises à jour au démarrage. Si une nouvelle version est disponible :

1. Le téléchargement démarre automatiquement en arrière-plan
2. Une fois terminé, une fenêtre vous propose de redémarrer
3. Cliquez sur "Redémarrer" pour installer la mise à jour

Les mises à jour sont incrémentales et préservent tous vos assets.

## Stockage des données

Vos assets sont stockés localement dans :
```
%APPDATA%/Roaming/asset-manager/
```

Ce dossier contient :
- `assets/` - Vos fichiers FBX et textures
- `textures/` - Vos sets de textures
- `stockshots/` - Vos vidéos et séquences

## Raccourcis

| Action | Raccourci |
|--------|-----------|
| Rechercher | Tapez dans la barre de recherche |
| Fermer | Cliquer sur X |
| Minimiser | Cliquer sur - |
| Maximiser | Cliquer sur □ |

## Formats supportés

### Assets 3D
- FBX

### Textures
- PNG, JPG, JPEG
- TGA, TIFF, TIF
- EXR, HDR, BMP

### Stockshots
- Vidéos : MP4, MOV, AVI, MKV, WEBM
- Séquences : PNG, JPG, JPEG, EXR, TIFF, TIF

## Développement

### Prérequis
- Node.js 20+
- npm

### Installation
```bash
git clone https://github.com/thomasrembl/FBX-Assets-manager.git
cd FBX-Assets-manager
npm install
```

### Lancer en développement
```bash
npm run dev
```

### Build
```bash
npm run electron:build
```

## Licence

MIT