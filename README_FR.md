<p align="center">
  <img src="docs/images/logo-banner.png" alt="Claudian" width="600">
</p>

<p align="center">
  <strong>L'intégration ultime de Claude AI pour Obsidian</strong>
</p>

<p align="center">
  <a href="https://enigmora.com">
    <img src="https://img.shields.io/badge/by-Enigmora-purple.svg?style=flat-square" alt="by Enigmora">
  </a>
  <a href="https://obsidian.md">
    <img src="https://img.shields.io/badge/Obsidian-Plugin-7C3AED?style=flat-square&logo=obsidian&logoColor=white" alt="Plugin Obsidian">
  </a>
  <a href="https://anthropic.com">
    <img src="https://img.shields.io/badge/Propulsé%20par-Claude-FF6B35?style=flat-square" alt="Propulsé par Claude">
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/Licence-MIT-green?style=flat-square" alt="Licence MIT">
  </a>
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#fonctionnalités">Fonctionnalités</a> •
  <a href="https://github.com/Enigmora/claudian/wiki">Documentation</a> •
  <a href="README.md">English</a> •
  <a href="README_ES.md">Español</a> •
  <a href="README_ZH.md">中文</a> •
  <a href="README_DE.md">Deutsch</a> •
  <a href="README_JA.md">日本語</a>
</p>

---

<p align="center">
  <img src="docs/images/preview.png" alt="Aperçu de Claudian" width="700">
</p>

---

## Qu'est-ce que Claudian ?

Claudian intègre **Claude AI** directement dans votre coffre Obsidian. Discutez avec Claude dans un panneau latéral dédié, traitez vos notes pour obtenir des suggestions intelligentes, et utilisez le **Mode Agent** pour gérer votre coffre entier avec des commandes en langage naturel.

Votre clé API reste sur votre appareil. Vos notes ne quittent jamais votre coffre à moins que vous ne demandiez à Claude de les analyser.

---

## Fonctionnalités

### 💬 Chat intégré
Conversez avec Claude sans quitter Obsidian. Les réponses arrivent en temps réel par streaming, et vous pouvez arrêter toute requête en cours de génération.

### 📝 Traitement intelligent des notes
Analysez vos notes et recevez des suggestions intelligentes de **tags**, **wikilinks** et **concepts atomiques** basées sur la structure existante de votre coffre.

### 🤖 Mode Agent
Gérez votre coffre en langage naturel :
- *"Crée un dossier Projets/2025 avec des sous-dossiers pour chaque trimestre"*
- *"Déplace toutes les notes avec le tag #archive dans le dossier Archive"*
- *"Traduis cette note en anglais"*

**52 actions** couvrant la gestion de fichiers, le contrôle de l'éditeur, les modèles, les signets, le canvas et plus encore.

### 📊 Traitement par lots
Traitez plusieurs notes à la fois avec des modèles d'extraction :
- Idées clés et résumés
- Questions et actions à faire
- Concepts et connexions

### 🗺️ Cartes conceptuelles
Générez des cartes conceptuelles visuelles à partir de notes sélectionnées, rendues au format Mermaid.

### 🧠 Sélection intelligente de modèle
L'orchestration automatique des modèles route chaque tâche vers le modèle Claude optimal :
- Tâches simples → Haiku (rapide et économique)
- Création de contenu → Sonnet (équilibré)
- Analyse approfondie → Opus (qualité maximale)

### 🌍 Multilingue
Support complet pour l'**anglais**, l'**espagnol**, le **chinois**, l'**allemand**, le **français** et le **japonais**. D'autres langues arrivent bientôt.

---

## Installation

### Depuis les plugins communautaires (Recommandé)
1. Ouvrez **Paramètres → Plugins communautaires**
2. Cliquez sur **Parcourir** et recherchez "Claudian"
3. Cliquez sur **Installer**, puis **Activer**

### Installation manuelle
1. Téléchargez la dernière version depuis [Releases](https://github.com/Enigmora/claudian/releases)
2. Extrayez dans `.obsidian/plugins/claudian/` de votre coffre
3. Activez dans **Paramètres → Plugins communautaires**

---

## Démarrage rapide

1. Obtenez votre clé API sur [console.anthropic.com](https://console.anthropic.com/)
2. Ouvrez **Paramètres → Claudian** et entrez votre clé
3. Cliquez sur l'icône Claudian dans le ruban ou utilisez la palette de commandes
4. Commencez à discuter !

Pour les options de configuration détaillées, consultez le [Guide de configuration](https://github.com/Enigmora/claudian/wiki/Configuration).

---

## Documentation

Visitez le **[Wiki](https://github.com/Enigmora/claudian/wiki)** pour la documentation complète :

- [Premiers pas](https://github.com/Enigmora/claudian/wiki/Getting-Started)
- [Interface de chat](https://github.com/Enigmora/claudian/wiki/Features/Chat-Interface)
- [Mode Agent](https://github.com/Enigmora/claudian/wiki/Features/Agent-Mode)
- [Traitement par lots](https://github.com/Enigmora/claudian/wiki/Features/Batch-Processing)
- [Dépannage](https://github.com/Enigmora/claudian/wiki/Troubleshooting)

---

## Confidentialité et sécurité

- **Stockage local** : Votre clé API est stockée uniquement sur votre appareil
- **Pas de télémétrie** : Nous ne collectons aucune donnée d'utilisation
- **Open source** : Code 100% auditable

---

## Contribuer

Les contributions sont les bienvenues ! Consultez notre [Guide de contribution](CONTRIBUTING.md) pour plus de détails.

```bash
git clone https://github.com/Enigmora/claudian.git
cd claudian && npm install
npm run dev
```

---

## Licence

[Licence MIT](LICENSE) — utilisez-le librement dans vos projets.

---

<p align="center">
  <img src="logo.svg" alt="Claudian" width="48">
</p>

<p align="center">
  <strong>Claudian</strong><br>
  <sub>Développé par <a href="https://github.com/Enigmora">Enigmora</a></sub>
</p>
