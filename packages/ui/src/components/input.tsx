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
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = mergeDescribedBy(props['aria-describedby'], hint, errorId);

    return (
      <RawStack gap="tight" className="mw-input-field">
        {label && (
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
          ref={ref}
          {...props}
          aria-invalid={error || field?.invalid ? true : props['aria-invalid']}
          aria-describedby={describedBy}
        />
        {error && (
          <p className="mw-input-field__error" id={errorId} role="alert">
            {error}
          </p>
        )}
      </RawStack>
    );
  }
);
Input.displayName = 'Input';
