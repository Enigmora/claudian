import { TFile, Notice } from 'obsidian';
import ClaudeCompanionPlugin from './main';
import { ClaudeClient } from './claude-client';
import { VaultIndexer } from './vault-indexer';

export interface ConceptNode {
  name: string;
  type: 'principal' | 'secundario';
  noteSource?: string;
  mentions: number;
}

export interface ConceptRelation {
  from: string;
  to: string;
  type: 'causa' | 'parte-de' | 'relacionado' | 'prerequisito';
  description?: string;
}

export interface ConceptMap {
  title: string;
  concepts: ConceptNode[];
  relations: ConceptRelation[];
  themes: string[];
  generatedAt: string;
  sourceNotes: string[];
}

export interface ConceptMapCallbacks {
  onStart?: () => void;
  onProgress?: (message: string) => void;
  onComplete?: (map: ConceptMap) => void;
  onError?: (error: Error) => void;
}

export class ConceptMapGenerator {
  private plugin: ClaudeCompanionPlugin;
  private claudeClient: ClaudeClient;
  private indexer: VaultIndexer;

  constructor(plugin: ClaudeCompanionPlugin, claudeClient: ClaudeClient, indexer: VaultIndexer) {
    this.plugin = plugin;
    this.claudeClient = claudeClient;
    this.indexer = indexer;
  }

  async generateFromNotes(
    files: TFile[],
    mapTitle: string,
    callbacks: ConceptMapCallbacks
  ): Promise<ConceptMap> {
    callbacks.onStart?.();
    callbacks.onProgress?.('Leyendo contenido de las notas...');

    // Recopilar contenido de todas las notas
    const notesContent: Array<{ title: string; content: string }> = [];
    for (const file of files) {
      const content = await this.plugin.app.vault.read(file);
      notesContent.push({ title: file.basename, content });
    }

    callbacks.onProgress?.('Analizando conceptos con Claude...');

    const prompt = this.buildConceptMapPrompt(notesContent);

    return new Promise((resolve, reject) => {
      let fullResponse = '';

      this.claudeClient.generateConceptMap(
        prompt,
        {
          onStart: () => {},
          onToken: (token) => {
            fullResponse += token;
          },
          onComplete: (response) => {
            try {
              const parsed = this.parseConceptMapResponse(response);
              const map: ConceptMap = {
                title: mapTitle,
                concepts: parsed.concepts || [],
                relations: parsed.relations || [],
                themes: parsed.themes || [],
                generatedAt: new Date().toISOString(),
                sourceNotes: files.map(f => f.basename)
              };
              callbacks.onComplete?.(map);
              resolve(map);
            } catch (error) {
              const err = error instanceof Error ? error : new Error('Error al parsear mapa');
              callbacks.onError?.(err);
              reject(err);
            }
          },
          onError: (error) => {
            callbacks.onError?.(error);
            reject(error);
          }
        }
      );
    });
  }

  private buildConceptMapPrompt(notes: Array<{ title: string; content: string }>): string {
    let prompt = `Analiza las siguientes notas y genera un mapa de conceptos que muestre las relaciones entre las ideas principales.

INSTRUCCIONES:
1. Identifica los conceptos principales y secundarios de todas las notas
2. Detecta relaciones entre conceptos (causales, jerárquicas, asociativas)
3. Identifica temas transversales que conectan múltiples notas
4. Cuenta cuántas veces se menciona cada concepto

RESPONDE ÚNICAMENTE con JSON válido:
{
  "concepts": [
    {
      "name": "Nombre del concepto",
      "type": "principal|secundario",
      "noteSource": "Título de nota donde aparece principalmente",
      "mentions": 3
    }
  ],
  "relations": [
    {
      "from": "Concepto A",
      "to": "Concepto B",
      "type": "causa|parte-de|relacionado|prerequisito",
      "description": "Breve descripción de la relación"
    }
  ],
  "themes": ["Tema transversal 1", "Tema transversal 2"]
}

---

NOTAS A ANALIZAR:

`;

    for (const note of notes) {
      prompt += `### ${note.title}\n\n${note.content}\n\n---\n\n`;
    }

    return prompt;
  }

