// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#4a4a4a',
        muted: '#6b7280',
        light: '#9ca3af',
        border: '#e5e7eb',
        surface: '#f9fafb',
        'surface-raised': '#ffffff',
        danger: '#dc2626',
        success: '#16a34a',
        warning: '#d97706',
        accent: '#2563eb',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '12px',
      },
      boxShadow: {
        DEFAULT: '0 1px 3px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
}