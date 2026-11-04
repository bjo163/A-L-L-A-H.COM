import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

export const avatarVariants = cva('mw-avatar', {
  variants: {
    size: {
      sm: 'mw-avatar--sm',
      default: 'mw-avatar--default',
      lg: 'mw-avatar--lg',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  name?: string;
  src?: string;
}

function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export function Avatar({ className, size, name, src, ...props }: AvatarProps) {
  const initials = name ? initialsOf(name) : 'U';

  return (
    <div
      className={cn(avatarVariants({ size, className }))}
      data-slot="avatar"
      {...(src ? {} : { role: 'img', 'aria-label': name ?? 'User' })}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={name ?? ''}
          width={40}
          height={40}
          className="mw-avatar__image"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
