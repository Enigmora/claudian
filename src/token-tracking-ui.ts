/**
 * TokenTrackingUI - Manages token usage display and tracking UI
 *
 * Extracted from chat-view.ts to reduce complexity.
 * Handles the footer showing token counts and history access.
 */

import { App } from 'obsidian';
import { t } from './i18n';
import type ClaudeCompanionPlugin from './main';
import type { TokenUsage, SessionTokenStats } from './token-tracker';

/**
 * Manages token tracking UI elements and subscriptions
 */
export class TokenTrackingUI {
  private tokenFooter: HTMLElement | null = null;
  private tokenIndicator: HTMLElement | null = null;
  private tokenUsageCleanup: (() => void) | null = null;

  constructor(
    private app: App,
    private plugin: ClaudeCompanionPlugin,
    private containerEl: HTMLElement
  ) {}

  /**
   * Initialize the token tracking UI
   */
  initialize(): void {
    this.createTokenFooter();
    this.setupTokenTracking();
  }

  /**
   * Cleanup subscriptions when view closes
   */
  cleanup(): void {
    if (this.tokenUsageCleanup) {
      this.tokenUsageCleanup();
      this.tokenUsageCleanup = null;
    }
  }

  /**
   * Track token usage via the plugin's tracker
   */
  trackUsage(usage: TokenUsage): void {
    const tracker = this.plugin.tokenTracker;
    if (tracker) {
      tracker.trackUsage(usage);
    }
  }

  /**
   * Update token footer visibility based on settings
   * Public method to allow settings to trigger updates
   */
  updateVisibility(): void {
    if (!this.tokenFooter) return;

    if (this.plugin.settings.showTokenIndicator) {
      this.tokenFooter.removeClass('hidden');
    } else {
      this.tokenFooter.addClass('hidden');
    }
  }

  /**
   * Update token footer labels when language changes
   */
  updateLanguage(): void {
    if (!this.tokenIndicator) return;

    const inputLabel = this.tokenIndicator.querySelector('.token-input .token-label');
    if (inputLabel) {
      inputLabel.setText(t('tokens.inputLabel') + ': ');
    }

    const outputLabel = this.tokenIndicator.querySelector('.token-output .token-label');
    if (outputLabel) {
      outputLabel.setText(t('tokens.outputLabel') + ': ');
    }

    const callsLabel = this.tokenIndicator.querySelector('.token-calls .token-label');
    if (callsLabel) {
      callsLabel.setText(t('tokens.callsLabel') + ': ');
    }

    const historyLink = this.tokenIndicator.querySelector('.token-history-link');
    if (historyLink) {
      historyLink.setText(t('tokens.historyLink'));
    }
  }

  /**
   * Create the token usage footer element
   */
  private createTokenFooter(): void {
    this.tokenFooter = this.containerEl.createDiv({ cls: 'claudian-token-footer' });

    // Token indicator
    this.tokenIndicator = this.tokenFooter.createDiv({ cls: 'claudian-token-indicator' });

    // Input tokens
    const inputSpan = this.tokenIndicator.createSpan({ cls: 'token-stat token-input' });
    inputSpan.createSpan({ cls: 'token-label', text: t('tokens.inputLabel') + ': ' });
    inputSpan.createSpan({ cls: 'token-value', text: '0' });

    // Separator
    this.tokenIndicator.createSpan({ cls: 'token-separator', text: '|' });

    // Output tokens
    const outputSpan = this.tokenIndicator.createSpan({ cls: 'token-stat token-output' });
    outputSpan.createSpan({ cls: 'token-label', text: t('tokens.outputLabel') + ': ' });
    outputSpan.createSpan({ cls: 'token-value', text: '0' });

    // Separator
    this.tokenIndicator.createSpan({ cls: 'token-separator', text: '|' });

    // Calls
    const callsSpan = this.tokenIndicator.createSpan({ cls: 'token-stat token-calls' });
    callsSpan.createSpan({ cls: 'token-label', text: t('tokens.callsLabel') + ': ' });
    callsSpan.createSpan({ cls: 'token-value', text: '0' });

    // Separator
    this.tokenIndicator.createSpan({ cls: 'token-separator', text: '|' });

    // Separator
    this.tokenIndicator.createSpan({ cls: 'token-separator', text: '|' });

    // History link
    const historyLink = this.tokenIndicator.createSpan({ cls: 'token-history-link' });
    historyLink.setText(t('tokens.historyLink'));
    historyLink.onclick = () => this.openTokenHistoryModal();

    // Initial visibility based on settings
    this.updateVisibility();
  }

  /**
   * Setup token tracking subscription
   */
  private setupTokenTracking(): void {
    const tracker = this.plugin.tokenTracker;
    if (!tracker) return;

    // Subscribe to usage updates
    this.tokenUsageCleanup = tracker.onUsageUpdate((stats) => {
      this.updateTokenIndicator(stats);
    });

    // Show current session stats
    const currentStats = tracker.getSessionStats();
    this.updateTokenIndicator(currentStats);
  }

  /**
   * Update the token indicator with new stats
   */
  private updateTokenIndicator(stats: SessionTokenStats): void {
    if (!this.tokenIndicator) return;

    const tracker = this.plugin.tokenTracker;

    // Update input value
    const inputValue = this.tokenIndicator.querySelector('.token-input .token-value');
    if (inputValue) {
      inputValue.setText(tracker ? tracker.formatTokenCount(stats.inputTokens) : String(stats.inputTokens));
    }

    // Update output value
    const outputValue = this.tokenIndicator.querySelector('.token-output .token-value');
    if (outputValue) {
      outputValue.setText(tracker ? tracker.formatTokenCount(stats.outputTokens) : String(stats.outputTokens));
    }

    // Update calls value
    const callsValue = this.tokenIndicator.querySelector('.token-calls .token-value');
    if (callsValue) {
      callsValue.setText(String(stats.callCount));
    }

    // Add pulse animation on update
    this.tokenIndicator.addClass('pulse');
    setTimeout(() => {
      this.tokenIndicator?.removeClass('pulse');
    }, 500);

    // Update visibility in case settings changed
    this.updateVisibility();
  }

  /**
   * Open the token history modal with animated bar chart
   */
  private openTokenHistoryModal(): void {
    const { TokenHistoryModal } = require('./token-history-modal');
    new TokenHistoryModal(this.app, this.plugin).open();
  }
}
