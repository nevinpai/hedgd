module.exports = {
  darkMode: false, // or 'media' or 'class'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hedgd-blue': '#1a223f',
        'hedgd-purple': '#232336',
        'hedgd-green': '#3ba97b',
        'hedgd-pastelGreen': '#7be6b7',
        'hedgd-pastelRed': '#ffb3b3',
        'hedgd-card': '#232336',
        gray: {
          300: '#b0b3c6',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
