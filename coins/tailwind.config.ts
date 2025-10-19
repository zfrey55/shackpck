import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        gold: '#eab308',
        silver: '#c0c0c0',
        charcoal: '#0b1220'
      },
      boxShadow: {
        glow: '0 0 24px rgba(234, 179, 8, 0.2)'
      }
    }
  },
  plugins: []
};

export default config;


