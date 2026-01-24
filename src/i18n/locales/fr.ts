import type { Translations } from '../types';

const translations: Translations = {
  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.title': 'Claudian - Paramètres',
  'settings.description': 'Plugin Obsidian pour l\'intégration de Claude AI développé par Enigmora. Discutez avec Claude, traitez vos notes pour obtenir des suggestions de tags et wikilinks, et gérez votre coffre avec le langage naturel en mode Agent. Confidentialité d\'abord : clé API stockée localement.',
  'settings.language.name': 'Langue',
  'settings.language.desc': 'Langue de l\'interface du plugin. "Auto" détecte depuis les paramètres Obsidian.',
  'settings.language.auto': 'Auto (détecter depuis Obsidian)',
  'settings.apiKey.name': 'Clé API',
  'settings.apiKey.descPart1': 'Obtenez votre clé API Anthropic sur ',
  'settings.apiKey.descPart2': '. Stockée localement dans votre coffre.',
  'settings.apiKey.placeholder': 'sk-ant-...',
  'settings.model.name': 'Modèle',
  'settings.model.desc': 'Sélectionnez le modèle Claude à utiliser.',
  'settings.model.sonnet4': 'Claude Sonnet 4 (Recommandé)',
  'settings.model.opus4': 'Claude Opus 4',
  'settings.model.sonnet35': 'Claude 3.5 Sonnet',
  'settings.model.haiku45': 'Claude Haiku 4.5 (Rapide)',
  // Execution Mode (Model Orchestrator)
  'settings.executionMode.name': 'Mode d\'exécution',
  'settings.executionMode.desc': 'Comment Claude sélectionne les modèles pour vos tâches.',
  'settings.executionMode.automatic': 'Automatique (Recommandé)',
  'settings.executionMode.automaticDesc': 'Routage intelligent : tâches simples vers Haiku, complexes vers Sonnet, analyses approfondies vers Opus.',
  'settings.executionMode.economic': 'Économique',
  'settings.executionMode.economicDesc': 'Toutes les tâches utilisent Haiku. Le plus rapide et abordable.',
  'settings.executionMode.maxQuality': 'Qualité maximale',
  'settings.executionMode.maxQualityDesc': 'Toutes les tâches utilisent Opus. Idéal pour les analyses complexes et la rédaction.',
  'settings.executionMode.currentModel': 'Utilise : {{model}}',
  'settings.folder.name': 'Dossier des notes',
  'settings.folder.desc': 'Dossier où les notes générées depuis le chat seront sauvegardées.',
  'settings.folder.placeholder': 'Claudian',
  'settings.maxTokens.name': 'Tokens maximum',
  'settings.maxTokens.desc': 'Nombre maximum de tokens dans les réponses (1000-8192).',
  'settings.customInstructions.name': 'Instructions personnalisées',
  'settings.customInstructions.desc': 'Instructions supplémentaires pour personnaliser le comportement de Claude. Elles s\'ajoutent aux instructions de base (ne les remplacent pas).',
  'settings.customInstructions.placeholder': 'Ex : Répondre toujours en français formel, utiliser des listes à puces...',
  'settings.customInstructions.clear': 'Effacer',
  'settings.customInstructions.cleared': 'Instructions personnalisées effacées',
  'settings.section.noteProcessing': 'Traitement des notes',
  'settings.maxNotesContext.name': 'Notes max. dans le contexte',
  'settings.maxNotesContext.desc': 'Nombre maximum de titres de notes à inclure lors du traitement (10-500).',
  'settings.maxTagsContext.name': 'Tags max. dans le contexte',
  'settings.maxTagsContext.desc': 'Nombre maximum de tags existants à inclure lors du traitement (10-200).',
  'settings.section.agentMode': 'Mode Agent',
  'settings.agentEnabled.name': 'Activer le mode agent par défaut',
  'settings.agentEnabled.desc': 'Le mode agent permet à Claude d\'exécuter des actions sur votre coffre.',
  'settings.confirmDestructive.name': 'Confirmer les actions destructives',
  'settings.confirmDestructive.desc': 'Demander confirmation avant de supprimer des fichiers ou remplacer du contenu.',
  'settings.protectedFolders.name': 'Dossiers protégés',
  'settings.protectedFolders.desc': 'Dossiers que l\'agent ne peut pas modifier (séparés par des virgules).',
  'settings.protectedFolders.placeholder': '.obsidian, templates',
  'settings.maxActions.name': 'Actions max. par message',
  'settings.maxActions.desc': 'Limite d\'actions que Claude peut exécuter dans un seul message (1-20).',
  'settings.footer.license': 'Sous licence MIT',
  'settings.footer.developedBy': 'Développé par',
  'settings.footer.sourceCode': 'Code source',

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT INTERFACE
  // ═══════════════════════════════════════════════════════════════════════════
  'chat.placeholder': 'Tapez votre message...',
  'chat.send': 'Envoyer',
  'chat.clearLabel': 'Effacer le chat',
  'chat.cleared': 'Chat effacé',
  'chat.agentLabel': 'Agent',
  'chat.agentEnabled': 'Mode agent activé',
  'chat.agentDisabled': 'Mode agent désactivé',
  'chat.copyLabel': 'Copier',
  'chat.copied': 'Copié dans le presse-papiers',
  'chat.createNoteLabel': 'Créer une note',
  'chat.actionsExecuted': '{{count}} action(s) exécutée(s)',
  'chat.actionsPartial': '{{success}} réussie(s), {{failed}} échouée(s)',
  'chat.actionsCancelled': 'Actions annulées par l\'utilisateur.',
  'chat.error': 'Erreur : {{message}}',
  'chat.errorUnknown': 'Erreur inconnue',
  'chat.stop': 'Arrêter',
  'chat.streamStopped': 'Réponse arrêtée par l\'utilisateur',

  // ═══════════════════════════════════════════════════════════════════════════
  // ERRORS
  // ═══════════════════════════════════════════════════════════════════════════
  'error.apiKeyMissing': 'Clé API non configurée. Allez dans Paramètres > Claudian.',
  'error.apiKeyInvalid': 'Clé API invalide. Vérifiez votre clé dans les Paramètres.',
  'error.rateLimit': 'Limite de requêtes dépassée. Réessayez dans quelques secondes.',
  'error.connection': 'Erreur de connexion. Vérifiez votre connexion internet.',
  'error.unknown': 'Erreur inconnue lors de la communication avec Claude.',
  'error.noActiveNote': 'Aucune note markdown active.',
  'error.parseJson': 'Aucun JSON valide trouvé dans la réponse.',
  'error.parseResponse': 'Erreur lors de l\'analyse du JSON de suggestion.',
  'error.tooManyActions': 'Trop d\'actions ({{count}}). Maximum autorisé : {{max}}',
  // Vault action errors
  'error.protectedPath': 'Chemin protégé : {{path}}',
  'error.folderNotFound': 'Dossier non trouvé : {{path}}',
  'error.folderNotEmpty': 'Le dossier n\'est pas vide : {{path}}',
  'error.fileAlreadyExists': 'Le fichier existe déjà : {{path}}. Utilisez overwrite: true pour écraser.',
  'error.noteNotFound': 'Note non trouvée : {{path}}',
  'error.sourceNoteNotFound': 'Note source non trouvée : {{path}}',
  'error.fileNotFound': 'Fichier non trouvé : {{path}}',
  'error.momentNotAvailable': 'Moment.js non disponible',
  'error.noActiveLeafToSplit': 'Aucun onglet actif à diviser',
  'error.unknownError': 'Erreur inconnue',
  // Concept map errors
  'error.conceptMapParse': 'Erreur lors de l\'analyse de la carte conceptuelle',
  'error.noValidJsonInResponse': 'Aucun JSON valide trouvé dans la réponse',

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTE CREATOR MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'noteCreator.title': 'Créer une note depuis le chat',
  'noteCreator.preview': 'Aperçu',
  'noteCreator.titleField.name': 'Titre',
  'noteCreator.titleField.desc': 'Nom du fichier (sans extension .md)',
  'noteCreator.tags.name': 'Tags',
  'noteCreator.tags.desc': 'Séparés par des virgules',
  'noteCreator.tags.placeholder': 'tag1, tag2, tag3',
  'noteCreator.folder.name': 'Dossier',
  'noteCreator.folder.desc': 'Dossier de destination pour la note',
  'noteCreator.cancel': 'Annuler',
  'noteCreator.create': 'Créer la note',
  'noteCreator.titleRequired': 'Le titre est requis',
  'noteCreator.fileExists': 'Un fichier avec ce nom existe déjà : {{name}}',
  'noteCreator.created': 'Note créée : {{path}}',
  'noteCreator.error': 'Erreur lors de la création de la note : {{message}}',

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'batch.titleExtraction': 'Traitement par lots',
  'batch.titleConceptMap': 'Générer une carte conceptuelle',
  'batch.selectNotes': 'Sélectionner les notes',
  'batch.selectFolder': 'Sélectionner un dossier',
  'batch.selectAll': 'Tout sélectionner',
  'batch.clear': 'Effacer',
  'batch.counter': '{{count}} notes sélectionnées',
  'batch.noNotes': 'Aucune note dans le coffre',
  'batch.rootFolder': 'Racine',
  'batch.selectTemplate': 'Sélectionner un modèle',
  'batch.mapOptions': 'Options de la carte',
  'batch.mapTitle': 'Titre de la carte :',
  'batch.mapTitlePlaceholder': 'Ma carte conceptuelle',
  'batch.cancel': 'Annuler',
  'batch.processNotes': 'Traiter les notes',
  'batch.generateMap': 'Générer la carte',
  'batch.selectAtLeastOne': 'Sélectionnez au moins une note',
  'batch.selectTemplateRequired': 'Sélectionnez un modèle',
  'batch.starting': 'Démarrage du traitement...',
  'batch.processing': 'Traitement {{current}}/{{total}} : {{note}}',
  'batch.completed': 'Terminé : {{success}} réussies, {{errors}} erreurs',
  'batch.savedTo': 'Résultats sauvegardés dans : {{path}}',
  'batch.analyzing': 'Analyse des notes...',
  'batch.saving': 'Sauvegarde de la carte...',
  'batch.mapGenerated': 'Carte générée avec succès',
  'batch.errorProcessing': 'Erreur lors du traitement',
  'batch.errorGenerating': 'Erreur lors de la génération de la carte',
  'batch.folderPrompt': 'Entrez le nom du dossier :',

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIRMATION MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'confirmation.title': 'Confirmer les actions',
  'confirmation.description': 'Les actions suivantes nécessitent une confirmation :',
  'confirmation.warning': 'Cette action ne peut pas être annulée.',
  'confirmation.cancel': 'Annuler',
  'confirmation.confirm': 'Confirmer',
  'confirmation.deleteNote': 'Supprimer la note : {{path}}',
  'confirmation.deleteFolder': 'Supprimer le dossier : {{path}}',
  'confirmation.replaceContent': 'Remplacer le contenu de : {{path}}',
  'confirmation.overwriteNote': 'Écraser le fichier existant : {{path}}',
  'confirmation.moveNote': 'Déplacer : {{from}} → {{to}}',
  'confirmation.renameNote': 'Renommer : {{from}} → {{to}}',

  // ═══════════════════════════════════════════════════════════════════════════
  // SUGGESTIONS MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'suggestions.title': 'Suggestions pour la note',
  'suggestions.tags': 'Tags suggérés',
  'suggestions.tagsEmpty': 'Aucune suggestion de tag.',
  'suggestions.selectAll': 'Tout sélectionner',
  'suggestions.applySelected': 'Appliquer la sélection',
  'suggestions.wikilinks': 'Wikilinks suggérés',
  'suggestions.wikilinksEmpty': 'Aucune suggestion de wikilink.',
  'suggestions.badgeExists': 'existe',
  'suggestions.badgeNew': 'nouveau',
  'suggestions.selectExisting': 'Sélectionner les existants',
  'suggestions.insertSelected': 'Insérer la sélection',
  'suggestions.atomicConcepts': 'Concepts atomiques',
  'suggestions.atomicConceptsEmpty': 'Aucun concept atomique suggéré.',
  'suggestions.viewContent': 'Voir le contenu',
  'suggestions.createNote': 'Créer une note',
  'suggestions.noteCreated': 'Créée',
  'suggestions.tagsApplied': '{{count}} tag(s) appliqué(s).',
  'suggestions.wikilinksInserted': '{{count}} wikilink(s) inséré(s).',

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════
  'command.openChat': 'Ouvrir le chat avec Claude',
  'command.processNote': 'Traiter la note active avec Claude',
  'command.batchProcess': 'Traitement par lots des notes',
  'command.generateMap': 'Générer une carte conceptuelle',

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTE PROCESSOR
  // ═══════════════════════════════════════════════════════════════════════════
  'processor.reading': 'Lecture du contenu de la note...',
  'processor.analyzing': 'Analyse avec Claude...',
  'processor.processing': 'Traitement de la note avec Claude...',
  'processor.relatedLinks': 'Liens connexes',

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENT MODE
  // ═══════════════════════════════════════════════════════════════════════════
  'agent.actionsExecuted': 'Actions exécutées',
  'agent.noActions': 'Impossible d\'exécuter les actions :',
  'agent.actionsFailed': '{{count}} action(s) échouée(s).',
  'agent.partialSuccess': 'Résultats :',
  'agent.loopLimitReached': 'Limite de boucle atteinte. Veuillez continuer manuellement.',
  'agent.processingResults': 'Traitement des résultats (étape {{step}})...',
  'agent.createFolder': 'Créer le dossier : {{path}}',
  'agent.deleteFolder': 'Supprimer le dossier : {{path}}',
  'agent.listFolder': 'Lister le dossier : {{path}}',
  'agent.createNote': 'Créer la note : {{path}}',
  'agent.readNote': 'Lire la note : {{path}}',
  'agent.deleteNote': 'Supprimer la note : {{path}}',
  'agent.renameNote': 'Renommer : {{from}} → {{to}}',
  'agent.moveNote': 'Déplacer : {{from}} → {{to}}',
  'agent.copyNote': 'Copier : {{from}} → {{to}}',
  'agent.appendContent': 'Ajouter du contenu à : {{path}}',
  'agent.prependContent': 'Préfixer du contenu à : {{path}}',
  'agent.replaceContent': 'Remplacer le contenu de : {{path}}',
  'agent.updateFrontmatter': 'Mettre à jour le frontmatter : {{path}}',
  'agent.searchNotes': 'Rechercher des notes : "{{query}}"',
  'agent.getNoteInfo': 'Obtenir les infos : {{path}}',
  'agent.findLinks': 'Trouver les liens vers : {{target}}',
  // Editor API actions
  'agent.editorGetContent': 'Obtenir le contenu de l\'éditeur',
  'agent.editorSetContent': 'Définir le contenu de l\'éditeur',
  'agent.editorGetSelection': 'Obtenir le texte sélectionné',
  'agent.editorReplaceSelection': 'Remplacer la sélection par : {{text}}',
  'agent.editorInsertAtCursor': 'Insérer au curseur : {{text}}',
  'agent.editorGetLine': 'Obtenir la ligne {{line}}',
  'agent.editorSetLine': 'Définir la ligne {{line}}',
  'agent.editorGoToLine': 'Aller à la ligne {{line}}',
  'agent.editorUndo': 'Annuler',
  'agent.editorRedo': 'Rétablir',
  // Commands API actions
  'agent.executeCommand': 'Exécuter la commande : {{commandId}}',
  'agent.listCommands': 'Lister les commandes',
  'agent.getCommandInfo': 'Obtenir les infos de la commande : {{commandId}}',
  // Daily Notes actions
  'agent.openDailyNote': 'Ouvrir la note quotidienne',
  'agent.createDailyNote': 'Créer la note quotidienne : {{date}}',
  // Templates actions
  'agent.insertTemplate': 'Insérer le modèle : {{templateName}}',
  'agent.listTemplates': 'Lister les modèles',
  // Bookmarks actions
  'agent.addBookmark': 'Ajouter un signet : {{path}}',
  'agent.removeBookmark': 'Supprimer le signet : {{path}}',
  'agent.listBookmarks': 'Lister les signets',
  // Canvas API actions
  'agent.canvasCreateTextNode': 'Créer un nœud texte : {{text}}',
  'agent.canvasCreateFileNode': 'Créer un nœud fichier : {{file}}',
  'agent.canvasCreateLinkNode': 'Créer un nœud lien : {{url}}',
  'agent.canvasCreateGroup': 'Créer un groupe : {{label}}',
  'agent.canvasAddEdge': 'Ajouter une arête : {{fromNode}} → {{toNode}}',
  'agent.canvasSelectAll': 'Sélectionner tous les nœuds du canvas',
  'agent.canvasZoomToFit': 'Ajuster le zoom du canvas',
  // Enhanced Search actions
  'agent.searchByHeading': 'Rechercher par titre : {{heading}}',
  'agent.searchByBlock': 'Rechercher par ID de bloc : {{blockId}}',
  'agent.getAllTags': 'Obtenir tous les tags',
  'agent.openSearch': 'Ouvrir la recherche : {{query}}',
  // Workspace actions
  'agent.openFile': 'Ouvrir le fichier : {{path}}',
  'agent.revealInExplorer': 'Révéler dans l\'explorateur : {{path}}',
  'agent.getActiveFile': 'Obtenir les infos du fichier actif',
  'agent.closeActiveLeaf': 'Fermer l\'onglet actif',
  'agent.splitLeaf': 'Diviser la vue : {{direction}}',
  // Error messages for new actions
  'error.noActiveEditor': 'Aucun éditeur actif. Ouvrez d\'abord un fichier markdown.',
  'error.noActiveCanvas': 'Aucun canvas actif. Ouvrez d\'abord un fichier canvas.',
  'error.pluginNotEnabled': 'Le plugin "{{plugin}}" n\'est pas activé.',
  'error.commandNotFound': 'Commande non trouvée : {{commandId}}',
  'error.templateNotFound': 'Modèle non trouvé : {{templateName}}',
  'error.bookmarkNotFound': 'Signet non trouvé : {{path}}',
  'error.canvasNodeNotFound': 'Nœud canvas non trouvé : {{nodeId}}',
  'error.headingNotFound': 'Aucune note trouvée avec le titre : {{heading}}',
  'error.blockNotFound': 'Bloc non trouvé : {{blockId}}',
  'agent.genericAction': 'Action : {{action}}',
  'agent.progressStarting': 'Démarrage de l\'exécution...',
  'agent.progressStatus': 'Exécution {{current}}/{{total}}',
  'agent.generatingResponse': 'Génération de la réponse...',
  'agent.streamingChars': 'Caractères : ',
  'agent.streamingActions': 'Actions détectées : ',
  'agent.showRawResponse': '▶ Afficher la réponse brute',
  'agent.hideRawResponse': '▼ Masquer la réponse brute',
  'agent.warningTitle': 'Mode Agent requis',
  'agent.warningDescription': 'Il semble que vous vouliez créer, modifier ou organiser des fichiers dans votre coffre. Cela nécessite l\'activation du Mode Agent.',
  'agent.enableAgentMode': 'Activer le Mode Agent',
  'agent.continueAnyway': 'Continuer sans',
  'agent.continuing': 'Poursuite de la réponse...',
  'agent.retryWithJson': 'Réessayer avec le format JSON',
  'agent.planningTask': 'Planification de la tâche complexe...',
  'agent.executingSubtask': 'Exécution {{current}}/{{total}} : {{description}}',
  'agent.subtask.preparation': 'Préparer la structure',
  'agent.subtask.execution': 'Exécuter la tâche principale',
  'agent.planSummary.header': 'Tâche terminée : {{completed}}/{{total}} sous-tâches',
  'agent.planSummary.successful': '**Réussies :**',
  'agent.planSummary.failed': '**Échouées :**',
  'agent.planningPrompt': `Décomposez cette tâche complexe en sous-tâches pouvant chacune être complétée avec au maximum {{maxActions}} actions.

TÂCHE : {{request}}

Nombre total d'actions estimé : {{estimatedActions}}
Sous-tâches maximum autorisées : {{maxSubtasks}}

Répondez en JSON :
{
  "subtasks": [
    {
      "id": "subtask-1",
      "description": "Brève description de ce que fait cette sous-tâche",
      "prompt": "Instruction spécifique pour exécuter cette sous-tâche",
      "dependencies": []
    }
  ],
  "estimatedTotalActions": number
}

IMPORTANT :
- Chaque sous-tâche doit être indépendante ou avoir des dépendances claires
- Ordonnez les sous-tâches logiquement (ex : créer les dossiers avant d'y créer des fichiers)
- Gardez les instructions spécifiques et actionnables`,
  'agent.reinforcement.reminder': 'Vous êtes en MODE AGENT. Utilisez le format JSON pour les actions sur le coffre.',
  'agent.reinforcement.canPerformActions': 'Vous POUVEZ créer, modifier et supprimer des fichiers dans ce coffre. Ne dites PAS que vous ne pouvez pas - utilisez le système d\'actions.',
  'agent.reinforcement.useJsonFormat': 'Quand l\'utilisateur demande des actions sur le coffre, répondez avec du JSON contenant un tableau "actions".',
  'agent.reinforcement.dontForget': 'Rappelez-vous : Vous avez la pleine capacité de gérer ce coffre Obsidian via le système d\'actions.',
  'agent.reinforcement.recoveryPrompt': `L'utilisateur a demandé : "{{message}}"

Vous êtes en MODE AGENT et POUVEZ effectuer des actions sur le coffre. Veuillez répondre avec le format JSON approprié :
{
  "actions": [{"action": "...", "params": {...}}],
  "message": "...",
  "requiresConfirmation": false
}`,
  'agent.retryPrompt.confusion': 'Vous ÊTES capable de créer et modifier des fichiers dans ce coffre. Veuillez fournir les actions au format JSON comme spécifié dans vos instructions.',
  'agent.retryPrompt.missingJson': `Vous avez décrit des actions mais n'avez pas fourni le format JSON. Basé sur ce que vous avez dit : "{{context}}..."

Veuillez fournir les actions EXACTES en JSON :
{
  "actions": [{"action": "action-name", "params": {...}}],
  "message": "Description de ce qui sera fait",
  "requiresConfirmation": false
}`,
  'agent.retryPrompt.incompleteJson': 'Votre réponse a été coupée. Veuillez continuer et compléter la structure JSON.',
  'agent.retryPrompt.generic': 'Veuillez fournir les actions sur le coffre au format JSON requis avec les champs "actions", "message" et "requiresConfirmation".',
  // Agentic Loop (Phase 2)
  'agent.loopCancelled': 'Boucle agent annulée par l\'utilisateur.',
  'agent.cancelLoop': 'Annuler',
  'agent.allActionsFailed': 'Toutes les actions ont échoué. Boucle arrêtée pour éviter d\'autres erreurs.',
  'agent.infiniteLoopDetected': 'Boucle infinie détectée (actions répétées). Opération arrêtée.',
  // Agentic Loop UX (Phase 3)
  'agent.loopProgress': 'Étape {{current}} sur max {{max}}',
  'agent.loopTokens': '↑{{input}} ↓{{output}}',
  'agent.loopTokenSummary': 'Tokens utilisés : ↑{{input}} entrée, ↓{{output}} sortie',
  'agent.loopStep': 'Étape {{step}}',
  'agent.loopStepFinal': 'Terminé',
  'agent.loopExpandStep': 'Voir plus...',
  'agent.loopCollapseStep': 'Voir moins',

  // ═══════════════════════════════════════════════════════════════════════════
  // WARNINGS AND VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════
  'warning.modelConfusion': 'Le modèle semble confus quant à ses capacités. Il peut effectuer des actions sur le coffre en Mode Agent.',
  'warning.actionClaimsNoJson': 'La réponse prétend avoir effectué des actions mais aucune action exécutable n\'a été trouvée.',
  'warning.emptyActionsArray': 'La réponse contient un tableau d\'actions vide.',
  'warning.incompleteJson': 'La réponse JSON semble incomplète ou tronquée.',
  'warning.actionMismatch': 'Les actions revendiquées ne correspondent pas aux actions fournies : {{mismatches}}',
  'suggestion.remindAgentMode': 'Essayez de rappeler au modèle que le Mode Agent est actif.',
  'suggestion.requestJsonFormat': 'Demandez la réponse au format JSON approprié.',
  'suggestion.requestContinuation': 'Demandez au modèle de continuer et compléter sa réponse.',
  'validation.valid': 'Réponse validée avec succès.',
  'validation.validWithNotes': 'Réponse valide avec des notes mineures.',

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS - PHASE 2
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.section.advanced': 'Options Agent avancées',
  'settings.autoContinue.name': 'Continuer automatiquement les réponses tronquées',
  'settings.autoContinue.desc': 'Demander automatiquement une continuation quand une réponse semble coupée.',
  'settings.autoPlan.name': 'Planifier automatiquement les tâches complexes',
  'settings.autoPlan.desc': 'Décomposer automatiquement les tâches complexes en sous-tâches plus petites.',
  'settings.contextReinforce.name': 'Renforcer le contexte agent',
  'settings.contextReinforce.desc': 'Ajouter des rappels pour éviter que le modèle n\'oublie le Mode Agent dans les longues conversations.',

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTRACTION TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════
  'template.keyIdeas.name': 'Extraire les idées clés',
  'template.keyIdeas.desc': 'Identifie et résume les idées principales du contenu',
  'template.summary.name': 'Résumé exécutif',
  'template.summary.desc': 'Génère un résumé concis pour une lecture rapide',
  'template.questions.name': 'Identifier les questions ouvertes',
  'template.questions.desc': 'Détecte les questions non résolues ou les domaines à explorer',
  'template.actions.name': 'Extraire les actions',
  'template.actions.desc': 'Identifie les tâches et actions mentionnées dans le contenu',
  'template.concepts.name': 'Concepts et définitions',
  'template.concepts.desc': 'Extrait les termes importants et leurs définitions',
  'template.connections.name': 'Connexions et relations',
  'template.connections.desc': 'Identifie les relations entre concepts pour créer des liens',

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM PROMPTS
  // ═══════════════════════════════════════════════════════════════════════════
  'prompt.baseIdentity': `Claude intégré dans Obsidian via Claudian (par Enigmora). Utilisez Markdown et wikilinks ([[Note]]) quand approprié. Soyez concis.`,

  'prompt.chatMode': `IMPORTANT - MODE AGENT :
Si l'utilisateur vous demande d'effectuer des actions sur le coffre (créer, déplacer, supprimer, renommer des notes ou dossiers, modifier du contenu, etc.) et que le Mode Agent N'EST PAS activé, vous devez l'informer :
"Pour effectuer des actions sur votre coffre, veuillez activer le **Mode Agent** via le bouton dans l'en-tête du chat."
N'essayez PAS de décrire ou simuler des actions sur le coffre sans le Mode Agent activé.`,

  'prompt.noteProcessor': `Vous êtes un assistant spécialisé dans l'organisation des connaissances pour Obsidian. Votre tâche est d'analyser les notes et de suggérer des améliorations pour mieux les intégrer dans le coffre de l'utilisateur.

CONTEXTE DU COFFRE :
- Notes totales : {{noteCount}}
- Notes existantes : {{noteTitles}}
- Tags existants : {{allTags}}

INSTRUCTIONS :
1. Analysez le contenu de la note fournie
2. Suggérez des tags pertinents (de préférence parmi les existants, mais vous pouvez en proposer de nouveaux)
3. Identifiez les concepts qui pourraient être liés à des notes existantes (wikilinks)
4. Détectez les concepts atomiques qui méritent leur propre note
5. Expliquez brièvement votre raisonnement

RÉPONDEZ UNIQUEMENT avec un objet JSON valide avec cette structure exacte :
{
  "tags": ["tag1", "tag2"],
  "wikilinks": [
    {
      "text": "texte à convertir en lien",
      "target": "Titre de la note cible",
      "context": "Brève explication de pourquoi lier"
    }
  ],
  "atomicConcepts": [
    {
      "title": "Titre pour la nouvelle note",
      "summary": "Résumé en 1-2 phrases",
      "content": "Contenu suggéré pour la note (en Markdown)"
    }
  ],
  "reasoning": "Brève explication de votre analyse"
}

IMPORTANT :
- Ne suggérez des wikilinks que vers des notes qui existent dans le coffre
- Les tags ne doivent pas inclure le symbole #
- Les concepts atomiques doivent être des idées qui méritent leur propre développement
- Gardez les suggestions pertinentes et utiles, ne remplissez pas avec des liens inutiles`,

  'prompt.templateProcessor': `Vous êtes un assistant spécialisé dans l'analyse et l'extraction d'informations à partir de textes.
Répondez de manière structurée et claire selon les instructions fournies.
{{jsonInstructions}}`,

  'prompt.conceptMapGenerator': `Vous êtes un assistant spécialisé dans l'analyse des connaissances et la création de cartes conceptuelles.
Votre tâche est d'identifier les concepts, relations et thèmes transversaux dans des ensembles de notes.
IMPORTANT : Répondez UNIQUEMENT avec du JSON valide selon le format demandé.`,

  'prompt.agentMode': `Assistant de coffre Obsidian. Exécutez des actions via des réponses JSON.

⚠️ CRITIQUE : Pour les opérations sur les dossiers, utilisez TOUJOURS list-folder EN PREMIER pour obtenir les vrais noms de fichiers.

ACTIONS ({{maxActions}} max par message) :
Fichiers : create-note{path,content,frontmatter?}, read-note{path}, delete-note{path}, rename-note{from,to}, move-note{from,to}, copy-note{from,to}
Dossiers : create-folder{path}, delete-folder{path}, list-folder{path,recursive?}
Contenu : append-content{path,content}, prepend-content{path,content}, replace-content{path,content}, update-frontmatter{path,fields}
Recherche : search-notes{query,field?,folder?}, get-note-info{path}, find-links{target}, search-by-heading{heading,folder?}, search-by-block{blockId}, get-all-tags{}, open-search{query}
Éditeur : editor-get-content{}, editor-set-content{content}, editor-get-selection{}, editor-replace-selection{text}, editor-insert-at-cursor{text}, editor-get-line{line}, editor-set-line{line,text}, editor-go-to-line{line}, editor-undo{}, editor-redo{}
Commandes : execute-command{commandId}, list-commands{filter?}, get-command-info{commandId}
Quotidien/Modèles : open-daily-note{}, create-daily-note{date?}, insert-template{templateName?}, list-templates{}
Signets : add-bookmark{path}, remove-bookmark{path}, list-bookmarks{}
Canvas : canvas-create-text-node{text,x?,y?}, canvas-create-file-node{file,x?,y?}, canvas-create-link-node{url,x?,y?}, canvas-create-group{label?}, canvas-add-edge{fromNode,toNode}, canvas-select-all{}, canvas-zoom-to-fit{}
Espace de travail : open-file{path,mode?}, reveal-in-explorer{path}, get-active-file{}, close-active-leaf{}, split-leaf{direction}

⚠️ RÈGLE CONTENU : Lors de la création de notes, incluez TOUJOURS le contenu complet dans le paramètre "content". Ne décrivez jamais le contenu dans "message" - mettez le texte réel dans params.

FORMAT DE RÉPONSE (compact, pas de champs supplémentaires) :
{"actions":[{"action":"name","params":{...}}],"message":"Brève desc."}

awaitResults=true : Utilisez quand vous avez besoin des résultats avant de continuer (list-folder, read-note, search). Vous recevrez les résultats, puis générerez les actions suivantes.
requiresConfirmation=true : Pour les actions destructives (delete, replace-content).

EXEMPLE - Créer une note avec contenu :
{"actions":[{"action":"create-note","params":{"path":"Notes/sujet.md","content":"# Sujet\\n\\nPremier paragraphe ici.\\n\\nDeuxième paragraphe."}}],"message":"Note créée"}

EXEMPLE - Copier des fichiers (2 étapes) :
1: {"actions":[{"action":"list-folder","params":{"path":"Src"}},{"action":"create-folder","params":{"path":"Dst"}}],"message":"Listage","awaitResults":true}
2: {"actions":[{"action":"copy-note","params":{"from":"Src/a.md","to":"Dst/a.md"}},{"action":"copy-note","params":{"from":"Src/b.md","to":"Dst/b.md"}}],"message":"Terminé"}

RÈGLES :
- copy-note préserve le contenu exact ; n'utilisez jamais read+create pour copier
- Incluez TOUTES les actions dans UNE réponse ; minimisez les appels API
- Après list-folder, exécutez TOUTES les copies dans la réponse suivante (pas d'étapes intermédiaires)
- Chemins sans slash au début/à la fin
- Pour une conversation sans actions sur le coffre, répondez normalement (pas de JSON)

COFFRE : {{noteCount}} notes | Dossiers : {{folders}} | Tags : {{tags}}`,

  // Haiku-optimized agent prompt (more verbose and explicit)
  'prompt.agentModeHaiku': `Vous êtes un assistant de coffre Obsidian. Votre travail est d'exécuter des actions sur le coffre de l'utilisateur en répondant avec du JSON.

RÈGLE CRITIQUE : Pour toute opération sur les dossiers, vous DEVEZ utiliser list-folder EN PREMIER pour voir les noms de fichiers réels avant de copier, déplacer ou supprimer des fichiers.

ACTIONS DISPONIBLES (maximum {{maxActions}} par message) :

OPÉRATIONS SUR LES FICHIERS :
- create-note : Créer une nouvelle note. Paramètres : {path: "dossier/nom.md", content: "contenu texte complet", frontmatter?: {key: value}}
  IMPORTANT : Incluez toujours le contenu complet dans le paramètre "content". Ne décrivez jamais le contenu dans "message".
- read-note : Lire le contenu d'une note. Paramètres : {path: "dossier/nom.md"}
- delete-note : Supprimer une note. Paramètres : {path: "dossier/nom.md"}
- rename-note : Renommer une note. Paramètres : {from: "ancien/chemin.md", to: "nouveau/chemin.md"}
- move-note : Déplacer une note. Paramètres : {from: "source/chemin.md", to: "dest/chemin.md"}
- copy-note : Copier une note. Paramètres : {from: "source/chemin.md", to: "dest/chemin.md"}

OPÉRATIONS SUR LES DOSSIERS :
- create-folder : Créer un dossier. Paramètres : {path: "dossier/nom"}
- delete-folder : Supprimer un dossier. Paramètres : {path: "dossier/nom"}
- list-folder : Lister le contenu d'un dossier. Paramètres : {path: "dossier/nom", recursive?: boolean}

OPÉRATIONS SUR LE CONTENU :
- append-content : Ajouter du contenu à la fin. Paramètres : {path: "fichier.md", content: "texte"}
- prepend-content : Ajouter du contenu au début. Paramètres : {path: "fichier.md", content: "texte"}
- replace-content : Remplacer tout le contenu. Paramètres : {path: "fichier.md", content: "texte"}
- update-frontmatter : Mettre à jour le frontmatter YAML. Paramètres : {path: "fichier.md", fields: {key: value}}

OPÉRATIONS DE RECHERCHE :
- search-notes : Rechercher des notes. Paramètres : {query: "texte", field?: "title|content|tags", folder?: "chemin"}
- get-note-info : Obtenir les métadonnées d'une note. Paramètres : {path: "fichier.md"}
- find-links : Trouver les notes liées à une cible. Paramètres : {target: "Nom de la note"}

FORMAT DE RÉPONSE :
Répondez toujours avec un objet JSON comme celui-ci :
{
  "actions": [
    {"action": "nom-action", "params": {...}}
  ],
  "message": "Brève description de ce qui sera fait"
}

FLAGS SPÉCIAUX :
- Ajoutez "awaitResults": true quand vous devez voir les résultats des actions avant de continuer (ex : après list-folder)
- Ajoutez "requiresConfirmation": true pour les actions destructives (delete, replace-content)

EXEMPLE - Créer une note avec contenu :
{
  "actions": [
    {"action": "create-note", "params": {"path": "Notes/ma-note.md", "content": "# Ma Note\\n\\nCeci est le premier paragraphe avec du contenu réel.\\n\\nCeci est un autre paragraphe.", "frontmatter": {"tags": ["exemple"]}}}
  ],
  "message": "Note créée avec contenu"
}

EXEMPLE - Copier tous les fichiers du dossier Source vers Dest :
Étape 1 : D'abord lister le dossier source et créer la destination
{
  "actions": [
    {"action": "list-folder", "params": {"path": "Source"}},
    {"action": "create-folder", "params": {"path": "Dest"}}
  ],
  "message": "Listage du dossier source et création de la destination",
  "awaitResults": true
}

Étape 2 : Après avoir reçu la liste des fichiers, copier chaque fichier
{
  "actions": [
    {"action": "copy-note", "params": {"from": "Source/fichier1.md", "to": "Dest/fichier1.md"}},
    {"action": "copy-note", "params": {"from": "Source/fichier2.md", "to": "Dest/fichier2.md"}}
  ],
  "message": "Copie de tous les fichiers vers la destination"
}

RÈGLES :
1. Utilisez copy-note pour copier des fichiers - N'utilisez PAS read-note + create-note
2. Incluez TOUTES les actions dans UNE réponse quand c'est possible
3. Après list-folder, exécutez TOUTES les opérations dans la réponse suivante
4. Les chemins ne doivent PAS avoir de slash au début ou à la fin
5. Pour une conversation normale (pas d'actions sur le coffre), répondez sans JSON

CONTEXTE DU COFFRE :
- Notes totales : {{noteCount}}
- Dossiers existants : {{folders}}
- Tags existants : {{tags}}`,

  // ═══════════════════════════════════════════════════════════════════════════
  // TOKEN TRACKING (Phase 5)
  // ═══════════════════════════════════════════════════════════════════════════
  'tokens.sessionCount': '{{count}} tokens',
  'tokens.tooltip': 'Entrée : {{input}} | Sortie : {{output}} | Appels : {{calls}}',
  'tokens.modelLabel': 'Modèle',
  'tokens.inputLabel': 'Entrée',
  'tokens.outputLabel': 'Sortie',
  'tokens.callsLabel': 'Appels',
  'tokens.totalLabel': 'Total',
  'tokens.today': 'Aujourd\'hui : {{count}}',
  'tokens.week': 'Cette semaine : {{count}}',
  'tokens.month': 'Ce mois : {{count}}',
  'tokens.allTime': 'Total : {{count}}',
  'tokens.historyLink': 'Historique d\'utilisation',
  'tokens.historyTitle': 'Historique d\'utilisation des tokens',
  'tokens.sessionTitle': 'Session actuelle',
  'tokens.closeButton': 'Fermer',
  'tokens.byModelTitle': 'Utilisation par modèle',
  'tokens.noModelData': 'Aucune donnée de modèle enregistrée',
  'status.processing': 'Traitement...',
  'status.classifying': 'Classification de la tâche...',
  'status.executingActions': 'Exécution des actions...',
  'status.waitingResponse': 'En attente de la réponse...',
  'settings.showTokens.name': 'Afficher l\'indicateur de tokens',
  'settings.showTokens.desc': 'Afficher l\'utilisation des tokens dans le pied du chat.',
  'settings.section.tokenTracking': 'Suivi des tokens',
  'error.quotaExhausted': 'Quota API épuisé. Vérifiez vos limites d\'utilisation sur console.anthropic.com.',
  'error.billingIssue': 'Problème de facturation détecté. Vérifiez votre compte sur console.anthropic.com.',
  'error.contentFiltered': 'Réponse bloquée par le filtre de contenu. Essayez de reformuler votre demande ou de la diviser en tâches plus petites.',

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT MANAGEMENT (Phase 6)
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.section.contextManagement': 'Gestion du contexte',
  'settings.autoContextManagement.name': 'Gestion automatique du contexte',
  'settings.autoContextManagement.desc': 'Résumer automatiquement l\'historique de conversation quand il devient long pour réduire l\'utilisation des tokens.',
  'settings.messageSummarizeThreshold.name': 'Résumer après messages',
  'settings.messageSummarizeThreshold.desc': 'Nombre de messages avant de déclencher le résumé automatique (10-50).',
  'settings.maxActiveContextMessages.name': 'Messages actifs max.',
  'settings.maxActiveContextMessages.desc': 'Maximum de messages à garder dans le contexte actif après résumé (20-100).',
  'context.summarizing': 'Résumé de l\'historique de conversation...',
  'context.summarized': 'Historique de conversation résumé',
  'context.sessionStarted': 'Session de contexte démarrée',
  'context.sessionEnded': 'Session de contexte terminée',
  'context.summaryPrompt': `Résumez la conversation suivante entre un utilisateur et un assistant IA. Concentrez-vous sur :
1. Les sujets clés discutés
2. Les décisions ou conclusions importantes
3. Les tâches en attente ou suivis
4. Le contexte qui serait important pour continuer la conversation

Répondez au format JSON :
{
  "keyTopics": ["sujet1", "sujet2"],
  "lastActions": ["action1", "action2"],
  "summary": "Bref résumé de la conversation"
}

CONVERSATION :
{{conversation}}`,

  // ═══════════════════════════════════════════════════════════════════════════
  // WELCOME SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  'welcome.title': 'Claudian',
  'welcome.developedBy': 'Développé par Enigmora',
  'welcome.greeting': 'Comment puis-je vous aider aujourd\'hui ?',
  'welcome.examplesHeader': 'Exemples de ce que je peux faire :',
  'welcome.example1': '"Quelles notes ai-je sur l\'intelligence artificielle ?"',
  'welcome.example2': '"Crée une note avec un résumé des réunions de cette semaine"',
  'welcome.example3': '"Lis ma note Idées.md et suggère des wikilinks vers des notes connexes"',
  'welcome.example4': '"Trouve toutes les notes avec le tag #projet et génère une carte conceptuelle de leurs connexions"',
  'welcome.example5': '"Organise mes notes de productivité dans des dossiers par sujet et crée un index lié"',
  'welcome.agentModeHint': 'Activez le Mode Agent pour créer, modifier et organiser des notes automatiquement.',
  // Personalized example templates
  'welcome.template.search': '"Quelles notes ai-je sur {{topic}} ?"',
  'welcome.template.read': '"Lis ma note "{{noteName}}" et résume-la"',
  'welcome.template.create': '"Crée une note avec des idées sur {{topic}}"',
  'welcome.template.analyze': '"Trouve les notes avec le tag #{{tag}} et suggère des connexions entre elles"',
  'welcome.template.organize': '"Organise mes notes sur {{topic}} dans des dossiers par sous-thème et crée un index"'
};

export default translations;
