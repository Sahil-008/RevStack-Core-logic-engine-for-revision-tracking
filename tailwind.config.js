/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050505",
        primary: {
          DEFAULT: "#FF6B00",
          hover: "#E05E00",
          glow: "rgba(255, 107, 0, 0.35)",
        },
        cyanAccent: {
          DEFAULT: "#2CE6FF",
          glow: "rgba(44, 230, 255, 0.35)",
        },
        purpleAccent: {
          DEFAULT: "#8A5CFF",
          glow: "rgba(138, 92, 255, 0.35)",
        },
        glass: {
          bg: "rgba(10, 10, 10, 0.7)",
          border: "rgba(255, 255, 255, 0.08)",
          borderHover: "rgba(255, 255, 255, 0.16)",
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px rgba(255, 107, 0, 0.25)',
        'glow-cyan': '0 0 25px rgba(44, 230, 255, 0.25)',
        'glow-purple': '0 0 25px rgba(138, 92, 255, 0.25)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.8)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-flow': 'glowFlow 6s linear infinite',
      },
      keyframes: {
        glowFlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 5px rgba(255, 107, 0, 0.3))' },
          '33%': { filter: 'drop-shadow(0 0 10px rgba(44, 230, 255, 0.3))' },
          '66%': { filter: 'drop-shadow(0 0 8px rgba(138, 92, 255, 0.3))' },
        }
      }
    },
  },
  plugins: [],
}
