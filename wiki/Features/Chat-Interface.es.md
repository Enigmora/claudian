# Interfaz de Chat

La interfaz de chat es la característica principal de Claudian, proporcionando un panel dedicado para conversar con Claude directamente dentro de Obsidian.

---

## Abrir el Chat

Hay múltiples formas de abrir el panel de chat:

1. **Ícono de la Cinta**: Haz clic en el ícono de Claudian en la cinta izquierda
2. **Paleta de Comandos**: Presiona `Ctrl/Cmd + P` y busca "Abrir chat con Claude"
3. **Atajo de Teclado**: Asigna un atajo personalizado en los ajustes de Obsidian

![Interfaz de Chat](../images/chat-interface.png)

---

## Vista General de la Interfaz

El panel de chat consiste en:

| Elemento | Descripción |
|----------|-------------|
| **Encabezado** | Título con toggle de Modo Agente y botón de limpiar |
| **Área de Mensajes** | Historial de conversación con scroll |
| **Área de Entrada** | Entrada de texto redimensionable para tus mensajes |
| **Botón Enviar** | Envía el mensaje actual |

---

## Enviar Mensajes

### Uso Básico

1. Escribe tu mensaje en el área de entrada
2. Presiona `Enter` o haz clic en **Enviar**
3. La respuesta de Claude aparecerá con streaming en tiempo real

### Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Enter` | Enviar mensaje |
| `Shift + Enter` | Nueva línea (sin enviar) |

### Entrada Redimensionable

El área de entrada puede redimensionarse arrastrando su borde superior. Esto es útil para mensajes más largos o bloques de código.

---

## Streaming en Tiempo Real

Las respuestas aparecen carácter por carácter mientras Claude las genera. Esto proporciona:

- Retroalimentación inmediata de que tu mensaje fue recibido
- Capacidad de leer respuestas mientras se escriben
- Indicación visual de procesamiento en curso

---

## Acciones de Mensaje

Cada respuesta de Claude incluye botones de acción:

### Copiar Respuesta

Haz clic en el botón **Copiar** para copiar el texto de la respuesta al portapapeles.

### Crear Nota

Haz clic en **Crear nota** para guardar la respuesta como una nueva nota:

1. Aparece un modal con título y tags sugeridos
2. Edita el título si es necesario
3. Agrega o elimina tags sugeridos
4. Haz clic en **Crear** para guardar

![Modal de Creación de Nota](../images/note-creator-modal.png)

La nota se creará con:
- Frontmatter YAML (fecha de creación, tags, fuente)
- Contenido formateado de la respuesta
- Wikilinks relacionados (si se detectan)

---

## Historial del Chat

El historial de conversación persiste durante tu sesión. Los mensajes se muestran con:

- Tus mensajes alineados a la derecha con fondo distintivo
- Los mensajes de Claude alineados a la izquierda con formato markdown
- Marcas de tiempo para referencia

### Limpiar Historial

Haz clic en el ícono de papelera en el encabezado o usa el comando "Limpiar historial de chat" para empezar de nuevo.

**Nota:** El historial del chat no se persiste entre sesiones de Obsidian. Cerrar Obsidian limpiará la conversación.

---

## Renderizado Markdown

Las respuestas de Claude soportan markdown completo:

- **Encabezados** y formato de texto
- **Bloques de código** con resaltado de sintaxis
- **Listas** y tablas
- **Enlaces** e imágenes
- Expresiones matemáticas **LaTeX** (si está habilitado en Obsidian)

---

## Toggle de Modo Agente

El encabezado del chat incluye un toggle de Modo Agente. Cuando está activado:

- Claude puede ejecutar acciones en tu bóveda
- Un indicador muestra que el modo agente está activo
- Las acciones destructivas requieren confirmación

Consulta [Modo Agente](Agent-Mode.es) para documentación completa.

![Toggle de Modo Agente](../images/agent-mode-toggle.png)

---

## Contexto y Memoria

### Comportamiento Actual

- El chat mantiene contexto dentro de la sesión actual
- Claude recuerda mensajes anteriores en la conversación
- El contexto se limpia cuando limpias el chat o reinicias Obsidian

### Contexto de Bóveda

Para comandos de procesamiento de notas, Claude recibe:
- Títulos de notas de tu bóveda (límite configurable)
- Tags existentes (límite configurable)
- Esto ayuda con sugerencias de wikilinks y tags

---

## Consejos para Conversaciones Efectivas

1. **Sé específico**: Las preguntas claras obtienen mejores respuestas
2. **Proporciona contexto**: Referencia notas o temas que estás discutiendo
3. **Usa seguimientos**: Construye sobre respuestas anteriores
4. **Prueba diferentes prompts**: Si una respuesta no es útil, reformula tu pregunta

---

## Características Relacionadas

- [Modo Agente](Agent-Mode.es) - Gestión de bóveda a través del chat
- [Configuración](../Configuration.es) - Personalizar comportamiento del chat