  private parseConceptMapResponse(response: string): Partial<ConceptMap> {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se encontró JSON válido en la respuesta');
    }

    return JSON.parse(jsonMatch[0]);
  }

  async saveAsNote(map: ConceptMap, outputPath?: string): Promise<TFile> {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${map.title}.md`;
    const folder = outputPath || this.plugin.settings.notesFolder;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    if (folder && !this.plugin.app.vault.getAbstractFileByPath(folder)) {
      await this.plugin.app.vault.createFolder(folder);
    }

    const content = this.formatConceptMap(map);
    const file = await this.plugin.app.vault.create(filePath, content);

    await this.plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
      frontmatter.created = timestamp;
      frontmatter.type = 'concept-map';
      frontmatter.source = 'claude-analysis';
      frontmatter.themes = map.themes;
    });

    return file;
  }

  private formatConceptMap(map: ConceptMap): string {
    let content = `# ${map.title}\n\n`;
    content += `> Mapa de conceptos generado a partir de ${map.sourceNotes.length} notas\n\n`;

    // Notas fuente
    content += `## Notas analizadas\n\n`;
    for (const note of map.sourceNotes) {
      content += `- [[${note}]]\n`;
    }
    content += `\n`;

    // Temas transversales
    if (map.themes.length > 0) {
      content += `## Temas transversales\n\n`;
      for (const theme of map.themes) {
        content += `- ${theme}\n`;
      }
      content += `\n`;
    }

    // Conceptos principales
    const mainConcepts = map.concepts.filter(c => c.type === 'principal');
    if (mainConcepts.length > 0) {
      content += `## Conceptos principales\n\n`;
      for (const concept of mainConcepts) {
        content += `### ${concept.name}\n\n`;
        if (concept.noteSource) {
          content += `- **Fuente principal:** [[${concept.noteSource}]]\n`;
        }
        content += `- **Menciones:** ${concept.mentions}\n`;

        // Relaciones de este concepto
        const relations = map.relations.filter(r => r.from === concept.name || r.to === concept.name);
        if (relations.length > 0) {
          content += `- **Relaciones:**\n`;
          for (const rel of relations) {
            const other = rel.from === concept.name ? rel.to : rel.from;
            const direction = rel.from === concept.name ? '→' : '←';
            content += `  - ${direction} ${other} (${rel.type})${rel.description ? ': ' + rel.description : ''}\n`;
          }
        }
        content += `\n`;
      }
    }

    // Conceptos secundarios
    const secondaryConcepts = map.concepts.filter(c => c.type === 'secundario');
    if (secondaryConcepts.length > 0) {
      content += `## Conceptos secundarios\n\n`;
      for (const concept of secondaryConcepts) {
        content += `- **${concept.name}**`;
        if (concept.noteSource) {
          content += ` (de [[${concept.noteSource}]])`;
        }
        content += `\n`;
      }
      content += `\n`;
    }

    // Grafo de relaciones en formato Mermaid
    if (map.relations.length > 0) {
      content += `## Grafo de relaciones\n\n`;
      content += '```mermaid\ngraph TD\n';
      for (const rel of map.relations) {
        const fromId = this.sanitizeId(rel.from);
        const toId = this.sanitizeId(rel.to);
        const arrow = rel.type === 'causa' ? '-->' : rel.type === 'parte-de' ? '-..->' : '---';
        content += `    ${fromId}["${rel.from}"] ${arrow} ${toId}["${rel.to}"]\n`;
      }
      content += '```\n\n';
    }

    content += `---\n*Generado con Claude Companion by Enigmora - ${map.generatedAt.split('T')[0]}*\n`;

    return content;
  }

  private sanitizeId(text: string): string {
    return text.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
  }
}
