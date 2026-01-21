# Configuración

Referencia completa de todos los ajustes de Claudian. Accede a los ajustes en **Ajustes > Claudian**.

---

## Ajustes Generales

### Idioma

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Idioma |
| **Descripción** | Idioma de la interfaz del plugin |
| **Por defecto** | Auto (sigue el idioma de Obsidian) |
| **Opciones** | Auto, English, Español |

El plugin detecta automáticamente el idioma de Obsidian, o puedes anularlo manualmente.

---

### Clave API

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Clave API |
| **Descripción** | Tu clave API de Anthropic para Claude |
| **Por defecto** | Vacío |
| **Requerido** | Sí |

Obtén tu clave API en [console.anthropic.com](https://console.anthropic.com). La clave se almacena localmente en el archivo de datos del plugin en tu bóveda y nunca se envía a servidores externos (excepto la API de Anthropic).

---

### Modelo

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Modelo |
| **Descripción** | Modelo de Claude a usar para las respuestas |
| **Por defecto** | Claude Sonnet 4 |
| **Opciones** | Claude Sonnet 4, Claude Opus 4, Claude 3.5 Sonnet, Claude 3.5 Haiku |

**Comparación de Modelos:**

| Modelo | Mejor Para | Velocidad | Costo |
|--------|------------|-----------|-------|
| Claude Sonnet 4 | Uso general, rendimiento equilibrado | Rápido | Medio |
| Claude Opus 4 | Razonamiento complejo, documentos largos | Más lento | Mayor |
| Claude 3.5 Sonnet | Generación anterior, confiable | Rápido | Medio |
| Claude 3.5 Haiku | Tareas rápidas, consultas simples | Más rápido | Menor |

---

### Carpeta de Notas

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Carpeta de notas |
| **Descripción** | Carpeta destino para notas generadas |
| **Por defecto** | `Claude Notes` |

Las notas creadas desde respuestas del chat se guardarán en esta carpeta. La carpeta se creará automáticamente si no existe.

---

### Tokens Máximos

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Tokens máximos |
| **Descripción** | Máximo de tokens en las respuestas de Claude |
| **Por defecto** | 4096 |
| **Rango** | 1000 - 8192 |

Valores más altos permiten respuestas más largas pero pueden aumentar los costos de API.

---

### Prompt del Sistema

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Prompt del sistema |
| **Descripción** | Instrucciones personalizadas para Claude |
| **Por defecto** | Prompt integrado consciente de Obsidian |

Puedes personalizar el comportamiento de Claude modificando el prompt del sistema. Haz clic en **Restaurar predeterminado** para restablecer el prompt original.

---

## Procesamiento de Notas

Estos ajustes controlan cómo se analizan las notas al usar el comando "Procesar nota activa".

### Notas en Contexto

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Notas en contexto |
| **Descripción** | Número de títulos de notas a incluir para sugerencias de wikilinks |
| **Por defecto** | 100 |
| **Rango** | 10 - 500 |

Valores más altos proporcionan más objetivos potenciales para wikilinks pero aumentan el uso de tokens de API.

---

### Tags en Contexto

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Tags en contexto |
| **Descripción** | Número de tags existentes a incluir para sugerencias de tags |
| **Por defecto** | 50 |
| **Rango** | 10 - 200 |

Incluye los tags existentes de tu bóveda para que Claude pueda sugerir los relevantes.

---

## Modo Agente

Ajustes para la gestión de bóveda con lenguaje natural.

### Activar Modo Agente

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Activar modo agente por defecto |
| **Descripción** | Iniciar nuevos chats con modo agente activado |
| **Por defecto** | Desactivado |

Cuando está activado, las nuevas sesiones de chat tendrán el modo agente activo. Siempre puedes alternarlo en el encabezado del chat.

---

### Confirmar Acciones Destructivas

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Confirmar acciones destructivas |
| **Descripción** | Mostrar diálogo de confirmación antes de operaciones de eliminación |
| **Por defecto** | Activado |

**Se recomienda encarecidamente mantenerlo activado.** Esto previene la eliminación accidental de notas o carpetas.

---

### Carpetas Protegidas

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Carpetas protegidas |
| **Descripción** | Carpetas que no pueden ser modificadas por el modo agente |
| **Por defecto** | `.obsidian, templates, _templates` |

Lista separada por comas de rutas de carpetas. El modo agente rechazará modificar archivos en estas carpetas.

---

### Máximo de Acciones por Mensaje

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Máximo de acciones por mensaje |
| **Descripción** | Máximo de operaciones en la bóveda por respuesta del agente |
| **Por defecto** | 10 |
| **Rango** | 1 - 20 |

Limita el número de acciones que Claude puede ejecutar en una sola respuesta para prevenir operaciones descontroladas.

---

## Ubicación del Archivo de Ajustes

Todos los ajustes se almacenan localmente en tu bóveda en:

```
.obsidian/plugins/claudian/data.json
```

Este archivo contiene tu configuración incluyendo la clave API. **No compartas este archivo públicamente.**

---

## Configuración Recomendada

### Para Uso General
- Modelo: Claude Sonnet 4
- Tokens máximos: 4096
- Confirmar acciones destructivas: Activado

### Para Bóvedas Grandes (1000+ notas)
- Notas en contexto: 200-300
- Tags en contexto: 100
- Considera usar Claude Opus 4 para consultas complejas

### Para Tareas Rápidas
- Modelo: Claude 3.5 Haiku
- Tokens máximos: 2048
