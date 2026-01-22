# Plan: Flujo Bidireccional Agéntico (Agentic Loop)

## Estado: ✅ COMPLETADO

Todas las fases han sido implementadas y probadas.

## Problema Original

El sistema tenía un flujo **unidireccional** de una sola pasada:

```
Usuario → mensaje → Claude → acciones JSON → Sistema ejecuta → Fin
                                                    ↓
                                          (resultados perdidos)
```

**Consecuencias:**
- Claude no podía ver los resultados de `list-folder` para saber qué archivos copiar
- Claude no podía corregir errores basándose en resultados fallidos
- Claude no podía tomar decisiones informadas que dependan de datos de la bóveda
- Claude tenía que "inventar" datos que debería obtener del sistema

## Solución Implementada: Agentic Loop

Flujo **bidireccional** de múltiples turnos:

```
Usuario → mensaje → Claude
                      ↓
              acciones JSON (ej: list-folder)
                      ↓
              Sistema ejecuta
                      ↓
              resultados → Claude  ✓
                      ↓
              más acciones (ej: copy-note con nombres reales)
                      ↓
              Sistema ejecuta
                      ↓
              resultados → Claude  ✓
                      ↓
              mensaje final (sin más acciones)
                      ↓
                    Fin
```

## Fases de Implementación

### ✅ Fase 1: Infraestructura básica
- [x] Agregar `awaitResults` a `AgentResponse` interface
- [x] Implementar `formatResultsForAgent` para formatear resultados
- [x] Modificar `handleAgentResponse` para detectar `awaitResults`
- [x] Crear `continueAgenticLoop` para enviar resultados a Claude

### ✅ Fase 2: Loop agéntico robusto
- [x] Implementar detección de loops infinitos (hash de acciones)
- [x] Agregar manejo de errores (parar si todas las acciones fallan)
- [x] Implementar cancelación del loop con botón
- [x] Agregar límite de iteraciones (MAX_LOOP_COUNT = 5)
- [x] Traducciones para mensajes del loop

### ✅ Fase 3: UX y pulido
- [x] Indicador visual de progreso ("Paso X de máx. Y")
- [x] Historial visual del loop (pasos completados)
- [x] Mensajes intermedios de Claude visibles
- [x] Contador de tokens por iteración
- [x] Resumen de tokens al finalizar
- [x] Expandir/colapsar mensajes largos
- [x] Estilos CSS para todos los componentes

### ✅ Fase 4: Actualizar prompts
- [x] Documentar cuándo usar awaitResults: true
- [x] Documentar cuándo NO usar awaitResults
- [x] Ejemplo 1: Copiar archivos de carpeta
- [x] Ejemplo 2: Buscar y procesar notas
- [x] Ejemplo 3: Leer antes de modificar
- [x] Ejemplo 4: Verificar y manejar errores

## Archivos Modificados

1. **`src/agent-mode.ts`**
   - `AgentResponse` interface con `awaitResults?: boolean`
   - `parseAgentResponse` extrae el campo `awaitResults`

2. **`src/chat-view.ts`**
   - Propiedades: `agentLoopActive`, `agentLoopHistory`, `agentLoopCancelled`, `agentLoopTokens`, `agentLoopContainer`
   - `handleAgentResponse` detecta `awaitResults` y llama a `continueAgenticLoop`
   - `continueAgenticLoop` envía resultados a Claude y procesa respuesta
   - `formatResultsForAgent` formatea resultados para Claude
   - `addLoopStepToHistory` agrega pasos al historial visual
   - `hashActions` detecta acciones repetidas
   - `startAgenticLoop` / `endAgenticLoop` gestionan el estado

3. **`src/i18n/types.ts`**
   - Nuevas claves de traducción para el loop

4. **`src/i18n/locales/es.ts` y `en.ts`**
   - Traducciones para mensajes del loop
   - System prompt mejorado con ejemplos detallados

5. **`styles.css`**
   - Estilos para `.agent-loop-container`, `.agent-loop-step`, etc.
   - Indicadores visuales y animaciones

## Características Implementadas

| Característica | Descripción |
|----------------|-------------|
| Loop bidireccional | Claude recibe resultados y puede continuar con datos reales |
| Máximo 5 iteraciones | Previene loops infinitos |
| Detección de repetición | Hash de acciones para detectar ciclos |
| Parada por errores | Si todas las acciones fallan, el loop se detiene |
| Cancelación | Botón para cancelar en cualquier momento |
| Historial visual | Cada paso se muestra con badge, mensaje y estadísticas |
| Contador de tokens | Muestra tokens usados en tiempo real |
| Mensajes expandibles | Mensajes largos se truncan con opción de expandir |

## Pruebas Recomendadas

1. **Copiar archivos de carpeta**: "Copia los archivos de /Origen a /Destino"
2. **Buscar y procesar**: "Busca notas sobre X y agrégales el tag #procesado"
3. **Leer y modificar**: "Lee la nota Ideas.md y agrega un resumen al inicio"
4. **Manejo de errores**: Probar con rutas inexistentes
5. **Límite de loops**: Tarea que requiera más de 5 iteraciones
6. **Cancelación**: Cancelar durante el streaming
