'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { mergeDescribedBy, useFormFieldContext } from '../lib/form-field';
import { RawStack } from '../raw';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, ...props }, ref) => {
    const field = useFormFieldContext();
    const generatedId = React.useId();
    const inputId = props.id ?? field?.id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : field?.hintId;
    const errorId = error ? `${inputId}-error` : field?.errorId;
    const describedBy = mergeDescribedBy(props['aria-describedby'], hintId, errorId);

    return (
      <RawStack gap="tight" className="mw-input-field">
        {label && !field && (
          <label className="mw-input-field__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            'mw-input',
            className
          )}
          data-slot="input"
          ref={ref}
          {...props}
          required={props.required ?? field?.required}
          aria-invalid={error || field?.invalid ? true : props['aria-invalid']}
          aria-describedby={describedBy}
        />
        {hint && (
          <p className="mw-input-field__hint" id={hintId} data-slot="input-hint">
            {hint}
          </p>
        )}
        {error && (
          <p className="mw-input-field__error" id={errorId} role="alert" data-slot="input-error">
            {error}
          </p>
        )}
      </RawStack>
    );
  }
);
Input.displayName = 'Input';
