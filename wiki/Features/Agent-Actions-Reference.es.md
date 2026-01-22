# Referencia de Acciones del Agente

Referencia completa de todas las acciones disponibles en Modo Agente. Esta página documenta el conjunto completo de 52 acciones en 8 categorías.

---

## Categorías de Acciones

| Categoría | Cantidad | Descripción |
|-----------|----------|-------------|
| [Gestión de Archivos y Carpetas](#gestión-de-archivos-y-carpetas) | 16 | Operaciones principales de bóveda |
| [API del Editor](#api-del-editor) | 10 | Manipulación de texto en tiempo real |
| [API de Comandos](#api-de-comandos) | 3 | Ejecutar comandos de Obsidian |
| [Notas Diarias](#notas-diarias) | 2 | Gestión de notas diarias |
| [Plantillas](#plantillas) | 2 | Inserción de plantillas |
| [Marcadores](#marcadores) | 3 | Gestión de marcadores |
| [API de Canvas](#api-de-canvas) | 7 | Manipulación de canvas |
| [Búsqueda Avanzada](#búsqueda-avanzada) | 4 | Capacidades de búsqueda avanzada |
| [Espacio de Trabajo](#espacio-de-trabajo) | 5 | Navegación y control de vistas |

---

## Gestión de Archivos y Carpetas

### Operaciones de Carpetas

#### create-folder
Crea una nueva carpeta en la bóveda.

```json
{ "action": "create-folder", "params": { "path": "Proyectos/2024" } }
```

**Lenguaje natural:** "Crea una carpeta llamada Proyectos/2024"

#### delete-folder
Elimina una carpeta vacía.

```json
{ "action": "delete-folder", "params": { "path": "borradores-viejos" } }
```

**Lenguaje natural:** "Elimina la carpeta borradores-viejos"

#### list-folder
Lista el contenido de una carpeta.

```json
{ "action": "list-folder", "params": { "path": "Proyectos", "recursive": true } }
```

**Lenguaje natural:** "¿Qué hay en mi carpeta Proyectos?" o "Lista todos los archivos en Proyectos recursivamente"

### Operaciones de Notas

#### create-note
Crea una nueva nota con contenido y frontmatter opcionales.

```json
{
  "action": "create-note",
  "params": {
    "path": "Reuniones/standup",
    "content": "# Standup Diario\n\n- Progreso\n- Bloqueos",
    "frontmatter": { "tags": ["reunión", "diario"] }
  }
}
```

**Lenguaje natural:** "Crea una nota de reunión en la carpeta Reuniones"

#### read-note
Lee el contenido de una nota.

```json
{ "action": "read-note", "params": { "path": "tareas" } }
```

**Lenguaje natural:** "Muéstrame mi nota de tareas"

#### delete-note
Elimina una nota (requiere confirmación).

```json
{ "action": "delete-note", "params": { "path": "borradores/borrador-viejo" } }
```

**Lenguaje natural:** "Elimina borrador-viejo.md de borradores"

#### rename-note
Renombra una nota.

```json
{ "action": "rename-note", "params": { "from": "borrador", "to": "informe-final" } }
```

**Lenguaje natural:** "Renombra borrador a informe-final"

#### move-note
Mueve una nota a otra ubicación.

```json
{ "action": "move-note", "params": { "from": "inbox/nota", "to": "archivo/nota" } }
```

**Lenguaje natural:** "Mueve nota de inbox a archivo"

#### copy-note
Copia una nota preservando el contenido exacto.

```json
{ "action": "copy-note", "params": { "from": "plantilla", "to": "nuevo-proyecto" } }
```

**Lenguaje natural:** "Copia plantilla a nuevo-proyecto"

### Modificación de Contenido

#### append-content
Agrega contenido al final de una nota.

```json
{ "action": "append-content", "params": { "path": "log", "content": "\n## Nueva Entrada\nContenido aquí" } }
```

**Lenguaje natural:** "Agrega una nueva sección a mi log"

#### prepend-content
Agrega contenido al inicio de una nota (después del frontmatter).

```json
{ "action": "prepend-content", "params": { "path": "readme", "content": "**¡Actualizado!**\n\n" } }
```

**Lenguaje natural:** "Agrega un aviso de actualización al inicio de readme"

#### replace-content
Reemplaza todo el contenido de la nota (requiere confirmación).

```json
{ "action": "replace-content", "params": { "path": "borrador", "content": "Nuevo contenido" } }
```

**Lenguaje natural:** "Reemplaza el contenido de borrador con..."

#### update-frontmatter
Actualiza campos del frontmatter YAML.

```json
{ "action": "update-frontmatter", "params": { "path": "proyecto", "fields": { "estado": "activo", "prioridad": 1 } } }
```

**Lenguaje natural:** "Establece estado a activo en la nota proyecto"

### Búsqueda y Consulta

#### search-notes
Busca notas por título, contenido o tags.

```json
{ "action": "search-notes", "params": { "query": "javascript", "field": "content", "folder": "tutoriales" } }
```

**Lenguaje natural:** "Encuentra notas sobre javascript en tutoriales"

#### get-note-info
Obtiene metadatos sobre una nota.

```json
{ "action": "get-note-info", "params": { "path": "proyecto" } }
```

**Lenguaje natural:** "¿Qué tags tiene la nota proyecto?"

#### find-links
Encuentra notas que enlazan a un objetivo.

```json
{ "action": "find-links", "params": { "target": "Básicos de Python" } }
```

**Lenguaje natural:** "¿Qué notas enlazan a Básicos de Python?"

---

## API del Editor

Manipulación en tiempo real del editor activo.

> **Nota:** Estas acciones requieren un archivo markdown abierto en el editor.

#### editor-get-content
Obtiene el contenido completo del editor activo.

```json
{ "action": "editor-get-content", "params": {} }
```

**Lenguaje natural:** "Obtén el contenido actual del editor"

#### editor-set-content
Establece el contenido completo del editor activo (requiere confirmación).

```json
{ "action": "editor-set-content", "params": { "content": "# Nuevo Contenido\n\nTexto aquí" } }
```

**Lenguaje natural:** "Reemplaza el contenido del editor con..."

#### editor-get-selection
Obtiene el texto seleccionado actualmente.

```json
{ "action": "editor-get-selection", "params": {} }
```

**Lenguaje natural:** "¿Qué texto está seleccionado?"

#### editor-replace-selection
Reemplaza el texto seleccionado.

```json
{ "action": "editor-replace-selection", "params": { "text": "texto de reemplazo" } }
```

**Lenguaje natural:** "Reemplaza la selección con 'texto de reemplazo'"

#### editor-insert-at-cursor
Inserta texto en la posición actual del cursor.

```json
{ "action": "editor-insert-at-cursor", "params": { "text": "texto insertado" } }
```

**Lenguaje natural:** "Inserta 'hola' en el cursor"

#### editor-get-line
Obtiene una línea específica por número (indexado desde 0).

```json
{ "action": "editor-get-line", "params": { "line": 5 } }
```

**Lenguaje natural:** "Obtén la línea 5"

#### editor-set-line
Establece el contenido de una línea específica.

```json
{ "action": "editor-set-line", "params": { "line": 5, "text": "nuevo contenido de línea" } }
```

**Lenguaje natural:** "Establece la línea 5 a 'nuevo contenido de línea'"

#### editor-go-to-line
Navega a una línea específica.

```json
{ "action": "editor-go-to-line", "params": { "line": 10 } }
```

**Lenguaje natural:** "Ve a la línea 10"

#### editor-undo
Deshace el último cambio.

```json
{ "action": "editor-undo", "params": {} }
```

**Lenguaje natural:** "Deshacer"

#### editor-redo
Rehace el último cambio deshecho.

```json
{ "action": "editor-redo", "params": {} }
```

**Lenguaje natural:** "Rehacer"

---

## API de Comandos

Ejecuta cualquier comando de Obsidian programáticamente.

#### execute-command
Ejecuta un comando por su ID.

```json
{ "action": "execute-command", "params": { "commandId": "editor:toggle-bold" } }
```

**Lenguaje natural:** "Activar negrita" o "Ejecuta el comando toggle-bold"

#### list-commands
Lista los comandos disponibles con filtro opcional.

```json
{ "action": "list-commands", "params": { "filter": "editor" } }
```

**Lenguaje natural:** "Lista los comandos de editor"

#### get-command-info
Obtiene detalles sobre un comando específico.

```json
{ "action": "get-command-info", "params": { "commandId": "editor:toggle-bold" } }
```

**Lenguaje natural:** "¿Qué hace el comando toggle-bold?"

---

## Notas Diarias

Integración con el plugin de Notas Diarias incorporado.

> **Nota:** El plugin de Notas Diarias debe estar habilitado.

#### open-daily-note
Abre la nota diaria de hoy (la crea si no existe).

```json
{ "action": "open-daily-note", "params": {} }
```

**Lenguaje natural:** "Abre la nota diaria de hoy"

#### create-daily-note
Crea una nota diaria para una fecha específica.

```json
{ "action": "create-daily-note", "params": { "date": "2024-01-15" } }
```

**Lenguaje natural:** "Crea la nota diaria del 15 de enero de 2024"

---

## Plantillas

Integración con el plugin de Plantillas incorporado.

> **Nota:** El plugin de Plantillas debe estar habilitado.

#### insert-template
Inserta una plantilla en la posición del cursor.

```json
{ "action": "insert-template", "params": { "templateName": "reunión" } }
```

**Lenguaje natural:** "Inserta la plantilla de reunión"

Sin `templateName`, abre el selector de plantillas:
```json
{ "action": "insert-template", "params": {} }
```

**Lenguaje natural:** "Inserta una plantilla"

#### list-templates
Lista todas las plantillas disponibles.

```json
{ "action": "list-templates", "params": {} }
```

**Lenguaje natural:** "¿Qué plantillas tengo?"

---

## Marcadores

Integración con el plugin de Marcadores incorporado.

> **Nota:** El plugin de Marcadores debe estar habilitado.

#### add-bookmark
Agrega un marcador a una nota.

```json
{ "action": "add-bookmark", "params": { "path": "nota-importante" } }
```

**Lenguaje natural:** "Marca nota-importante"

#### remove-bookmark
Elimina un marcador.

```json
{ "action": "remove-bookmark", "params": { "path": "marcador-viejo" } }
```

**Lenguaje natural:** "Elimina el marcador de marcador-viejo"

#### list-bookmarks
Lista todos los marcadores.

```json
{ "action": "list-bookmarks", "params": {} }
```

**Lenguaje natural:** "Muestra mis marcadores"

---

## API de Canvas

Manipulación de archivos Canvas cuando hay un canvas activo.

> **Nota:** Estas acciones requieren un archivo canvas abierto.

#### canvas-create-text-node
Crea un nodo de texto en el canvas.

```json
{ "action": "canvas-create-text-node", "params": { "text": "Mi idea", "x": 100, "y": 200 } }
```

**Lenguaje natural:** "Agrega una tarjeta de texto diciendo 'Mi idea'"

#### canvas-create-file-node
Crea un nodo enlazado a un archivo.

```json
{ "action": "canvas-create-file-node", "params": { "file": "notas/referencia", "x": 300, "y": 200 } }
```

**Lenguaje natural:** "Agrega mi nota de referencia al canvas"

#### canvas-create-link-node
Crea un nodo con un enlace web.

```json
{ "action": "canvas-create-link-node", "params": { "url": "https://obsidian.md", "x": 500, "y": 200 } }
```

**Lenguaje natural:** "Agrega un enlace a obsidian.md en el canvas"

#### canvas-create-group
Crea un grupo en el canvas.

```json
{ "action": "canvas-create-group", "params": { "label": "Ideas" } }
```

**Lenguaje natural:** "Crea un grupo llamado 'Ideas'"

#### canvas-add-edge
Agrega una conexión entre dos nodos.

```json
{ "action": "canvas-add-edge", "params": { "fromNode": "id-nodo1", "toNode": "id-nodo2" } }
```

**Lenguaje natural:** "Conecta nodo1 con nodo2"

#### canvas-select-all
Selecciona todos los nodos del canvas.

```json
{ "action": "canvas-select-all", "params": {} }
```

**Lenguaje natural:** "Selecciona todos los nodos"

#### canvas-zoom-to-fit
Ajusta el zoom para ver todo el contenido.

```json
{ "action": "canvas-zoom-to-fit", "params": {} }
```

**Lenguaje natural:** "Ajustar zoom"

---

## Búsqueda Avanzada

Capacidades de búsqueda avanzada más allá de la búsqueda básica de notas.

#### search-by-heading
Encuentra notas que contienen un encabezado específico.

```json
{ "action": "search-by-heading", "params": { "heading": "Introducción", "folder": "docs" } }
```

**Lenguaje natural:** "Encuentra notas con encabezado 'Introducción' en docs"

#### search-by-block
Encuentra la nota que contiene un ID de bloque.

```json
{ "action": "search-by-block", "params": { "blockId": "abc123" } }
```

**Lenguaje natural:** "Encuentra la nota con el bloque ^abc123"

#### get-all-tags
Obtiene todos los tags usados en la bóveda.

```json
{ "action": "get-all-tags", "params": {} }
```

**Lenguaje natural:** "¿Qué tags existen en mi bóveda?"

#### open-search
Abre la interfaz de búsqueda global con una consulta.

```json
{ "action": "open-search", "params": { "query": "tag:#importante" } }
```

**Lenguaje natural:** "Busca notas con tag importante"

---

## Espacio de Trabajo

Navegación y control de vistas.

#### open-file
Abre un archivo en el editor.

```json
{ "action": "open-file", "params": { "path": "readme", "mode": "preview" } }
```

**Lenguaje natural:** "Abre readme en modo vista previa"

#### reveal-in-explorer
Muestra un archivo en el explorador de archivos.

```json
{ "action": "reveal-in-explorer", "params": { "path": "oculto/nota" } }
```

**Lenguaje natural:** "Muestra oculto/nota en el explorador de archivos"

#### get-active-file
Obtiene información sobre el archivo activo actualmente.

```json
{ "action": "get-active-file", "params": {} }
```

**Lenguaje natural:** "¿Qué archivo estoy editando?"

#### close-active-leaf
Cierra la pestaña actual.

```json
{ "action": "close-active-leaf", "params": {} }
```

**Lenguaje natural:** "Cierra esta pestaña"

#### split-leaf
Divide la vista actual.

```json
{ "action": "split-leaf", "params": { "direction": "vertical" } }
```

**Lenguaje natural:** "Divide la vista verticalmente"

---

## Formato de Respuesta de Acciones

Todas las acciones devuelven resultados estructurados:

```json
{
  "actions": [
    { "action": "create-note", "params": { "path": "nueva-nota" } }
  ],
  "message": "Creada nueva-nota.md",
  "requiresConfirmation": false
}
```

### Confirmación Requerida

Las acciones destructivas requieren confirmación:
- `delete-note`
- `delete-folder`
- `replace-content`
- `editor-set-content`

---

## Páginas Relacionadas

- [Modo Agente](Agent-Mode.es) - Descripción general y uso
- [Configuración](../Configuration.es) - Ajustes del agente
- [Solución de Problemas](../Troubleshooting.es) - Problemas comunes
