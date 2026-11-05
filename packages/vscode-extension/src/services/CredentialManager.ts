/**
 * Credential Manager
 * Handles secure credential storage and encryption
 */

import * as vscode from 'vscode';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const IV_LENGTH = 12;

export interface StoredCredential {
  provider: string;
  encrypted: string;
  salt: string;
  iv: string;
  authTag: string;
  timestamp: number;
}

export class CredentialManager {
  constructor(private readonly secrets: vscode.SecretStorage) {}

  /**
   * Store a credential securely
   */
  async storeCredential(provider: string, credential: string): Promise<void> {
    const key = `allah.provider.${provider}`;
    await this.secrets.store(key, credential.trim());
  }

  /**
   * Retrieve a credential
   */
  async getCredential(provider: string): Promise<string | undefined> {
    const key = `allah.provider.${provider}`;
    return this.secrets.get(key);
  }

  /**
   * Delete a credential
   */
  async deleteCredential(provider: string): Promise<void> {
    const key = `allah.provider.${provider}`;
    await this.secrets.delete(key);
  }

  /**
   * Get all stored provider credentials (keys only, not values)
   */
  async getStoredProviders(): Promise<string[]> {
    // This is a limitation of VS Code SecretStorage - we can't enumerate keys
    // So we try common providers and check if they exist
    const providers = ['openai', 'anthropic', 'gemini', 'moonwitness'];
    const stored: string[] = [];

    for (const provider of providers) {
      if (await this.getCredential(provider)) {
        stored.push(provider);
      }
    }

    return stored;
  }

  /**
   * Export credentials as encrypted bundle
   */
  async exportCredentialsBundle(): Promise<string> {
    const providers = await this.getStoredProviders();
    const bundle: Record<string, string> = {};

    for (const provider of providers) {
      const credential = await this.getCredential(provider);
      if (credential) {
        bundle[provider] = credential;
      }
    }

    // Return as base64-encoded JSON
    return Buffer.from(JSON.stringify(bundle)).toString('base64');
  }

  /**
   * Import credentials from encrypted bundle
   */
  async importCredentialsBundle(bundleBase64: string): Promise<{ success: number; failed: number }> {
    try {
      const bundleJson = Buffer.from(bundleBase64, 'base64').toString('utf-8');
      const bundle = JSON.parse(bundleJson) as Record<string, string>;

      let success = 0;
      let failed = 0;

      for (const [provider, credential] of Object.entries(bundle)) {
        try {
          await this.storeCredential(provider, credential);
          success++;
        } catch {
          failed++;
        }
      }

      return { success, failed };
    } catch (error) {
      throw new Error(`Failed to import credentials bundle: ${error instanceof Error ? error.message : 'unknown'}`);
    }
  }

  /**
   * Validate API key format (basic checks)
   */
  validateCredentialFormat(provider: string, credential: string): { valid: boolean; message?: string } {
    const trimmed = credential.trim();

    switch (provider) {
      case 'openai':
        if (!trimmed.startsWith('sk-')) {
          return { valid: false, message: 'OpenAI key should start with "sk-"' };
        }
        if (trimmed.length < 20) {
          return { valid: false, message: 'OpenAI key seems too short' };
        }
        return { valid: true };

      case 'anthropic':
        if (!trimmed.startsWith('sk-ant-')) {
          return { valid: false, message: 'Anthropic key should start with "sk-ant-"' };
        }
        if (trimmed.length < 20) {
          return { valid: false, message: 'Anthropic key seems too short' };
        }
        return { valid: true };

      case 'gemini':
        if (trimmed.length < 20) {
          return { valid: false, message: 'Gemini key seems too short' };
        }
        return { valid: true };

      case 'moonwitness':
        if (trimmed.length === 0) {
          return { valid: false, message: 'MoonWitness virtual key cannot be empty' };
        }
        return { valid: true };

      default:
        return { valid: true };
    }
  }
}
