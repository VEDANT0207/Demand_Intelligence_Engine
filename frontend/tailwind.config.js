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
          DEFAULT: "#4F46E5",
          dark: "#4338CA",
          light: "#E0E7FF",
        },
        secondary: {
          DEFAULT: "#7C3AED",
          dark: "#6D28D9",
          light: "#F3E8FF",
        },
        accent: {
          DEFAULT: "#06B6D4",
          dark: "#0891B2",
          light: "#ECFEFF",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        }
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(79, 70, 229, 0.08), 0 2px 10px -1px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 10px 30px -3px rgba(79, 70, 229, 0.12), 0 4px 15px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
