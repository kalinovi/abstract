import type { Config } from 'tailwindcss';

// Anchor content globs to this file's directory so they resolve correctly
// regardless of the process working directory (the dev server is launched
// from the monorepo root). fast-glob needs forward slashes on Windows.
const here = __dirname.replace(/\\/g, '/');

const config: Config = {
  content: [`${here}/src/**/*.{ts,tsx}`],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0a0f',
          900: '#111118',
          800: '#1a1a24',
          700: '#262633',
        },
        accent: {
          DEFAULT: '#7c5cff',
          soft: '#a594ff',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
