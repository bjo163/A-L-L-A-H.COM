/**
 * Onboarding Wizard
 * Interactive first-time setup for new users
 */

import * as vscode from 'vscode';
import { ProviderIntegration } from './services/ProviderIntegration';
import { CredentialManager } from './services/CredentialManager';

export class OnboardingWizardProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'allah.views.onboarding';

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly credentialManager: CredentialManager,
    private readonly providerIntegration: ProviderIntegration
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

    webviewView.webview.onDidReceiveMessage(async (message: any) => {
      if (message.type === 'getProviders') {
        webviewView.webview.postMessage({
          type: 'providers',
          data: [
            { id: 'openai', name: 'OpenAI (GPT-4)', icon: '🟢' },
            { id: 'anthropic', name: 'Anthropic (Claude)', icon: '🤖' },
            { id: 'gemini', name: 'Google Gemini', icon: '✨' },
            { id: 'ollama', name: 'Ollama (Local)', icon: '🦙' },
            { id: 'moonwitness', name: 'MoonWitness Gateway', icon: '🌙' },
          ],
        });
      } else if (message.type === 'saveApiKey') {
        try {
          const validation = this.credentialManager.validateCredentialFormat(
            message.provider,
            message.apiKey
          );
          if (!validation.valid) {
            webviewView.webview.postMessage({
              type: 'error',
              message: validation.message || 'Invalid API key format',
            });
            return;
          }

          await this.credentialManager.storeCredential(message.provider, message.apiKey);
          webviewView.webview.postMessage({
            type: 'success',
            message: `${message.provider} API key saved!`,
          });
        } catch (error) {
          webviewView.webview.postMessage({
            type: 'error',
            message: error instanceof Error ? error.message : 'Failed to save API key',
          });
        }
      } else if (message.type === 'completeWizard') {
        await this.context.globalState.update('allah.wizardCompleted', true);
        vscode.window.showInformationMessage('Welcome to MoonWitness! Happy coding 🚀');
      }
    });
  }

  private getHtmlContent(webview: vscode.Webview): string {
    const nonce = this.getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'">
    <title>Welcome to MoonWitness</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
            margin: 0;
        }

        .wizard-container {
            max-width: 600px;
            margin: 0 auto;
        }

        .step {
            display: none;
            animation: fadeIn 0.3s ease-in;
        }

        .step.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        .step-header {
            margin-bottom: 20px;
        }

        .step-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .step-subtitle {
            font-size: 14px;
            color: var(--vscode-descriptionForeground);
        }

        .provider-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 20px;
        }

        .provider-card {
            background: var(--vscode-editorGroup-border);
            border: 2px solid transparent;
            border-radius: 8px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
        }

        .provider-card:hover {
            border-color: var(--vscode-focusBorder);
            transform: translateY(-2px);
        }

        .provider-card.selected {
            border-color: var(--vscode-progressBar-background);
            background: rgba(76, 175, 80, 0.1);
        }

        .provider-icon {
            font-size: 32px;
            margin-bottom: 8px;
        }

        .provider-name {
            font-weight: 600;
            font-size: 13px;
        }

        .form-group {
            margin-bottom: 16px;
        }

        label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            margin-bottom: 6px;
        }

        input[type="password"],
        input[type="text"] {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid var(--vscode-editorGroup-border);
            border-radius: 4px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-size: 13px;
        }

        input:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
            box-shadow: 0 0 0 1px var(--vscode-focusBorder);
        }

        .button-group {
            display: flex;
            gap: 8px;
            justify-content: space-between;
            margin-top: 20px;
        }

        button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .btn-primary {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            flex: 1;
        }

        .btn-primary:hover {
            opacity: 0.9;
        }

        .btn-secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .message {
            padding: 10px 12px;
            border-radius: 4px;
            font-size: 12px;
            margin-bottom: 16px;
            display: none;
        }

        .message.success {
            display: block;
            background: rgba(76, 175, 80, 0.2);
            color: var(--vscode-testing-runAction);
            border: 1px solid var(--vscode-testing-runAction);
        }

        .message.error {
            display: block;
            background: rgba(244, 67, 54, 0.2);
            color: var(--vscode-statusBarItem-errorForeground);
            border: 1px solid var(--vscode-statusBarItem-errorBackground);
        }

        .progress-bar {
            height: 4px;
            background: var(--vscode-editorGroup-border);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 20px;
        }

        .progress-fill {
            height: 100%;
            background: var(--vscode-progressBar-background);
            width: 0%;
            transition: width 0.3s;
        }

        .checkbox {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }

        input[type="checkbox"] {
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="wizard-container">
        <!-- Step 1: Welcome -->
        <div class="step active" data-step="1">
            <div class="step-header">
                <div class="step-title">👋 Welcome to MoonWitness</div>
                <div class="step-subtitle">AI-powered development companion for VS Code</div>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width: 20%;"></div></div>

            <p style="color: var(--vscode-descriptionForeground); line-height: 1.6;">
                MoonWitness helps you write, understand, and debug code using the power of AI.
                Choose your preferred AI provider and get started in seconds.
            </p>

            <div class="button-group">
                <button class="btn-primary" onclick="nextStep(2)">Get Started →</button>
            </div>
        </div>

        <!-- Step 2: Provider Selection -->
        <div class="step" data-step="2">
            <div class="step-header">
                <div class="step-title">🤖 Choose Your AI Provider</div>
                <div class="step-subtitle">Pick the AI model provider you prefer</div>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width: 40%;"></div></div>

            <div id="providerGrid" class="provider-grid"></div>

            <div class="button-group">
                <button class="btn-secondary" onclick="prevStep(1)">← Back</button>
                <button class="btn-primary" onclick="nextStep(3)" id="nextBtn" disabled>Next →</button>
            </div>
        </div>

        <!-- Step 3: API Key Input -->
        <div class="step" data-step="3">
            <div class="step-header">
                <div class="step-title">🔑 Add Your API Key</div>
                <div class="step-subtitle" id="apiKeySubtitle">Enter your API key securely</div>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width: 60%;"></div></div>

            <div id="messageContainer"></div>

            <div class="form-group">
                <label for="apiKey">API Key</label>
                <input type="password" id="apiKey" placeholder="sk-..." />
            </div>

            <div class="checkbox">
                <input type="checkbox" id="showKey" onchange="toggleKeyVisibility()" />
                <label for="showKey" style="margin: 0;">Show API key</label>
            </div>

            <div class="button-group">
                <button class="btn-secondary" onclick="prevStep(2)">← Back</button>
                <button class="btn-primary" onclick="saveApiKey()">Save & Continue →</button>
            </div>
        </div>

        <!-- Step 4: Completion -->
        <div class="step" data-step="4">
            <div class="step-header">
                <div class="step-title">🎉 You're All Set!</div>
                <div class="step-subtitle">Ready to code smarter</div>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width: 100%;"></div></div>

            <p style="color: var(--vscode-descriptionForeground); line-height: 1.6; margin-bottom: 20px;">
                Your MoonWitness extension is now configured and ready to use.
                Start by opening the "Workspace Agent" panel to run your first mission.
            </p>

            <div class="button-group">
                <button class="btn-primary" onclick="completeWizard()">Start Using MoonWitness 🚀</button>
            </div>
        </div>
    </div>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        let selectedProvider = null;

        function nextStep(step) {
            document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
            document.querySelector(\`[data-step="\${step}"]\`).classList.add('active');

            if (step === 2) {
                vscode.postMessage({ type: 'getProviders' });
            }
        }

        function prevStep(step) {
            nextStep(step);
        }

        function selectProvider(providerId) {
            selectedProvider = providerId;
            document.querySelectorAll('.provider-card').forEach(el => el.classList.remove('selected'));
            event.target.closest('.provider-card').classList.add('selected');
            document.getElementById('nextBtn').disabled = false;
        }

        function toggleKeyVisibility() {
            const input = document.getElementById('apiKey');
            input.type = input.type === 'password' ? 'text' : 'password';
        }

        function saveApiKey() {
            const apiKey = document.getElementById('apiKey').value.trim();
            if (!apiKey) {
                showMessage('Please enter your API key', 'error');
                return;
            }
            vscode.postMessage({
                type: 'saveApiKey',
                provider: selectedProvider,
                apiKey,
            });
        }

        function completeWizard() {
            vscode.postMessage({ type: 'completeWizard' });
        }

        function showMessage(text, type) {
            const container = document.getElementById('messageContainer');
            const message = document.createElement('div');
            message.className = \`message \${type}\`;
            message.textContent = text;
            container.innerHTML = '';
            container.appendChild(message);

            if (type === 'success') {
                setTimeout(() => nextStep(4), 1500);
            }
        }

        window.addEventListener('message', (event) => {
            const message = event.data;

            if (message.type === 'providers') {
                const grid = document.getElementById('providerGrid');
                grid.innerHTML = message.data.map(p => \`
                    <div class="provider-card" onclick="selectProvider('\${p.id}')">
                        <div class="provider-icon">\${p.icon}</div>
                        <div class="provider-name">\${p.name}</div>
                    </div>
                \`).join('');
            } else if (message.type === 'success') {
                showMessage(message.message, 'success');
            } else if (message.type === 'error') {
                showMessage(message.message, 'error');
            }
        });
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
}
