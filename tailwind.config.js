export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0d14',
        surface: '#111520',
        surface2: '#161c2d',
        gold: '#c9a84c',
        teal: '#4cc9c9',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        mono: ['"DM Mono"', 'monospace'],
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
