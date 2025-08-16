import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3D74B6',
        secondary: '#FBF5DE',
        accent: {
          DEFAULT: '#C89F2F',  // main accent
          gold: '#FFD700',     // bright gold
          dark: '#D3AF37'      // deeper gold tone
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config 