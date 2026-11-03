export const tokens = {
  colors: {
    gold: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
    },
    background: '#09090b',
    surface: '#18181b',
    surfaceMuted: '#27272a',
    border: '#27272a',
    emerald: '#10b981',
    rose: '#f43f5e',
  },
  typography: {
    fontSans: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
    fontMono: 'var(--font-mono, monospace)',
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
} as const;

