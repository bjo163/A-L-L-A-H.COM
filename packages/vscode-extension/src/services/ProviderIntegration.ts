/**
 * Provider Integration Service
 * Bridges ProviderRegistry with extension lifecycle
 */

import * as vscode from 'vscode';
import { ProviderRegistry, type ProviderCredentials } from '../providers';
import { CredentialManager } from './CredentialManager';

export class ProviderIntegration {
  private static instance: ProviderIntegration;
  private registry = ProviderRegistry.getInstance();

  constructor(private readonly credentialManager: CredentialManager) {}

  static getInstance(credentialManager: CredentialManager): ProviderIntegration {
    if (!ProviderIntegration.instance) {
      ProviderIntegration.instance = new ProviderIntegration(credentialManager);
    }
    return ProviderIntegration.instance;
  }

  /**
   * Initialize provider registry with stored credentials
   */
  async initialize(): Promise<void> {
    try {
      const credentials = await this.loadStoredCredentials();
      if (Object.keys(credentials).length > 0) {
        this.registry.registerCredentials(credentials);
      }
    } catch (error) {
      console.error('Failed to initialize provider integration:', error);
    }
  }

  /**
   * Load all stored credentials from SecretStorage
   */
  private async loadStoredCredentials(): Promise<ProviderCredentials> {
    const credentials: ProviderCredentials = {};

    const openaiKey = await this.credentialManager.getCredential('openai');
    if (openaiKey) credentials.openai = openaiKey;

    const anthropicKey = await this.credentialManager.getCredential('anthropic');
    if (anthropicKey) credentials.anthropic = anthropicKey;

    const geminiKey = await this.credentialManager.getCredential('gemini');
    if (geminiKey) credentials.gemini = geminiKey;

    return credentials;
  }

  /**
   * Get the active registry
   */
  getRegistry(): ProviderRegistry {
    return this.registry;
  }

  /**
   * Get first available provider
   */
  async getFirstAvailableProvider(): Promise<any> {
    return this.registry.getFirstAvailableProvider();
  }

  /**
   * Get all available models
   */
  async getAllModels(): Promise<any> {
    return this.registry.getAllAvailableModels();
  }
}
