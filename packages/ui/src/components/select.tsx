'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { mergeDescribedBy, useFormFieldContext } from '../lib/form-field';
import { RawStack } from '../raw';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, children, ...props }, ref) => {
    const field = useFormFieldContext();
    const autoId = React.useId();
    const selectId = props.id ?? field?.id ?? autoId;
    const hintId = hint ? `${selectId}-hint` : field?.hintId;
    const errorId = error ? `${selectId}-error` : field?.errorId;
    const describedBy = mergeDescribedBy(props['aria-describedby'], hintId, errorId);

    return (
      <RawStack gap="tight" className="mw-select-field">
        {label && !field && (
          <label className="mw-select-field__label" htmlFor={selectId}>
            {label}
          </label>
        )}
        <span className="mw-select-control">
          <select
            id={selectId}
            className={cn('mw-select', className)}
            data-slot="select"
            ref={ref}
            {...props}
            required={props.required ?? field?.required}
            aria-invalid={error || field?.invalid ? true : props['aria-invalid']}
            aria-describedby={describedBy}
          >
            {children}
          </select>
          <span className="mw-select__caret" aria-hidden="true" />
        </span>
        {hint && (
          <p className="mw-select-field__hint" id={hintId} data-slot="select-hint">
            {hint}
          </p>
        )}
        {error && (
          <p className="mw-select-field__error" id={errorId} role="alert" data-slot="select-error">
            {error}
          </p>
        )}
      </RawStack>
    );
  }
);
Select.displayName = 'Select';
