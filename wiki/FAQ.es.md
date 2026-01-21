# Preguntas Frecuentes

Preguntas comunes sobre Claudian.

---

## General

### ¿Qué es Claudian?

Claudian es un plugin de Obsidian que integra Claude AI directamente en tu flujo de trabajo de toma de notas. Proporciona una interfaz de chat, procesamiento de notas y gestión de bóveda a través de lenguaje natural.

---

### ¿Es Claudian gratis?

Claudian en sí es gratuito y de código abierto bajo la licencia MIT. Sin embargo, necesitas una clave API de Anthropic para usar Claude, lo cual tiene costos asociados basados en el uso.

---

### ¿Qué modelos de Claude están soportados?

Claudian soporta:
- **Claude Sonnet 4** (recomendado)
- **Claude Opus 4** (para tareas complejas)
- **Claude 3.5 Sonnet**
- **Claude 3.5 Haiku** (más rápido, menor costo)

---

### ¿Funciona Claudian sin conexión?

No. Claudian requiere una conexión a internet para comunicarse con la API de Claude.

---

## Privacidad y Seguridad

### ¿Mis datos se envían a servidores externos?

Tus mensajes se envían a la API de Anthropic para generar respuestas. La política de privacidad de Anthropic aplica a estos datos. Tu clave API y ajustes se almacenan localmente en tu bóveda.

---

### ¿Dónde se almacena mi clave API?

Tu clave API se almacena en tu bóveda en:
```
.obsidian/plugins/claudian/data.json
```

Nunca se envía a ningún lugar excepto a la API de Anthropic para autenticación.

---

### ¿Puede Claude leer todas mis notas?

Solo cuando explícitamente:
- Procesas una nota específica
- Usas procesamiento por lotes en notas seleccionadas
- Activas el contexto de bóveda para el Modo Agente

Claude no tiene acceso continuo a tu bóveda.

---

### ¿Se almacenan mis conversaciones?

El historial del chat se mantiene en memoria durante tu sesión. Cuando cierras Obsidian o limpias el chat, la conversación se pierde. No almacenamos tus conversaciones externamente.

---

## API y Costos

### ¿Cómo obtengo una clave API?

1. Ve a [console.anthropic.com](https://console.anthropic.com)
2. Crea una cuenta o inicia sesión
3. Navega a API Keys
4. Crea una nueva clave

---

### ¿Cuánto cuesta usar Claude?

Los costos dependen de:
- El modelo que uses
- Número de tokens en tus mensajes
- Frecuencia de uso

Consulta la [página de precios de Anthropic](https://www.anthropic.com/pricing) para tarifas actuales.

---

### ¿Cómo puedo reducir los costos de API?

- Usa Claude 3.5 Haiku para consultas simples
- Reduce los tokens máximos en los ajustes
- Sé conciso en tus mensajes
- Reduce notas/tags en contexto

---

## Características

### ¿Qué es el Modo Agente?

El Modo Agente permite a Claude ejecutar acciones en tu bóveda a través de lenguaje natural. Por ejemplo:
- "Crea una nueva carpeta llamada Proyectos"
- "Mueve todas las notas sobre Python a Programación/"
- "Elimina las notas vacías en Borradores/"

Consulta [Modo Agente](Features/Agent-Mode.es) para más detalles.

---

### ¿Puede Claude crear notas?

Sí, de dos formas:
1. Haz clic en "Crear nota" en cualquier respuesta del chat para guardarla como nota
2. Usa el Modo Agente para crear notas directamente: "Crea una nota sobre notas de reunión"

---

### ¿Qué es el procesamiento por lotes?

El procesamiento por lotes te permite analizar múltiples notas a la vez usando plantillas como:
- Extraer ideas clave
- Resumen ejecutivo
- Identificar preguntas
- Extraer acciones

Consulta [Procesamiento por Lotes](Features/Batch-Processing.es) para más detalles.

---

### ¿Qué son los mapas conceptuales?

Los mapas conceptuales analizan un conjunto de notas y generan un diagrama visual mostrando:
- Conceptos principales
- Relaciones entre conceptos
- Temas transversales

La salida usa formato Mermaid para visualización.

---

## Compatibilidad

### ¿Qué versión de Obsidian se requiere?

Claudian requiere Obsidian v1.0.0 o superior.

---

### ¿Funciona Claudian en móvil?

Claudian debería funcionar en Obsidian móvil, pero la experiencia puede variar. La versión de escritorio es el objetivo principal de desarrollo.

---

### ¿Hay plugins conflictivos?

No hay conflictos conocidos. Si experimentas problemas con otros plugins, por favor repórtalos en GitHub.

---

## Solución de Problemas

### El chat no responde

Verifica:
1. La clave API está configurada
2. La conexión a internet funciona
3. La API de Anthropic está operativa

Consulta [Solución de Problemas](Troubleshooting.es) para soluciones detalladas.

---

### El Modo Agente no modifica ciertos archivos

Algunas carpetas están protegidas por defecto:
- `.obsidian`
- `templates`
- `_templates`

Revisa **Ajustes > Carpetas protegidas** para ajustar.

---

## Contribuir

### ¿Es Claudian de código abierto?

¡Sí! Claudian tiene licencia MIT. El código fuente está disponible en [github.com/Enigmora/claudian](https://github.com/Enigmora/claudian).

---

### ¿Cómo puedo contribuir?

- Reporta bugs en [GitHub Issues](https://github.com/Enigmora/claudian/issues)
- Envía solicitudes de características
- Crea pull requests para mejoras
- Ayuda con traducciones

---

### ¿Puedo solicitar características?

¡Sí! Abre un issue en GitHub con la etiqueta "feature request" describiendo tu idea.
