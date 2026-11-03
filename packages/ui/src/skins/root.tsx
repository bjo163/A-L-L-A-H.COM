import * as React from 'react';
import { cn } from '../lib/utils';
import { getSkinStyle, resolveSkinId, skinRegistry, type SkinId } from './registry';

export interface SkinRootProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  skin?: SkinId;
}

export function SkinRoot({ skin, className, ...props }: SkinRootProps) {
  const skinId = resolveSkinId(skin);
  const definition = skinRegistry[skinId];

  return (
    <div
      {...props}
      className={cn('mw-skin-root', className)}
      data-moonframe-skin={skinId}
      style={getSkinStyle(definition)}
    />
  );
}
