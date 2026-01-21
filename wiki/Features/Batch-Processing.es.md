# Procesamiento por Lotes

El procesamiento por lotes te permite analizar múltiples notas a la vez usando plantillas de extracción predefinidas, generando análisis consolidados.

---

## Descripción General

Con el procesamiento por lotes, puedes:

- Procesar muchas notas simultáneamente
- Aplicar análisis consistente en toda tu bóveda
- Extraer tipos específicos de información
- Generar informes de resumen

---

## Abrir Procesamiento por Lotes

1. Abre la paleta de comandos con `Ctrl/Cmd + P`
2. Busca **"Procesar notas por lotes"**
3. Selecciona el comando

![Modal de Lotes](../images/batch-modal.png)

---

## Seleccionar Notas

El modal de lotes proporciona dos métodos de selección:

### Por Carpeta

1. Haz clic en una carpeta de la lista
2. Todas las notas en esa carpeta serán seleccionadas
3. Las subcarpetas se incluyen recursivamente

### Selección Individual

1. Navega el árbol de carpetas
2. Haz clic en notas individuales para seleccionar/deseleccionar
3. Usa `Ctrl/Cmd + Clic` para selección múltiple

### Indicadores de Selección

- Casilla de verificación muestra el estado de selección
- Contador muestra el total de notas seleccionadas
- Insignias de carpeta muestran conteos de notas

---

## Plantillas de Extracción

Elige una plantilla que coincida con tu objetivo de análisis:

### Extraer Ideas Clave

**Propósito:** Resumir las ideas principales de cada nota

**La salida incluye:**
- Puntos principales de cada nota
- Temas comunes entre notas
- Conclusiones clave

**Mejor para:** Notas de investigación, notas de reuniones, artículos

---

### Resumen Ejecutivo

**Propósito:** Generar un resumen conciso

**La salida incluye:**
- Breve descripción del contenido
- Hallazgos más importantes
- Conclusiones

**Mejor para:** Documentos largos, informes, documentación

---

### Identificar Preguntas

**Propósito:** Encontrar preguntas abiertas y temas para explorar

**La salida incluye:**
- Preguntas explícitas en las notas
- Preguntas implícitas
- Áreas que necesitan investigación

**Mejor para:** Notas de investigación, materiales de estudio, planificación de proyectos

---

### Extraer Acciones

**Propósito:** Listar tareas y elementos de acción

**La salida incluye:**
- TODOs explícitos
- Tareas implícitas
- Fechas límite (si se mencionan)

**Mejor para:** Notas de reuniones, notas de proyecto, documentos de planificación

---

### Conceptos y Definiciones

**Propósito:** Crear un glosario de términos

**La salida incluye:**
- Términos clave y sus definiciones
- Vocabulario técnico
- Explicaciones de conceptos

**Mejor para:** Notas de estudio, documentación técnica, materiales de aprendizaje

---

### Conexiones

**Propósito:** Identificar relaciones entre notas

**La salida incluye:**
- Temas comunes
- Referencias cruzadas
- Wikilinks potenciales

**Mejor para:** Investigación, construcción de base de conocimiento, exploración de temas

---

## Ejecutar Procesamiento por Lotes

1. Selecciona tus notas
2. Elige una plantilla de extracción
3. Haz clic en **Procesar**
4. Espera a que termine

![Progreso del Lote](../images/batch-progress.png)

### Seguimiento de Progreso

Durante el procesamiento, verás:
- Nota actual siendo procesada
- Barra de progreso
- Tiempo transcurrido
- Tiempo restante estimado

---

## Salida

Los resultados se guardan como una nueva nota en tu carpeta de notas configurada:

### Formato de Salida

```markdown
---
created: 2024-01-21
source: claudian-batch
template: extract-key-ideas
notes_processed: 5
---

# Procesamiento por Lotes: Extraer Ideas Clave

## Resumen

[Descripción general de hallazgos]

## Resultados por Nota

### Título de Nota 1
- Idea clave 1
- Idea clave 2

### Título de Nota 2
- Idea clave 1
- Idea clave 2

## Temas Comunes

- Tema 1
- Tema 2

## Enlaces Relacionados

- [[Nota 1]]
- [[Nota 2]]
```

---

## Consejos para Procesamiento Efectivo

### Selección de Notas

- Agrupa notas relacionadas para mejor análisis
- Evita mezclar contenido no relacionado
- Considera procesar por carpeta/tema

### Elección de Plantillas

- Coincide la plantilla con tu objetivo
- "Extraer ideas clave" es buena para análisis general
- "Conexiones" ayuda a construir tu grafo de conocimiento

### Lotes Grandes

- El tiempo de procesamiento aumenta con el número de notas
- Considera dividir lotes muy grandes
- Los costos de API aumentan con más notas

---

## Uso de API

El procesamiento por lotes envía cada nota a Claude para análisis:

- Cada nota = una llamada a API
- El uso de tokens depende de la longitud de la nota
- Considera el número y longitud de notas para el costo

### Reducir Costos

- Procesa menos notas a la vez
- Usa Claude 3.5 Haiku para extracciones más simples
- Reduce los tokens máximos en los ajustes

---

## Limitaciones

- El máximo de notas por lote depende de los límites de API
- Las notas muy largas pueden truncarse
- Procesar lotes grandes toma tiempo
- Cada plantilla produce un formato de salida específico

---

## Casos de Uso

### Síntesis de Investigación

Procesa todas las notas de un tema de investigación para:
- Identificar temas clave
- Encontrar vacíos en tu conocimiento
- Generar un resumen de literatura

### Revisión de Proyecto

Procesa notas de proyecto para:
- Extraer todos los elementos de acción
- Encontrar preguntas abiertas
- Generar resumen de estado

### Preparación de Estudio

Procesa notas de curso para:
- Crear glosario de conceptos
- Identificar temas clave
- Encontrar áreas que necesitan revisión

### Auditoría de Base de Conocimiento

Procesa una carpeta para:
- Encontrar conexiones entre notas
- Identificar notas huérfanas
- Descubrir oportunidades de enlace

---

## Características Relacionadas

- [Interfaz de Chat](Chat-Interface.es) - Conversaciones individuales
- [Mapas Conceptuales](Concept-Maps.es) - Mapeo visual de relaciones
- [Configuración](../Configuration.es) - Ajustar configuración de procesamiento
