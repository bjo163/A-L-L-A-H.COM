'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { FormFieldContext, type FormFieldContextValue } from '../lib/form-field';
import { RawStack } from '../raw';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  layout?: 'stack' | 'grid' | 'row';
}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, layout = 'stack', ...props }, ref) => (
    <form
      ref={ref}
      className={cn('mw-form', className)}
      data-layout={layout}
      {...props}
    />
  )
);
Form.displayName = 'Form';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  controlId?: string;
}

export function FormField({
  className,
  label,
  hint,
  error,
  required = false,
  controlId,
  children,
  ...props
}: FormFieldProps) {
  const autoId = React.useId();
  const id = controlId ?? autoId;
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  const context = React.useMemo<FormFieldContextValue>(
    () => ({ id, errorId, hintId, invalid: Boolean(error) }),
    [id, errorId, hintId, error]
  );

  return (
    <FormFieldContext.Provider value={context}>
      <RawStack
        gap="tight"
        className={cn('mw-form-field', className)}
        data-invalid={error ? 'true' : undefined}
        {...props}
      >
        <label className="mw-form-field__label" htmlFor={id}>
          {label}
          {required && (
            <span className="mw-form-field__required" aria-hidden="true">
              {' *'}
            </span>
          )}
        </label>
        {children}
        {hint && (
          <p className="mw-form-field__hint" id={hintId}>
            {hint}
          </p>
        )}
        {error && (
          <p className="mw-form-field__error" id={errorId} role="alert">
            {error}
          </p>
        )}
      </RawStack>
    </FormFieldContext.Provider>
  );
}
