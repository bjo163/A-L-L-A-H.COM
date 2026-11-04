import * as React from 'react';
import { cn } from '../lib/utils';
import { mergeDescribedBy, useFormFieldContext } from '../lib/form-field';
import { RawStack } from '../raw';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, ...props }, ref) => {
    const field = useFormFieldContext();
    const generatedId = React.useId();
    const textareaId = props.id ?? field?.id ?? generatedId;
    const errorId = error ? `${textareaId}-error` : undefined;
    const describedBy = mergeDescribedBy(props['aria-describedby'], hint, errorId);

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
Textarea.displayName = 'Textarea';
