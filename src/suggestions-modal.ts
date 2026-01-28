import { Modal, TFile } from 'obsidian';
import ClaudianPlugin from './main';
import { NoteProcessor, ValidatedSuggestions } from './note-processor';
import { t } from './i18n';

export class SuggestionsModal extends Modal {
  private plugin: ClaudianPlugin;
  private processor: NoteProcessor;
  private suggestions: ValidatedSuggestions;
  private file: TFile;
  private selectedTags: Set<string> = new Set();
  private selectedWikilinks: Set<number> = new Set();

  constructor(
    plugin: ClaudianPlugin,
    processor: NoteProcessor,
    suggestions: ValidatedSuggestions,
    file: TFile
  ) {
    super(plugin.app);
    this.plugin = plugin;
    this.processor = processor;
    this.suggestions = suggestions;
    this.file = file;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('suggestions-modal');

    contentEl.createEl('h2', { text: t('suggestions.title') });

    if (this.suggestions.reasoning) {
      const reasoningEl = contentEl.createDiv({ cls: 'suggestions-reasoning' });
      reasoningEl.createEl('p', { text: this.suggestions.reasoning });
    }

    this.renderTagsSection(contentEl);
    this.renderWikilinksSection(contentEl);
    this.renderAtomicConceptsSection(contentEl);
  }

  private renderTagsSection(container: HTMLElement) {
    const section = container.createDiv({ cls: 'suggestions-section' });
    section.createEl('h3', { text: t('suggestions.tags') });

    if (this.suggestions.tags.length === 0) {
      section.createEl('p', { text: t('suggestions.tagsEmpty'), cls: 'suggestions-empty' });
      return;
    }

    const tagsContainer = section.createDiv({ cls: 'suggestions-tags-container' });

    this.suggestions.tags.forEach(tag => {
      const tagEl = tagsContainer.createDiv({ cls: 'suggestions-tag' });
      tagEl.textContent = `#${tag}`;
      tagEl.addEventListener('click', () => {
        if (this.selectedTags.has(tag)) {
          this.selectedTags.delete(tag);
          tagEl.removeClass('is-selected');
        } else {
          this.selectedTags.add(tag);
          tagEl.addClass('is-selected');
        }
      });
    });

    const actionsRow = section.createDiv({ cls: 'suggestions-actions' });

    const selectAllBtn = actionsRow.createEl('button', {
      text: t('suggestions.selectAll'),
      cls: 'suggestions-btn-secondary'
    });
    selectAllBtn.addEventListener('click', () => {
      this.suggestions.tags.forEach(tag => this.selectedTags.add(tag));
      tagsContainer.querySelectorAll('.suggestions-tag').forEach(el => {
        el.addClass('is-selected');
      });
    });

    const applyBtn = actionsRow.createEl('button', {
      text: t('suggestions.applySelected'),
      cls: 'suggestions-btn-primary'
    });
    applyBtn.addEventListener('click', async () => {
      if (this.selectedTags.size > 0) {
        await this.processor.applyTags(this.file, Array.from(this.selectedTags));
        this.selectedTags.clear();
        tagsContainer.querySelectorAll('.suggestions-tag').forEach(el => {
          el.removeClass('is-selected');
        });
      }
    });
  }

  private renderWikilinksSection(container: HTMLElement) {
    const section = container.createDiv({ cls: 'suggestions-section' });
    section.createEl('h3', { text: t('suggestions.wikilinks') });

    if (this.suggestions.wikilinks.length === 0) {
      section.createEl('p', { text: t('suggestions.wikilinksEmpty'), cls: 'suggestions-empty' });
      return;
    }

    const wikilinksContainer = section.createDiv({ cls: 'suggestions-wikilinks-container' });

    this.suggestions.wikilinks.forEach((wl, index) => {
      const row = wikilinksContainer.createDiv({ cls: 'suggestions-wikilink-row' });

      const checkbox = row.createEl('input', { type: 'checkbox' });
      checkbox.id = `wikilink-${index}`;
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          this.selectedWikilinks.add(index);
        } else {
          this.selectedWikilinks.delete(index);
        }
      });

