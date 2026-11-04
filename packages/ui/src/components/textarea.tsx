'use client';

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
    const hintId = hint ? `${textareaId}-hint` : field?.hintId;
    const errorId = error ? `${textareaId}-error` : field?.errorId;
    const describedBy = mergeDescribedBy(props['aria-describedby'], hintId, errorId);

    return (
      <RawStack gap="tight" className="mw-input-field">
        {label && !field && (
          <label className="mw-input-field__label" htmlFor={textareaId}>
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn('mw-textarea', className)}
          data-slot="textarea"
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
Textarea.displayName = 'Textarea';
