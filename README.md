# Claude Companion

Plugin de Obsidian para chatear con Claude AI y generar notas estructuradas con wikilinks, tags y YAML frontmatter directamente en tu bóveda.

## Características

- **Chat integrado** - Panel lateral para conversar con Claude sin salir de Obsidian
- **Streaming en tiempo real** - Las respuestas se muestran mientras se generan
- **Generación de notas** - Convierte respuestas del chat en notas Markdown estructuradas
- **Formato Obsidian nativo** - Notas con YAML frontmatter, wikilinks y tags
- **Privacidad** - Tu API key se almacena localmente, nunca en código ni servidores externos
- **Código auditable** - 100% open source para que puedas revisar cada línea

## Instalación

### Instalación manual

1. Descarga los archivos `main.js`, `manifest.json` y `styles.css` de la última release
2. Crea la carpeta `.obsidian/plugins/obsidian-claude-companion/` en tu bóveda
3. Copia los archivos descargados a esa carpeta
4. Reinicia Obsidian o recarga (Ctrl/Cmd + R)
5. Ve a Settings > Community Plugins y activa "Claude Companion"

## Configuración

1. Obtén tu API key en [console.anthropic.com](https://console.anthropic.com/)
2. Abre Settings > Claude Companion
3. Ingresa tu API key
4. Selecciona el modelo preferido (claude-sonnet-4-20250514 por defecto)
5. Configura la carpeta de destino para las notas generadas

## Uso

### Chat con Claude

1. Abre el panel de chat con el comando "Open Claude Chat" o desde el ribbon
2. Escribe tu mensaje y presiona Enter o el botón de enviar
3. Las respuestas aparecerán en tiempo real con streaming

### Crear notas desde el chat

1. Haz clic en el botón "Crear nota" en cualquier respuesta de Claude
2. Edita el título y tags sugeridos
3. La nota se guardará con formato estructurado incluyendo:
   - YAML frontmatter con fecha, tags y metadata
   - Contenido formateado
   - Sección de enlaces relacionados

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

## Roadmap

### Fase 1: MVP (Actual)
- [x] Panel de chat lateral
- [x] Streaming de respuestas
- [x] Configuración de API key y modelo
- [x] Generación de notas desde chat

### Fase 2: Integración con bóveda
- [ ] Comando para procesar nota activa
- [ ] Sugerencias de tags y wikilinks basadas en contenido existente
- [ ] Indexación de títulos de notas para contexto

### Fase 3: Automatización
- [ ] Templates de extracción personalizados
- [ ] Procesamiento batch de múltiples notas
- [ ] Generación de mapas de conceptos

## Stack técnico

- TypeScript
- Obsidian API
- Anthropic SDK
- esbuild

## Licencia

MIT

## Autor

**José Villaseñor Montfort**  
Diseño, arquitectura y desarrollo  

[Enigmora SC](https://github.com/Enigmora)

Copyright © 2025 José Villaseñor Montfort. Todos los derechos reservados.  
