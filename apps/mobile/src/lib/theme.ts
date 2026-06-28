/** Shared colours/spacing for the mobile UI (mirrors the web palette). */
export const theme = {
  colors: {
    bg: '#0a0a0f',
    surface: '#111118',
    surfaceAlt: '#1a1a24',
    border: 'rgba(255,255,255,0.10)',
    text: '#f4f4f5',
    textMuted: '#a1a1aa',
    accent: '#7c5cff',
    accentSoft: '#a594ff',
    danger: '#fca5a5',
  },
  radius: { sm: 8, md: 14, lg: 20, pill: 999 },
  space: (n: number) => n * 4,
} as const;
