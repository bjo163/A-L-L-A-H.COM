import * as React from 'react';
import { cn } from '../lib/utils';
import { RawStack } from '../raw';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = props.id ?? generatedId;
    const errorId = error ? `${inputId}-error` : undefined;

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
          aria-invalid={error ? true : props['aria-invalid']}
          aria-describedby={cn(props['aria-describedby'], errorId) || undefined}
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
