/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        surface: '#0f1117',
        panel: '#161b27',
        border: '#1e2535',
        accent: '#00d4aa',
        'accent-dim': '#00a882',
        danger: '#ff4d6d',
        warn: '#ffb347',
        muted: '#4a5568',
      },
    },
  },
  plugins: [],
}
