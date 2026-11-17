/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#FFFFFF',
          'bg-secondary': '#F8FAFC',
          sidebar: '#FFFFFF',
          card: '#FFFFFF',
          text: '#172033',
          'text-secondary': '#64748B',
          blue: '#2563EB',
          'blue-light': '#EFF6FF',
          'blue-hover': '#1D4ED8',
          border: '#E5E7EB',
          success: '#16A34A',
          warning: '#D97706',
          error: '#DC2626',
          navy: '#1E293B',
          'navy-light': '#334155',
          violet: '#7C3AED',
          // Dark mode fallbacks (optional setting)
          'bg-dark': '#0B132B',
          'card-dark': '#131F37',
          'border-dark': '#1E293B',
          'text-dark': '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'dropdown': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
