import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#0a0a0a',
          accent: '#c0392b',
          narcissism: '#f0c040',
          psychopathy: '#c0392b',
          machiavellianism: '#8e44ad',
        },
      },
    },
  },
  plugins: [],
};

export default config;
