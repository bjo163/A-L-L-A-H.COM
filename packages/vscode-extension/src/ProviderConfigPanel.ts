/**
 * Provider Configuration Webview Panel
 * Manages the UI for configuring AI provider credentials
 */

import * as vscode from 'vscode';
import path from 'path';
import { ProviderRegistry } from './providers';
import { CredentialManager } from './services/CredentialManager';

export class ProviderConfigPanel implements vscode.WebviewViewProvider {
  public static readonly viewType = 'allah.views.providerConfig';

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly credentialManager: CredentialManager
  ) {}

  async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken
  ): Promise<void> {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    webviewView.webview.html = this.getHtmlContent(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message: unknown) => {
      if (!this.isRecord(message)) return;

      if (message.type === 'ready') {
        await this.handleReady(webviewView);
      } else if (message.type === 'testProvider') {
        await this.handleTestProvider(webviewView, message);
      } else if (message.type === 'saveProvider') {
        await this.handleSaveProvider(message);
      } else if (message.type === 'clearProvider') {
        await this.handleClearProvider(webviewView, message);
      } else if (message.type === 'exportCredentials') {
        await this.handleExportCredentials();
      } else if (message.type === 'importCredentials') {
        await this.handleImportCredentials();
      } else if (message.type === 'openLink') {
        if (typeof message.url === 'string') {
          vscode.env.openExternal(vscode.Uri.parse(message.url));
        }
      }
    });
  }

  private async handleReady(webviewView: vscode.WebviewView): Promise<void> {
    const registry = ProviderRegistry.getInstance();
    const providers = registry.getConfiguredProviders();

    for (const { id } of providers) {
      webviewView.webview.postMessage({
        type: 'credentialStatus',
        provider: id,
        configured: true,
      });
    }
  }

  private async handleTestProvider(webviewView: vscode.WebviewView, message: any): Promise<void> {
    const provider = message.provider as string;
    const credential = message.credential as string;

    // Validate format
    const validation = this.credentialManager.validateCredentialFormat(provider, credential);
    if (!validation.valid) {
      webviewView.webview.postMessage({
        type: 'testResult',
        provider,
        success: false,
        error: validation.message || 'Invalid credential format',
      });
      return;
    }

    try {
      // Create provider and test credentials
      const registry = ProviderRegistry.getInstance();
      const credsToRegister: any = {};

      if (provider === 'moonwitness') {
        const config = JSON.parse(credential);
        credsToRegister.moonwitness = {
          baseUrl: config.url,
          virtualKey: config.key,
        };
      } else {
        credsToRegister[provider] = credential;
      }

      registry.registerCredentials(credsToRegister);
      const testProvider = registry.getProvider(provider as any);

      if (!testProvider) {
        throw new Error('Provider not available');
      }

      const isValid = await testProvider.validateCredentials();

      if (!isValid) {
        throw new Error('Credential validation failed');
      }

      webviewView.webview.postMessage({
        type: 'testResult',
        provider,
        success: true,
      });
    } catch (error) {
      webviewView.webview.postMessage({
        type: 'testResult',
        provider,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async handleSaveProvider(message: any): Promise<void> {
    const provider = message.provider as string;
    const credential = message.credential as string;

    try {
      await this.credentialManager.storeCredential(provider, credential);
    } catch (error) {
      console.error(`Failed to save ${provider} credential:`, error);
    }
  }

  private async handleClearProvider(webviewView: vscode.WebviewView, message: any): Promise<void> {
    const provider = message.provider as string;

    try {
      await this.credentialManager.deleteCredential(provider);
      webviewView.webview.postMessage({
        type: 'credentialStatus',
        provider,
        configured: false,
      });
    } catch (error) {
      console.error(`Failed to clear ${provider} credential:`, error);
    }
  }

  private async handleExportCredentials(): Promise<void> {
    try {
      const bundle = await this.credentialManager.exportCredentialsBundle();

      // Offer download
      const fileName = `moonwitness-credentials-${Date.now()}.txt`;
      const fileUri = vscode.Uri.file(path.join(vscode.workspace.rootPath || '', fileName));

      // Note: In real implementation, we'd save to temp location or clipboard
      vscode.window.showInformationMessage(
        `Credentials exported. Length: ${bundle.length} characters. (Copy to clipboard or save to file)`
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Export failed: ${error instanceof Error ? error.message : 'unknown'}`
      );
    }
  }

  private async handleImportCredentials(): Promise<void> {
    try {
      const files = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        title: 'Import Credentials Bundle',
      });

      if (files && files.length > 0) {
        const content = await vscode.workspace.fs.readFile(files[0]);
        const bundleBase64 = new TextDecoder().decode(content);

        const result = await this.credentialManager.importCredentialsBundle(bundleBase64);
        vscode.window.showInformationMessage(
          `Imported credentials: ${result.success} success, ${result.failed} failed`
        );
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Import failed: ${error instanceof Error ? error.message : 'unknown'}`
      );
    }
  }

  private getHtmlContent(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webviews', 'provider-config.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webviews', 'provider-config.css')
    );

    const nonce = this.getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'">
    <title>Configure AI Providers</title>
    <link rel="stylesheet" href="${styleUri}">
</head>
<body>
    <div class="container">
        <h1>🤖 Configure AI Providers</h1>
        <p class="subtitle">Add or update API credentials for AI providers</p>
        <div id="messageContainer"></div>

        <div class="provider-section">
            <h2>Active Providers</h2>
            <div id="providers-list"></div>
        </div>
    </div>
    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        vscode.postMessage({ type: 'ready' });
    </script>
</body>
</html>`;
  }

  private getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