      const label = row.createEl('label');
      label.setAttribute('for', `wikilink-${index}`);

      const linkText = label.createSpan({ cls: 'suggestions-wikilink-target' });
      linkText.textContent = `[[${wl.target}]]`;

      if (wl.exists) {
        const existsBadge = label.createSpan({ cls: 'suggestions-badge suggestions-badge-exists' });
        existsBadge.textContent = t('suggestions.badgeExists');
      } else {
        const newBadge = label.createSpan({ cls: 'suggestions-badge suggestions-badge-new' });
        newBadge.textContent = t('suggestions.badgeNew');
      }

      const contextEl = row.createDiv({ cls: 'suggestions-wikilink-context' });
      contextEl.textContent = wl.context;
    });

    const actionsRow = section.createDiv({ cls: 'suggestions-actions' });

    const selectExistingBtn = actionsRow.createEl('button', {
      text: t('suggestions.selectExisting'),
      cls: 'suggestions-btn-secondary'
    });
    selectExistingBtn.addEventListener('click', () => {
      this.suggestions.wikilinks.forEach((wl, index) => {
        if (wl.exists) {
          this.selectedWikilinks.add(index);
          const checkbox = wikilinksContainer.querySelector(`#wikilink-${index}`) as HTMLInputElement;
          if (checkbox) checkbox.checked = true;
        }
      });
    });

    const insertBtn = actionsRow.createEl('button', {
      text: t('suggestions.insertSelected'),
      cls: 'suggestions-btn-primary'
    });
    insertBtn.addEventListener('click', async () => {
      if (this.selectedWikilinks.size > 0) {
        const wikilinks = Array.from(this.selectedWikilinks)
          .map(idx => this.suggestions.wikilinks[idx]);
        await this.processor.insertWikilinks(this.file, wikilinks);
        this.selectedWikilinks.clear();
        wikilinksContainer.querySelectorAll('input[type="checkbox"]').forEach((el) => {
          (el as HTMLInputElement).checked = false;
        });
      }
    });
  }

  private renderAtomicConceptsSection(container: HTMLElement) {
    const section = container.createDiv({ cls: 'suggestions-section' });
    section.createEl('h3', { text: t('suggestions.atomicConcepts') });

    if (this.suggestions.atomicConcepts.length === 0) {
      section.createEl('p', { text: t('suggestions.atomicConceptsEmpty'), cls: 'suggestions-empty' });
      return;
    }

    const conceptsContainer = section.createDiv({ cls: 'suggestions-concepts-container' });

    this.suggestions.atomicConcepts.forEach(concept => {
      const card = conceptsContainer.createDiv({ cls: 'suggestions-concept-card' });

      const header = card.createDiv({ cls: 'suggestions-concept-header' });
      header.createEl('h4', { text: concept.title });

      const summary = card.createDiv({ cls: 'suggestions-concept-summary' });
      summary.textContent = concept.summary;

      const actions = card.createDiv({ cls: 'suggestions-concept-actions' });

      const previewBtn = actions.createEl('button', {
        text: t('suggestions.viewContent'),
        cls: 'suggestions-btn-secondary'
      });
      previewBtn.addEventListener('click', () => {
        const previewEl = card.querySelector('.suggestions-concept-preview');
        if (previewEl) {
          previewEl.remove();
        } else {
          const preview = card.createDiv({ cls: 'suggestions-concept-preview' });
          preview.createEl('pre', { text: concept.content });
        }
      });

      const createBtn = actions.createEl('button', {
        text: t('suggestions.createNote'),
        cls: 'suggestions-btn-primary'
      });
      createBtn.addEventListener('click', async () => {
        await this.processor.createAtomicNote(concept);
        card.addClass('is-created');
        createBtn.textContent = t('suggestions.noteCreated');
        createBtn.disabled = true;
      });
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
