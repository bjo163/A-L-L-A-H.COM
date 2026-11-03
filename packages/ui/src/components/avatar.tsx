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
        'relative flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500/20 to-amber-400/5 border border-amber-500/20 text-amber-400 font-semibold shadow-inner',
        className
      )}
      {...props}
    >
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="h-full w-full rounded-xl object-cover" />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
