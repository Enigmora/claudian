<p align="center">
  <img src="https://img.shields.io/badge/Obsidian-Plugin-7C3AED?style=for-the-badge&logo=obsidian&logoColor=white" alt="Obsidian Plugin">
  <img src="https://img.shields.io/badge/Claude-AI-FF6B35?style=for-the-badge&logo=anthropic&logoColor=white" alt="Claude AI">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
</p>

# Claude Companion

> Plugin de Obsidian para chatear con Claude AI y generar notas estructuradas con wikilinks, tags y YAML frontmatter directamente en tu bóveda.

---

## Características

| Característica | Descripción |
|----------------|-------------|
| **Chat integrado** | Panel lateral para conversar con Claude sin salir de Obsidian |
| **Streaming en tiempo real** | Las respuestas se muestran mientras se generan |
| **Procesamiento de notas** | Analiza notas activas y sugiere tags, wikilinks y conceptos atómicos |
| **Generación de notas** | Convierte respuestas del chat en notas Markdown estructuradas |
| **Contexto de bóveda** | Indexa títulos y tags existentes para sugerencias inteligentes |
| **Formato nativo** | Notas con YAML frontmatter, wikilinks y tags |
| **Privacidad** | Tu API key se almacena localmente, nunca en servidores externos |
| **Open Source** | Código 100% auditable |

---

## Instalación

### Instalación manual

1. Descarga `main.js`, `manifest.json` y `styles.css` de la última release
2. Crea la carpeta `.obsidian/plugins/obsidian-claude-companion/` en tu bóveda
3. Copia los archivos descargados a esa carpeta
4. Reinicia Obsidian o recarga (`Ctrl/Cmd + R`)
5. Ve a **Settings > Community Plugins** y activa "Claude Companion"

---

## Configuración

1. Obtén tu API key en [console.anthropic.com](https://console.anthropic.com/)
2. Abre **Settings > Claude Companion**
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

---

## Formato de notas generadas

```markdown
---
created: 2025-01-20
tags: [tag1, tag2]
source: claude-chat
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
git clone https://github.com/Enigmora/obsidian-plugin.git
cd obsidian-plugin

# Instalar dependencias
npm install

# Build de desarrollo (con sourcemaps)
npm run dev

# Build de producción (minificado)
npm run build
```

### Estructura del proyecto

```
src/
├── main.ts              # Entry point, comandos y vistas
├── settings.ts          # Configuración del plugin
├── claude-client.ts     # Cliente Anthropic SDK con streaming
├── chat-view.ts         # Panel lateral de chat
├── note-creator.ts      # Modal para crear notas desde chat
├── note-processor.ts    # Procesamiento de notas existentes
├── vault-indexer.ts     # Indexación de bóveda
├── suggestions-modal.ts # Modal de sugerencias interactivo
└── templates/
    └── default.ts       # Template de notas
```

---

## Roadmap

### Fase 1: MVP
- [x] Panel de chat lateral
- [x] Streaming de respuestas
- [x] Configuración de API key y modelo
- [x] Generación de notas desde chat

### Fase 2: Integración con bóveda
- [x] Comando para procesar nota activa
- [x] Sugerencias de tags y wikilinks basadas en contenido existente
- [x] Indexación de títulos de notas para contexto
- [x] Modal interactivo para aplicar sugerencias
- [x] Creación de notas atómicas desde sugerencias

### Fase 3: Automatización
- [ ] Templates de extracción personalizados
- [ ] Procesamiento batch de múltiples notas
- [ ] Generación de mapas de conceptos

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

## Autor

<p align="center">
  <strong>José Villaseñor Montfort</strong><br>
  Diseño, arquitectura y desarrollo
</p>

<p align="center">
  <a href="https://github.com/Enigmora">Enigmora SC</a>
</p>

<p align="center">
  <sub>Copyright © 2025 José Villaseñor Montfort. Todos los derechos reservados.</sub>
</p>
