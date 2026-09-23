/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        liftBg: "#05060A",
        liftCard: "#0F121C",
        liftCardBorder: "#1E2436",
        liftCyan: "#00F0FF",
        liftMint: "#00FF9D",
        liftPurple: "#A855F7",
        liftPink: "#EC4899",
        liftRose: "#FF3B30",
        liftGold: "#FFCC00",
        liftMuted: "#64748B"
      },
      keyframes: {
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.6))' },
          '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 16px rgba(0, 240, 255, 0.9))' }
        },
        wavePulse: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0.8' }
        }
      },
      animation: {
        slideUpFade: 'slideUpFade 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        pulseGlow: 'pulseGlow 2s ease-in-out infinite',
        wavePulse: 'wavePulse 3s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
