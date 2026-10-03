# fcvisualizer-showcase
Note : Ceci est un dépôt vitrine. Le code source complet est hébergé sur un dépôt privé.

# FC VISUALIZER 📊⚽
Un outil de visualisation vidéo avancé pour l'analyse statistique du football, construit avec **Remotion**. Créez des vidéos dynamiques et engageantes à partir de données de joueurs, avec animations, masques personnalisés et analyses prédictives.

## 🎯 Vue d'ensemble





## 🎬 Exemples de rendu Vidéo :
<p align="center">
  <a href="https://www.youtube.com/watch?v=4DyBI0RNUvU">
    <img src="https://img.youtube.com/vi/4DyBI0RNUvU/maxresdefault.jpg" width="500">
  </a>
</p>

<p align="center">
  <a href="https://youtube.com/shorts/A9zdFnEmdC4">
    <img src="https://img.youtube.com/vi/A9zdFnEmdC4/maxresdefault.jpg" width="500">
  </a>
  <a href="https://youtube.com/shorts/Bk__3-hEz64">
    <img src="https://img.youtube.com/vi/Bk__3-hEz64/maxresdefault.jpg" width="500">
  </a>
</p>

<p align="center">
  <a href="https://youtube.com/shorts/IusQLI_F6L4">
    <img src="https://img.youtube.com/vi/IusQLI_F6L4/maxresdefault.jpg" width="500">
  </a>
  <a href="https://www.youtube.com/watch?v=F02xUDLv_wg">
    <img src="https://img.youtube.com/vi/F02xUDLv_wg/maxresdefault.jpg" width="500">
  </a>
</p>



**FC Visualizer** est une plateforme de création de vidéos d'analyse footballistique qui transforme les données statistiques brutes en visualisations visuelles captivantes. Utilisant Remotion pour le rendu vidéo, le projet combine :

- **Visualisations de données** : Graphiques, courbes, grilles de joueurs
- **Animations personnalisées** : Masques de silhouette, chemins animés, effets spéciaux
- **Analyse prédictive** : Algorithmes d'IA pour prédire les performances
- **Interface de configuration** : Positionnement d'images, zoom, ratios

### Tagline
> "Transforming football data into cinematic experiences" 🎬⚽

## ✨ Fonctionnalités principales

### 1. **Visualisations de Joueurs** 👤
- **Grilles de joueurs** : Affichage horizontal, vertical ou en colonnes
- **Cartes de profil** : Headers personnalisés avec statistiques
- **Positionnement dynamique** : Zoom, position, ratio d'aspect configurables
- **Masques de silhouette** : Animations autour des contours des joueurs
- **Effets visuels** : Glow, bordures électriques, halos 3D

### 2. **Analyse Statistique** 📈
- **Courbes progressives** : Évolution des statistiques au fil du temps
- **Comparaisons** : Entre joueurs, équipes, saisons
- **Métriques clés** : Passes, tirs, duels, interceptions, etc.
- **Analyse comparative** : Meilleures/pires stats par joueur
- **Quiz interactif** : Questions sur les statistiques

### 3. **Animations et Effets** 🎬
- **Masques animés** : Silhouettes avec bordures électriques, vortex, flammes
- **Chemins de mouvement** : Trajectoires bruitées, fractales, ondes
- **Transitions fluides** : Easing, springs, interpolations
- **Effets temporels** : Countdown, progressions, révélations
- **Stickers SVG** : Icônes cœur, couronne, éclair, ballon

### 4. **Prédictions et IA** 🤖
- **Algorithmes prédictifs** :
  - Moyenne mobile exponentielle (EWMA)
  - Régression linéaire
  - Marche aléatoire avec dérive
  - Holt-Winters
  - Moyennes pondérées
- **IA avancée** : TensorFlow.js pour analyses complexes
- **Détection de talents** : Identification de joueurs sous-cotés
- **Fantasy football** : Analyses pour optimisation d'équipes

