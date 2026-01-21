<p align="center">
  <img src="logo-2.svg" alt="Claudian by Enigmora SC" width="400">
</p>

<p align="center">
  <strong>The ultimate Claude AI integration for Obsidian</strong><br>
  <em>Powered by Claude</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Obsidian-Plugin-7C3AED?style=for-the-badge&logo=obsidian&logoColor=white" alt="Obsidian Plugin">
  <img src="https://img.shields.io/badge/Claude-AI-FF6B35?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude AI">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
</p>

---

## Características

| Característica | Descripción |
|----------------|-------------|
| **Chat integrado** | Panel lateral para conversar con Claude sin salir de Obsidian |
| **Streaming en tiempo real** | Las respuestas se muestran mientras se generan |
| **Procesamiento de notas** | Analiza notas activas y sugiere tags, wikilinks y conceptos atómicos |
| **Generación de notas** | Convierte respuestas del chat en notas Markdown estructuradas |
| **Modo Agente** | Gestiona tu bóveda con lenguaje natural |
| **Contexto de bóveda** | Indexa títulos y tags existentes para sugerencias inteligentes |
| **Formato nativo** | Notas con YAML frontmatter, wikilinks y tags |
| **Privacidad** | Tu API key se almacena localmente, nunca en servidores externos |
| **Open Source** | Código 100% auditable |

---

## Instalación

### Instalación manual

1. Descarga `main.js`, `manifest.json` y `styles.css` de la última release
2. Crea la carpeta `.obsidian/plugins/claudian/` en tu bóveda
3. Copia los archivos descargados a esa carpeta
4. Reinicia Obsidian o recarga (`Ctrl/Cmd + R`)
5. Ve a **Settings > Community Plugins** y activa "Claudian"

---

## Configuración

1. Obtén tu API key en [console.anthropic.com](https://console.anthropic.com/)
2. Abre **Settings > Claudian**
3. Ingresa tu API key
4. Selecciona el modelo preferido (Claude Sonnet 4 por defecto)
5. Ajusta las opciones de contexto según el tamaño de tu bóveda

### Opciones disponibles

| Opción | Descripción | Valor por defecto |
|--------|-------------|-------------------|
| API Key | Tu clave de API de Anthropic | - |
| Modelo | Modelo de Claude a utilizar | Claude Sonnet 4 |
| Carpeta de notas | Destino para notas generadas | `Claude Notes` |
| Máx. tokens | Límite de tokens en respuestas | 4096 |
| Notas en contexto | Títulos a incluir al procesar | 100 |
| Tags en contexto | Tags a incluir al procesar | 50 |

---

## Uso

### Chat con Claude

1. Abre el panel con el comando **"Abrir chat con Claude"** o desde el ribbon
2. Escribe tu mensaje y presiona `Enter`
3. Las respuestas aparecerán en tiempo real con streaming

### Crear notas desde el chat

1. Haz clic en **"Crear nota"** en cualquier respuesta de Claude
2. Edita el título y tags sugeridos
3. La nota se guardará con formato estructurado

### Procesar nota activa

1. Abre una nota en tu bóveda
2. Ejecuta el comando **"Procesar nota activa con Claude"** (`Ctrl/Cmd + P`)
3. Claude analizará la nota considerando el contexto de tu bóveda
4. Aparecerá un modal interactivo con:
   - **Tags sugeridos** — Chips seleccionables para aplicar al frontmatter
   - **Wikilinks sugeridos** — Enlaces a notas existentes o nuevas
   - **Conceptos atómicos** — Ideas que merecen su propia nota

### Procesamiento batch

1. Ejecuta el comando **"Procesamiento batch de notas"** (`Ctrl/Cmd + P`)
2. Selecciona las notas a procesar (por carpeta o individualmente)
3. Elige un template de extracción:
   - **Extraer ideas clave** — Resume las ideas principales
   - **Resumen ejecutivo** — Genera resumen conciso
   - **Identificar preguntas** — Detecta temas abiertos
   - **Extraer acciones** — Lista tareas y TODOs
   - **Conceptos y definiciones** — Crea glosario
   - **Conexiones** — Identifica relaciones
4. Los resultados se guardan en una nota consolidada

### Generar mapa de conceptos

1. Ejecuta el comando **"Generar mapa de conceptos"** (`Ctrl/Cmd + P`)
2. Selecciona las notas a analizar
3. Ingresa un título para el mapa
4. Claude analizará las notas y generará:
   - Conceptos principales y secundarios
   - Relaciones entre conceptos
   - Temas transversales
   - Grafo visual en formato Mermaid

### Modo Agente (gestión de bóveda)

1. Activa el **modo agente** con el toggle en el header del chat
2. Usa lenguaje natural para gestionar tu bóveda:
   - *"Crea una carpeta Proyectos/2025 con subcarpetas para Docs y Código"*
   - *"Mueve todas las notas sobre Python a Programación/"*
   - *"Crea una nota con ideas para el proyecto X"*
   - *"Elimina las notas vacías en Borradores/"*
3. Claude interpretará tu solicitud y ejecutará las acciones
4. Las acciones destructivas requieren confirmación

**Acciones disponibles:**
- Crear, mover, renombrar y eliminar notas y carpetas
- Leer y modificar contenido de notas
- Buscar notas por título, contenido o tags
- Actualizar frontmatter (YAML)

---

## Formato de notas generadas

```markdown
---
created: 2025-01-20
tags: [tag1, tag2]
source: claudian
status: draft
---

# Título de la nota

Contenido de la respuesta...

## Enlaces relacionados

- [[Nota relacionada 1]]
- [[Nota relacionada 2]]
```

---

## Desarrollo

```bash
# Clonar repositorio
git clone https://github.com/Enigmora/claudian.git
cd claudian

# Instalar dependencias
npm install

# Build de desarrollo (con sourcemaps)
npm run dev

# Build de producción (minificado)
npm run build

# Compilar y desplegar a bóveda
./deploy.sh . /ruta/a/boveda/.obsidian/plugins/claudian/
```

### Estructura del proyecto

```
src/
├── main.ts                  # Entry point, comandos y vistas
├── settings.ts              # Configuración del plugin
├── claude-client.ts         # Cliente Anthropic SDK con streaming
├── chat-view.ts             # Panel lateral de chat
├── note-creator.ts          # Modal para crear notas desde chat
├── note-processor.ts        # Procesamiento de notas existentes
├── vault-indexer.ts         # Indexación de bóveda
├── suggestions-modal.ts     # Modal de sugerencias interactivo
├── extraction-templates.ts  # Templates de extracción predefinidos
├── batch-processor.ts       # Procesamiento batch de notas
├── batch-modal.ts           # Modal de selección para batch
├── concept-map-generator.ts # Generador de mapas de conceptos
├── vault-actions.ts         # Ejecutor de acciones sobre bóveda
├── agent-mode.ts            # Gestión del modo agente
├── confirmation-modal.ts    # Modal de confirmación de acciones
└── templates/
    └── default.ts           # Template de notas
```

---

## Stack técnico

- **TypeScript** — Tipado estático
- **Obsidian API** — Integración nativa
- **Anthropic SDK** — Comunicación con Claude
- **esbuild** — Bundling ultrarrápido

---

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE).

---

<p align="center">
  <img src="logo.svg" alt="Claudian" width="80">
</p>

<p align="center">
  <strong>Claudian</strong><br>
  <em>The ultimate Claude AI integration for Obsidian</em>
</p>

<p align="center">
  Desarrollado por <a href="https://github.com/Enigmora">Enigmora SC</a>
</p>

<p align="center">
  <sub>Powered by Claude</sub>
</p>
