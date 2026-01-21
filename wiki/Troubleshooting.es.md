# Solución de Problemas

Soluciones a problemas comunes con Claudian.

---

## Problemas de API

### "Clave API no configurada"

**Problema:** El chat muestra un error sobre clave API faltante.

**Solución:**
1. Ve a **Ajustes > Claudian**
2. Ingresa tu clave API de [console.anthropic.com](https://console.anthropic.com)
3. Intenta enviar un mensaje de nuevo

---

### "Clave API inválida"

**Problema:** Claude devuelve un error de autenticación.

**Solución:**
1. Verifica que tu clave API sea correcta (sin espacios extra)
2. Comprueba que tu clave no haya expirado o sido revocada
3. Crea una nueva clave si es necesario en [console.anthropic.com](https://console.anthropic.com)

---

### Errores de Límite de Velocidad

**Problema:** Los mensajes fallan con errores de límite de velocidad o cuota.

**Solución:**
1. Espera unos minutos antes de reintentar
2. Verifica tus límites de uso en [console.anthropic.com](https://console.anthropic.com)
3. Considera actualizar tu plan de Anthropic si necesitas límites más altos

---

### Errores de Conexión

**Problema:** Mensajes de "Error de red" o "Error al obtener".

**Solución:**
1. Verifica tu conexión a internet
2. Comprueba el estado de la API de Anthropic en [status.anthropic.com](https://status.anthropic.com)
3. Intenta desactivar VPN o proxy si aplica
4. Reinicia Obsidian

---

## Problemas del Chat

### El Panel de Chat No Abre

**Problema:** Hacer clic en el ícono de la cinta o usar el comando no abre el chat.

**Solución:**
1. Verifica que el plugin esté activado en **Ajustes > Plugins de la comunidad**
2. Intenta desactivar y reactivar Claudian
3. Reinicia Obsidian con `Ctrl/Cmd + R`

---

### Los Mensajes No Aparecen

**Problema:** Envías un mensaje pero no pasa nada.

**Solución:**
1. Revisa la consola por errores (`Ctrl/Cmd + Shift + I`)
2. Verifica que tu clave API esté configurada
3. Comprueba tu conexión a internet
4. Intenta con un mensaje más simple como "Hola"

---

### El Streaming No Funciona

**Problema:** Las respuestas aparecen todas de una vez en lugar de en streaming.

**Solución:**
1. Esto usualmente es un problema de red
2. Verifica si un firewall está bloqueando conexiones de streaming
3. Intenta cambiar de red

---

## Problemas del Modo Agente

### Las Acciones No Se Ejecutan

**Problema:** El modo agente responde pero no realiza acciones.

**Solución:**
1. Asegúrate de que el modo agente esté activado (toggle en el encabezado del chat)
2. Verifica si la carpeta objetivo está en la lista de carpetas protegidas
3. Verifica que tu solicitud sea clara y accionable

---

### El Diálogo de Confirmación Aparece para Todo

**Problema:** Incluso las acciones no destructivas requieren confirmación.

**Solución:**
1. Esto es por diseño para seguridad
2. Solo las operaciones de eliminación/modificación deberían requerir confirmación
3. Si estás seguro, puedes ajustar esto en los ajustes

---

### Errores de Carpeta Protegida

**Problema:** El agente rechaza modificar archivos en una carpeta específica.

**Solución:**
1. Verifica **Ajustes > Claudian > Carpetas protegidas**
2. Elimina la carpeta de la lista si la modificación es intencional
3. Nota: `.obsidian` siempre debe permanecer protegida

---

## Problemas de Procesamiento de Notas

### El Procesamiento Toma Mucho Tiempo

**Problema:** Procesar una nota parece colgarse o tomar mucho tiempo.

**Solución:**
1. Las notas grandes toman más tiempo
2. Reduce el número de notas/tags en contexto en los ajustes
3. Intenta usar un modelo más rápido (Claude 3.5 Haiku)

---

### Las Sugerencias No Aparecen

**Problema:** Después de procesar, no aparece el modal de sugerencias.

**Solución:**
1. Asegúrate de tener una nota activa abierta
2. Revisa la consola por errores (`Ctrl/Cmd + Shift + I`)
3. La nota podría ser muy corta para sugerencias significativas

---

## Problemas Generales

### El Plugin No Carga

**Problema:** Claudian no aparece en ajustes o comandos.

**Solución:**
1. Verifica que los archivos estén en `.obsidian/plugins/claudian/`:
   - `main.js`
   - `manifest.json`
   - `styles.css`
2. Comprueba que Plugins de la comunidad esté activado en ajustes
3. Reinicia Obsidian

---

### Los Ajustes No Se Guardan

**Problema:** Los cambios de configuración se pierden después de reiniciar.

**Solución:**
1. Verifica los permisos de archivo para `.obsidian/plugins/claudian/data.json`
2. Intenta eliminar `data.json` y reconfigurar
3. Asegúrate de que tu bóveda no esté en una ubicación de solo lectura

---

### Problemas de Estilo

**Problema:** El chat o los modales se ven rotos o sin estilo.

**Solución:**
1. Verifica que `styles.css` exista en la carpeta del plugin
2. Intenta cambiar entre tema claro y oscuro
3. Desactiva snippets CSS conflictivos

---

## Obtener Más Ayuda

Si ninguna de estas soluciones funciona:

1. **Revisa los Errores de Consola**
   - Abre Herramientas de Desarrollo: `Ctrl/Cmd + Shift + I`
   - Ve a la pestaña Consola
   - Busca mensajes de error cuando ocurra el problema

2. **Reporta un Problema**
   - Ve a [GitHub Issues](https://github.com/Enigmora/claudian/issues)
   - Incluye:
     - Versión de Obsidian
     - Versión de Claudian
     - Pasos para reproducir
     - Mensajes de error de consola (si hay)

3. **Información de Depuración**
   - Versión de Claudian: Revisa `manifest.json`
   - Versión de Obsidian: **Ajustes > Acerca de**
   - SO: Tu sistema operativo
