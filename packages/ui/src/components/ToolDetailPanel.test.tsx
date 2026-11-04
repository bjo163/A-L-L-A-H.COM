import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolDetailPanel } from './ToolDetailPanel';
import { McpTool } from '@moonwitness/types';

const mockTool: any = {
  name: 'test_tool',
  description: 'A test tool for testing',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'SQL query to execute' },
      limit: { type: 'number', description: 'Result limit', default: 10 },
    },
    required: ['query'],
  },
};

describe('ToolDetailPanel', () => {
  it('renders null when tool is null', () => {
    render(<ToolDetailPanel tool={null} />);
    expect(screen.queryByText('test_tool')).not.toBeInTheDocument();
  });

  it('renders tool name and description', () => {
    render(<ToolDetailPanel tool={mockTool} />);
    expect(screen.getByText('test_tool')).toBeInTheDocument();
    expect(screen.getByText('A test tool for testing')).toBeInTheDocument();
  });

  it('renders NATIVE badge', () => {
    render(<ToolDetailPanel tool={mockTool} />);
    expect(screen.getByText('NATIVE')).toBeInTheDocument();
  });

  it('renders parameters section with count', () => {
    render(<ToolDetailPanel tool={mockTool} />);
    expect(screen.getByText(/Parameters.*\(2\)/)).toBeInTheDocument();
  });

  it('renders required badge for required parameters', () => {
    render(<ToolDetailPanel tool={mockTool} />);
    expect(screen.getByText('required')).toBeInTheDocument();
  });

  it('renders parameter types', () => {
    render(<ToolDetailPanel tool={mockTool} />);
    expect(screen.getByText('string')).toBeInTheDocument();
    expect(screen.getByText('number')).toBeInTheDocument();
  });

  it('renders parameter descriptions', () => {
    render(<ToolDetailPanel tool={mockTool} />);
    expect(screen.getByText('SQL query to execute')).toBeInTheDocument();
    expect(screen.getByText('Result limit')).toBeInTheDocument();
  });

  it('renders default values', () => {
    render(<ToolDetailPanel tool={mockTool} />);
    expect(screen.getByText('Default: 10')).toBeInTheDocument();
  });

  it('renders example arguments section', () => {
    render(<ToolDetailPanel tool={mockTool} />);
    expect(screen.getByText('Example Arguments')).toBeInTheDocument();
  });

  it('renders example JSON', () => {
    render(<ToolDetailPanel tool={mockTool} />);
    expect(screen.getByText('"query"')).toBeInTheDocument();
    expect(screen.getByText('"limit"')).toBeInTheDocument();
  });

  it('calls onExecute when Execute Tool button is clicked', () => {
    const onExecute = vi.fn();
    render(<ToolDetailPanel tool={mockTool} onExecute={onExecute} />);
    fireEvent.click(screen.getByRole('button', { name: /Execute Tool/i }));
    expect(onExecute).toHaveBeenCalledWith(mockTool);
  });

  it('calls onClose when Close button is clicked', () => {
    const onClose = vi.fn();
    render(<ToolDetailPanel tool={mockTool} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('handles tool with no parameters', () => {
    const toolNoParams = {
      name: 'no_params',
      description: 'No params tool',
      inputSchema: { type: 'object', properties: {} },
    };
    render(<ToolDetailPanel tool={toolNoParams} />);
    expect(screen.getByText('Parameters (0)')).toBeInTheDocument();
    expect(screen.getByText('No parameters required')).toBeInTheDocument();
  });

  it('handles tool with no schema', () => {
    const toolNoSchema = {
      name: 'no_schema',
      description: 'No schema tool',
      inputSchema: {},
    };
    render(<ToolDetailPanel tool={toolNoSchema} />);
    expect(screen.getByText('Parameters (0)')).toBeInTheDocument();
  });
});