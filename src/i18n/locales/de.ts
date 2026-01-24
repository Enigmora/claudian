import type { Translations } from '../types';

const translations: Translations = {
  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.title': 'Claudian - Einstellungen',
  'settings.description': 'Obsidian-Plugin für Claude AI Integration, entwickelt von Enigmora. Chatten Sie mit Claude, verarbeiten Sie Notizen für intelligente Tag- und Wikilink-Vorschläge und verwalten Sie Ihren Vault mit natürlicher Sprache im Agentenmodus. Datenschutz zuerst: API-Schlüssel wird lokal gespeichert.',
  'settings.language.name': 'Sprache',
  'settings.language.desc': 'Sprache der Plugin-Oberfläche. "Auto" erkennt aus Obsidian-Einstellungen.',
  'settings.language.auto': 'Auto (aus Obsidian erkennen)',
  'settings.apiKey.name': 'API-Schlüssel',
  'settings.apiKey.descPart1': 'Holen Sie sich Ihren Anthropic API-Schlüssel auf ',
  'settings.apiKey.descPart2': '. Wird lokal in Ihrem Vault gespeichert.',
  'settings.apiKey.placeholder': 'sk-ant-...',
  'settings.model.name': 'Modell',
  'settings.model.desc': 'Wählen Sie das zu verwendende Claude-Modell.',
  'settings.model.sonnet4': 'Claude Sonnet 4 (Empfohlen)',
  'settings.model.opus4': 'Claude Opus 4',
  'settings.model.sonnet35': 'Claude 3.5 Sonnet',
  'settings.model.haiku45': 'Claude Haiku 4.5 (Schnell)',
  // Execution Mode (Model Orchestrator)
  'settings.executionMode.name': 'Ausführungsmodus',
  'settings.executionMode.desc': 'Wie Claude Modelle für Ihre Aufgaben auswählt.',
  'settings.executionMode.automatic': 'Automatisch (Empfohlen)',
  'settings.executionMode.automaticDesc': 'Intelligente Weiterleitung: einfache Aufgaben an Haiku, komplexe an Sonnet, tiefe Analysen an Opus.',
  'settings.executionMode.economic': 'Wirtschaftlich',
  'settings.executionMode.economicDesc': 'Alle Aufgaben nutzen Haiku. Am schnellsten und günstigsten.',
  'settings.executionMode.maxQuality': 'Maximale Qualität',
  'settings.executionMode.maxQualityDesc': 'Alle Aufgaben nutzen Opus. Am besten für komplexe Analysen und Texterstellung.',
  'settings.executionMode.currentModel': 'Verwendet: {{model}}',
  'settings.folder.name': 'Notizordner',
  'settings.folder.desc': 'Ordner, in dem aus dem Chat generierte Notizen gespeichert werden.',
  'settings.folder.placeholder': 'Claudian',
  'settings.maxTokens.name': 'Max. Tokens',
  'settings.maxTokens.desc': 'Maximale Anzahl der Tokens in Antworten (1000-8192).',
  'settings.customInstructions.name': 'Benutzerdefinierte Anweisungen',
  'settings.customInstructions.desc': 'Zusätzliche Anweisungen zur Personalisierung von Claudes Verhalten. Diese werden zu den Basisanweisungen hinzugefügt (nicht ersetzt).',
  'settings.customInstructions.placeholder': 'Z.B.: Antworte immer auf formelles Deutsch, verwende Aufzählungspunkte...',
  'settings.customInstructions.clear': 'Löschen',
  'settings.customInstructions.cleared': 'Benutzerdefinierte Anweisungen gelöscht',
  'settings.section.noteProcessing': 'Notizverarbeitung',
  'settings.maxNotesContext.name': 'Max. Notizen im Kontext',
  'settings.maxNotesContext.desc': 'Maximale Anzahl von Notiztiteln, die bei der Verarbeitung einbezogen werden (10-500).',
  'settings.maxTagsContext.name': 'Max. Tags im Kontext',
  'settings.maxTagsContext.desc': 'Maximale Anzahl vorhandener Tags, die bei der Verarbeitung einbezogen werden (10-200).',
  'settings.section.agentMode': 'Agentenmodus',
  'settings.agentEnabled.name': 'Agentenmodus standardmäßig aktivieren',
  'settings.agentEnabled.desc': 'Der Agentenmodus erlaubt Claude, Aktionen in Ihrem Vault auszuführen.',
  'settings.confirmDestructive.name': 'Destruktive Aktionen bestätigen',
  'settings.confirmDestructive.desc': 'Bestätigung anfordern, bevor Dateien gelöscht oder Inhalte ersetzt werden.',
  'settings.protectedFolders.name': 'Geschützte Ordner',
  'settings.protectedFolders.desc': 'Ordner, die der Agent nicht ändern kann (kommagetrennt).',
  'settings.protectedFolders.placeholder': '.obsidian, templates',
  'settings.maxActions.name': 'Max. Aktionen pro Nachricht',
  'settings.maxActions.desc': 'Limit der Aktionen, die Claude in einer einzelnen Nachricht ausführen kann (1-20).',
  'settings.footer.license': 'Lizenziert unter MIT-Lizenz',
  'settings.footer.developedBy': 'Entwickelt von',
  'settings.footer.sourceCode': 'Quellcode',

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT INTERFACE
  // ═══════════════════════════════════════════════════════════════════════════
  'chat.placeholder': 'Geben Sie Ihre Nachricht ein...',
  'chat.send': 'Senden',
  'chat.clearLabel': 'Chat löschen',
  'chat.cleared': 'Chat gelöscht',
  'chat.agentLabel': 'Agent',
  'chat.agentEnabled': 'Agentenmodus aktiviert',
  'chat.agentDisabled': 'Agentenmodus deaktiviert',
  'chat.copyLabel': 'Kopieren',
  'chat.copied': 'In die Zwischenablage kopiert',
  'chat.createNoteLabel': 'Notiz erstellen',
  'chat.actionsExecuted': '{{count}} Aktion(en) ausgeführt',
  'chat.actionsPartial': '{{success}} erfolgreich, {{failed}} fehlgeschlagen',
  'chat.actionsCancelled': 'Aktionen vom Benutzer abgebrochen.',
  'chat.error': 'Fehler: {{message}}',
  'chat.errorUnknown': 'Unbekannter Fehler',
  'chat.stop': 'Stopp',
  'chat.streamStopped': 'Antwort vom Benutzer gestoppt',

  // ═══════════════════════════════════════════════════════════════════════════
  // ERRORS
  // ═══════════════════════════════════════════════════════════════════════════
  'error.apiKeyMissing': 'API-Schlüssel nicht konfiguriert. Gehen Sie zu Einstellungen > Claudian.',
  'error.apiKeyInvalid': 'Ungültiger API-Schlüssel. Überprüfen Sie Ihren Schlüssel in den Einstellungen.',
  'error.rateLimit': 'Rate-Limit überschritten. Versuchen Sie es in einigen Sekunden erneut.',
  'error.connection': 'Verbindungsfehler. Überprüfen Sie Ihre Internetverbindung.',
  'error.unknown': 'Unbekannter Fehler bei der Kommunikation mit Claude.',
  'error.noActiveNote': 'Keine aktive Markdown-Notiz.',
  'error.parseJson': 'Kein gültiges JSON in der Antwort gefunden.',
  'error.parseResponse': 'Fehler beim Parsen des Vorschlags-JSON.',
  'error.tooManyActions': 'Zu viele Aktionen ({{count}}). Maximum erlaubt: {{max}}',
  // Vault action errors
  'error.protectedPath': 'Geschützter Pfad: {{path}}',
  'error.folderNotFound': 'Ordner nicht gefunden: {{path}}',
  'error.folderNotEmpty': 'Ordner ist nicht leer: {{path}}',
  'error.fileAlreadyExists': 'Datei existiert bereits: {{path}}. Verwenden Sie overwrite: true zum Überschreiben.',
  'error.noteNotFound': 'Notiz nicht gefunden: {{path}}',
  'error.sourceNoteNotFound': 'Quellnotiz nicht gefunden: {{path}}',
  'error.fileNotFound': 'Datei nicht gefunden: {{path}}',
  'error.momentNotAvailable': 'Moment.js nicht verfügbar',
  'error.noActiveLeafToSplit': 'Kein aktives Blatt zum Teilen',
  'error.unknownError': 'Unbekannter Fehler',
  // Concept map errors
  'error.conceptMapParse': 'Fehler beim Parsen der Konzeptkarte',
  'error.noValidJsonInResponse': 'Kein gültiges JSON in der Antwort gefunden',

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTE CREATOR MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'noteCreator.title': 'Notiz aus Chat erstellen',
  'noteCreator.preview': 'Vorschau',
  'noteCreator.titleField.name': 'Titel',
  'noteCreator.titleField.desc': 'Dateiname (ohne .md-Erweiterung)',
  'noteCreator.tags.name': 'Tags',
  'noteCreator.tags.desc': 'Kommagetrennt',
  'noteCreator.tags.placeholder': 'tag1, tag2, tag3',
  'noteCreator.folder.name': 'Ordner',
  'noteCreator.folder.desc': 'Zielordner für die Notiz',
  'noteCreator.cancel': 'Abbrechen',
  'noteCreator.create': 'Notiz erstellen',
  'noteCreator.titleRequired': 'Titel ist erforderlich',
  'noteCreator.fileExists': 'Eine Datei mit diesem Namen existiert bereits: {{name}}',
  'noteCreator.created': 'Notiz erstellt: {{path}}',
  'noteCreator.error': 'Fehler beim Erstellen der Notiz: {{message}}',

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'batch.titleExtraction': 'Stapelverarbeitung',
  'batch.titleConceptMap': 'Konzeptkarte erstellen',
  'batch.selectNotes': 'Notizen auswählen',
  'batch.selectFolder': 'Ordner auswählen',
  'batch.selectAll': 'Alle auswählen',
  'batch.clear': 'Löschen',
  'batch.counter': '{{count}} Notizen ausgewählt',
  'batch.noNotes': 'Keine Notizen im Vault',
  'batch.rootFolder': 'Stammordner',
  'batch.selectTemplate': 'Vorlage auswählen',
  'batch.mapOptions': 'Kartenoptionen',
  'batch.mapTitle': 'Kartentitel:',
  'batch.mapTitlePlaceholder': 'Meine Konzeptkarte',
  'batch.cancel': 'Abbrechen',
  'batch.processNotes': 'Notizen verarbeiten',
  'batch.generateMap': 'Karte erstellen',
  'batch.selectAtLeastOne': 'Wählen Sie mindestens eine Notiz',
  'batch.selectTemplateRequired': 'Wählen Sie eine Vorlage',
  'batch.starting': 'Verarbeitung wird gestartet...',
  'batch.processing': 'Verarbeite {{current}}/{{total}}: {{note}}',
  'batch.completed': 'Abgeschlossen: {{success}} erfolgreich, {{errors}} Fehler',
  'batch.savedTo': 'Ergebnisse gespeichert unter: {{path}}',
  'batch.analyzing': 'Notizen werden analysiert...',
  'batch.saving': 'Karte wird gespeichert...',
  'batch.mapGenerated': 'Karte erfolgreich erstellt',
  'batch.errorProcessing': 'Fehler bei der Verarbeitung',
  'batch.errorGenerating': 'Fehler beim Erstellen der Karte',
  'batch.folderPrompt': 'Ordnernamen eingeben:',

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIRMATION MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'confirmation.title': 'Aktionen bestätigen',
  'confirmation.description': 'Die folgenden Aktionen erfordern Bestätigung:',
  'confirmation.warning': 'Diese Aktion kann nicht rückgängig gemacht werden.',
  'confirmation.cancel': 'Abbrechen',
  'confirmation.confirm': 'Bestätigen',
  'confirmation.deleteNote': 'Notiz löschen: {{path}}',
  'confirmation.deleteFolder': 'Ordner löschen: {{path}}',
  'confirmation.replaceContent': 'Inhalt ersetzen von: {{path}}',
  'confirmation.overwriteNote': 'Vorhandene Datei überschreiben: {{path}}',
  'confirmation.moveNote': 'Verschieben: {{from}} → {{to}}',
  'confirmation.renameNote': 'Umbenennen: {{from}} → {{to}}',

  // ═══════════════════════════════════════════════════════════════════════════
  // SUGGESTIONS MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'suggestions.title': 'Vorschläge für Notiz',
  'suggestions.tags': 'Vorgeschlagene Tags',
  'suggestions.tagsEmpty': 'Keine Tag-Vorschläge.',
  'suggestions.selectAll': 'Alle auswählen',
  'suggestions.applySelected': 'Ausgewählte anwenden',
  'suggestions.wikilinks': 'Vorgeschlagene Wikilinks',
  'suggestions.wikilinksEmpty': 'Keine Wikilink-Vorschläge.',
  'suggestions.badgeExists': 'vorhanden',
  'suggestions.badgeNew': 'neu',
  'suggestions.selectExisting': 'Vorhandene auswählen',
  'suggestions.insertSelected': 'Ausgewählte einfügen',
  'suggestions.atomicConcepts': 'Atomare Konzepte',
  'suggestions.atomicConceptsEmpty': 'Keine atomaren Konzepte vorgeschlagen.',
  'suggestions.viewContent': 'Inhalt anzeigen',
  'suggestions.createNote': 'Notiz erstellen',
  'suggestions.noteCreated': 'Erstellt',
  'suggestions.tagsApplied': '{{count}} Tag(s) angewendet.',
  'suggestions.wikilinksInserted': '{{count}} Wikilink(s) eingefügt.',

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════
  'command.openChat': 'Chat mit Claude öffnen',
  'command.processNote': 'Aktive Notiz mit Claude verarbeiten',
  'command.batchProcess': 'Notizen stapelweise verarbeiten',
  'command.generateMap': 'Konzeptkarte erstellen',

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTE PROCESSOR
  // ═══════════════════════════════════════════════════════════════════════════
  'processor.reading': 'Notizinhalt wird gelesen...',
  'processor.analyzing': 'Analysiere mit Claude...',
  'processor.processing': 'Notiz wird mit Claude verarbeitet...',
  'processor.relatedLinks': 'Verwandte Links',

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENT MODE
  // ═══════════════════════════════════════════════════════════════════════════
  'agent.actionsExecuted': 'Aktionen ausgeführt',
  'agent.noActions': 'Aktionen konnten nicht ausgeführt werden:',
  'agent.actionsFailed': '{{count}} Aktion(en) fehlgeschlagen.',
  'agent.partialSuccess': 'Ergebnisse:',
  'agent.loopLimitReached': 'Schleifenlimit erreicht. Bitte manuell fortfahren.',
  'agent.processingResults': 'Ergebnisse werden verarbeitet (Schritt {{step}})...',
  'agent.createFolder': 'Ordner erstellen: {{path}}',
  'agent.deleteFolder': 'Ordner löschen: {{path}}',
  'agent.listFolder': 'Ordner auflisten: {{path}}',
  'agent.createNote': 'Notiz erstellen: {{path}}',
  'agent.readNote': 'Notiz lesen: {{path}}',
  'agent.deleteNote': 'Notiz löschen: {{path}}',
  'agent.renameNote': 'Umbenennen: {{from}} → {{to}}',
  'agent.moveNote': 'Verschieben: {{from}} → {{to}}',
  'agent.copyNote': 'Kopieren: {{from}} → {{to}}',
  'agent.appendContent': 'Inhalt anhängen an: {{path}}',
  'agent.prependContent': 'Inhalt voranstellen an: {{path}}',
  'agent.replaceContent': 'Inhalt ersetzen von: {{path}}',
  'agent.updateFrontmatter': 'Frontmatter aktualisieren: {{path}}',
  'agent.searchNotes': 'Notizen suchen: "{{query}}"',
  'agent.getNoteInfo': 'Info abrufen: {{path}}',
  'agent.findLinks': 'Links finden zu: {{target}}',
  // Editor API actions
  'agent.editorGetContent': 'Editor-Inhalt abrufen',
  'agent.editorSetContent': 'Editor-Inhalt setzen',
  'agent.editorGetSelection': 'Ausgewählten Text abrufen',
  'agent.editorReplaceSelection': 'Auswahl ersetzen durch: {{text}}',
  'agent.editorInsertAtCursor': 'Am Cursor einfügen: {{text}}',
  'agent.editorGetLine': 'Zeile {{line}} abrufen',
  'agent.editorSetLine': 'Zeile {{line}} setzen',
  'agent.editorGoToLine': 'Zu Zeile {{line}} gehen',
  'agent.editorUndo': 'Rückgängig',
  'agent.editorRedo': 'Wiederholen',
  // Commands API actions
  'agent.executeCommand': 'Befehl ausführen: {{commandId}}',
  'agent.listCommands': 'Befehle auflisten',
  'agent.getCommandInfo': 'Befehlsinfo abrufen: {{commandId}}',
  // Daily Notes actions
  'agent.openDailyNote': 'Tägliche Notiz öffnen',
  'agent.createDailyNote': 'Tägliche Notiz erstellen: {{date}}',
  // Templates actions
  'agent.insertTemplate': 'Vorlage einfügen: {{templateName}}',
  'agent.listTemplates': 'Vorlagen auflisten',
  // Bookmarks actions
  'agent.addBookmark': 'Lesezeichen hinzufügen: {{path}}',
  'agent.removeBookmark': 'Lesezeichen entfernen: {{path}}',
  'agent.listBookmarks': 'Lesezeichen auflisten',
  // Canvas API actions
  'agent.canvasCreateTextNode': 'Textknoten erstellen: {{text}}',
  'agent.canvasCreateFileNode': 'Dateiknoten erstellen: {{file}}',
  'agent.canvasCreateLinkNode': 'Linkknoten erstellen: {{url}}',
  'agent.canvasCreateGroup': 'Gruppe erstellen: {{label}}',
  'agent.canvasAddEdge': 'Verbindung hinzufügen: {{fromNode}} → {{toNode}}',
  'agent.canvasSelectAll': 'Alle Canvas-Knoten auswählen',
  'agent.canvasZoomToFit': 'Canvas einpassen',
  // Enhanced Search actions
  'agent.searchByHeading': 'Nach Überschrift suchen: {{heading}}',
  'agent.searchByBlock': 'Nach Block-ID suchen: {{blockId}}',
  'agent.getAllTags': 'Alle Tags abrufen',
  'agent.openSearch': 'Suche öffnen: {{query}}',
  // Workspace actions
  'agent.openFile': 'Datei öffnen: {{path}}',
  'agent.revealInExplorer': 'Im Explorer anzeigen: {{path}}',
  'agent.getActiveFile': 'Aktive Datei-Info abrufen',
  'agent.closeActiveLeaf': 'Aktiven Tab schließen',
  'agent.splitLeaf': 'Ansicht teilen: {{direction}}',
  // Error messages for new actions
  'error.noActiveEditor': 'Kein aktiver Editor. Öffnen Sie zuerst eine Markdown-Datei.',
  'error.noActiveCanvas': 'Kein aktives Canvas. Öffnen Sie zuerst eine Canvas-Datei.',
  'error.pluginNotEnabled': 'Plugin "{{plugin}}" ist nicht aktiviert.',
  'error.commandNotFound': 'Befehl nicht gefunden: {{commandId}}',
  'error.templateNotFound': 'Vorlage nicht gefunden: {{templateName}}',
  'error.bookmarkNotFound': 'Lesezeichen nicht gefunden: {{path}}',
  'error.canvasNodeNotFound': 'Canvas-Knoten nicht gefunden: {{nodeId}}',
  'error.headingNotFound': 'Keine Notizen mit Überschrift gefunden: {{heading}}',
  'error.blockNotFound': 'Block nicht gefunden: {{blockId}}',
  'agent.genericAction': 'Aktion: {{action}}',
  'agent.progressStarting': 'Ausführung wird gestartet...',
  'agent.progressStatus': 'Ausführen {{current}}/{{total}}',
  'agent.generatingResponse': 'Antwort wird generiert...',
  'agent.streamingChars': 'Zeichen: ',
  'agent.streamingActions': 'Erkannte Aktionen: ',
  'agent.showRawResponse': '▶ Rohantwort anzeigen',
  'agent.hideRawResponse': '▼ Rohantwort ausblenden',
  'agent.warningTitle': 'Agentenmodus erforderlich',
  'agent.warningDescription': 'Es sieht so aus, als möchten Sie Dateien in Ihrem Vault erstellen, ändern oder organisieren. Dafür muss der Agentenmodus aktiviert sein.',
  'agent.enableAgentMode': 'Agentenmodus aktivieren',
  'agent.continueAnyway': 'Trotzdem fortfahren',
  'agent.continuing': 'Antwort wird fortgesetzt...',
  'agent.retryWithJson': 'Mit JSON-Format erneut versuchen',
  'agent.planningTask': 'Komplexe Aufgabe wird geplant...',
  'agent.executingSubtask': 'Ausführen {{current}}/{{total}}: {{description}}',
  'agent.subtask.preparation': 'Struktur vorbereiten',
  'agent.subtask.execution': 'Hauptaufgabe ausführen',
  'agent.planSummary.header': 'Aufgabe abgeschlossen: {{completed}}/{{total}} Teilaufgaben',
  'agent.planSummary.successful': '**Erfolgreich:**',
  'agent.planSummary.failed': '**Fehlgeschlagen:**',
  'agent.planningPrompt': `Teilen Sie diese komplexe Aufgabe in Teilaufgaben auf, die jeweils mit höchstens {{maxActions}} Aktionen abgeschlossen werden können.

AUFGABE: {{request}}

Geschätzte Gesamtzahl der benötigten Aktionen: {{estimatedActions}}
Maximal erlaubte Teilaufgaben: {{maxSubtasks}}

Antworten Sie mit JSON:
{
  "subtasks": [
    {
      "id": "subtask-1",
      "description": "Kurze Beschreibung, was diese Teilaufgabe tut",
      "prompt": "Spezifische Anweisung zur Ausführung dieser Teilaufgabe",
      "dependencies": []
    }
  ],
  "estimatedTotalActions": number
}

WICHTIG:
- Jede Teilaufgabe sollte unabhängig sein oder klare Abhängigkeiten haben
- Ordnen Sie Teilaufgaben logisch (z.B. Ordner erstellen, bevor Dateien darin erstellt werden)
- Halten Sie Anweisungen spezifisch und umsetzbar`,
  'agent.reinforcement.reminder': 'Sie sind im AGENTENMODUS. Verwenden Sie das JSON-Format für Vault-Aktionen.',
  'agent.reinforcement.canPerformActions': 'Sie KÖNNEN Dateien in diesem Vault erstellen, ändern und löschen. Sagen Sie NICHT, dass Sie es nicht können - verwenden Sie das Aktionssystem.',
  'agent.reinforcement.useJsonFormat': 'Wenn der Benutzer Vault-Aktionen anfordert, antworten Sie mit JSON, das ein "actions"-Array enthält.',
  'agent.reinforcement.dontForget': 'Denken Sie daran: Sie haben die volle Fähigkeit, diesen Obsidian-Vault über das Aktionssystem zu verwalten.',
  'agent.reinforcement.recoveryPrompt': `Der Benutzer fragte: "{{message}}"

Sie sind im AGENTENMODUS und KÖNNEN Vault-Aktionen ausführen. Bitte antworten Sie mit dem entsprechenden JSON-Format:
{
  "actions": [{"action": "...", "params": {...}}],
  "message": "...",
  "requiresConfirmation": false
}`,
  'agent.retryPrompt.confusion': 'Sie SIND in der Lage, Dateien in diesem Vault zu erstellen und zu ändern. Bitte geben Sie die Aktionen im JSON-Format wie in Ihren Anweisungen angegeben an.',
  'agent.retryPrompt.missingJson': `Sie haben Aktionen beschrieben, aber nicht das JSON-Format bereitgestellt. Basierend auf dem, was Sie sagten: "{{context}}..."

Bitte geben Sie die EXAKTEN Aktionen als JSON an:
{
  "actions": [{"action": "action-name", "params": {...}}],
  "message": "Beschreibung dessen, was getan wird",
  "requiresConfirmation": false
}`,
  'agent.retryPrompt.incompleteJson': 'Ihre Antwort wurde abgeschnitten. Bitte fahren Sie fort und vervollständigen Sie die JSON-Struktur.',
  'agent.retryPrompt.generic': 'Bitte geben Sie Vault-Aktionen im erforderlichen JSON-Format mit den Feldern "actions", "message" und "requiresConfirmation" an.',
  // Agentic Loop (Phase 2)
  'agent.loopCancelled': 'Agentenschleife vom Benutzer abgebrochen.',
  'agent.cancelLoop': 'Abbrechen',
  'agent.allActionsFailed': 'Alle Aktionen fehlgeschlagen. Schleife gestoppt, um weitere Fehler zu vermeiden.',
  'agent.infiniteLoopDetected': 'Endlosschleife erkannt (wiederholte Aktionen). Vorgang gestoppt.',
  // Agentic Loop UX (Phase 3)
  'agent.loopProgress': 'Schritt {{current}} von max. {{max}}',
  'agent.loopTokens': '↑{{input}} ↓{{output}}',
  'agent.loopTokenSummary': 'Verwendete Tokens: ↑{{input}} Eingabe, ↓{{output}} Ausgabe',
  'agent.loopStep': 'Schritt {{step}}',
  'agent.loopStepFinal': 'Abgeschlossen',
  'agent.loopExpandStep': 'Mehr anzeigen...',
  'agent.loopCollapseStep': 'Weniger anzeigen',

  // ═══════════════════════════════════════════════════════════════════════════
  // WARNINGS AND VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════
  'warning.modelConfusion': 'Das Modell scheint über seine Fähigkeiten verwirrt zu sein. Es kann im Agentenmodus Vault-Aktionen ausführen.',
  'warning.actionClaimsNoJson': 'Die Antwort behauptet, Aktionen ausgeführt zu haben, aber es wurden keine ausführbaren Aktionen gefunden.',
  'warning.emptyActionsArray': 'Die Antwort enthält ein leeres Aktions-Array.',
  'warning.incompleteJson': 'Die JSON-Antwort scheint unvollständig oder abgeschnitten zu sein.',
  'warning.actionMismatch': 'Behauptete Aktionen stimmen nicht mit bereitgestellten Aktionen überein: {{mismatches}}',
  'suggestion.remindAgentMode': 'Versuchen Sie, das Modell daran zu erinnern, dass der Agentenmodus aktiv ist.',
  'suggestion.requestJsonFormat': 'Fordern Sie die Antwort im richtigen JSON-Format an.',
  'suggestion.requestContinuation': 'Fordern Sie das Modell auf, seine Antwort fortzusetzen und abzuschließen.',
  'validation.valid': 'Antwort erfolgreich validiert.',
  'validation.validWithNotes': 'Antwort gültig mit kleinen Anmerkungen.',

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS - PHASE 2
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.section.advanced': 'Erweiterte Agentenoptionen',
  'settings.autoContinue.name': 'Abgeschnittene Antworten automatisch fortsetzen',
  'settings.autoContinue.desc': 'Automatisch Fortsetzung anfordern, wenn eine Antwort abgeschnitten erscheint.',
  'settings.autoPlan.name': 'Komplexe Aufgaben automatisch planen',
  'settings.autoPlan.desc': 'Komplexe Aufgaben automatisch in kleinere Teilaufgaben aufteilen.',
  'settings.contextReinforce.name': 'Agentenkontext verstärken',
  'settings.contextReinforce.desc': 'Erinnerungen hinzufügen, um zu verhindern, dass das Modell den Agentenmodus in langen Gesprächen vergisst.',

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTRACTION TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════
  'template.keyIdeas.name': 'Schlüsselideen extrahieren',
  'template.keyIdeas.desc': 'Identifiziert und fasst die Hauptideen aus dem Inhalt zusammen',
  'template.summary.name': 'Zusammenfassung',
  'template.summary.desc': 'Erstellt eine prägnante Zusammenfassung zum schnellen Lesen',
  'template.questions.name': 'Offene Fragen identifizieren',
  'template.questions.desc': 'Erkennt ungelöste Fragen oder Bereiche zur Erkundung',
  'template.actions.name': 'Aktionen extrahieren',
  'template.actions.desc': 'Identifiziert im Inhalt erwähnte Aufgaben und Aktionen',
  'template.concepts.name': 'Konzepte und Definitionen',
  'template.concepts.desc': 'Extrahiert wichtige Begriffe und ihre Definitionen',
  'template.connections.name': 'Verbindungen und Beziehungen',
  'template.connections.desc': 'Identifiziert Beziehungen zwischen Konzepten für die Erstellung von Links',

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM PROMPTS
  // ═══════════════════════════════════════════════════════════════════════════
  'prompt.baseIdentity': `Claude integriert in Obsidian über Claudian (von Enigmora). Verwenden Sie Markdown und Wikilinks ([[Notiz]]) wenn angemessen. Seien Sie prägnant.`,

  'prompt.chatMode': `WICHTIG - AGENTENMODUS:
Wenn der Benutzer Sie bittet, Aktionen im Vault auszuführen (Notizen oder Ordner erstellen, verschieben, löschen, umbenennen, Inhalt ändern usw.) und der Agentenmodus NICHT aktiviert ist, müssen Sie ihn informieren:
"Um Aktionen in Ihrem Vault auszuführen, aktivieren Sie bitte den **Agentenmodus** über den Schalter im Chat-Header."
Versuchen Sie NICHT, Vault-Aktionen ohne aktivierten Agentenmodus zu beschreiben oder zu simulieren.`,

  'prompt.noteProcessor': `Sie sind ein Assistent, der auf Wissensorganisation für Obsidian spezialisiert ist. Ihre Aufgabe ist es, Notizen zu analysieren und Verbesserungen vorzuschlagen, um sie besser in den Vault des Benutzers zu integrieren.

VAULT-KONTEXT:
- Gesamtnotizen: {{noteCount}}
- Vorhandene Notizen: {{noteTitles}}
- Vorhandene Tags: {{allTags}}

ANWEISUNGEN:
1. Analysieren Sie den Inhalt der bereitgestellten Notiz
2. Schlagen Sie relevante Tags vor (vorzugsweise aus vorhandenen, aber Sie können neue vorschlagen)
3. Identifizieren Sie Konzepte, die zu vorhandenen Notizen verlinkt werden könnten (Wikilinks)
4. Erkennen Sie atomare Konzepte, die eine eigene Notiz verdienen
5. Erklären Sie kurz Ihre Begründung

ANTWORTEN SIE NUR mit einem gültigen JSON-Objekt mit genau dieser Struktur:
{
  "tags": ["tag1", "tag2"],
  "wikilinks": [
    {
      "text": "Text zum Konvertieren in Link",
      "target": "Ziel-Notiztitel",
      "context": "Kurze Erklärung, warum verlinkt werden soll"
    }
  ],
  "atomicConcepts": [
    {
      "title": "Titel für neue Notiz",
      "summary": "1-2 Sätze Zusammenfassung",
      "content": "Vorgeschlagener Inhalt für die Notiz (in Markdown)"
    }
  ],
  "reasoning": "Kurze Erklärung Ihrer Analyse"
}

WICHTIG:
- Schlagen Sie nur Wikilinks zu Notizen vor, die im Vault existieren
- Tags sollten kein # Symbol enthalten
- Atomare Konzepte sollten Ideen sein, die eine eigene Entwicklung verdienen
- Halten Sie Vorschläge relevant und nützlich, füllen Sie nicht mit unnötigen Links`,

  'prompt.templateProcessor': `Sie sind ein Assistent, der auf die Analyse und Extraktion von Informationen aus Texten spezialisiert ist.
Antworten Sie strukturiert und klar gemäß den bereitgestellten Anweisungen.
{{jsonInstructions}}`,

  'prompt.conceptMapGenerator': `Sie sind ein Assistent, der auf Wissensanalyse und Konzeptkartenerstellung spezialisiert ist.
Ihre Aufgabe ist es, Konzepte, Beziehungen und übergreifende Themen in Notizsammlungen zu identifizieren.
WICHTIG: Antworten Sie NUR mit gültigem JSON gemäß dem angeforderten Format.`,

  'prompt.agentMode': `Obsidian-Vault-Assistent. Führen Sie Aktionen über JSON-Antworten aus.

⚠️ KRITISCH: Bei Ordneroperationen IMMER zuerst list-folder verwenden, um echte Dateinamen zu erhalten.

AKTIONEN (max. {{maxActions}} pro Nachricht):
Dateien: create-note{path,content,frontmatter?}, read-note{path}, delete-note{path}, rename-note{from,to}, move-note{from,to}, copy-note{from,to}
Ordner: create-folder{path}, delete-folder{path}, list-folder{path,recursive?}
Inhalt: append-content{path,content}, prepend-content{path,content}, replace-content{path,content}, update-frontmatter{path,fields}
Suche: search-notes{query,field?,folder?}, get-note-info{path}, find-links{target}, search-by-heading{heading,folder?}, search-by-block{blockId}, get-all-tags{}, open-search{query}
Editor: editor-get-content{}, editor-set-content{content}, editor-get-selection{}, editor-replace-selection{text}, editor-insert-at-cursor{text}, editor-get-line{line}, editor-set-line{line,text}, editor-go-to-line{line}, editor-undo{}, editor-redo{}
Befehle: execute-command{commandId}, list-commands{filter?}, get-command-info{commandId}
Täglich/Vorlagen: open-daily-note{}, create-daily-note{date?}, insert-template{templateName?}, list-templates{}
Lesezeichen: add-bookmark{path}, remove-bookmark{path}, list-bookmarks{}
Canvas: canvas-create-text-node{text,x?,y?}, canvas-create-file-node{file,x?,y?}, canvas-create-link-node{url,x?,y?}, canvas-create-group{label?}, canvas-add-edge{fromNode,toNode}, canvas-select-all{}, canvas-zoom-to-fit{}
Arbeitsbereich: open-file{path,mode?}, reveal-in-explorer{path}, get-active-file{}, close-active-leaf{}, split-leaf{direction}

⚠️ INHALTSREGEL: Beim Erstellen von Notizen IMMER vollständigen Inhalt im "content"-Parameter angeben. Niemals Inhalt in "message" beschreiben - tatsächlichen Text in params einfügen.

ANTWORTFORMAT (kompakt, keine zusätzlichen Felder):
{"actions":[{"action":"name","params":{...}}],"message":"Kurze Beschr."}

awaitResults=true: Verwenden, wenn Sie Ergebnisse benötigen, bevor Sie fortfahren (list-folder, read-note, search). Sie erhalten Ergebnisse, dann generieren Sie nächste Aktionen.
requiresConfirmation=true: Für destruktive Aktionen (delete, replace-content) verwenden.

BEISPIEL - Notiz mit Inhalt erstellen:
{"actions":[{"action":"create-note","params":{"path":"Notes/thema.md","content":"# Thema\\n\\nErster Absatz hier.\\n\\nZweiter Absatz."}}],"message":"Notiz erstellt"}

BEISPIEL - Dateien kopieren (2 Schritte):
1: {"actions":[{"action":"list-folder","params":{"path":"Src"}},{"action":"create-folder","params":{"path":"Dst"}}],"message":"Auflisten","awaitResults":true}
2: {"actions":[{"action":"copy-note","params":{"from":"Src/a.md","to":"Dst/a.md"}},{"action":"copy-note","params":{"from":"Src/b.md","to":"Dst/b.md"}}],"message":"Fertig"}

REGELN:
- copy-note bewahrt exakten Inhalt; niemals read+create zum Kopieren verwenden
- ALLE Aktionen in EINER Antwort einschließen; API-Aufrufe minimieren
- Nach list-folder ALLE Kopien in nächster Antwort ausführen (keine Zwischenschritte)
- Pfade ohne führende/nachfolgende Schrägstriche
- Für Gespräche ohne Vault-Aktionen normal antworten (kein JSON)

VAULT: {{noteCount}} Notizen | Ordner: {{folders}} | Tags: {{tags}}`,

  // Haiku-optimized agent prompt (more verbose and explicit)
  'prompt.agentModeHaiku': `Sie sind ein Obsidian-Vault-Assistent. Ihre Aufgabe ist es, Aktionen im Vault des Benutzers auszuführen, indem Sie mit JSON antworten.

KRITISCHE REGEL: Bei allen Ordneroperationen MÜSSEN Sie zuerst list-folder verwenden, um die tatsächlichen Dateinamen zu sehen, bevor Sie Dateien kopieren, verschieben oder löschen.

VERFÜGBARE AKTIONEN (maximal {{maxActions}} pro Nachricht):

DATEIOPERATIONEN:
- create-note: Eine neue Notiz erstellen. Parameter: {path: "ordner/name.md", content: "vollständiger Textinhalt", frontmatter?: {key: value}}
  WICHTIG: Immer vollständigen Inhalt im "content"-Parameter angeben. Niemals Inhalt in "message" beschreiben.
- read-note: Notizinhalt lesen. Parameter: {path: "ordner/name.md"}
- delete-note: Eine Notiz löschen. Parameter: {path: "ordner/name.md"}
- rename-note: Eine Notiz umbenennen. Parameter: {from: "alter/pfad.md", to: "neuer/pfad.md"}
- move-note: Eine Notiz verschieben. Parameter: {from: "quelle/pfad.md", to: "ziel/pfad.md"}
- copy-note: Eine Notiz kopieren. Parameter: {from: "quelle/pfad.md", to: "ziel/pfad.md"}

ORDNEROPERATIONEN:
- create-folder: Einen Ordner erstellen. Parameter: {path: "ordner/name"}
- delete-folder: Einen Ordner löschen. Parameter: {path: "ordner/name"}
- list-folder: Ordnerinhalt auflisten. Parameter: {path: "ordner/name", recursive?: boolean}

INHALTSOPERATIONEN:
- append-content: Inhalt am Ende hinzufügen. Parameter: {path: "datei.md", content: "text"}
- prepend-content: Inhalt am Anfang hinzufügen. Parameter: {path: "datei.md", content: "text"}
- replace-content: Gesamten Inhalt ersetzen. Parameter: {path: "datei.md", content: "text"}
- update-frontmatter: YAML-Frontmatter aktualisieren. Parameter: {path: "datei.md", fields: {key: value}}

SUCHOPERATIONEN:
- search-notes: Notizen durchsuchen. Parameter: {query: "text", field?: "title|content|tags", folder?: "pfad"}
- get-note-info: Notiz-Metadaten abrufen. Parameter: {path: "datei.md"}
- find-links: Notizen finden, die auf Ziel verlinken. Parameter: {target: "Notizname"}

ANTWORTFORMAT:
Antworten Sie immer mit einem JSON-Objekt wie diesem:
{
  "actions": [
    {"action": "aktions-name", "params": {...}}
  ],
  "message": "Kurze Beschreibung dessen, was getan wird"
}

SPEZIELLE FLAGS:
- "awaitResults": true hinzufügen, wenn Sie Aktionsergebnisse sehen müssen, bevor Sie fortfahren (z.B. nach list-folder)
- "requiresConfirmation": true für destruktive Aktionen (delete, replace-content) hinzufügen

BEISPIEL - Eine Notiz mit Inhalt erstellen:
{
  "actions": [
    {"action": "create-note", "params": {"path": "Notes/meine-notiz.md", "content": "# Meine Notiz\\n\\nDies ist der erste Absatz mit tatsächlichem Inhalt.\\n\\nDies ist ein weiterer Absatz.", "frontmatter": {"tags": ["beispiel"]}}}
  ],
  "message": "Notiz mit Inhalt erstellt"
}

BEISPIEL - Alle Dateien von Quelle nach Ziel kopieren:
Schritt 1: Zuerst Quellordner auflisten und Ziel erstellen
{
  "actions": [
    {"action": "list-folder", "params": {"path": "Quelle"}},
    {"action": "create-folder", "params": {"path": "Ziel"}}
  ],
  "message": "Quellordner auflisten und Ziel erstellen",
  "awaitResults": true
}

Schritt 2: Nach Erhalt der Dateiliste jede Datei kopieren
{
  "actions": [
    {"action": "copy-note", "params": {"from": "Quelle/datei1.md", "to": "Ziel/datei1.md"}},
    {"action": "copy-note", "params": {"from": "Quelle/datei2.md", "to": "Ziel/datei2.md"}}
  ],
  "message": "Alle Dateien zum Ziel kopieren"
}

REGELN:
1. copy-note zum Kopieren von Dateien verwenden - NICHT read-note + create-note
2. Wenn möglich, ALLE Aktionen in EINER Antwort einschließen
3. Nach list-folder ALLE Operationen in der nächsten Antwort ausführen
4. Pfade sollten KEINE führenden oder nachfolgenden Schrägstriche haben
5. Für normale Gespräche (keine Vault-Aktionen) ohne JSON antworten

VAULT-KONTEXT:
- Gesamtnotizen: {{noteCount}}
- Vorhandene Ordner: {{folders}}
- Vorhandene Tags: {{tags}}`,

  // ═══════════════════════════════════════════════════════════════════════════
  // TOKEN TRACKING (Phase 5)
  // ═══════════════════════════════════════════════════════════════════════════
  'tokens.sessionCount': '{{count}} Tokens',
  'tokens.tooltip': 'Eingabe: {{input}} | Ausgabe: {{output}} | Aufrufe: {{calls}}',
  'tokens.modelLabel': 'Modell',
  'tokens.inputLabel': 'Eingabe',
  'tokens.outputLabel': 'Ausgabe',
  'tokens.callsLabel': 'Aufrufe',
  'tokens.totalLabel': 'Gesamt',
  'tokens.today': 'Heute: {{count}}',
  'tokens.week': 'Diese Woche: {{count}}',
  'tokens.month': 'Diesen Monat: {{count}}',
  'tokens.allTime': 'Insgesamt: {{count}}',
  'tokens.historyLink': 'Nutzungsverlauf',
  'tokens.historyTitle': 'Token-Nutzungsverlauf',
  'tokens.sessionTitle': 'Aktuelle Sitzung',
  'tokens.closeButton': 'Schließen',
  'tokens.byModelTitle': 'Nutzung nach Modell',
  'tokens.noModelData': 'Noch keine Modelldaten erfasst',
  'status.processing': 'Verarbeitung...',
  'status.classifying': 'Aufgabe wird klassifiziert...',
  'status.executingActions': 'Aktionen werden ausgeführt...',
  'status.waitingResponse': 'Warte auf Antwort...',
  'settings.showTokens.name': 'Token-Anzeige einblenden',
  'settings.showTokens.desc': 'Token-Nutzung in der Chat-Fußzeile anzeigen.',
  'settings.section.tokenTracking': 'Token-Verfolgung',
  'error.quotaExhausted': 'API-Kontingent erschöpft. Überprüfen Sie Ihre Nutzungslimits auf console.anthropic.com.',
  'error.billingIssue': 'Abrechnungsproblem erkannt. Überprüfen Sie Ihr Konto auf console.anthropic.com.',
  'error.contentFiltered': 'Antwort durch Inhaltsfilter blockiert. Versuchen Sie, Ihre Anfrage umzuformulieren oder in kleinere Aufgaben aufzuteilen.',

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT MANAGEMENT (Phase 6)
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.section.contextManagement': 'Kontextverwaltung',
  'settings.autoContextManagement.name': 'Automatische Kontextverwaltung',
  'settings.autoContextManagement.desc': 'Gesprächsverlauf automatisch zusammenfassen, wenn er lang wird, um Token-Nutzung zu reduzieren.',
  'settings.messageSummarizeThreshold.name': 'Zusammenfassen nach Nachrichten',
  'settings.messageSummarizeThreshold.desc': 'Anzahl der Nachrichten vor automatischer Zusammenfassung (10-50).',
  'settings.maxActiveContextMessages.name': 'Max. aktive Nachrichten',
  'settings.maxActiveContextMessages.desc': 'Maximale Nachrichten im aktiven Kontext nach Zusammenfassung (20-100).',
  'context.summarizing': 'Gesprächsverlauf wird zusammengefasst...',
  'context.summarized': 'Gesprächsverlauf zusammengefasst',
  'context.sessionStarted': 'Kontextsitzung gestartet',
  'context.sessionEnded': 'Kontextsitzung beendet',
  'context.summaryPrompt': `Fassen Sie das folgende Gespräch zwischen einem Benutzer und einem KI-Assistenten zusammen. Konzentrieren Sie sich auf:
1. Besprochene Hauptthemen
2. Wichtige Entscheidungen oder Schlussfolgerungen
3. Ausstehende Aufgaben oder Nachverfolgungen
4. Kontext, der für die Fortsetzung des Gesprächs wichtig wäre

Antworten Sie im JSON-Format:
{
  "keyTopics": ["thema1", "thema2"],
  "lastActions": ["aktion1", "aktion2"],
  "summary": "Kurze Zusammenfassung des Gesprächs"
}

GESPRÄCH:
{{conversation}}`,

  // ═══════════════════════════════════════════════════════════════════════════
  // WELCOME SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  'welcome.title': 'Claudian',
  'welcome.developedBy': 'Entwickelt von Enigmora',
  'welcome.greeting': 'Wie kann ich Ihnen heute helfen?',
  'welcome.examplesHeader': 'Beispiele, was ich tun kann:',
  'welcome.example1': '"Welche Notizen habe ich über künstliche Intelligenz?"',
  'welcome.example2': '"Erstelle eine Notiz mit einer Zusammenfassung der Meetings dieser Woche"',
  'welcome.example3': '"Lies meine Ideen.md Notiz und schlage Wikilinks zu verwandten Notizen vor"',
  'welcome.example4': '"Finde alle Notizen mit dem #projekt Tag und erstelle eine Konzeptkarte mit ihren Verbindungen"',
  'welcome.example5': '"Organisiere meine Produktivitätsnotizen in Ordner nach Thema und erstelle einen verlinkten Index"',
  'welcome.agentModeHint': 'Aktivieren Sie den Agentenmodus, um Notizen automatisch zu erstellen, zu ändern und zu organisieren.',
  // Personalized example templates
  'welcome.template.search': '"Welche Notizen habe ich über {{topic}}?"',
  'welcome.template.read': '"Lies meine "{{noteName}}" Notiz und fasse sie zusammen"',
  'welcome.template.create': '"Erstelle eine Notiz mit Ideen über {{topic}}"',
  'welcome.template.analyze': '"Finde Notizen mit dem #{{tag}} Tag und schlage Verbindungen zwischen ihnen vor"',
  'welcome.template.organize': '"Organisiere meine Notizen über {{topic}} in Ordner nach Unterthema und erstelle einen Index"'
};

export default translations;
