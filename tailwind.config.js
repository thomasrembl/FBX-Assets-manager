/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(220 13% 18%)',
        input: 'hsl(220 13% 18%)',
        background: 'hsl(220 16% 6%)',
        foreground: 'hsl(220 10% 92%)',
        card: {
          DEFAULT: 'hsl(220 15% 9%)',
          foreground: 'hsl(220 10% 92%)',
        },
        primary: {
          DEFAULT: '#7798a8',
          foreground: 'hsl(220 15% 6%)',
        },
        secondary: {
          DEFAULT: 'hsl(220 13% 14%)',
          foreground: 'hsl(220 10% 75%)',
        },
        muted: {
          DEFAULT: 'hsl(220 13% 12%)',
          foreground: 'hsl(220 10% 50%)',
        },
        accent: {
          DEFAULT: 'hsl(35 80% 50%)',
          foreground: 'hsl(220 15% 6%)',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
