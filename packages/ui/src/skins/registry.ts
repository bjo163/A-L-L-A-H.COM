import type * as React from 'react';

export const skinIds = [
  'imperium-lumen',
  'lunar-chronicles',
  'rocksoul',
  'nexus-paradox',
  'riot-anarchy',
  'mycelium',
] as const;

export type SkinId = (typeof skinIds)[number];

export interface SkinTokens {
  colors: {
    canvas: string;
    surface: string;
    elevatedSurface: string;
    text: string;
    mutedText: string;
    border: string;
    accent: string;
    accentText: string;
    focus: string;
    success: string;
    danger: string;
    dangerText: string;
  };
  typography: {
    display: string;
    heading: string;
    body: string;
    label: string;
    numeric: string;
    tracking: string;
  };
  spacing: {
    density: 'compact' | 'comfortable' | 'spacious';
    controlGap: string;
    cardPadding: string;
    sectionGap: string;
  };
  geometry: {
    controlRadius: string;
    surfaceRadius: string;
    borderWidth: string;
  };
  material: {
    surfaceShadow: string;
    controlShadow: string;
  };
  motion: {
    fastDuration: string;
    standardDuration: string;
    ambientDuration: string;
    easing: string;
  };
}

export interface SkinDefinition {
  id: SkinId;
  name: string;
  signature: string;
  tokens: SkinTokens;
}

