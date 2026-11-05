'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
import { Button } from './button';
import { Textarea } from './textarea';
import { StatusMessage } from '../blocks/status-message';
import type { McpTool } from '@moonwitness/types';

export interface ToolExecutionFormProps {
  tool: McpTool;
  /** Called with the parsed JSON arguments once the operator submits the form. */
  onSubmit: (args: Record<string, unknown>) => void;
  /** Disables the submit affordance while a call is in flight. */
  isLoading?: boolean;
  onClose?: () => void;
}

/**
 * Collects a tool's arguments as a JSON document and hands the parsed object to
 * the caller. Validation is deliberately local (parse-only) so the parent owns
 * the transport; the form never calls a provider itself.
 */
export function ToolExecutionForm({ tool, onSubmit, isLoading = false, onClose }: ToolExecutionFormProps) {
  const [inputArgs, setInputArgs] = React.useState('{}');
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(inputArgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON arguments');
      return;
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      setError('Arguments must be a JSON object');
      return;
    }
    onSubmit(parsed as Record<string, unknown>);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tool.name}</CardTitle>
        <CardDescription>{tool.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            label="Arguments (JSON)"
            value={inputArgs}
            onChange={(e) => setInputArgs(e.target.value)}
            placeholder='{"query": "your query here"}'
            className="font-mono text-xs"
            disabled={isLoading}
          />
          {error && <StatusMessage tone="danger" title="Invalid arguments">{error}</StatusMessage>}
          <div className="flex justify-end gap-2">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Close
              </Button>
            )}
            <Button type="submit" variant="gold" disabled={isLoading}>
              {isLoading ? 'Executing…' : 'Execute Tool'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
