'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { sfx } from '../sfx';

export const buttonVariants = cva(
  'mw-button whitespace-nowrap select-none',
  {
    variants: {
      variant: {
        default: 'mw-button--default',
        gold: 'mw-button--gold',
        outline: 'mw-button--outline',
        ghost: 'mw-button--ghost',
        destructive: 'mw-button--destructive',
      },
      size: {
        default: 'mw-button--size-default',
        sm: 'mw-button--size-sm',
        lg: 'mw-button--size-lg',
        icon: 'mw-button--size-icon',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  enableSfx?: boolean;
  asChild?: boolean;
}

export function composeClickHandlers<E extends { preventDefault(): void; stopPropagation(): void }>(
  childHandler: ((event: E) => void) | undefined,
  buttonHandler: ((event: E) => void) | undefined,
  disabled = false
): (event: E) => void {
  return (event) => {
    if (disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    childHandler?.(event);
    buttonHandler?.(event);
  };
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, enableSfx = true, asChild = false, onClick, children, disabled = false, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (enableSfx) {
        if (variant === 'destructive') sfx.revoke();
        else sfx.click();
      }
      onClick?.(e);
    };

    // asChild moves the variant contract onto a caller element (next/link, an anchor)
    // instead of nesting a button inside it.
    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement<
        Record<string, unknown> & {
          className?: string;
          onClick?: React.MouseEventHandler<HTMLElement>;
          ref?: React.Ref<HTMLElement>;
        }
      >;
      const childRef = child.props.ref;
      const mergedRef: React.RefCallback<HTMLElement> = (node) => {
        if (typeof childRef === 'function') childRef(node);
        else if (childRef) childRef.current = node;

        if (typeof ref === 'function') ref(node as HTMLButtonElement);
        else if (ref) ref.current = node as HTMLButtonElement;
      };

      return React.cloneElement(child, {
        ...props,
        ref: mergedRef,
        className: cn(buttonVariants({ variant, size }), child.props.className, className),
        'data-slot': 'button',
        ...(child.type === 'button'
          ? { disabled }
          : disabled
            ? { 'aria-disabled': true, tabIndex: -1 }
            : {}),
        onClick: composeClickHandlers(
          child.props.onClick,
          (event) => handleClick(event as React.MouseEvent<HTMLButtonElement>),
          disabled
        ),
      });
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        data-slot="button"
        disabled={disabled}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