export const skinRegistry = {
  'imperium-lumen': {
    id: 'imperium-lumen',
    name: 'IMPERIUM LUMEN',
    signature: 'Monumental frames, axial order, and restrained warm light.',
    tokens: {
      colors: {
        canvas: '#11110f',
        surface: '#1b1b18',
        elevatedSurface: '#25251f',
        text: '#f4f1e8',
        mutedText: '#c4c0b5',
        border: '#908b7d',
        accent: '#d3b77b',
        accentText: '#17150f',
        focus: '#f3d996',
        success: '#6ec39a',
        danger: '#ff938b',
        dangerText: '#28100e',
      },
      typography: {
        display: 'Georgia, "Times New Roman", serif',
        heading: 'Georgia, "Times New Roman", serif',
        body: 'Arial, Helvetica, sans-serif',
        label: 'Arial, Helvetica, sans-serif',
        numeric: '"Courier New", monospace',
        tracking: '0.015em',
      },
      spacing: {
        density: 'spacious',
        controlGap: '0.75rem',
        cardPadding: '1.5rem',
        sectionGap: '2.5rem',
      },
      geometry: {
        controlRadius: '0.2rem',
        surfaceRadius: '0.35rem',
        borderWidth: '1px',
      },
      material: {
        surfaceShadow: '0 12px 30px rgb(0 0 0 / 0.22)',
        controlShadow: 'inset 0 1px rgb(255 255 255 / 0.08)',
      },
      motion: {
        fastDuration: '120ms',
        standardDuration: '220ms',
        ambientDuration: '42s',
        easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
      },
    },
  },
  'lunar-chronicles': {
    id: 'lunar-chronicles',
    name: 'LUNAR CHRONICLES',
    signature: 'Layered atlas surfaces and observatory-grade alignment.',
    tokens: {
      colors: {
        canvas: '#101923',
        surface: '#182432',
        elevatedSurface: '#223345',
        text: '#f1f5f8',
        mutedText: '#c1ccd5',
        border: '#9eacb8',
        accent: '#c5d5e1',
        accentText: '#14202a',
        focus: '#f0cc75',
        success: '#79d2a4',
        danger: '#ff9b91',
        dangerText: '#28100e',
      },
      typography: {
        display: 'Georgia, "Times New Roman", serif',
        heading: 'Georgia, "Times New Roman", serif',
        body: 'Arial, Helvetica, sans-serif',
        label: 'Arial, Helvetica, sans-serif',
        numeric: '"Courier New", monospace',
        tracking: '0.025em',
      },
      spacing: {
        density: 'comfortable',
        controlGap: '0.625rem',
        cardPadding: '1.25rem',
        sectionGap: '2rem',
      },
      geometry: {
        controlRadius: '0.55rem',
        surfaceRadius: '1.1rem',
        borderWidth: '1px',
      },
      material: {
        surfaceShadow: '0 14px 32px rgb(0 0 0 / 0.24)',
        controlShadow: 'inset 0 0 0 1px rgb(224 236 245 / 0.08)',
      },
      motion: {
        fastDuration: '140ms',
        standardDuration: '240ms',
        ambientDuration: '48s',
        easing: 'cubic-bezier(0.2, 0.65, 0.3, 1)',
      },
    },
  },
  rocksoul: {
    id: 'rocksoul',
    name: 'ROCKSOUL',
    signature: 'Cinematic framing, tactile edges, and selective crimson.',
    tokens: {
      colors: {
        canvas: '#141516',
        surface: '#1d1e20',
        elevatedSurface: '#27282a',
        text: '#f1eee8',
        mutedText: '#c7c0b8',
        border: '#aaa39b',
        accent: '#bd4144',
        accentText: '#fff8f2',
        focus: '#efd278',
        success: '#83d1a2',
        danger: '#ff9890',
        dangerText: '#2a100e',
      },
      typography: {
        display: 'Impact, "Arial Narrow", sans-serif',
        heading: 'Arial, Helvetica, sans-serif',
        body: 'Arial, Helvetica, sans-serif',
        label: 'Arial, Helvetica, sans-serif',
        numeric: '"Courier New", monospace',
        tracking: '0.035em',
      },
      spacing: {
        density: 'comfortable',
        controlGap: '0.75rem',
        cardPadding: '1.25rem',
        sectionGap: '2rem',
      },
      geometry: {
        controlRadius: '0.15rem',
        surfaceRadius: '0.2rem',
        borderWidth: '1px',
      },
      material: {
        surfaceShadow: '0 10px 24px rgb(0 0 0 / 0.3)',
        controlShadow: 'inset 0 0 0 1px rgb(255 255 255 / 0.05)',
      },
      motion: {
        fastDuration: '110ms',
        standardDuration: '180ms',
        ambientDuration: '34s',
        easing: 'cubic-bezier(0.25, 0.5, 0.35, 1)',
      },
    },
  },
  'nexus-paradox': {
    id: 'nexus-paradox',
    name: 'NEXUS PARADOX',
    signature: 'Instrument planes, clipped coordinates, and precise signals.',
    tokens: {
      colors: {
        canvas: '#0c171c',
        surface: '#13232a',
        elevatedSurface: '#1c3038',
        text: '#eff9fa',
        mutedText: '#bfd0d3',
        border: '#92b8be',
        accent: '#55c4d2',
        accentText: '#071a1e',
        focus: '#f3d06e',
        success: '#80d4a9',
        danger: '#ff968e',
        dangerText: '#2a100e',
      },
      typography: {
        display: 'Arial, Helvetica, sans-serif',
        heading: 'Arial, Helvetica, sans-serif',
        body: 'Arial, Helvetica, sans-serif',
        label: 'Arial, Helvetica, sans-serif',
        numeric: '"Courier New", monospace',
        tracking: '0.045em',
      },
      spacing: {
        density: 'compact',
        controlGap: '0.5rem',
        cardPadding: '1.125rem',
        sectionGap: '1.75rem',
      },
      geometry: {
        controlRadius: '0.1rem',
        surfaceRadius: '0.15rem',
        borderWidth: '1px',
      },
      material: {
        surfaceShadow: '0 10px 22px rgb(0 0 0 / 0.28)',
        controlShadow: 'inset 0 0 0 1px rgb(137 223 231 / 0.08)',
      },
      motion: {
        fastDuration: '100ms',
        standardDuration: '180ms',
        ambientDuration: '28s',
        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  'riot-anarchy': {
    id: 'riot-anarchy',
    name: 'RIOT ANARCHY',
    signature: 'Hard print edges, poster contrast, and controlled disruption.',
    tokens: {
      colors: {
        canvas: '#e9e3d3',
        surface: '#f5f0e2',
        elevatedSurface: '#ddd5c1',
        text: '#171715',
        mutedText: '#393832',
        border: '#34332e',
        accent: '#a5282d',
        accentText: '#fffaf1',
        focus: '#0759a8',
        success: '#155e35',
        danger: '#8f1b1f',
        dangerText: '#fffaf1',
      },
      typography: {
        display: 'Impact, "Arial Narrow", sans-serif',
        heading: 'Arial, Helvetica, sans-serif',
        body: 'Arial, Helvetica, sans-serif',
        label: 'Arial, Helvetica, sans-serif',
        numeric: '"Courier New", monospace',
        tracking: '0.02em',
      },
      spacing: {
        density: 'compact',
        controlGap: '0.5rem',
        cardPadding: '1.125rem',
        sectionGap: '1.5rem',
      },
      geometry: {
        controlRadius: '0',
        surfaceRadius: '0',
        borderWidth: '2px',
      },
      material: {
        surfaceShadow: '5px 5px 0 rgb(23 23 21 / 0.9)',
        controlShadow: '3px 3px 0 rgb(23 23 21 / 0.85)',
      },
      motion: {
        fastDuration: '90ms',
        standardDuration: '150ms',
        ambientDuration: '32s',
        easing: 'steps(2, end)',
      },
    },
  },
  mycelium: {
    id: 'mycelium',
    name: 'MYCELIUM',
    signature: 'Connected organic surfaces and quiet mineral color.',
    tokens: {
      colors: {
        canvas: '#10201b',
        surface: '#192d26',
        elevatedSurface: '#233b31',
        text: '#f1f4e8',
        mutedText: '#c4d0c4',
        border: '#9eb4a3',
        accent: '#9dc8ad',
        accentText: '#12231a',
        focus: '#e5cc79',
        success: '#8bd5a6',
        danger: '#ff9b91',
        dangerText: '#28100e',
      },
      typography: {
        display: '"Trebuchet MS", Arial, sans-serif',
        heading: '"Trebuchet MS", Arial, sans-serif',
        body: '"Trebuchet MS", Arial, sans-serif',
        label: 'Arial, Helvetica, sans-serif',
        numeric: '"Courier New", monospace',
        tracking: '0.01em',
      },
      spacing: {
        density: 'comfortable',
        controlGap: '0.75rem',
        cardPadding: '1.25rem',
        sectionGap: '2rem',
      },
      geometry: {
        controlRadius: '1.25rem',
        surfaceRadius: '1.5rem 0.9rem 1.5rem 0.9rem',
        borderWidth: '1px',
      },
      material: {
        surfaceShadow: '0 12px 28px rgb(0 0 0 / 0.2)',
        controlShadow: 'inset 0 1px rgb(255 255 255 / 0.08)',
      },
      motion: {
        fastDuration: '150ms',
        standardDuration: '260ms',
        ambientDuration: '46s',
        easing: 'cubic-bezier(0.22, 0.7, 0.25, 1)',
      },
    },
  },
} satisfies Record<SkinId, SkinDefinition>;

export const defaultSkinId: SkinId = 'imperium-lumen';

const skinIdSet: ReadonlySet<string> = new Set(skinIds);

export function isSkinId(value: string): value is SkinId {
  return skinIdSet.has(value);
}

export function resolveSkinId(value: unknown): SkinId {
  if (value === undefined || value === null) {
    return defaultSkinId;
  }

  if (typeof value === 'string' && isSkinId(value)) {
    return value;
  }

  console.warn(`Invalid MoonFrame skin identifier; using "${defaultSkinId}".`);
  return defaultSkinId;
}

export type SkinStyle = React.CSSProperties & {
  [key: `--mw-${string}`]: string;
};

export function getSkinStyle(skin: SkinDefinition): SkinStyle {
  const { colors, typography, spacing, geometry, material, motion } = skin.tokens;

  return {
    '--mw-canvas': colors.canvas,
    '--mw-surface': colors.surface,
    '--mw-surface-raised': colors.elevatedSurface,
    '--mw-text': colors.text,
    '--mw-muted-text': colors.mutedText,
    '--mw-border': colors.border,
    '--mw-accent': colors.accent,
    '--mw-accent-text': colors.accentText,
    '--mw-focus': colors.focus,
    '--mw-success': colors.success,
    '--mw-danger': colors.danger,
    '--mw-danger-text': colors.dangerText,
    '--mw-font-display': typography.display,
    '--mw-font-heading': typography.heading,
    '--mw-font-body': typography.body,
    '--mw-font-label': typography.label,
    '--mw-font-numeric': typography.numeric,
    '--mw-label-tracking': typography.tracking,
    '--mw-control-gap': spacing.controlGap,
    '--mw-card-padding': spacing.cardPadding,
    '--mw-section-gap': spacing.sectionGap,
    '--mw-density': spacing.density,
    '--mw-control-radius': geometry.controlRadius,
    '--mw-surface-radius': geometry.surfaceRadius,
    '--mw-border-width': geometry.borderWidth,
    '--mw-surface-shadow': material.surfaceShadow,
    '--mw-control-shadow': material.controlShadow,
    '--mw-motion-fast': motion.fastDuration,
    '--mw-motion-standard': motion.standardDuration,
    '--mw-motion-ambient': motion.ambientDuration,
    '--mw-motion-easing': motion.easing,
  };
}
