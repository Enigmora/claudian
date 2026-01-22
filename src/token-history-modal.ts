/**
 * Token History Modal
 * Phase 5: Displays historical token usage with animated bar chart
 */

import { App, Modal } from 'obsidian';
import ClaudeCompanionPlugin from './main';
import { t } from './i18n';
import type { TokenStats } from './token-tracker';

interface HistoryItem {
  label: string;
  stats: TokenStats;
  percentage: number;
}

export class TokenHistoryModal extends Modal {
  private plugin: ClaudeCompanionPlugin;

  constructor(app: App, plugin: ClaudeCompanionPlugin) {
    super(app);
    this.plugin = plugin;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('token-history-modal');

    // Title
    contentEl.createEl('h2', { text: t('tokens.historyTitle') });

    // Get stats
    const tracker = this.plugin.tokenTracker;
    if (!tracker) {
      contentEl.createEl('p', { text: 'Token tracker not available' });
      return;
    }

    const today = tracker.getTodayStats();
    const week = tracker.getThisWeekStats();
    const month = tracker.getThisMonthStats();
    const allTime = tracker.getAllTimeStats();

    // Find max for percentage calculation
    const maxTokens = Math.max(
      today.totalTokens,
      week.totalTokens,
      month.totalTokens,
      allTime.totalTokens,
      1 // Prevent division by zero
    );

    const items: HistoryItem[] = [
      { label: t('tokens.today', { count: '' }).replace(': ', ''), stats: today, percentage: (today.totalTokens / maxTokens) * 100 },
      { label: t('tokens.week', { count: '' }).replace(': ', ''), stats: week, percentage: (week.totalTokens / maxTokens) * 100 },
      { label: t('tokens.month', { count: '' }).replace(': ', ''), stats: month, percentage: (month.totalTokens / maxTokens) * 100 },
      { label: t('tokens.allTime', { count: '' }).replace(': ', ''), stats: allTime, percentage: (allTime.totalTokens / maxTokens) * 100 }
    ];

    // Chart container
    const chartContainer = contentEl.createDiv({ cls: 'token-history-chart' });

    // Create bars with animation delay
    items.forEach((item, index) => {
      const row = chartContainer.createDiv({ cls: 'token-history-row' });

      // Label
      row.createDiv({ cls: 'token-history-label', text: item.label });

      // Bar container
      const barContainer = row.createDiv({ cls: 'token-history-bar-container' });

      // Animated bar
      const bar = barContainer.createDiv({ cls: 'token-history-bar' });
      bar.style.setProperty('--target-width', `${item.percentage}%`);
      bar.style.setProperty('--animation-delay', `${index * 0.15}s`);

      // Value
      const value = row.createDiv({ cls: 'token-history-value' });
      value.setText(tracker.formatTokenCount(item.stats.totalTokens));

      // Detailed stats on hover (via title attribute, simple approach)
      const detailText = `${t('tokens.inputLabel')}: ${tracker.formatTokenCount(item.stats.inputTokens)} | ${t('tokens.outputLabel')}: ${tracker.formatTokenCount(item.stats.outputTokens)} | ${t('tokens.callsLabel')}: ${item.stats.callCount}`;
      row.setAttribute('title', detailText);
    });

    // Session stats section
    const sessionSection = contentEl.createDiv({ cls: 'token-history-session' });
    sessionSection.createEl('h3', { text: t('tokens.sessionTitle') });

    const sessionStats = tracker.getSessionStats();
    const sessionGrid = sessionSection.createDiv({ cls: 'token-history-session-grid' });

    // Input
    const inputItem = sessionGrid.createDiv({ cls: 'token-history-session-item' });
    inputItem.createDiv({ cls: 'session-item-value', text: tracker.formatTokenCount(sessionStats.inputTokens) });
    inputItem.createDiv({ cls: 'session-item-label', text: t('tokens.inputLabel') });

    // Output
    const outputItem = sessionGrid.createDiv({ cls: 'token-history-session-item' });
    outputItem.createDiv({ cls: 'session-item-value', text: tracker.formatTokenCount(sessionStats.outputTokens) });
    outputItem.createDiv({ cls: 'session-item-label', text: t('tokens.outputLabel') });

    // Calls
    const callsItem = sessionGrid.createDiv({ cls: 'token-history-session-item' });
    callsItem.createDiv({ cls: 'session-item-value', text: String(sessionStats.callCount) });
    callsItem.createDiv({ cls: 'session-item-label', text: t('tokens.callsLabel') });

    // Total
    const totalItem = sessionGrid.createDiv({ cls: 'token-history-session-item' });
    totalItem.createDiv({ cls: 'session-item-value', text: tracker.formatTokenCount(sessionStats.totalTokens) });
    totalItem.createDiv({ cls: 'session-item-label', text: t('tokens.totalLabel') });

    // Close button
    const buttonContainer = contentEl.createDiv({ cls: 'token-history-buttons' });
    const closeBtn = buttonContainer.createEl('button', {
      cls: 'token-history-close-btn',
      text: t('tokens.closeButton')
    });
    closeBtn.onclick = () => this.close();
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
