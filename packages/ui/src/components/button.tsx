import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';
import { sfx } from '../sfx';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer select-none',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 font-semibold shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400',
        gold:
          'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20',
        outline:
          'border border-zinc-800 bg-zinc-900/60 text-zinc-200 hover:bg-zinc-800 hover:text-white',
        ghost:
          'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100',
        destructive:
          'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-12 rounded-2xl px-6 text-base',
        icon: 'h-10 w-10',
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
