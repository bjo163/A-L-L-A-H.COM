'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    const id = React.useId();

    return (
      <div className={cn('mw-checkbox-field', className)}>
        <input
          ref={ref}
          id={props.id || id}
          type="checkbox"
          className={cn('mw-checkbox', className)}
          data-slot="checkbox"
          {...props}
        />
        {label && (
          <label className="mw-checkbox-field__label" htmlFor={props.id || id}>
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';