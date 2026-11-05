'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { StatusMessage } from '../blocks/status-message';
import type { McpToolCallResult } from '@moonwitness/types';

export interface ToolResultViewerProps {
  callResult: McpToolCallResult | null;
  onClose?: () => void;
}

/**
 * Renders the outcome of a tool call. Text blocks are surfaced inline, an error
 * result is called out with a danger status, and the raw payload stays available
 * for inspection. Returns nothing when there is no result yet.
 */
export function ToolResultViewer({ callResult, onClose }: ToolResultViewerProps) {
  if (!callResult) {
    return null;
  }

  const textBlocks = callResult.content
    .filter((block) => typeof block.text === 'string')
    .map((block) => block.text as string);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tool Call Result</CardTitle>
        {callResult.isError ? (
          <Badge variant="revoked" dot>
            Error
          </Badge>
        ) : (
          <Badge variant="gold" dot>
            Executed
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {callResult.isError && (
          <StatusMessage tone="danger" title="Tool reported an error">
            {textBlocks.join('\n') || 'The tool call failed.'}
          </StatusMessage>
        )}
        {!callResult.isError && textBlocks.length > 0 && (
          <div className="space-y-1">
            {textBlocks.map((text, index) => (
              <p key={index} className="whitespace-pre-wrap text-sm">
                {text}
              </p>
            ))}
          </div>
        )}
        <div className="rounded-lg border border-border bg-card p-3">
          <pre className="whitespace-pre-wrap font-mono text-xs">
            {JSON.stringify(callResult, null, 2)}
          </pre>
        </div>
      </CardContent>
      {onClose && (
        <CardContent className="flex justify-end border-t border-border pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
