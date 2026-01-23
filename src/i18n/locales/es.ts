import type { Translations } from '../types';

const translations: Translations = {
  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.title': 'Claudian - Configuración',
  'settings.description': 'Plugin de Obsidian para integración con Claude AI, desarrollado por Enigmora. Chatea con Claude, procesa notas para obtener sugerencias inteligentes de tags y wikilinks, y gestiona tu bóveda con lenguaje natural usando el Modo Agente. Privacidad primero: API key almacenada localmente.',
  'settings.language.name': 'Idioma',
  'settings.language.desc': 'Idioma de la interfaz del plugin. "Auto" detecta el idioma de Obsidian.',
  'settings.language.auto': 'Auto (detectar de Obsidian)',
  'settings.apiKey.name': 'API Key',
  'settings.apiKey.descPart1': 'Obtén tu API Key de Anthropic en ',
  'settings.apiKey.descPart2': '. Se almacena localmente en tu bóveda.',
  'settings.apiKey.placeholder': 'sk-ant-...',
  'settings.model.name': 'Modelo',
  'settings.model.desc': 'Selecciona el modelo de Claude a utilizar.',
  'settings.model.sonnet4': 'Claude Sonnet 4 (Recomendado)',
  'settings.model.opus4': 'Claude Opus 4',
  'settings.model.sonnet35': 'Claude 3.5 Sonnet',
  'settings.model.haiku45': 'Claude Haiku 4.5 (Rápido)',
  // Modo de Ejecución (Model Orchestrator)
  'settings.executionMode.name': 'Modo de Ejecución',
  'settings.executionMode.desc': 'Cómo Claude selecciona modelos para tus tareas.',
  'settings.executionMode.automatic': 'Automático (Recomendado)',
  'settings.executionMode.automaticDesc': 'Enrutamiento inteligente: tareas simples a Haiku, complejas a Sonnet, análisis profundo a Opus.',
  'settings.executionMode.economic': 'Económico',
  'settings.executionMode.economicDesc': 'Todas las tareas usan Haiku. Más rápido y económico.',
  'settings.executionMode.maxQuality': 'Máxima Calidad',
  'settings.executionMode.maxQualityDesc': 'Todas las tareas usan Opus. Mejor para análisis complejo y escritura.',
  'settings.executionMode.currentModel': 'Usando: {{model}}',
  'settings.folder.name': 'Carpeta de notas',
  'settings.folder.desc': 'Carpeta donde se guardarán las notas generadas desde el chat.',
  'settings.folder.placeholder': 'Claudian',
  'settings.maxTokens.name': 'Máximo de tokens',
  'settings.maxTokens.desc': 'Número máximo de tokens en las respuestas (1000-8192).',
  'settings.customInstructions.name': 'Instrucciones personalizadas',
  'settings.customInstructions.desc': 'Instrucciones adicionales para personalizar el comportamiento de Claude. Estas se agregan a las instrucciones base (no las reemplazan).',
  'settings.customInstructions.placeholder': 'Ej.: Responde siempre en español formal, usa viñetas...',
  'settings.customInstructions.clear': 'Limpiar',
  'settings.customInstructions.cleared': 'Instrucciones personalizadas limpiadas',
  'settings.section.noteProcessing': 'Procesamiento de Notas',
  'settings.maxNotesContext.name': 'Máximo de notas en contexto',
  'settings.maxNotesContext.desc': 'Número máximo de títulos de notas a incluir al procesar (10-500).',
  'settings.maxTagsContext.name': 'Máximo de tags en contexto',
  'settings.maxTagsContext.desc': 'Número máximo de tags existentes a incluir al procesar (10-200).',
  'settings.section.agentMode': 'Modo Agente',
  'settings.agentEnabled.name': 'Activar modo agente por defecto',
  'settings.agentEnabled.desc': 'El modo agente permite a Claude ejecutar acciones sobre la bóveda.',
  'settings.confirmDestructive.name': 'Confirmar acciones destructivas',
  'settings.confirmDestructive.desc': 'Solicitar confirmación antes de eliminar archivos o reemplazar contenido.',
  'settings.protectedFolders.name': 'Carpetas protegidas',
  'settings.protectedFolders.desc': 'Carpetas que el agente no puede modificar (separadas por comas).',
  'settings.protectedFolders.placeholder': '.obsidian, templates',
  'settings.maxActions.name': 'Máximo de acciones por mensaje',
  'settings.maxActions.desc': 'Límite de acciones que Claude puede ejecutar en un solo mensaje (1-20).',
  'settings.footer.license': 'Licenciado bajo MIT License',
  'settings.footer.developedBy': 'Desarrollado por',
  'settings.footer.sourceCode': 'Código fuente',

  // ═══════════════════════════════════════════════════════════════════════════
  // CHAT INTERFACE
  // ═══════════════════════════════════════════════════════════════════════════
  'chat.placeholder': 'Escribe tu mensaje...',
  'chat.send': 'Enviar',
  'chat.clearLabel': 'Limpiar chat',
  'chat.cleared': 'Chat limpiado',
  'chat.agentLabel': 'Agente',
  'chat.agentEnabled': 'Modo agente activado',
  'chat.agentDisabled': 'Modo agente desactivado',
  'chat.copyLabel': 'Copiar',
  'chat.copied': 'Copiado al portapapeles',
  'chat.createNoteLabel': 'Crear nota',
  'chat.actionsExecuted': '{{count}} acción(es) ejecutadas',
  'chat.actionsPartial': '{{success}} exitosas, {{failed}} fallidas',
  'chat.actionsCancelled': 'Acciones canceladas por el usuario.',
  'chat.error': 'Error: {{message}}',
  'chat.errorUnknown': 'Error desconocido',
  'chat.stop': 'Detener',
  'chat.streamStopped': 'Respuesta detenida por el usuario',

  // ═══════════════════════════════════════════════════════════════════════════
  // ERRORS
  // ═══════════════════════════════════════════════════════════════════════════
  'error.apiKeyMissing': 'API key no configurada. Ve a Settings > Claudian.',
  'error.apiKeyInvalid': 'API key inválida. Verifica tu clave en Settings.',
  'error.rateLimit': 'Límite de requests excedido. Intenta en unos segundos.',
  'error.connection': 'Error de conexión. Verifica tu conexión a internet.',
  'error.unknown': 'Error desconocido al comunicarse con Claude.',
  'error.noActiveNote': 'No hay una nota markdown activa.',
  'error.parseJson': 'No se encontró JSON válido en la respuesta.',
  'error.parseResponse': 'Error al parsear JSON de sugerencias.',
  'error.tooManyActions': 'Demasiadas acciones ({{count}}). Máximo permitido: {{max}}',

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTE CREATOR MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'noteCreator.title': 'Crear nota desde chat',
  'noteCreator.preview': 'Vista previa',
  'noteCreator.titleField.name': 'Título',
  'noteCreator.titleField.desc': 'Nombre del archivo (sin extensión .md)',
  'noteCreator.tags.name': 'Tags',
  'noteCreator.tags.desc': 'Separados por comas',
  'noteCreator.tags.placeholder': 'tag1, tag2, tag3',
  'noteCreator.folder.name': 'Carpeta',
  'noteCreator.folder.desc': 'Carpeta destino de la nota',
  'noteCreator.cancel': 'Cancelar',
  'noteCreator.create': 'Crear nota',
  'noteCreator.titleRequired': 'El título es requerido',
  'noteCreator.fileExists': 'Ya existe un archivo con el nombre: {{name}}',
  'noteCreator.created': 'Nota creada: {{path}}',
  'noteCreator.error': 'Error al crear la nota: {{message}}',

  // ═══════════════════════════════════════════════════════════════════════════
  // BATCH MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'batch.titleExtraction': 'Procesamiento Batch',
  'batch.titleConceptMap': 'Generar Mapa de Conceptos',
  'batch.selectNotes': 'Seleccionar notas',
  'batch.selectFolder': 'Seleccionar carpeta',
  'batch.selectAll': 'Seleccionar todo',
  'batch.clear': 'Limpiar',
  'batch.counter': '{{count}} notas seleccionadas',
  'batch.noNotes': 'No hay notas en la bóveda',
  'batch.rootFolder': 'Raíz',
  'batch.selectTemplate': 'Seleccionar template',
  'batch.mapOptions': 'Opciones del mapa',
  'batch.mapTitle': 'Título del mapa:',
  'batch.mapTitlePlaceholder': 'Mi mapa de conceptos',
  'batch.cancel': 'Cancelar',
  'batch.processNotes': 'Procesar notas',
  'batch.generateMap': 'Generar mapa',
  'batch.selectAtLeastOne': 'Selecciona al menos una nota',
  'batch.selectTemplateRequired': 'Selecciona un template',
  'batch.starting': 'Iniciando procesamiento...',
  'batch.processing': 'Procesando {{current}}/{{total}}: {{note}}',
  'batch.completed': 'Completado: {{success}} exitosos, {{errors}} errores',
  'batch.savedTo': 'Resultados guardados en: {{path}}',
  'batch.analyzing': 'Analizando notas...',
  'batch.saving': 'Guardando mapa...',
  'batch.mapGenerated': 'Mapa generado exitosamente',
  'batch.errorProcessing': 'Error durante el procesamiento',
  'batch.errorGenerating': 'Error al generar mapa',
  'batch.folderPrompt': 'Ingresa el nombre de la carpeta:',

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIRMATION MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'confirmation.title': 'Confirmar acciones',
  'confirmation.description': 'Las siguientes acciones requieren confirmación:',
  'confirmation.warning': 'Esta acción no se puede deshacer.',
  'confirmation.cancel': 'Cancelar',
  'confirmation.confirm': 'Confirmar',
  'confirmation.deleteNote': 'Eliminar nota: {{path}}',
  'confirmation.deleteFolder': 'Eliminar carpeta: {{path}}',
  'confirmation.replaceContent': 'Reemplazar contenido de: {{path}}',
  'confirmation.overwriteNote': 'Sobreescribir archivo existente: {{path}}',
  'confirmation.moveNote': 'Mover: {{from}} → {{to}}',
  'confirmation.renameNote': 'Renombrar: {{from}} → {{to}}',

  // ═══════════════════════════════════════════════════════════════════════════
  // SUGGESTIONS MODAL
  // ═══════════════════════════════════════════════════════════════════════════
  'suggestions.title': 'Sugerencias para la nota',
  'suggestions.tags': 'Tags sugeridos',
  'suggestions.tagsEmpty': 'No hay sugerencias de tags.',
  'suggestions.selectAll': 'Seleccionar todos',
  'suggestions.applySelected': 'Aplicar seleccionados',
  'suggestions.wikilinks': 'Wikilinks sugeridos',
  'suggestions.wikilinksEmpty': 'No hay sugerencias de wikilinks.',
  'suggestions.badgeExists': 'existe',
  'suggestions.badgeNew': 'nueva',
  'suggestions.selectExisting': 'Seleccionar existentes',
  'suggestions.insertSelected': 'Insertar seleccionados',
  'suggestions.atomicConcepts': 'Conceptos atómicos',
  'suggestions.atomicConceptsEmpty': 'No hay conceptos atómicos sugeridos.',
  'suggestions.viewContent': 'Ver contenido',
  'suggestions.createNote': 'Crear nota',
  'suggestions.noteCreated': 'Creada',
  'suggestions.tagsApplied': '{{count}} tag(s) aplicados.',
  'suggestions.wikilinksInserted': '{{count}} wikilink(s) insertados.',

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMANDS
  // ═══════════════════════════════════════════════════════════════════════════
  'command.openChat': 'Abrir chat con Claude',
  'command.processNote': 'Procesar nota activa con Claude',
  'command.batchProcess': 'Procesamiento batch de notas',
  'command.generateMap': 'Generar mapa de conceptos',

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTE PROCESSOR
  // ═══════════════════════════════════════════════════════════════════════════
  'processor.reading': 'Leyendo contenido de la nota...',
  'processor.analyzing': 'Analizando con Claude...',
  'processor.processing': 'Procesando nota con Claude...',
  'processor.relatedLinks': 'Enlaces relacionados',

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENT MODE
  // ═══════════════════════════════════════════════════════════════════════════
  'agent.actionsExecuted': 'Acciones ejecutadas',
  'agent.noActions': 'No se pudieron ejecutar las acciones:',
  'agent.actionsFailed': '{{count}} acción(es) fallaron.',
  'agent.partialSuccess': 'Resultados:',
  'agent.loopLimitReached': 'Límite de iteraciones alcanzado. Por favor, continúa manualmente.',
  'agent.processingResults': 'Procesando resultados (paso {{step}})...',
  'agent.createFolder': 'Crear carpeta: {{path}}',
  'agent.deleteFolder': 'Eliminar carpeta: {{path}}',
  'agent.listFolder': 'Listar carpeta: {{path}}',
  'agent.createNote': 'Crear nota: {{path}}',
  'agent.readNote': 'Leer nota: {{path}}',
  'agent.deleteNote': 'Eliminar nota: {{path}}',
  'agent.renameNote': 'Renombrar: {{from}} → {{to}}',
  'agent.moveNote': 'Mover: {{from}} → {{to}}',
  'agent.copyNote': 'Copiar: {{from}} → {{to}}',
  'agent.appendContent': 'Agregar contenido a: {{path}}',
  'agent.prependContent': 'Insertar contenido en: {{path}}',
  'agent.replaceContent': 'Reemplazar contenido de: {{path}}',
  'agent.updateFrontmatter': 'Actualizar frontmatter: {{path}}',
  'agent.searchNotes': 'Buscar notas: "{{query}}"',
  'agent.getNoteInfo': 'Obtener info: {{path}}',
  'agent.findLinks': 'Buscar enlaces a: {{target}}',
  // Editor API actions
  'agent.editorGetContent': 'Obtener contenido del editor',
  'agent.editorSetContent': 'Establecer contenido del editor',
  'agent.editorGetSelection': 'Obtener texto seleccionado',
  'agent.editorReplaceSelection': 'Reemplazar selección con: {{text}}',
  'agent.editorInsertAtCursor': 'Insertar en cursor: {{text}}',
  'agent.editorGetLine': 'Obtener línea {{line}}',
  'agent.editorSetLine': 'Establecer línea {{line}}',
  'agent.editorGoToLine': 'Ir a línea {{line}}',
  'agent.editorUndo': 'Deshacer',
  'agent.editorRedo': 'Rehacer',
  // Commands API actions
  'agent.executeCommand': 'Ejecutar comando: {{commandId}}',
  'agent.listCommands': 'Listar comandos',
  'agent.getCommandInfo': 'Info del comando: {{commandId}}',
  // Daily Notes actions
  'agent.openDailyNote': 'Abrir nota diaria',
  'agent.createDailyNote': 'Crear nota diaria: {{date}}',
  // Templates actions
  'agent.insertTemplate': 'Insertar plantilla: {{templateName}}',
  'agent.listTemplates': 'Listar plantillas',
  // Bookmarks actions
  'agent.addBookmark': 'Agregar marcador: {{path}}',
  'agent.removeBookmark': 'Eliminar marcador: {{path}}',
  'agent.listBookmarks': 'Listar marcadores',
  // Canvas API actions
  'agent.canvasCreateTextNode': 'Crear nodo de texto: {{text}}',
  'agent.canvasCreateFileNode': 'Crear nodo de archivo: {{file}}',
  'agent.canvasCreateLinkNode': 'Crear nodo de enlace: {{url}}',
  'agent.canvasCreateGroup': 'Crear grupo: {{label}}',
  'agent.canvasAddEdge': 'Agregar conexión: {{fromNode}} → {{toNode}}',
  'agent.canvasSelectAll': 'Seleccionar todos los nodos',
  'agent.canvasZoomToFit': 'Ajustar zoom al canvas',
  // Enhanced Search actions
  'agent.searchByHeading': 'Buscar por encabezado: {{heading}}',
  'agent.searchByBlock': 'Buscar por ID de bloque: {{blockId}}',
  'agent.getAllTags': 'Obtener todos los tags',
  'agent.openSearch': 'Abrir búsqueda: {{query}}',
  // Workspace actions
  'agent.openFile': 'Abrir archivo: {{path}}',
  'agent.revealInExplorer': 'Mostrar en explorador: {{path}}',
  'agent.getActiveFile': 'Obtener info del archivo activo',
  'agent.closeActiveLeaf': 'Cerrar pestaña activa',
  'agent.splitLeaf': 'Dividir vista: {{direction}}',
  // Error messages for new actions
  'error.noActiveEditor': 'No hay editor activo. Abre un archivo markdown primero.',
  'error.noActiveCanvas': 'No hay canvas activo. Abre un archivo canvas primero.',
  'error.pluginNotEnabled': 'El plugin "{{plugin}}" no está habilitado.',
  'error.commandNotFound': 'Comando no encontrado: {{commandId}}',
  'error.templateNotFound': 'Plantilla no encontrada: {{templateName}}',
  'error.bookmarkNotFound': 'Marcador no encontrado: {{path}}',
  'error.canvasNodeNotFound': 'Nodo de canvas no encontrado: {{nodeId}}',
  'error.headingNotFound': 'No se encontraron notas con encabezado: {{heading}}',
  'error.blockNotFound': 'Bloque no encontrado: {{blockId}}',
  'agent.genericAction': 'Acción: {{action}}',
  'agent.progressStarting': 'Iniciando ejecución...',
  'agent.progressStatus': 'Ejecutando {{current}}/{{total}}',
  'agent.generatingResponse': 'Generando respuesta...',
  'agent.streamingChars': 'Caracteres: ',
  'agent.streamingActions': 'Acciones detectadas: ',
  'agent.showRawResponse': '▶ Mostrar respuesta cruda',
  'agent.hideRawResponse': '▼ Ocultar respuesta cruda',
  'agent.warningTitle': 'Se requiere Modo Agente',
  'agent.warningDescription': 'Parece que quieres crear, modificar u organizar archivos en tu bóveda. Esto requiere que el Modo Agente esté activado.',
  'agent.enableAgentMode': 'Activar Modo Agente',
  'agent.continueAnyway': 'Continuar sin él',
  'agent.continuing': 'Continuando respuesta...',
  'agent.retryWithJson': 'Reintentar con formato JSON',
  'agent.planningTask': 'Planificando tarea compleja...',
  'agent.executingSubtask': 'Ejecutando {{current}}/{{total}}: {{description}}',
  'agent.subtask.preparation': 'Preparar estructura',
  'agent.subtask.execution': 'Ejecutar tarea principal',
  'agent.planSummary.header': 'Tarea completada: {{completed}}/{{total}} subtareas',
  'agent.planSummary.successful': '**Exitosas:**',
  'agent.planSummary.failed': '**Fallidas:**',
  'agent.planningPrompt': `Divide esta tarea compleja en subtareas que puedan completarse con máximo {{maxActions}} acciones cada una.

TAREA: {{request}}

Acciones totales estimadas: {{estimatedActions}}
Máximo de subtareas permitidas: {{maxSubtasks}}

Responde con JSON:
{
  "subtasks": [
    {
      "id": "subtask-1",
      "description": "Breve descripción de lo que hace esta subtarea",
      "prompt": "Instrucción específica para ejecutar esta subtarea",
      "dependencies": []
    }
  ],
  "estimatedTotalActions": número
}

IMPORTANTE:
- Cada subtarea debe ser independiente o tener dependencias claras
- Ordena las subtareas lógicamente (ej: crear carpetas antes de crear archivos en ellas)
- Mantén los prompts específicos y accionables`,
  'agent.reinforcement.reminder': 'Estás en MODO AGENTE. Usa formato JSON para acciones sobre la bóveda.',
  'agent.reinforcement.canPerformActions': 'SÍ PUEDES crear, modificar y eliminar archivos en esta bóveda. NO digas que no puedes - usa el sistema de acciones.',
  'agent.reinforcement.useJsonFormat': 'Cuando el usuario solicite acciones sobre la bóveda, responde con JSON conteniendo el array "actions".',
  'agent.reinforcement.dontForget': 'Recuerda: Tienes capacidad total para gestionar esta bóveda de Obsidian a través del sistema de acciones.',
  'agent.reinforcement.recoveryPrompt': `El usuario preguntó: "{{message}}"

Estás en MODO AGENTE y PUEDES realizar acciones sobre la bóveda. Por favor responde con el formato JSON apropiado:
{
  "actions": [{"action": "...", "params": {...}}],
  "message": "...",
  "requiresConfirmation": false
}`,
  'agent.retryPrompt.confusion': 'SÍ PUEDES crear y modificar archivos en esta bóveda. Por favor proporciona las acciones en formato JSON según tus instrucciones.',
  'agent.retryPrompt.missingJson': `Describiste acciones pero no proporcionaste el formato JSON. Basándote en lo que dijiste: "{{context}}..."

Por favor proporciona las acciones EXACTAS como JSON:
{
  "actions": [{"action": "nombre-accion", "params": {...}}],
  "message": "Descripción de lo que se hará",
  "requiresConfirmation": false
}`,
  'agent.retryPrompt.incompleteJson': 'Tu respuesta fue cortada. Por favor continúa y completa la estructura JSON.',
  'agent.retryPrompt.generic': 'Por favor proporciona las acciones de la bóveda en el formato JSON requerido con los campos "actions", "message" y "requiresConfirmation".',
  // Agentic Loop (Phase 2)
  'agent.loopCancelled': 'Bucle agéntico cancelado por el usuario.',
  'agent.cancelLoop': 'Cancelar',
  'agent.allActionsFailed': 'Todas las acciones fallaron. Bucle detenido para evitar más errores.',
  'agent.infiniteLoopDetected': 'Bucle infinito detectado (acciones repetidas). Operación detenida.',
  // Agentic Loop UX (Phase 3)
  'agent.loopProgress': 'Paso {{current}} de máx. {{max}}',
  'agent.loopTokens': '↑{{input}} ↓{{output}}',
  'agent.loopTokenSummary': 'Tokens utilizados: ↑{{input}} entrada, ↓{{output}} salida',
  'agent.loopStep': 'Paso {{step}}',
  'agent.loopStepFinal': 'Completado',
  'agent.loopExpandStep': 'Ver más...',
  'agent.loopCollapseStep': 'Ver menos',

  // ═══════════════════════════════════════════════════════════════════════════
  // WARNINGS AND VALIDATION
  // ═══════════════════════════════════════════════════════════════════════════
  'warning.modelConfusion': 'El modelo parece confundido sobre sus capacidades. Puede realizar acciones de bóveda en Modo Agente.',
  'warning.actionClaimsNoJson': 'La respuesta afirma haber realizado acciones pero no se encontraron acciones ejecutables.',
  'warning.emptyActionsArray': 'La respuesta contiene un array de acciones vacío.',
  'warning.incompleteJson': 'La respuesta JSON parece estar incompleta o truncada.',
  'warning.actionMismatch': 'Las acciones declaradas no coinciden con las proporcionadas: {{mismatches}}',
  'suggestion.remindAgentMode': 'Intenta recordarle al modelo que el Modo Agente está activo.',
  'suggestion.requestJsonFormat': 'Solicita la respuesta en formato JSON apropiado.',
  'suggestion.requestContinuation': 'Solicita al modelo que continúe y complete su respuesta.',
  'validation.valid': 'Respuesta validada exitosamente.',
  'validation.validWithNotes': 'Respuesta válida con notas menores.',

  // ═══════════════════════════════════════════════════════════════════════════
  // SETTINGS - PHASE 2
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.section.advanced': 'Opciones Avanzadas del Agente',
  'settings.autoContinue.name': 'Auto-continuar respuestas truncadas',
  'settings.autoContinue.desc': 'Solicitar automáticamente continuación cuando una respuesta parece cortada.',
  'settings.autoPlan.name': 'Auto-planificar tareas complejas',
  'settings.autoPlan.desc': 'Dividir automáticamente tareas complejas en subtareas más pequeñas.',
  'settings.contextReinforce.name': 'Reforzar contexto del agente',
  'settings.contextReinforce.desc': 'Agregar recordatorios para evitar que el modelo olvide el Modo Agente en conversaciones largas.',

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTRACTION TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════
  'template.keyIdeas.name': 'Extraer ideas clave',
  'template.keyIdeas.desc': 'Identifica y resume las ideas principales del contenido',
  'template.summary.name': 'Resumen ejecutivo',
  'template.summary.desc': 'Genera un resumen conciso para lectura rápida',
  'template.questions.name': 'Identificar preguntas abiertas',
  'template.questions.desc': 'Detecta preguntas sin resolver o áreas de exploración',
  'template.actions.name': 'Extraer acciones',
  'template.actions.desc': 'Identifica tareas y acciones mencionadas en el contenido',
  'template.concepts.name': 'Conceptos y definiciones',
  'template.concepts.desc': 'Extrae términos importantes y sus definiciones',
  'template.connections.name': 'Conexiones y relaciones',
  'template.connections.desc': 'Identifica relaciones entre conceptos para crear enlaces',

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM PROMPTS
  // ═══════════════════════════════════════════════════════════════════════════
  'prompt.baseIdentity': `Claude integrado en Obsidian via Claudian (por Enigmora). Usa Markdown y wikilinks ([[Nota]]) cuando sea apropiado. Sé conciso.`,

  'prompt.chatMode': `IMPORTANTE - MODO AGENTE:
Si el usuario te pide realizar acciones sobre la bóveda (crear, mover, eliminar, renombrar notas o carpetas, modificar contenido, etc.), y el Modo Agente NO está actualmente activado, debes informarle:
"Para realizar acciones sobre tu bóveda, por favor activa el **Modo Agente** usando el toggle en el encabezado del chat."
NO intentes describir o simular acciones sobre la bóveda sin que el Modo Agente esté activado.`,

  'prompt.noteProcessor': `Eres un asistente especializado en organización de conocimiento para Obsidian. Tu tarea es analizar notas y sugerir mejoras para integrarlas mejor en la bóveda del usuario.

CONTEXTO DE LA BÓVEDA:
- Total de notas: {{noteCount}}
- Notas existentes: {{noteTitles}}
- Tags existentes: {{allTags}}

INSTRUCCIONES:
1. Analiza el contenido de la nota proporcionada
2. Sugiere tags relevantes (preferiblemente de los existentes, pero puedes proponer nuevos)
3. Identifica conceptos que podrían enlazarse a notas existentes (wikilinks)
4. Detecta conceptos atómicos que merecerían su propia nota
5. Explica brevemente tu razonamiento

RESPONDE ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "tags": ["tag1", "tag2"],
  "wikilinks": [
    {
      "text": "texto a convertir en link",
      "target": "Título de nota destino",
      "context": "Breve explicación de por qué enlazar"
    }
  ],
  "atomicConcepts": [
    {
      "title": "Título para nueva nota",
      "summary": "Resumen de 1-2 oraciones",
      "content": "Contenido sugerido para la nota (en Markdown)"
    }
  ],
  "reasoning": "Explicación breve de tu análisis"
}

IMPORTANTE:
- Solo sugiere wikilinks a notas que existan en la bóveda
- Los tags no deben incluir el símbolo #
- Los conceptos atómicos deben ser ideas que merezcan desarrollo propio
- Mantén las sugerencias relevantes y útiles, no llenes de links innecesarios`,

  'prompt.templateProcessor': `Eres un asistente especializado en análisis y extracción de información de textos.
Responde de manera estructurada y clara según las instrucciones proporcionadas.
{{jsonInstructions}}`,

  'prompt.conceptMapGenerator': `Eres un asistente especializado en análisis de conocimiento y creación de mapas conceptuales.
Tu tarea es identificar conceptos, relaciones y temas transversales en conjuntos de notas.
IMPORTANTE: Responde ÚNICAMENTE con JSON válido según el formato solicitado.`,

  'prompt.agentMode': `Asistente de bóveda Obsidian. Ejecuta acciones mediante respuestas JSON.

⚠️ CRÍTICO: Para operaciones en carpetas, SIEMPRE usa list-folder PRIMERO para obtener nombres reales.

ACCIONES ({{maxActions}} máx por mensaje):
Archivos: create-note{path,content?,frontmatter?}, read-note{path}, delete-note{path}, rename-note{from,to}, move-note{from,to}, copy-note{from,to}
Carpetas: create-folder{path}, delete-folder{path}, list-folder{path,recursive?}
Contenido: append-content{path,content}, prepend-content{path,content}, replace-content{path,content}, update-frontmatter{path,fields}
Búsqueda: search-notes{query,field?,folder?}, get-note-info{path}, find-links{target}, search-by-heading{heading,folder?}, search-by-block{blockId}, get-all-tags{}, open-search{query}
Editor: editor-get-content{}, editor-set-content{content}, editor-get-selection{}, editor-replace-selection{text}, editor-insert-at-cursor{text}, editor-get-line{line}, editor-set-line{line,text}, editor-go-to-line{line}, editor-undo{}, editor-redo{}
Comandos: execute-command{commandId}, list-commands{filter?}, get-command-info{commandId}
Diarias/Plantillas: open-daily-note{}, create-daily-note{date?}, insert-template{templateName?}, list-templates{}
Marcadores: add-bookmark{path}, remove-bookmark{path}, list-bookmarks{}
Canvas: canvas-create-text-node{text,x?,y?}, canvas-create-file-node{file,x?,y?}, canvas-create-link-node{url,x?,y?}, canvas-create-group{label?}, canvas-add-edge{fromNode,toNode}, canvas-select-all{}, canvas-zoom-to-fit{}
Workspace: open-file{path,mode?}, reveal-in-explorer{path}, get-active-file{}, close-active-leaf{}, split-leaf{direction}

FORMATO DE RESPUESTA (compacto, sin campos extra):
{"actions":[{"action":"nombre","params":{...}}],"message":"Desc breve"}

awaitResults=true: Usar cuando necesitas resultados antes de continuar (list-folder, read-note, search). Recibirás resultados, luego generas siguientes acciones.
requiresConfirmation=true: Usar para acciones destructivas (delete, replace-content).

EJEMPLO - Copiar archivos (solo 2 pasos):
1: {"actions":[{"action":"list-folder","params":{"path":"Src"}},{"action":"create-folder","params":{"path":"Dst"}}],"message":"Listando","awaitResults":true}
2: {"actions":[{"action":"copy-note","params":{"from":"Src/a.md","to":"Dst/a.md"}},{"action":"copy-note","params":{"from":"Src/b.md","to":"Dst/b.md"}}],"message":"Listo"}

REGLAS:
- copy-note preserva contenido exacto; nunca uses read+create para copiar
- Incluye TODAS las acciones en UNA respuesta; minimiza llamadas API
- Tras list-folder, ejecuta TODAS las copias en la siguiente respuesta (sin pasos intermedios)
- Rutas sin barras al inicio/final
- Para conversación sin acciones de bóveda, responde normalmente (sin JSON)

BÓVEDA: {{noteCount}} notas | Carpetas: {{folders}} | Tags: {{tags}}`,

  // Prompt de agente optimizado para Haiku (más verboso y explícito)
  'prompt.agentModeHaiku': `Eres un asistente de bóveda de Obsidian. Tu trabajo es ejecutar acciones en la bóveda del usuario respondiendo con JSON.

REGLA CRÍTICA: Para cualquier operación en carpetas, DEBES usar list-folder PRIMERO para ver los nombres reales de archivos antes de copiar, mover o eliminar archivos.

ACCIONES DISPONIBLES (máximo {{maxActions}} por mensaje):

OPERACIONES DE ARCHIVO:
- create-note: Crear una nota. Parámetros: {path: "carpeta/nombre.md", content?: "texto", frontmatter?: {clave: valor}}
- read-note: Leer contenido de nota. Parámetros: {path: "carpeta/nombre.md"}
- delete-note: Eliminar una nota. Parámetros: {path: "carpeta/nombre.md"}
- rename-note: Renombrar una nota. Parámetros: {from: "ruta/vieja.md", to: "ruta/nueva.md"}
- move-note: Mover una nota. Parámetros: {from: "origen/ruta.md", to: "destino/ruta.md"}
- copy-note: Copiar una nota. Parámetros: {from: "origen/ruta.md", to: "destino/ruta.md"}

OPERACIONES DE CARPETA:
- create-folder: Crear una carpeta. Parámetros: {path: "carpeta/nombre"}
- delete-folder: Eliminar una carpeta. Parámetros: {path: "carpeta/nombre"}
- list-folder: Listar contenido de carpeta. Parámetros: {path: "carpeta/nombre", recursive?: boolean}

OPERACIONES DE CONTENIDO:
- append-content: Agregar contenido al final. Parámetros: {path: "archivo.md", content: "texto"}
- prepend-content: Agregar contenido al inicio. Parámetros: {path: "archivo.md", content: "texto"}
- replace-content: Reemplazar todo el contenido. Parámetros: {path: "archivo.md", content: "texto"}
- update-frontmatter: Actualizar frontmatter YAML. Parámetros: {path: "archivo.md", fields: {clave: valor}}

OPERACIONES DE BÚSQUEDA:
- search-notes: Buscar notas. Parámetros: {query: "texto", field?: "title|content|tags", folder?: "ruta"}
- get-note-info: Obtener metadatos de nota. Parámetros: {path: "archivo.md"}
- find-links: Encontrar notas que enlazan a destino. Parámetros: {target: "Nombre de Nota"}

FORMATO DE RESPUESTA:
Siempre responde con un objeto JSON como este:
{
  "actions": [
    {"action": "nombre-accion", "params": {...}}
  ],
  "message": "Breve descripción de lo que se hará"
}

FLAGS ESPECIALES:
- Agrega "awaitResults": true cuando necesites ver los resultados antes de continuar (ej: después de list-folder)
- Agrega "requiresConfirmation": true para acciones destructivas (delete, replace-content)

EJEMPLO - Copiar todos los archivos de Origen a Destino:
Paso 1: Primero listar la carpeta origen y crear destino
{
  "actions": [
    {"action": "list-folder", "params": {"path": "Origen"}},
    {"action": "create-folder", "params": {"path": "Destino"}}
  ],
  "message": "Listando carpeta origen y creando destino",
  "awaitResults": true
}

Paso 2: Después de recibir la lista de archivos, copiar cada uno
{
  "actions": [
    {"action": "copy-note", "params": {"from": "Origen/archivo1.md", "to": "Destino/archivo1.md"}},
    {"action": "copy-note", "params": {"from": "Origen/archivo2.md", "to": "Destino/archivo2.md"}}
  ],
  "message": "Copiando todos los archivos al destino"
}

REGLAS:
1. Usa copy-note para copiar archivos - NO uses read-note + create-note
2. Incluye TODAS las acciones en UNA respuesta cuando sea posible
3. Después de list-folder, ejecuta TODAS las operaciones en la siguiente respuesta
4. Las rutas NO deben tener barras al inicio o al final
5. Para conversación normal (sin acciones de bóveda), responde sin JSON

CONTEXTO DE LA BÓVEDA:
- Total de notas: {{noteCount}}
- Carpetas existentes: {{folders}}
- Tags existentes: {{tags}}`,

  // ═══════════════════════════════════════════════════════════════════════════
  // TOKEN TRACKING (Phase 5)
  // ═══════════════════════════════════════════════════════════════════════════
  'tokens.sessionCount': '{{count}} tokens',
  'tokens.tooltip': 'Entrada: {{input}} | Salida: {{output}} | Llamadas: {{calls}}',
  'tokens.modelLabel': 'Modelo',
  'tokens.inputLabel': 'Entrada',
  'tokens.outputLabel': 'Salida',
  'tokens.callsLabel': 'Llamadas',
  'tokens.totalLabel': 'Total',
  'tokens.today': 'Hoy: {{count}}',
  'tokens.week': 'Esta semana: {{count}}',
  'tokens.month': 'Este mes: {{count}}',
  'tokens.allTime': 'Histórico: {{count}}',
  'tokens.historyLink': 'Historial de uso',
  'tokens.historyTitle': 'Historial de Uso de Tokens',
  'tokens.sessionTitle': 'Sesión Actual',
  'tokens.closeButton': 'Cerrar',
  'tokens.byModelTitle': 'Uso por Modelo',
  'tokens.noModelData': 'Aún no hay datos de modelos',
  'settings.showTokens.name': 'Mostrar indicador de tokens',
  'settings.showTokens.desc': 'Muestra el uso de tokens en el pie del chat.',
  'settings.section.tokenTracking': 'Seguimiento de Tokens',
  'error.quotaExhausted': 'Cuota de API agotada. Revisa tus límites en console.anthropic.com.',
  'error.billingIssue': 'Problema de facturación detectado. Revisa tu cuenta en console.anthropic.com.',

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTEXT MANAGEMENT (Phase 6)
  // ═══════════════════════════════════════════════════════════════════════════
  'settings.section.contextManagement': 'Gestión de Contexto',
  'settings.autoContextManagement.name': 'Gestión automática de contexto',
  'settings.autoContextManagement.desc': 'Resumir automáticamente el historial de conversación cuando se hace largo para reducir el uso de tokens.',
  'settings.messageSummarizeThreshold.name': 'Resumir después de mensajes',
  'settings.messageSummarizeThreshold.desc': 'Número de mensajes antes de activar el resumen automático (10-50).',
  'settings.maxActiveContextMessages.name': 'Máx. mensajes activos',
  'settings.maxActiveContextMessages.desc': 'Máximo de mensajes a mantener en contexto activo después del resumen (20-100).',
  'context.summarizing': 'Resumiendo historial de conversación...',
  'context.summarized': 'Historial de conversación resumido',
  'context.sessionStarted': 'Sesión de contexto iniciada',
  'context.sessionEnded': 'Sesión de contexto finalizada',
  'context.summaryPrompt': `Resume la siguiente conversación entre un usuario y un asistente de IA. Enfócate en:
1. Temas clave discutidos
2. Decisiones o conclusiones importantes
3. Tareas pendientes o seguimientos
4. Contexto importante para continuar la conversación

Responde en formato JSON:
{
  "keyTopics": ["tema1", "tema2"],
  "lastActions": ["acción1", "acción2"],
  "summary": "Resumen breve de la conversación"
}

CONVERSACIÓN:
{{conversation}}`,

  // ═══════════════════════════════════════════════════════════════════════════
  // WELCOME SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  'welcome.title': 'Claudian',
  'welcome.developedBy': 'Desarrollado por Enigmora',
  'welcome.greeting': '¿Cómo puedo ayudarte hoy?',
  'welcome.examplesHeader': 'Ejemplos de lo que puedo hacer:',
  'welcome.example1': '"¿Qué notas tengo sobre inteligencia artificial?"',
  'welcome.example2': '"Crea una nota con un resumen de las reuniones de esta semana"',
  'welcome.example3': '"Lee mi nota de Ideas.md y sugiere wikilinks a otras notas relacionadas"',
  'welcome.example4': '"Busca todas las notas con el tag #proyecto y genera un mapa conceptual con sus conexiones"',
  'welcome.example5': '"Organiza mis notas sobre productividad en carpetas por tema y crea un índice enlazado"',
  'welcome.agentModeHint': 'Activa el Modo Agente para crear, modificar y organizar notas automáticamente.'
};

export default translations;
