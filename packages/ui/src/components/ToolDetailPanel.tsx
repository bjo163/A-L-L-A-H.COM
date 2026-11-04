'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@moonwitness/ui';
import type { McpTool } from '@moonwitness/types';
import { cn } from '../lib/utils';

export interface ToolDetailPanelProps {
  tool: McpTool | null;
  onExecute?: (tool: McpTool) => void;
  onClose?: () => void;
  className?: string;
}

export function ToolDetailPanel({ tool, onExecute, onClose, className }: ToolDetailPanelProps) {
  if (!tool) {
    return null;
  }

  const schema = tool.inputSchema as { 
    properties?: Record<string, unknown>; 
    required?: string[];
    type?: string;
  };
  const props = schema?.properties || {};
  const required = schema?.required || [];

  const formatType = (prop: unknown): string => {
    const p = prop as { type?: string; enum?: string[]; items?: unknown; format?: string };
    if (!p || typeof p !== 'object') return 'unknown';
    if (p.type === 'array') {
      return `array<${p.items ? formatType(p.items) : 'unknown'}>`;
    }
    if (p.type === 'object') return 'object';
    if (p.enum) return `enum: ${p.enum.join(', ')}`;
    if (p.format) return `${p.type} (${p.format})`;
    return p.type || 'unknown';
  };

  return (
    <Card className={cn('w-full h-[500px] flex flex-col', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{tool.name}</CardTitle>
          <Badge variant="gold" dot>NATIVE</Badge>
        </div>
        <CardDescription className="text-sm text-muted-foreground">{tool.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="h-full pr-2">
          <div className="space-y-4">
            {/* Parameters Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Parameters ({Object.keys(tool.inputSchema?.properties || {}).length})
              </h4>
              {Object.entries((tool.inputSchema as { properties?: Record<string, unknown> }).properties || {}).map(([key, value]) => {
                const p = value as { 
                  type?: string; 
                  description?: string; 
                  enum?: string[]; 
                  items?: unknown;
                  properties?: Record<string, unknown>;
                  required?: string[];
                  default?: unknown;
                };
                const isRequired = (tool.inputSchema as { required?: string[] }).required?.includes(key) || false;
                return (
                  <div key={key} className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-medium">{key}</span>
                          <Badge variant="default" className="text-[10px]">{formatType(value)}</Badge>
                          {isRequired && <Badge variant="revoked" className="text-[10px]">required</Badge>}
                        </div>
                        {p.description && (
                          <p className="text-[11px] text-muted-foreground mt-1">{p.description}</p>
                        )}
                        {p.enum && (
                          <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                            Values: {p.enum.join(', ')}
                          </p>
                        )}
                        {p.default !== undefined && (
                          <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                            Default: {JSON.stringify(p.default)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {Object.keys(props).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No parameters required</p>
              )}
            </div>

            {/* Example Section */}
            <div className="pt-2 border-t border-border">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Example Arguments
              </h4>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <pre className="text-[10px] font-mono text-foreground overflow-x-auto">
                  {JSON.stringify(generateExampleArgs(tool), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-4 border-t border-border">
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="gold" onClick={() => onExecute?.(tool)}>
            Execute Tool
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function generateExampleArgs(tool: any): Record<string, unknown> {
  const schema = tool.inputSchema as { properties?: Record<string, unknown>; required?: string[] };
  const props = schema?.properties || {};
  const required = schema?.required || [];
  const example: Record<string, unknown> = {};

  for (const [key] of Object.entries(props)) {
    if (required.includes(key)) {
      example[key] = '';
    } else if (key === 'params') {
      example[key] = [];
    } else if (key === 'max_bytes') {
      example[key] = 50000;
    } else if (key === 'limit') {
      example[key] = 5;
    } else if (key === 'min_score') {
      example[key] = 0.7;
    } else {
      example[key] = '';
    }
  }
  return example;
}