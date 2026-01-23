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

### Modo de Ejecución

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Modo de Ejecución |
| **Descripción** | Cómo Claudian selecciona el modelo óptimo para cada tarea |
| **Por defecto** | Automático |
| **Opciones** | Automático, Económico, Máxima Calidad |

**Comparación de Modos:**

| Modo | Descripción | Mejor Para |
|------|-------------|------------|
| **Automático** | Haiku analiza cada tarea y la enruta al modelo óptimo | La mayoría de usuarios - equilibra costo y calidad |
| **Económico** | Todas las tareas usan Haiku | Usuarios conscientes del presupuesto, tareas simples |
| **Máxima Calidad** | Todas las tareas usan Opus | Razonamiento complejo, trabajo crítico |

**Cómo Funciona el Modo Automático:**

El Orquestador de Modelos usa Haiku (rápido y económico) para clasificar la complejidad de cada tarea:

| Complejidad | Modelo Usado | Tareas de Ejemplo |
|-------------|--------------|-------------------|
| Simple | Haiku 4.5 | Listar archivos, copiar, mover, eliminar, contenido placeholder |
| Moderada | Sonnet 4 | Escribir contenido, resumir, traducir, explicar |
| Compleja | Sonnet 4 | Operaciones multi-archivo, procesamiento batch, refactorización |
| Profunda | Opus 4 | Análisis, planificación estratégica, síntesis de conocimiento |

Este enrutamiento inteligente optimiza costos mientras asegura calidad donde importa.

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

### Instrucciones Personalizadas

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Instrucciones personalizadas |
| **Descripción** | Instrucciones adicionales para Claude |
| **Por defecto** | Vacío |

Agrega tus propias instrucciones para personalizar el comportamiento de Claude. Estas instrucciones se **añaden** al prompt del sistema integrado, por lo que la funcionalidad principal siempre se preserva. Haz clic en **Limpiar** para eliminar todas las instrucciones personalizadas.

**Ejemplos de instrucciones personalizadas:**
- "Siempre responde en español formal"
- "Prefiere usar viñetas en lugar de párrafos"
- "Al crear notas, siempre agrega un campo 'status: draft'"

**Nota:** No puedes anular la identidad central de Claude ni la funcionalidad base. Las instrucciones personalizadas complementan el comportamiento predeterminado.

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
| **Por defecto** | 20 |
| **Rango** | 1 - 50 |

Limita el número de acciones que Claude puede ejecutar en una sola respuesta para prevenir operaciones descontroladas.

---

### Auto-Continuar

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Auto-continuar |
| **Descripción** | Continuar automáticamente respuestas truncadas |
| **Por defecto** | Activado |

Cuando está activado, si la respuesta de Claude se corta debido a límites de tokens, el plugin solicitará automáticamente una continuación. Esto asegura respuestas completas para tareas complejas.

---

### Auto-Planificar

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Auto-planificar |
| **Descripción** | Descomponer automáticamente tareas complejas en pasos |
| **Por defecto** | Activado |

Cuando está activado, Claude desglosará solicitudes complejas en una serie de pasos manejables antes de la ejecución. Esto mejora la confiabilidad para operaciones de múltiples pasos.

---

### Refuerzo de Contexto

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Refuerzo de contexto |
| **Descripción** | Reforzar el contexto del agente en conversaciones largas |
| **Por defecto** | Activado |

Cuando está activado, el contexto del sistema del agente se refuerza periódicamente durante conversaciones largas para mantener un comportamiento consistente y prevenir la deriva del contexto.

---

## Seguimiento de Tokens

Ajustes para monitorear el uso de tokens de la API.

### Mostrar Indicador de Tokens

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Mostrar indicador de tokens |
| **Descripción** | Mostrar uso de tokens en el pie del chat |
| **Por defecto** | Activado |

Cuando está activado, muestra el uso de tokens de la sesión actual en el pie del chat. Haz clic en el indicador para ver el historial de uso detallado.

**El indicador de tokens muestra:**
- Tokens de entrada (enviados a Claude)
- Tokens de salida (recibidos de Claude)
- Totales de sesión
- Clic para expandir el modal de historial de uso

---

## Gestión de Contexto

Ajustes para la optimización automática de conversaciones y reducción del uso de tokens.

### Gestión Automática de Contexto

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Gestión automática de contexto |
| **Descripción** | Resumir automáticamente el historial cuando las conversaciones se hacen largas |
| **Por defecto** | Activado |

Cuando está activado, Claudian resume automáticamente los mensajes antiguos cuando las conversaciones se hacen largas. Esto reduce el uso de tokens mientras preserva el contexto importante, permitiendo conversaciones más largas sin alcanzar los límites de tokens.

**Cómo funciona:**
- Monitorea la longitud de la conversación
- Cuando se alcanza el umbral, los mensajes antiguos se resumen
- Los mensajes recientes permanecen en detalle completo
- El contexto del resumen se incluye en nuevas solicitudes

---

### Resumir Después de Mensajes

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Resumir después de mensajes |
| **Descripción** | Número de mensajes antes de activar el resumen automático |
| **Por defecto** | 20 |
| **Rango** | 10 - 50 |

Valores más bajos resumen con más frecuencia (más ahorro de tokens, menos contexto). Valores más altos mantienen más mensajes completos antes de resumir.

---

### Máximo de Mensajes Activos

| Ajuste | Descripción |
|--------|-------------|
| **Nombre** | Máximo de mensajes activos |
| **Descripción** | Máximo de mensajes a mantener en contexto activo después del resumen |
| **Por defecto** | 50 |
| **Rango** | 20 - 100 |

Después del resumen, esta cantidad de mensajes recientes se mantienen en detalle completo. Los mensajes más antiguos se comprimen en un resumen.

**Estimaciones de ahorro de tokens:**

| Longitud de Conversación | Sin Resumen | Con Resumen | Ahorro |
|--------------------------|-------------|-------------|--------|
| 30 mensajes | ~7,500 tokens | ~3,000 tokens | 60% |
| 50 mensajes | ~12,500 tokens | ~3,500 tokens | 72% |
| 100 mensajes | ~25,000 tokens | ~4,000 tokens | 84% |

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
- Modo de Ejecución: Automático
- Tokens máximos: 4096
- Confirmar acciones destructivas: Activado

### Para Bóvedas Grandes (1000+ notas)
- Modo de Ejecución: Automático
- Notas en contexto: 200-300
- Tags en contexto: 100

### Para Usuarios Conscientes del Presupuesto
- Modo de Ejecución: Económico
- Tokens máximos: 2048

### Para Trabajo Crítico
- Modo de Ejecución: Máxima Calidad
- Tokens máximos: 8192
