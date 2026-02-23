/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        dark: '#111827',
        surface: '#1F2937',
        'text-primary': '#F3F4F6',
        'text-secondary': '#D1D5DB',
        'border-color': '#374151',
      },
      minHeight: {
        touch: '48px',
      },
      minWidth: {
        touch: '48px',
      },
    },
  },
  plugins: [],
};
