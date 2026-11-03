import * as React from 'react';
import { cn } from '../lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  src?: string;
}

export function Avatar({ className, name, src, ...props }: AvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <div
      className={cn(
        'mw-avatar',
        className
      )}
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
        <span>{initial}</span>
      )}
    </div>
  );
}