### 5. **Configuration Dynamique** ⚙️
- **Positionneur d'images** : Interface drag & drop pour ajuster les images
- **Serveur de configuration** : API Express pour sauvegarder les configs
- **Zoom et position** : Contrôle précis du placement
- **Ratios d'aspect** : 16:9, 1:1, personnalisés

### 6. **Templates et Composants** 🎨
- **Catch phrases** : Phrases accrocheuses animées
- **Headers de quiz** : Titres avec compteurs à rebours
- **Écrans de fin** : Résumés avec icônes et messages
- **Cartes d'intro** : Présentations de joueurs/équipes
- **Logos horizontaux** : Affichage d'équipes côte à côte

## 📱 Stack Technique

### Framework Vidéo
| Aspect | Technologie |
|--------|------------|
| Framework | Remotion 4.0.395 |
| Langage | TypeScript 5.8.2 |
| UI | React 19.0.0 |
| Styling | TailwindCSS 4.0.0 |
| Animations | Framer Motion 12.23.26 |
| Canvas | React-Konva 19.2.3 |

### Données et Visualisation
- **D3.js** (7.9.0) : Graphiques et visualisations
- **Recharts** (3.2.1) : Composants de graphiques React
- **PapaParse** (5.5.3) : Parsing CSV
- **TensorFlow.js** (4.22.0) : IA et prédictions

### Backend et API
- **Express.js** (4.21.2) : Serveur de configuration
- **CORS** (2.8.5) : Cross-origin requests
- **CSV Parser** (3.2.0) : Traitement des données CSV

### Utilitaires
- **Zod** (3.22.3) : Validation des données
- **Lucide React** (0.562.0) : Icônes SVG
- **Autoprefixer** (10.4.21) : CSS prefixes
- **PostCSS** (8.5.6) : Traitement CSS

## 🏗️ Architecture

```
fc_visualizer/
├── src/
│   ├── Main/                          # Composants principaux
│   │   ├── prediction/                # Algorithmes prédictifs
│   │   │   └── PredictionFunctions.tsx
│   │   └── test/                      # Composants de test
│   ├── Utilities/                     # Utilitaires visuels
│   │   ├── PlayersGrid.tsx           # Grilles de joueurs
│   │   ├── ImagePositioner.tsx       # Positionneur d'images
│   │   ├── MaskAnimation.tsx         # Animations de masques
│   │   ├── PersonMaskTemplates.tsx   # Templates de masques
│   │   ├── PersonPaths.tsx           # Générateurs de chemins
│   │   ├── CatchPhrase.tsx           # Phrases accrocheuses
│   │   ├── EndScreen.tsx             # Écrans de fin
│   │   ├── Header.tsx                # Headers de joueurs
│   │   ├── StickersSvg.tsx           # Icônes SVG
│   │   └── types.tsx                 # Types TypeScript
│   ├── const/                        # Constantes
│   │   ├── players.ts                # Données joueurs
│   │   └── TinyFunctions.ts          # Fonctions utilitaires
│   ├── data/                         # Données de configuration
│   │   ├── imageConfigs.json         # Configs d'images
│   │   └── imageConfigs.ts           # Types configs
│   ├── Root.tsx                      # Point d'entrée Remotion
│   ├── index.css                     # Styles globaux
│   └── FontLoader.tsx                # Chargement polices
├── public/                           # Assets statiques
│   ├── players.json                  # Métadonnées joueurs
│   ├── playersData/                  # Données CSV par équipe
│   ├── playersImgClean/              # Images joueurs nettoyées
│   ├── masks/                        # Masques de silhouette JSON
│   ├── cryptedImg/                   # Images cryptées
│   └── quiz/                         # Assets quiz
├── brouillon/                        # Développement
│   ├── ideesAnalyse.txt              # Idées d'analyse
│   ├── remarques.txt                 # Notes techniques
│   ├── saves.txt                     # Sauvegardes
│   └── spider.tsx                    # Composant araignée
├── server.js                         # Serveur de configuration
├── remotion.config.ts               # Config Remotion
├── package.json                      # Dépendances
└── tsconfig.json                     # Config TypeScript
```

