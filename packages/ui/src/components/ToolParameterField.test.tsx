import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolParameterField, ToolArrayField, ToolObjectField } from './ToolParameterField';
import type { ToolParameter } from '@moonwitness/types';
import * as React from 'react';

const mockOnChange = vi.fn();

const mockStringSchema: ToolParameter = {
  type: 'string',
  description: 'A string parameter',
  default: 'default value',
};

const mockNumberSchema: ToolParameter = {
  type: 'number',
  description: 'A number parameter',
  minimum: 0,
  maximum: 100,
  default: 50,
};

const mockIntegerSchema: ToolParameter = {
  type: 'integer',
  description: 'An integer parameter',
  minimum: 1,
  maximum: 10,
};

const mockBooleanSchema: ToolParameter = {
  type: 'boolean',
  description: 'A boolean parameter',
};

const mockEnumSchema: ToolParameter = {
  type: 'string',
  description: 'An enum parameter',
  enum: ['option1', 'option2', 'option3'],
};

const mockArraySchema: ToolParameter = {
  type: 'array',
  description: 'An array parameter',
  items: { type: 'string' },
};

const mockObjectSchema: ToolParameter = {
  type: 'object',
  description: 'An object parameter',
  properties: {
    name: { type: 'string', description: 'Name field' },
    age: { type: 'integer', description: 'Age field' },
  },
  required: ['name'],
};

describe('ToolParameterField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('string type', () => {
    it('renders string input', () => {
      render(<ToolParameterField name="test" schema={mockStringSchema} value="test" onChange={mockOnChange} />);
      expect(screen.getByLabelText('test')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    });

    it('renders description', () => {
      render(<ToolParameterField name="test" schema={mockStringSchema} value="" onChange={mockOnChange} />);
      expect(screen.getByText('A string parameter')).toBeInTheDocument();
    });

    it('renders default value placeholder', () => {
      render(<ToolParameterField name="test" schema={mockStringSchema} value="" onChange={mockOnChange} />);
      expect(screen.getByPlaceholderText('default value')).toBeInTheDocument();
    });

    it('calls onChange on input', () => {
      render(<ToolParameterField name="test" schema={mockStringSchema} value="" onChange={mockOnChange} />);
      fireEvent.change(screen.getByLabelText('test'), { target: { value: 'new value' } });
      expect(mockOnChange).toHaveBeenCalledWith('test', 'new value');
    });

    it('shows error when provided', () => {
      render(<ToolParameterField name="test" schema={mockStringSchema} value="" onChange={mockOnChange} error="This is required" />);
      expect(screen.getByText('This is required')).toBeInTheDocument();
    });
  });

  describe('number type', () => {
    it('renders number input', () => {
      render(<ToolParameterField name="test" schema={mockNumberSchema} value={50} onChange={mockOnChange} />);
      expect(screen.getByLabelText('test')).toBeInTheDocument();
    });

    it('shows min/max range', () => {
      render(<ToolParameterField name="test" schema={mockNumberSchema} value={50} onChange={mockOnChange} />);
      expect(screen.getByText('Range: 0 – 100')).toBeInTheDocument();
    });

    it('calls onChange with parsed number', () => {
      render(<ToolParameterField name="test" schema={mockNumberSchema} value={50} onChange={mockOnChange} />);
      fireEvent.change(screen.getByLabelText('test'), { target: { value: '75' } });
      expect(mockOnChange).toHaveBeenCalledWith('test', 75);
    });
  });

  describe('integer type', () => {
    it('renders integer input', () => {
      render(<ToolParameterField name="test" schema={mockIntegerSchema} value={5} onChange={mockOnChange} />);
      expect(screen.getByLabelText('test')).toBeInTheDocument();
    });

    it('calls onChange with parsed integer', () => {
      render(<ToolParameterField name="test" schema={mockIntegerSchema} value={5} onChange={mockOnChange} />);
      fireEvent.change(screen.getByLabelText('test'), { target: { value: '7' } });
      expect(mockOnChange).toHaveBeenCalledWith('test', 7);
    });
  });

  describe('boolean type', () => {
    it('renders checkbox', () => {
      render(<ToolParameterField name="test" schema={mockBooleanSchema} value={false} onChange={mockOnChange} />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('calls onChange with boolean', () => {
      render(<ToolParameterField name="test" schema={mockBooleanSchema} value={false} onChange={mockOnChange} />);
      fireEvent.click(screen.getByRole('checkbox'));
      expect(mockOnChange).toHaveBeenCalledWith('test', true);
    });
  });

  describe('enum type', () => {
    it('renders select with options', () => {
      render(<ToolParameterField name="test" schema={mockEnumSchema} value="option1" onChange={mockOnChange} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByText('option1')).toBeInTheDocument();
      expect(screen.getByText('option2')).toBeInTheDocument();
      expect(screen.getByText('option3')).toBeInTheDocument();
    });

    it('calls onChange with selected value', () => {
      render(<ToolParameterField name="test" schema={mockEnumSchema} value="option1" onChange={mockOnChange} />);
      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'option2' } });
      expect(mockOnChange).toHaveBeenCalledWith('test', 'option2');
    });
  });

  describe('array type', () => {
    it('renders array field with add button', () => {
      render(<ToolParameterField name="test" schema={mockArraySchema} value={['item1']} onChange={mockOnChange} />);
      expect(screen.getByText('+ Add Item')).toBeInTheDocument();
    });

    it('renders existing items', () => {
      render(<ToolParameterField name="test" schema={mockArraySchema} value={['item1', 'item2']} onChange={mockOnChange} />);
      expect(screen.getByText('[0]')).toBeInTheDocument();
      expect(screen.getByText('[1]')).toBeInTheDocument();
    });

    it('adds item when add button clicked', () => {
      render(<ToolParameterField name="test" schema={mockArraySchema} value={[]} onChange={mockOnChange} />);
      fireEvent.click(screen.getByText('+ Add Item'));
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('removes item when remove button clicked', () => {
      render(<ToolParameterField name="test" schema={mockArraySchema} value={['item1']} onChange={mockOnChange} />);
      fireEvent.click(screen.getByText('Remove'));
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('object type', () => {
    it('renders object fields', () => {
      render(<ToolParameterField name="test" schema={mockObjectSchema} value={{ name: 'John', age: 30 }} onChange={mockOnChange} />);
      expect(screen.getByText('name')).toBeInTheDocument();
      expect(screen.getByText('age')).toBeInTheDocument();
    });

    it('updates nested field value', () => {
      render(<ToolParameterField name="test" schema={mockObjectSchema} value={{ name: 'John', age: 30 }} onChange={mockOnChange} />);
      // Find the nested name input and change it
      const nameInput = screen.getByLabelText('name');
      fireEvent.change(nameInput, { target: { value: 'Jane' } });
      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe('required field', () => {
    it('shows required indicator', () => {
      render(<ToolParameterField name="test" schema={mockStringSchema} value="" onChange={mockOnChange} required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('error display', () => {
    it('shows error message', () => {
      render(<ToolParameterField name="test" schema={mockStringSchema} value="" onChange={mockOnChange} error="Field is required" />);
      expect(screen.getByText('Field is required')).toBeInTheDocument();
    });
  });
});