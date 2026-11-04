import * as React from 'react';
import {
  ArrowRight,
  BookOpen,
  Command,
  Compass,
  Globe,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShieldCheck,
  UsersRound,
  Volume2,
  VolumeX,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * The single icon owner for the whole ecosystem. Apps must not add their own
 * lucide-react dependency; every glyph is imported from here so the package
 * pins one version and one stroke contract.
 */
const iconByName = {
  'arrow-right': ArrowRight,
  'book-open': BookOpen,
  'command': Command,
  'compass': Compass,
  'globe': Globe,
  'layout-dashboard': LayoutDashboard,
  'message-square': MessageSquare,
  'settings': Settings,
  'shield-check': ShieldCheck,
  'users-round': UsersRound,
  'volume-2': Volume2,
  'volume-x': VolumeX,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof iconByName;

/** Every governed glyph name, for validation at content boundaries. */
export const iconNames = Object.keys(iconByName) as IconName[];

export function hasIconName(name: string): name is IconName {
  return Object.hasOwn(iconByName, name);
}

export interface IconProps extends LucideProps {
  name: IconName;
}

export function Icon({ name, size = 20, strokeWidth = 1.75, className, ...props }: IconProps) {
  const Glyph = iconByName[name];

  return (
    <Glyph
      data-slot="icon"
      size={size}
      strokeWidth={strokeWidth}
      className={cn('mw-icon', className)}
      {...props}
    />
  );
}