## 🎮 Flux utilisateur

### Créateur de Vidéo
1. ✅ Configurer les données des joueurs (CSV)
2. ✅ Sélectionner un template de visualisation
3. ✅ Ajuster les positions d'images via l'interface
4. ✅ Configurer les animations et effets
5. ✅ Prévisualiser la vidéo
6. ✅ Exporter en haute qualité

### Analyste de Données
1. ✅ Importer les données statistiques des joueurs
2. ✅ Sélectionner les métriques à analyser
3. ✅ Choisir l'algorithme prédictif
4. ✅ Générer les visualisations
5. ✅ Créer des comparaisons entre joueurs/équipes

### Développeur
1. ✅ Créer de nouveaux templates de visualisation
2. ✅ Développer des algorithmes d'animation
3. ✅ Ajouter des effets visuels personnalisés
4. ✅ Étendre les capacités d'IA

## 📡 API et Configuration

### Serveur Express (port 5050)
```javascript
POST /save-config        // Sauvegarder config image
GET  /get-config/:key    // Récupérer config image
POST /api/list-players   // Lister joueurs par équipe
```

### Configuration d'Images
```json
{
  "playerName": {
    "zoom": 2.0,
    "pos": { "x": 12.0, "y": 67.8 },
    "ratio": [16, 9]
  }
}
```

## 🎯 Types de données principaux

### Player
```typescript
{
  name: string;
  color: string;
  csv: string;           // Chemin vers données CSV
  imgPlayer: string;     // Chemin vers image
  clubSrc: string;       // Logo club
  nationSrc: string;     // Drapeau nation
  mask?: string;         // Masque silhouette
}
```

### Config Image
```typescript
{
  zoom: number;          // Facteur de zoom
  pos: { x: number; y: number };  // Position
  ratio: [number, number];       // Ratio d'aspect
}
```

### Statistiques Joueur
```typescript
{
  date: string;
  passes: number;
  shots: number;
  tackles: number;
  interceptions: number;
  // ... autres métriques
}
```

## 🎬 Composants Clés

### PlayersGrid
- Affichage flexible : horizontal, vertical, colonnes
- Mode statique/dynamique
- Cartes de joueurs avec headers

### ImagePositioner
- Interface drag & drop
- Zoom et position en temps réel
- Sauvegarde automatique des configs

### MaskAnimation
- Animations de silhouette
- Effets électriques, vortex, flammes
- Chemins de mouvement procéduraux

### PredictionFunctions
- 7 algorithmes prédictifs
- Intégration TensorFlow.js
- Analyses de tendances

## 🚀 Installation et Setup

