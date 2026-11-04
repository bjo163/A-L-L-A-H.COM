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
    const errorId = error ? `${selectId}-error` : undefined;
    const describedBy = mergeDescribedBy(props['aria-describedby'], hint, errorId);

    return (
      <RawStack gap="tight" className="mw-select-field">
        {label && (
          <label className="mw-select-field__label" htmlFor={selectId}>
            {label}
          </label>
        )}
        <span className="mw-select-control">
          <select
            id={selectId}
            className={cn('mw-select', className)}
            ref={ref}
            {...props}
            aria-invalid={error || field?.invalid ? true : props['aria-invalid']}
            aria-describedby={describedBy}
          >
            {children}
          </select>
          <span className="mw-select__caret" aria-hidden="true" />
        </span>
        {error && (
          <p className="mw-select-field__error" id={errorId} role="alert">
            {error}
          </p>
        )}
      </RawStack>
    );
  }
);
Select.displayName = 'Select';
