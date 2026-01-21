import { t } from './i18n';

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

/**
 * Get all extraction templates with localized names and descriptions
 */
export function getAllTemplates(): ExtractionTemplate[] {
  return [
    {
      id: 'key-ideas',
      name: t('template.keyIdeas.name'),
      description: t('template.keyIdeas.desc'),
      icon: 'lightbulb',
      outputFormat: 'markdown',
      prompt: `Analyze the following content and extract the key ideas.

INSTRUCTIONS:
1. Identify the 3-7 most important ideas
2. Summarize each idea in 1-2 clear sentences
3. Order them by relevance
4. Include brief textual quotes when useful

RESPONSE FORMAT:
## Key Ideas

1. **[Idea title]**
   [Concise description]

2. **[Idea title]**
   [Concise description]

...`
    },
    {
      id: 'executive-summary',
      name: t('template.summary.name'),
      description: t('template.summary.desc'),
      icon: 'file-text',
      outputFormat: 'markdown',
      prompt: `Generate an executive summary of the following content.

INSTRUCTIONS:
1. Maximum 3 paragraphs
2. First paragraph: context and main topic
3. Second paragraph: key points and findings
4. Third paragraph: conclusions or next steps
5. Use clear and direct language

RESPONSE FORMAT:
## Executive Summary

[Paragraph 1: Context]

[Paragraph 2: Key points]

[Paragraph 3: Conclusions]`
    },
    {
      id: 'open-questions',
      name: t('template.questions.name'),
      description: t('template.questions.desc'),
      icon: 'help-circle',
      outputFormat: 'markdown',
      prompt: `Analyze the following content and identify open questions and areas for exploration.

INSTRUCTIONS:
1. Look for topics mentioned but not developed
2. Identify assumptions that need validation
3. Detect contradictions or ambiguities
4. Suggest questions for deeper exploration

RESPONSE FORMAT:
## Open Questions

### Topics to explore
- [Question 1]
- [Question 2]

### Assumptions to validate
- [Assumption 1]
- [Assumption 2]

### Questions for deeper exploration
- [Question 1]
- [Question 2]`
    },
    {
      id: 'action-items',
      name: t('template.actions.name'),
      description: t('template.actions.desc'),
      icon: 'check-square',
      outputFormat: 'markdown',
      prompt: `Extract all tasks and actions from the following content.

INSTRUCTIONS:
1. Identify explicit and implicit actions
2. Classify by priority if possible to infer
3. Include responsible parties if mentioned
4. Detect mentioned deadlines

RESPONSE FORMAT:
## Identified Actions

### High priority
- [ ] [Action] — [Responsible if applicable] — [Date if applicable]

### Medium priority
- [ ] [Action]

### Low priority / Future
- [ ] [Action]`
    },
    {
      id: 'concepts-definitions',
      name: t('template.concepts.name'),
      description: t('template.concepts.desc'),
      icon: 'book-open',
      outputFormat: 'markdown',
      prompt: `Identify key concepts and their definitions in the following content.

INSTRUCTIONS:
1. Extract technical or specialized terms
2. Include explicit definitions from the text
3. Infer definitions when context allows
4. Group related concepts

RESPONSE FORMAT:
## Concept Glossary

### [Category 1]

**[Term]**
: [Definition]

**[Term]**
: [Definition]

### [Category 2]
...`
    },
    {
      id: 'connections',
      name: t('template.connections.name'),
      description: t('template.connections.desc'),
      icon: 'git-branch',
      outputFormat: 'json',
      prompt: `Analyze the following content and identify connections and relationships between concepts.

INSTRUCTIONS:
1. Identify main concepts mentioned
2. Detect causal, hierarchical, or associative relationships
3. Suggest related notes that might exist
4. Identify cross-cutting themes

RESPOND ONLY with valid JSON:
{
  "concepts": [
    {
      "name": "Concept name",
      "type": "main|secondary",
      "relatedTo": ["Concept A", "Concept B"]
    }
  ],
  "relationships": [
    {
      "from": "Concept A",
      "to": "Concept B",
      "type": "cause|part-of|related|prerequisite",
      "description": "Brief description of the relationship"
    }
  ],
  "suggestedLinks": ["Suggested note title 1", "Suggested note title 2"],
  "themes": ["Cross-cutting theme 1", "Cross-cutting theme 2"]
}`
    }
  ];
}

export function getTemplateById(id: string): ExtractionTemplate | undefined {
  return getAllTemplates().find(t => t.id === id);
}

export function buildTemplatePrompt(template: ExtractionTemplate, noteContent: string, noteTitle: string): string {
  return `${template.prompt}

---

NOTE TITLE: ${noteTitle}

CONTENT:
${noteContent}`;
}
