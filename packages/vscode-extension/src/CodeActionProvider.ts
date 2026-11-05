/**
 * Code Action Provider
 * Provides inline agent suggestions for common fixes
 */

import * as vscode from 'vscode';
import { EnhancedClientWrapper } from './services/EnhancedClientWrapper';

export class AgentCodeActionProvider implements vscode.CodeActionProvider {
  constructor(private readonly client: EnhancedClientWrapper) {}

  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];

    // Check for diagnostics in this range
    for (const diagnostic of context.diagnostics) {
      if (diagnostic.range.intersection(range)) {
        const fixes = await this.createFixActions(document, diagnostic, token);
        actions.push(...fixes);
      }
    }

    // Suggest code improvements for selected text
    if (!range.isEmpty) {
      const selectedText = document.getText(range);
      actions.push(this.createAskAgentAction('Explain this code', document, range, selectedText));
      actions.push(this.createAskAgentAction('Refactor this code', document, range, selectedText));
      actions.push(this.createAskAgentAction('Add tests for this', document, range, selectedText));
    }

    return actions;
  }

  private async createFixActions(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    token: vscode.CancellationToken
  ): Promise<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];
    const message = diagnostic.message.toLowerCase();

    // TypeScript errors
    if (message.includes('cannot find name')) {
      actions.push(
        this.createAskAgentAction(
          'Fix undefined variable',
          document,
          diagnostic.range,
          document.getText(diagnostic.range)
        )
      );
    }

    // Type errors
    if (message.includes('type') && message.includes('not assignable')) {
      actions.push(
        this.createAskAgentAction(
          'Fix type error',
          document,
          diagnostic.range,
          document.getText(diagnostic.range)
        )
      );
    }

    // Unused variables
    if (message.includes('unused')) {
      actions.push(
        this.createAskAgentAction(
          'Remove unused variable',
          document,
          diagnostic.range,
          document.getText(diagnostic.range)
        )
      );
    }

    // Missing return
    if (message.includes('missing return')) {
      actions.push(
        this.createAskAgentAction(
          'Add missing return',
          document,
          diagnostic.range,
          document.getText(diagnostic.range)
        )
      );
    }

    return actions;
  }

  private createAskAgentAction(
    title: string,
    document: vscode.TextDocument,
    range: vscode.Range,
    selectedText: string
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    action.command = {
      title,
      command: 'allah.askAgentAboutCode',
      arguments: [document.uri, range, selectedText, title],
    };
    return action;
  }

  static readonly supportedDiagnosticCodes = [
    'noImplicitAny',
    'notAssignable',
    'unusedVariable',
    'missingReturn',
  ];
}

/**
 * Register and handle code action commands
 */
export function registerCodeActionCommands(
  context: vscode.ExtensionContext,
  client: EnhancedClientWrapper
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'allah.askAgentAboutCode',
      async (uri: vscode.Uri, range: vscode.Range, selectedText: string, action: string) => {
        try {
          const editor = await vscode.window.showTextDocument(uri);

          // Show loading message
          vscode.window.setStatusBarMessage(`🤖 Agent analyzing "${action}"...`, 5000);

          // Build context
          const filename = vscode.workspace.asRelativePath(uri.fsPath);
          const prompt = `File: ${filename}\nAction: ${action}\n\nCode:\n\`\`\`\n${selectedText}\n\`\`\`\n\nProvide a focused suggestion to fix this.`;

          // Ask agent in debug mode (brief)
          const response = await client.chat('gpt-3.5-turbo', [
            { role: 'system', content: 'You are a code assistant. Provide brief, actionable suggestions.' },
            { role: 'user', content: prompt },
          ]);

          // Show result in notification
          vscode.window.showInformationMessage(
            `Agent: ${response.content.substring(0, 200)}...`,
            'View Full Response'
          );
        } catch (error) {
          vscode.window.showErrorMessage(
            `Agent error: ${error instanceof Error ? error.message : 'unknown'}`
          );
        }
      }
    )
  );
}
