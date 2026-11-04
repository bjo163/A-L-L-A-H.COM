'use client';

import * as React from 'react';

export interface FormFieldContextValue {
  id: string;
  errorId?: string;
  hintId?: string;
  invalid: boolean;
}

export const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

export function useFormFieldContext(): FormFieldContextValue | null {
  return React.useContext(FormFieldContext);
}

export function mergeDescribedBy(
  own: string | undefined,
  ...ids: Array<string | undefined>
): string | undefined {
  const parts = [own, ...ids].filter((value): value is string => Boolean(value));
  return parts.length > 0 ? parts.join(' ') : undefined;
}
