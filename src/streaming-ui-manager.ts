/**
 * StreamingUIManager - Manages streaming indicators and processing status UI
 *
 * Extracted from chat-view.ts to reduce complexity and improve maintainability.
 * Handles all visual feedback during streaming operations.
 */

import { t } from './i18n';
import type { ModelOrchestrator, RouteResult } from './model-orchestrator';

/**
 * Manages streaming UI indicators and processing status overlays
 */
export class StreamingUIManager {
  constructor(private orchestrator: ModelOrchestrator) {}

  /**
   * Create a streaming indicator for agent responses
   * Shows real-time stats like character count and actions detected
   */
  createStreamingIndicator(container: HTMLElement): HTMLElement {
    const indicator = container.createDiv({ cls: 'agent-streaming-indicator' });

    // Header with spinner
    const header = indicator.createDiv({ cls: 'agent-streaming-header' });
    const spinner = header.createSpan({ cls: 'agent-streaming-spinner' });
    spinner.setText('⚙️');
    header.createSpan({ cls: 'agent-streaming-title', text: t('agent.generatingResponse') });

    // Stats container
    const stats = indicator.createDiv({ cls: 'agent-streaming-stats' });

    // Character count
    const charStat = stats.createDiv({ cls: 'agent-streaming-stat' });
    charStat.createSpan({ cls: 'stat-label', text: t('agent.streamingChars') });
    charStat.createSpan({ cls: 'stat-value chars-count', text: '0' });

    // Actions detected
    const actionsStat = stats.createDiv({ cls: 'agent-streaming-stat' });
    actionsStat.createSpan({ cls: 'stat-label', text: t('agent.streamingActions') });
    actionsStat.createSpan({ cls: 'stat-value actions-count', text: '0' });

    // Progress bar (indeterminate)
    const progressContainer = indicator.createDiv({ cls: 'agent-streaming-progress' });
    progressContainer.createDiv({ cls: 'agent-streaming-progress-bar' });

    // Collapsible raw preview (for debugging)
    const previewToggle = indicator.createDiv({ cls: 'agent-streaming-preview-toggle' });
    previewToggle.setText(t('agent.showRawResponse'));

    const previewContainer = indicator.createDiv({ cls: 'agent-streaming-preview hidden' });
    previewContainer.createEl('pre', { cls: 'agent-streaming-preview-content' });

    previewToggle.onclick = () => {
      previewContainer.classList.toggle('hidden');
      previewToggle.setText(
        previewContainer.classList.contains('hidden')
          ? t('agent.showRawResponse')
          : t('agent.hideRawResponse')
      );
    };

    return indicator;
  }

  /**
   * Update the streaming indicator with current response stats
   */
  updateStreamingIndicator(indicator: HTMLElement | null, response: string): void {
    if (!indicator) return;

    // Update character count
    const charsEl = indicator.querySelector('.chars-count');
    if (charsEl) {
      charsEl.setText(this.formatNumber(response.length));
    }

    // Count actions detected so far
    const actionsCount = (response.match(/"action"\s*:/g) || []).length;
    const actionsEl = indicator.querySelector('.actions-count');
    if (actionsEl) {
      actionsEl.setText(String(actionsCount));
    }

    // Update raw preview
    const previewContent = indicator.querySelector('.agent-streaming-preview-content');
    if (previewContent) {
      // Show last 500 chars to keep it manageable
      const previewText = response.length > 500
        ? '...' + response.slice(-500)
        : response;
      previewContent.setText(previewText);
    }
  }

  /**
   * Format large numbers with K/M suffix
   */
  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return String(num);
  }

  /**
   * Show processing overlay in place of input
   * Combines status message with model name for clarity
   */
  showProcessingStatus(
    overlay: HTMLElement | null,
    inputEl: HTMLTextAreaElement,
    statusKey: string,
    routeResult: RouteResult | null
  ): void {
    if (!overlay) return;

    // Get current model name
    const modelName = routeResult
      ? this.orchestrator.getSelector().getModelDisplayName(routeResult.model)
      : '';

    // Build combined message: "Waiting for response from Haiku 4.5..."
    const statusText = overlay.querySelector('.processing-text');
    if (statusText) {
      const baseStatus = t(statusKey as unknown);
      const fullStatus = modelName
        ? `${baseStatus.replace('...', '')} (${modelName})...`
        : baseStatus;
      statusText.setText(fullStatus);
    }

    // Show overlay and hide input
    overlay.removeClass('hidden');
    inputEl.addClass('hidden');
  }

  /**
   * Hide processing overlay and restore input
   */
  hideProcessingStatus(overlay: HTMLElement | null, inputEl: HTMLTextAreaElement): void {
    if (!overlay) return;
    overlay.addClass('hidden');
    inputEl.removeClass('hidden');
  }
}
