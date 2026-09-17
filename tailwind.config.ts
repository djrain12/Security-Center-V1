import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        canvas: '#07151b',
        surface: '#0c2027',
        line: '#1b3a42',
        mint: '#49d4bf',
        coral: '#ef855b',
        amber: '#f5b55e',
      },
    },
  },
  plugins: [],
};

export default config;
