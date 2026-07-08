/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#38BDF8', // Sky Blue
          dark: '#0284C7',
        },
        accent: {
          DEFAULT: '#0F172A', // Deep Blue
          light: '#1E293B',
        },
        neutral: {
          light: '#F8FAFC',   // Light Gray background
          border: '#E2E8F0',
        },
        success: '#22C55E',
        warning: '#EAB308',
        error: '#EF4444',
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
        }
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'card': '20px',
        'btn': '14px',
        'input': '14px',
      }
    },
  },
  plugins: [],
}
