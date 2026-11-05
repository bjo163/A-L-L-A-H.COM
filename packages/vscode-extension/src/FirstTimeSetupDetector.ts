/**
 * First Time Setup Detector
 * Detects if user needs onboarding
 */

import * as vscode from 'vscode';
import { CredentialManager } from './services/CredentialManager';

export class FirstTimeSetupDetector {
  private readonly extensionVersion = '1.0.0';

  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * Check if user should see onboarding wizard
   */
  async shouldShowWizard(credentialManager: CredentialManager): Promise<boolean> {
    // Check if wizard already completed
    const wizardCompleted = this.context.globalState.get<boolean>('allah.wizardCompleted');
    if (wizardCompleted) {
      return false;
    }

    // Check if any credentials are configured
    const providers = await credentialManager.getStoredProviders();
    if (providers.length > 0) {
      // Has credentials, mark wizard as done
      await this.context.globalState.update('allah.wizardCompleted', true);
      return false;
    }

    return true;
  }

  /**
   * Record that wizard was shown
   */
  async markWizardShown(): Promise<void> {
    await this.context.globalState.update('allah.wizardCompleted', true);
  }

  /**
   * Reset wizard for testing
   */
  async resetWizard(): Promise<void> {
    await this.context.globalState.update('allah.wizardCompleted', undefined);
  }

  /**
   * Get current version
   */
  getCurrentVersion(): string {
    return this.context.extension.packageJSON.version || this.extensionVersion;
  }

  /**
   * Check if this is an upgrade
   */
  async isUpgrade(): Promise<boolean> {
    const lastVersion = this.context.globalState.get<string>('allah.lastVersion');
    const currentVersion = this.getCurrentVersion();

    if (!lastVersion) {
      await this.context.globalState.update('allah.lastVersion', currentVersion);
      return false;
    }

    if (lastVersion !== currentVersion) {
      await this.context.globalState.update('allah.lastVersion', currentVersion);
      return true;
    }

    return false;
  }
}
