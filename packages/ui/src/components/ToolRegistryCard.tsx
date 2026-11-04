'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@moonwitness/ui';
import type { McpTool } from '@moonwitness/types';
import { cn } from '../lib/utils';

export interface ToolRegistryCardProps {
  tool: McpTool;
  onClick?: (tool: McpTool) => void;
  lastExecutedAt?: string;
  executionCount?: number;
  className?: string;
}

export function ToolRegistryCard({ tool, onClick, lastExecutedAt, executionCount, className, ...props }: ToolRegistryCardProps) {
  const schema = tool.inputSchema as { properties?: Record<string, unknown>; required?: string[] };
  const propsCount = Object.keys(schema?.properties || {}).length;
  const requiredCount = schema?.required?.length || 0;

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    onClick?.(tool);
  };

  return (
    <Card
      className={cn(
        'cursor-pointer hover:border-accent transition-colors group',
        'hover:shadow-md',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{tool.name}</CardTitle>
          <Badge variant="gold" dot>NATIVE</Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">{tool.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-[10px] text-muted-foreground font-mono mb-2">
          Schema: {Object.keys((tool.inputSchema as { properties?: Record<string, unknown> }).properties || {}).join(', ') || 'none'}
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
          <span>{propsCount} param(s) · {requiredCount} required</span>
          {executionCount !== undefined && (
            <span>Executed: {executionCount}</span>
          )}
        </div>
        {lastExecutedAt && (
          <div className="text-[10px] text-muted-foreground">
            Last executed: {new Date(lastExecutedAt).toLocaleString()}
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.(tool);
          }}
          className="w-full text-[10px] px-3"
        >
          Test in Sandbox
        </Button>
      </CardContent>
    </Card>
  );
}

ToolRegistryCard.displayName = 'ToolRegistryCard';