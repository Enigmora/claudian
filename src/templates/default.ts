export interface NoteData {
  title: string;
  content: string;
  tags: string[];
  date: string;
}

export function generateNoteContent(data: NoteData): string {
  const tagsFormatted = data.tags.length > 0
    ? data.tags.map(t => t.startsWith('#') ? t.slice(1) : t).join(', ')
    : '';

  return `---
created: ${data.date}
tags: [${tagsFormatted}]
source: claude-chat
status: draft
---

# ${data.title}

${data.content}

---
*Generado con Claude Companion by Enigmora - ${data.date}*
`;
}

export function extractSuggestedTags(content: string): string[] {
  const tags: string[] = [];

  // Buscar hashtags existentes en el contenido
  const hashtagMatches = content.match(/#[\w-]+/g);
  if (hashtagMatches) {
    hashtagMatches.forEach(tag => {
      const cleanTag = tag.slice(1).toLowerCase();
      if (!tags.includes(cleanTag)) {
        tags.push(cleanTag);
      }
    });
  }

  // Buscar palabras clave comunes
  const keywords = [
    { pattern: /\b(tutorial|guía|guide)\b/i, tag: 'tutorial' },
    { pattern: /\b(código|code|programación|programming)\b/i, tag: 'code' },
    { pattern: /\b(idea|concept)\b/i, tag: 'idea' },
    { pattern: /\b(resumen|summary)\b/i, tag: 'resumen' },
    { pattern: /\b(proyecto|project)\b/i, tag: 'proyecto' },
    { pattern: /\b(referencia|reference)\b/i, tag: 'referencia' },
  ];

  keywords.forEach(({ pattern, tag }) => {
    if (pattern.test(content) && !tags.includes(tag)) {
      tags.push(tag);
    }
  });

  return tags.slice(0, 5); // Máximo 5 tags sugeridos
}

export function suggestTitle(content: string): string {
  // Buscar si hay un título markdown
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Usar las primeras palabras significativas
  const firstLine = content.split('\n').find(line => line.trim().length > 0) || '';
  const words = firstLine.replace(/[#*_`]/g, '').trim().split(/\s+/).slice(0, 6);

  if (words.length > 0) {
    let title = words.join(' ');
    if (title.length > 50) {
      title = title.slice(0, 47) + '...';
    }
    return title;
  }

  return 'Nueva nota';
}
