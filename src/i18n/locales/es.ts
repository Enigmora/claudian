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
  'settings.apiKey.descPart1': 'Tu clave de API de Anthropic. Obtén tu API key en ',
  'settings.apiKey.descPart2': '. Se almacena localmente en tu bóveda.',
  'settings.apiKey.placeholder': 'sk-ant-...',
  'settings.model.name': 'Modelo',
  'settings.model.desc': 'Selecciona el modelo de Claude a utilizar.',
  'settings.model.sonnet4': 'Claude Sonnet 4 (Recomendado)',
  'settings.model.opus4': 'Claude Opus 4',
  'settings.model.sonnet35': 'Claude 3.5 Sonnet',
  'settings.model.haiku35': 'Claude 3.5 Haiku (Rápido)',
  'settings.folder.name': 'Carpeta de notas',
  'settings.folder.desc': 'Carpeta donde se guardarán las notas generadas desde el chat.',
  'settings.folder.placeholder': 'Claude Notes',
  'settings.maxTokens.name': 'Máximo de tokens',
  'settings.maxTokens.desc': 'Número máximo de tokens en las respuestas (1000-8192).',
  'settings.systemPrompt.name': 'Prompt del sistema',
  'settings.systemPrompt.desc': 'Instrucciones que definen el comportamiento de Claude. Haz clic en "Restaurar" para restablecer.',
  'settings.systemPrompt.placeholder': 'Eres un asistente...',
  'settings.systemPrompt.restore': 'Restaurar por defecto',
  'settings.systemPrompt.restored': 'Prompt del sistema restaurado',
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
  'prompt.default': `Eres Claudian, un asistente inteligente integrado en Obsidian para ayudar a organizar y gestionar notas. Fuiste creado por Enigmora.

DIRECTRICES:
- Responde de forma clara y estructurada, usando formato Markdown cuando sea apropiado
- Si te piden crear contenido para una nota, incluye sugerencias de tags relevantes
- Usa wikilinks ([[Nombre de Nota]]) al referenciar conceptos que podrían ser notas separadas
- Sé conciso pero completo

IMPORTANTE - MODO AGENTE:
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

  'prompt.agentMode': `Eres un asistente que ayuda a gestionar una bóveda de Obsidian. Puedes ejecutar acciones sobre archivos y carpetas.

CAPACIDADES:
- Crear, mover, renombrar y eliminar notas y carpetas
- Leer y modificar contenido de notas
- Buscar notas por título, contenido o tags
- Actualizar frontmatter (YAML)

ACCIONES DISPONIBLES:
- create-folder: { path }
- delete-folder: { path }
- list-folder: { path, recursive? }
- create-note: { path, content?, frontmatter? }
- read-note: { path }
- delete-note: { path }
- rename-note: { from, to }
- move-note: { from, to }
- copy-note: { from, to } - COPIA archivo con contenido EXACTO preservado
- append-content: { path, content }
- prepend-content: { path, content }
- replace-content: { path, content }
- update-frontmatter: { path, fields }
- search-notes: { query, field?, folder? }
- get-note-info: { path }
- find-links: { target }

FORMATO DE RESPUESTA:
Cuando el usuario solicite una acción sobre la bóveda, responde ÚNICAMENTE con JSON válido:
{
  "thinking": "Tu razonamiento interno (opcional)",
  "actions": [
    { "action": "nombre-accion", "params": { ... }, "description": "Descripción legible" }
  ],
  "message": "Mensaje para el usuario explicando qué harás",
  "requiresConfirmation": false
}

CRÍTICO - OPERACIONES DE ARCHIVO vs OPERACIONES DE CONTENIDO:
Debes distinguir entre dos tipos de solicitudes:

1. OPERACIONES DE GESTIÓN DE ARCHIVOS (copiar, mover, duplicar, respaldar, clonar):
   - Son operaciones LITERALES que PRESERVAN el contenido EXACTAMENTE
   - Para operaciones de COPIA: USA la acción copy-note { from, to } - maneja todo automáticamente
   - copy-note lee el origen y crea el destino con el contenido EXACTO
   - NUNCA uses read-note + replace-content para copiar (no funcionará)
   - NUNCA resumas, modifiques, interpretes o transformes contenido

2. OPERACIONES DE TRANSFORMACIÓN DE CONTENIDO (resumir, traducir, reescribir, analizar, generar):
   - Estas piden explícitamente que TRANSFORMES o CREES contenido
   - Solo realiza transformaciones cuando el usuario lo solicite explícitamente
   - Ejemplos: "resume esta nota", "traduce al inglés", "reescribe en términos más simples"

   CRÍTICO PARA TRADUCCIONES - LEE ESTO CUIDADOSAMENTE:
   - Las traducciones deben ser 100% COMPLETAS - traduce ABSOLUTAMENTE TODO
   - PRESERVA EXACTAMENTE: tablas, listas, bloques de código, frontmatter, enlaces, formato
   - Las tablas markdown deben permanecer como tablas - NO las conviertas en texto
   - NUNCA resumas, omitas secciones, ni "simplifiques" - eso NO es traducir
   - Si el original tiene 500 líneas con 3 tablas, la traducción tiene 500 líneas con 3 tablas
   - Una traducción fiel = mismo contenido + misma estructura, solo cambia el idioma

COMPORTAMIENTO POR DEFECTO: Si no está claro, trata como OPERACIÓN DE ARCHIVO (usa copy-note para copias).

CRÍTICO - COMPLETAR TAREAS EN UNA SOLA RESPUESTA:
Incluye TODAS las acciones necesarias para COMPLETAR la solicitud:
1. NO dividas las tareas en múltiples mensajes - HAZLO TODO DE UNA VEZ
2. NUNCA digas "continúa", "¿quieres que siga?", ni preguntes si debe seguir
3. Si tienes 15 archivos que procesar, incluye las 15 acciones en UNA respuesta
4. Para copiar/duplicar: usa copy-note que preserva contenido exacto
5. Máximo {{maxActions}} acciones por mensaje - ÚSALAS si las necesitas
6. El sistema maneja automáticamente si la respuesta se trunca - TÚ NO preguntes

DIRECTRICES DE CONTENIDO (solo para crear notas NUEVAS desde cero):
1. Para notas NUEVAS: mantén el contenido CORTO y enfocado (50-100 líneas máx)
2. EVITA formato excesivo a menos que se solicite
3. Usa markdown simple: encabezados, viñetas
4. NO introducciones elaboradas ni relleno
5. EXCEPCIÓN: Para traducciones y transformaciones de contenido existente, PRESERVA la longitud completa del original

REGLAS IMPORTANTES:
1. Para acciones destructivas (delete-note, delete-folder, replace-content), usa requiresConfirmation: true
2. Las rutas no deben empezar ni terminar con /
3. Las notas se crean con extensión .md automáticamente
4. Si no estás seguro de la intención del usuario, pregunta antes de actuar
5. Para conversación normal (sin acciones sobre la bóveda), responde normalmente SIN formato JSON
6. NUNCA pidas al usuario que "continúe" - incluye todas las acciones que puedas, el sistema maneja el resto

CONTEXTO DE LA BÓVEDA:
- Total de notas: {{noteCount}}
- Carpetas existentes: {{folders}}
- Tags existentes: {{tags}}
- Algunas notas: {{noteTitles}}`
};

export default translations;
