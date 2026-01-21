export interface ExtractionTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  outputFormat: 'markdown' | 'json';
  icon: string;
}

export interface TemplateResult {
  templateId: string;
  noteTitle: string;
  notePath: string;
  content: string;
  timestamp: string;
}

export const DEFAULT_TEMPLATES: ExtractionTemplate[] = [
  {
    id: 'key-ideas',
    name: 'Extraer ideas clave',
    description: 'Identifica y resume las ideas principales del contenido',
    icon: 'lightbulb',
    outputFormat: 'markdown',
    prompt: `Analiza el siguiente contenido y extrae las ideas clave.

INSTRUCCIONES:
1. Identifica las 3-7 ideas más importantes
2. Resume cada idea en 1-2 oraciones claras
3. Ordénalas por relevancia
4. Incluye citas textuales breves cuando sea útil

FORMATO DE RESPUESTA:
## Ideas Clave

1. **[Título de la idea]**
   [Descripción concisa]

2. **[Título de la idea]**
   [Descripción concisa]

...`
  },
  {
    id: 'executive-summary',
    name: 'Resumen ejecutivo',
    description: 'Genera un resumen conciso para lectura rápida',
    icon: 'file-text',
    outputFormat: 'markdown',
    prompt: `Genera un resumen ejecutivo del siguiente contenido.

INSTRUCCIONES:
1. Máximo 3 párrafos
2. Primer párrafo: contexto y tema principal
3. Segundo párrafo: puntos clave y hallazgos
4. Tercer párrafo: conclusiones o próximos pasos
5. Usa lenguaje claro y directo

FORMATO DE RESPUESTA:
## Resumen Ejecutivo

[Párrafo 1: Contexto]

[Párrafo 2: Puntos clave]

[Párrafo 3: Conclusiones]`
  },
  {
    id: 'open-questions',
    name: 'Identificar preguntas abiertas',
    description: 'Detecta preguntas sin resolver o áreas de exploración',
    icon: 'help-circle',
    outputFormat: 'markdown',
    prompt: `Analiza el siguiente contenido e identifica preguntas abiertas y áreas de exploración.

INSTRUCCIONES:
1. Busca temas mencionados pero no desarrollados
2. Identifica suposiciones que necesitan validación
3. Detecta contradicciones o ambigüedades
4. Sugiere preguntas para profundizar

FORMATO DE RESPUESTA:
## Preguntas Abiertas

### Temas por explorar
- [Pregunta 1]
- [Pregunta 2]

### Suposiciones a validar
- [Suposición 1]
- [Suposición 2]

### Preguntas para profundizar
- [Pregunta 1]
- [Pregunta 2]`
  },
  {
    id: 'action-items',
    name: 'Extraer acciones',
    description: 'Identifica tareas y acciones mencionadas en el contenido',
    icon: 'check-square',
    outputFormat: 'markdown',
    prompt: `Extrae todas las tareas y acciones del siguiente contenido.

INSTRUCCIONES:
1. Identifica acciones explícitas e implícitas
2. Clasifica por prioridad si es posible inferirla
3. Incluye responsables si se mencionan
4. Detecta fechas límite mencionadas

FORMATO DE RESPUESTA:
## Acciones Identificadas

### Alta prioridad
- [ ] [Acción] — [Responsable si aplica] — [Fecha si aplica]

### Media prioridad
- [ ] [Acción]

### Baja prioridad / Futuro
- [ ] [Acción]`
  },
  {
    id: 'concepts-definitions',
    name: 'Conceptos y definiciones',
    description: 'Extrae términos importantes y sus definiciones',
    icon: 'book-open',
    outputFormat: 'markdown',
    prompt: `Identifica los conceptos clave y sus definiciones en el siguiente contenido.

INSTRUCCIONES:
1. Extrae términos técnicos o especializados
2. Incluye definiciones explícitas del texto
3. Infiere definiciones cuando el contexto lo permita
4. Agrupa conceptos relacionados

FORMATO DE RESPUESTA:
## Glosario de Conceptos

### [Categoría 1]

**[Término]**
: [Definición]

**[Término]**
: [Definición]

### [Categoría 2]
...`
  },
  {
    id: 'connections',
    name: 'Conexiones y relaciones',
    description: 'Identifica relaciones entre conceptos para crear enlaces',
    icon: 'git-branch',
    outputFormat: 'json',
    prompt: `Analiza el siguiente contenido e identifica conexiones y relaciones entre conceptos.

INSTRUCCIONES:
1. Identifica conceptos principales mencionados
2. Detecta relaciones causales, jerárquicas o asociativas
3. Sugiere notas relacionadas que podrían existir
4. Identifica temas transversales

RESPONDE ÚNICAMENTE con JSON válido:
{
  "concepts": [
    {
      "name": "Nombre del concepto",
      "type": "principal|secundario",
      "relatedTo": ["Concepto A", "Concepto B"]
    }
  ],
  "relationships": [
    {
      "from": "Concepto A",
      "to": "Concepto B",
      "type": "causa|parte-de|relacionado|prerequisito",
      "description": "Breve descripción de la relación"
    }
  ],
  "suggestedLinks": ["Título de nota sugerida 1", "Título de nota sugerida 2"],
  "themes": ["Tema transversal 1", "Tema transversal 2"]
}`
  }
];

export function getTemplateById(id: string): ExtractionTemplate | undefined {
  return DEFAULT_TEMPLATES.find(t => t.id === id);
}

export function getAllTemplates(): ExtractionTemplate[] {
  return [...DEFAULT_TEMPLATES];
}

export function buildTemplatePrompt(template: ExtractionTemplate, noteContent: string, noteTitle: string): string {
  return `${template.prompt}

---

TÍTULO DE LA NOTA: ${noteTitle}

CONTENIDO:
${noteContent}`;
}
