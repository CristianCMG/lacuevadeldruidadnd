/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#1b1d21',
        foreground: '#f8fafc',
        primary: {
          DEFAULT: '#e40712',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f59e0b',
          foreground: '#1b1d21',
        },
        card: {
          DEFAULT: '#27292d',
          foreground: '#f8fafc',
        },
        border: '#3e4147',
        input: '#3e4147',
        ring: '#e40712',
      },
      fontFamily: {
        display: ['var(--font-cinzel)', 'serif'],
        sans: ['var(--font-roboto)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

module.exports = config