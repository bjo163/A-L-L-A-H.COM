import * as React from 'react';
import { cn } from '../lib/utils';
import { RawStack } from '../raw';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = props.id ?? generatedId;
    const errorId = error ? `${textareaId}-error` : undefined;

    return (
      <RawStack gap="tight" className="mw-input-field">
        {label && (
          <label className="mw-input-field__label" htmlFor={textareaId}>
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn('mw-textarea', className)}
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
Textarea.displayName = 'Textarea';
