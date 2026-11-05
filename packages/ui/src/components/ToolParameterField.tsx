'use client';

import * as React from 'react';
import { Input } from './input';
import { Textarea } from './textarea';
import { Select } from './select';
import { Checkbox } from './checkbox';
import type { ToolParameter } from '@moonwitness/types';
import { cn } from '../lib/utils';

export interface ToolParameterFieldProps {
  name: string;
  schema: ToolParameter;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export function ToolParameterField({ name, schema, value, onChange, error, required, className }: ToolParameterFieldProps) {
  const isRequired = required || Boolean(schema.required && schema.required.length > 0);
  const schemaType = schema.type || 'string';

  const handleChange = (newValue: unknown) => {
    onChange(name, newValue);
  };

  // Handle array type
  if (schema.type === 'array') {
    return <ToolArrayField name={name} schema={schema} value={value as unknown[]} onChange={handleChange} error={error} required={isRequired} className={className} />;
  }

  // Handle object type
  if (schema.type === 'object') {
    return <ToolObjectField name={name} schema={schema} value={value as Record<string, unknown>} onChange={handleChange} error={error} required={isRequired} className={className} />;
  }

  // Handle enum as select
  if (schema.enum && schema.enum.length > 0) {
    return (
      <div className={cn('space-y-1', className)}>
        <label className={cn('text-xs font-medium text-foreground', isRequired && 'text-destructive')} htmlFor={name}>
          {name} {isRequired && <span className="text-destructive">*</span>}
        </label>
        <Select
          id={name}
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          error={error}
          required={isRequired}
          className="w-full text-xs"
        >
          {schema.enum!.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        {schema.description && <p className="text-[11px] text-muted-foreground">{schema.description}</p>}
        {error && <p className="text-[11px] text-destructive" role="alert">{error}</p>}
      </div>
    );
  }

  // Handle boolean as checkbox
  if (schemaType === 'boolean') {
    return (
      <div className={cn('space-y-1', className)}>
        <div className="flex items-center gap-2">
          <Checkbox
            id={name}
            checked={(value as boolean) || false}
            onChange={(e) => handleChange(e.target.checked)}
            required={isRequired}
          />
          <label className={cn('text-xs font-medium text-foreground', isRequired && 'text-destructive')} htmlFor={name}>
            {name} {isRequired && <span className="text-destructive">*</span>}
          </label>
        </div>
        {schema.description && <p className="text-[11px] text-muted-foreground ml-6">{schema.description}</p>}
        {error && <p className="text-[11px] text-destructive ml-6" role="alert">{error}</p>}
      </div>
    );
  }

  // Handle number/integer
  if (schemaType === 'number' || schemaType === 'integer') {
    return (
      <div className={cn('space-y-1', className)}>
        <label className={cn('text-xs font-medium text-foreground', isRequired && 'text-destructive')} htmlFor={name}>
          {name} {isRequired && <span className="text-destructive">*</span>}
        </label>
        <Input
          id={name}
          type="number"
          value={value as string | number}
          onChange={(e) => handleChange(schemaType === 'integer' ? parseInt(e.target.value) || 0 : parseFloat(e.target.value) || 0)}
          error={error}
          required={isRequired}
          min={schema.minimum}
          max={schema.maximum}
          step={schemaType === 'integer' ? 1 : 'any'}
          className="w-full text-xs"
          placeholder={schema.default !== undefined ? String(schema.default) : undefined}
        />
        {schema.description && <p className="text-[11px] text-muted-foreground">{schema.description}</p>}
        {error && <p className="text-[11px] text-destructive" role="alert">{error}</p>}
        {(schema.minimum !== undefined || schema.maximum !== undefined) && (
          <p className="text-[10px] text-muted-foreground">
            {schema.minimum !== undefined && schema.maximum !== undefined
              ? `Range: ${schema.minimum} – ${schema.maximum}`
              : schema.minimum !== undefined
              ? `Min: ${schema.minimum}`
              : `Max: ${schema.maximum}`}
        </p>
        )}
      </div>
    );
  }

  // Default string type
  return (
    <div className={cn('space-y-1', className)}>
      <label className={cn('text-xs font-medium text-foreground', isRequired && 'text-destructive')} htmlFor={name}>
        {name} {isRequired && <span className="text-destructive">*</span>}
      </label>
      {schema.format === 'password' ? (
        <Input
          id={name}
          type="password"
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          error={error}
          required={isRequired}
          className="w-full text-xs"
        />
      ) : schema.format === 'textarea' || (schema.type === 'string' && (schema.description?.length || 0) > 100) ? (
        <Textarea
          id={name}
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          error={error}
          required={isRequired}
          className="w-full text-xs font-mono"
          rows={4}
        />
      ) : (
        <Input
          id={name}
          type="text"
          value={value as string}
          onChange={(e) => handleChange(e.target.value)}
          error={error}
          required={isRequired}
          className="w-full text-xs"
          pattern={schema.pattern}
          placeholder={schema.default !== undefined ? String(schema.default) : undefined}
        />
      )}
      {schema.description && <p className="text-[11px] text-muted-foreground">{schema.description}</p>}
      {error && <p className="text-[11px] text-destructive" role="alert">{error}</p>}
      {schema.pattern && <p className="text-[10px] text-muted-foreground font-mono">Pattern: {schema.pattern}</p>}
    </div>
  );
}

// Array field component
interface ToolArrayFieldProps {
  name: string;
  schema: ToolParameter;
  value: unknown[];
  onChange: (value: unknown[]) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

function ToolArrayField({ name, schema, value, onChange, error, required, className }: ToolArrayFieldProps) {
  const [items, setItems] = React.useState<unknown[]>(value || []);
  const itemSchema = schema.items as ToolParameter | undefined;

  React.useEffect(() => {
    onChange(items);
  }, [items, onChange]);

  const addItem = () => {
    const defaultValue = itemSchema?.default ?? (itemSchema?.type === 'object' ? {} : itemSchema?.type === 'string' ? '' : 0);
    setItems([...items, defaultValue]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, newValue: unknown) => {
    setItems(items.map((item, i) => (i === index ? newValue : item)));
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <label className={cn('text-xs font-medium text-foreground', required && 'text-destructive')}>
          {name} {required && <span className="text-destructive">*</span>}
        </label>
        <button
          type="button"
          onClick={addItem}
          className="text-xs text-accent hover:underline"
        >
          + Add Item
        </button>
      </div>
      <div className="space-y-2 ml-4 border-l-2 border-border pl-3">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">No items. Click "Add Item" to add one.</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-[10px] text-muted-foreground font-mono mt-1">[{index}]</span>
              <div className="flex-1">
                <ToolParameterField
                  name={`${name}[${index}]`}
                  schema={itemSchema || { type: 'string' }}
                  value={item}
                  onChange={(newValue) => updateItem(index, newValue)}
                  required={required}
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-xs text-destructive hover:underline self-start"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
      {error && <p className="text-[11px] text-destructive" role="alert">{error}</p>}
    </div>
  );
}

// Object field component
interface ToolObjectFieldProps {
  name: string;
  schema: ToolParameter;
  value: Record<string, unknown>;
  onChange: (value: Record<string, unknown>) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

function ToolObjectField({ name, schema, value, onChange, error, required, className }: ToolObjectFieldProps) {
  const [fields, setFields] = React.useState<Record<string, unknown>>(value || {});

  React.useEffect(() => {
    onChange(fields);
  }, [fields, onChange]);

  const updateField = (fieldName: string, newValue: unknown) => {
    setFields({ ...fields, [fieldName]: newValue });
  };

  const removeField = (fieldName: string) => {
    const { [fieldName]: removed, ...rest } = fields;
    setFields(rest);
  };

  const properties = (schema.properties as Record<string, ToolParameter>) || {};

  return (
    <div className={cn('space-y-2', className)}>
      <label className={cn('text-xs font-medium text-foreground', required && 'text-destructive')}>
        {name} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="space-y-2 ml-4 border-l-2 border-border pl-3">
        {Object.keys(properties).length === 0 ? (
          <p className="text-xs text-muted-foreground">No properties defined.</p>
        ) : (
          Object.entries(properties).map(([key, propSchema]) => (
            <div key={key} className="flex items-start gap-2">
              <span className="text-[10px] text-muted-foreground font-mono mt-1">{key}</span>
              <div className="flex-1">
                <ToolParameterField
                  name={key}
                  schema={propSchema}
                  value={fields[key] ?? propSchema.default}
                  onChange={(newValue) => updateField(key, newValue)}
                  required={schema.required?.includes(key)}
                />
              </div>
            </div>
          ))
        )}
      </div>
      {error && <p className="text-[11px] text-destructive" role="alert">{error}</p>}
    </div>
  );
}