### Prérequis
- Node.js (v18+)
- npm ou yarn
- FFmpeg (pour l'export vidéo)

### Installation
```bash
npm install
```

### Développement

**Lancer le studio Remotion** :
```bash
npm run dev
```

**Lancer le serveur de configuration** :
```bash
node server.js
```

### Export Vidéo
```bash
npx remotion render <composition> <output.mp4>
```

### Mise à jour Remotion
```bash
npm run upgrade
```

### Linting
```bash
npm run lint
```

## 📦 Commandes disponibles

```bash
npm run dev              # Studio Remotion
npm run build            # Bundle pour production
npm run upgrade          # Mettre à jour Remotion
npm run lint             # Vérifier le code
```

## 🎨 Templates de Visualisation

### CatchPhrase
- Phrases accrocheuses animées
- Comparaisons joueur à joueur
- Statistiques révélées progressivement

### Quiz Templates
- Questions à choix multiples
- Compte à rebours dramatique
- Révélations de réponses

### End Screens
- Résumés de statistiques
- Messages personnalisés
- Icônes et effets visuels

### Person Masks
- Silhouettes avec effets spéciaux
- Bordures animées (électrique, rotation, glow)
- Chemins de mouvement complexes

## 🤖 Algorithmes Prédictifs

### Méthodes Statistiques
1. **EWMA** : Moyenne mobile exponentielle
2. **Régression Linéaire** : Tendances linéaires
3. **Marche Aléatoire** : Avec dérive
4. **Moyennes Pondérées** : Par importance temporelle
5. **Holt-Winters** : Saisonnalité et tendance
6. **Moyenne Cumulative** : Historique complet
7. **Moyenne Simple** : Base de référence

### IA Avancée
- **TensorFlow.js** : Modèles de deep learning
- **Analyse de patterns** : Détection de tendances
- **Prédictions multi-variables** : Plusieurs métriques

## 🎯 Idées d'Analyse (brouillon/)

### Analyses Implémentées
- **Comparaisons équipe** : Real Madrid vs FC Barcelone
- **Stats individuelles** : Meilleures/pires performances
- **Évolution temporelle** : Courbes de progression
- **Quiz interactif** : Questions sur les données

### Idées Futures
- **Détection de talents** : Joueurs sous-cotés
- **Fantasy football** : Optimisation d'équipes
- **Prédictions de mercato** : Transferts probables
- **Analyse comparative** : Par position, âge, nationalité

## 📊 Formats de Données

### CSV Joueurs
```csv
date,passes,shots,tackles,interceptions,duels_won,minutes_played
2024-01-15,45,3,8,2,12,90
2024-01-22,52,5,6,3,15,85
...
```

### Masques Silhouette (JSON)
```json
{
  "polygon": [
    [100, 200],
    [150, 180],
    [200, 220],
    ...
  ]
}
```

## 🎬 Export et Rendu

### Formats Supportés
- **MP4** : Haute qualité
- **WebM** : Web optimisé
- **GIF** : Animations courtes
- **Images** : Stills individuels

### Configurations
- **Résolution** : 1920x1080 (Full HD)
- **Framerate** : 30 FPS
- **Codec** : H.264
- **Qualité** : Configurable

## 🐛 Debugging

L'application inclut :
- **Console logs** détaillés
- **Validation Zod** des données
- **Gestion d'erreurs** pour les fichiers manquants
- **Fallbacks** pour les configs absentes

## 📱 Responsive Design

- **Adaptation automatique** : Différentes résolutions
- **Templates flexibles** : Grilles adaptatives
- **Textes scalables** : Tailles relatives

## 🔄 État et Données

### Gestion d'État
- **Props drilling** : Passage de données entre composants
- **State local** : Gestion des animations frame par frame
- **Configs persistées** : Sauvegarde serveur des positions

### Sources de Données
- **CSV locaux** : Statistiques par joueur/équipe
- **JSON configs** : Positions et paramètres visuels
- **Assets statiques** : Images, masques, polices

## 🎓 Ressources

- [Remotion Docs](https://www.remotion.dev/docs/)
- [React Docs](https://react.dev/)
- [D3.js Docs](https://d3js.org/)
- [TensorFlow.js](https://www.tensorflow.org/js)
- [Framer Motion](https://www.framer.com/motion/)
- [TailwindCSS](https://tailwindcss.com/)

## 📄 Licence

Projet privé.

## 👥 Auteur

Projet personnel FC Visualizer

---

## 💡 Notes de développement

- **Remotion-first** : Architecture optimisée pour le rendu vidéo
- **Frame-based** : Animations synchronisées sur les frames
- **Performance** : Optimisations pour le rendu haute qualité
- **Modularité** : Composants réutilisables et configurables
- **Évolutivité** : Architecture extensible pour nouveaux templates

## 🚀 Améliorations futures

- **Interface web** : Éditeur visuel drag & drop
- **Templates prédéfinis** : Bibliothèque de visualisations
- **Intégration API** : Données en temps réel
- **Collaboration** : Édition multi-utilisateurs
- **Export avancés** : Formats 4K, animations complexes
- **IA générative** : Création automatique de narratifs
- **Analytics** : Métriques d'engagement des vidéos
- **Mobile** : Application compagnon pour prévisualisation