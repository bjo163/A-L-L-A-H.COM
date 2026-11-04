import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolRegistryCard } from './ToolRegistryCard';
import { McpTool } from '@moonwitness/types';

const mockTool: McpTool = {
  name: 'test_tool',
  description: 'A test tool for testing',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'SQL query' },
      limit: { type: 'number', description: 'Result limit' },
    },
    required: ['query'],
  },
};

describe('ToolRegistryCard', () => {
  it('renders tool name and description', () => {
    render(<ToolRegistryCard tool={mockTool} />);
    expect(screen.getByText('test_tool')).toBeInTheDocument();
    expect(screen.getByText('A test tool for testing')).toBeInTheDocument();
  });

  it('renders parameter count and required fields', () => {
    render(<ToolRegistryCard tool={mockTool} />);
    expect(screen.getByText('2 param(s) · 1 required')).toBeInTheDocument();
  });

  it('renders NATIVE badge', () => {
    render(<ToolRegistryCard tool={mockTool} />);
    expect(screen.getByText('NATIVE')).toBeInTheDocument();
  });

  it('renders "Test in Sandbox" button', () => {
    render(<ToolRegistryCard tool={mockTool} />);
    expect(screen.getByRole('button', { name: /Test in Sandbox/i })).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<ToolRegistryCard tool={mockTool} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /test_tool/i }));
    expect(onClick).toHaveBeenCalledWith(mockTool);
  });

  it('calls onClick when "Test in Sandbox" button is clicked', () => {
    const onClick = vi.fn();
    render(<ToolRegistryCard tool={mockTool} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: /Test in Sandbox/i }));
    expect(onClick).toHaveBeenCalledWith(mockTool);
  });

  it('displays last executed at when provided', () => {
    render(<ToolRegistryCard tool={mockTool} lastExecutedAt="2024-01-15T10:30:00Z" />);
    expect(screen.getByText(/Last executed:/)).toBeInTheDocument();
  });

  it('displays execution count when provided', () => {
    render(<ToolRegistryCard tool={mockTool} executionCount={5} />);
    expect(screen.getByText('Executed: 5')).toBeInTheDocument();
  });

  it('handles tools with no parameters', () => {
    const toolNoParams: McpTool = {
      name: 'no_params',
      description: 'No params tool',
      inputSchema: { type: 'object', properties: {} },
    };
    render(<ToolRegistryCard tool={toolNoParams} />);
    expect(screen.getByText('0 param(s) · 0 required')).toBeInTheDocument();
  });

  it('handles tools with no schema properties', () => {
    const toolNoSchema: McpTool = {
      name: 'no_schema',
      description: 'No schema tool',
      inputSchema: {},
    };
    render(<ToolRegistryCard tool={toolNoSchema} />);
    expect(screen.getByText('0 param(s) · 0 required')).toBeInTheDocument();
  });
});