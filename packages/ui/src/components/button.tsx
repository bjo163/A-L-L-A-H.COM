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
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, enableSfx = true, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (enableSfx) {
        if (variant === 'destructive') sfx.revoke();
        else sfx.click();
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
