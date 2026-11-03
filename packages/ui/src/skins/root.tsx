import * as React from 'react';
import { cn } from '../lib/utils';
import { VisualEffectsProvider } from '../primitives/visual-effects';
import { getSkinStyle, resolveSkinId, skinRegistry, type SkinId } from './registry';

export interface SkinRootProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  skin?: SkinId;
}

export function SkinRoot({ skin, className, children, ...props }: SkinRootProps) {
  const skinId = resolveSkinId(skin);
  const definition = skinRegistry[skinId];

  return (
    <div
      {...props}
      className={cn('mw-skin-root', className)}
      data-moonframe-skin={skinId}
      style={getSkinStyle(definition)}
    >
      <VisualEffectsProvider>{children}</VisualEffectsProvider>
    </div>
  );
}
