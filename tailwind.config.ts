import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Habilita el modo oscuro usando la clase 'dark'
  theme: {
    extend: {},
  },
  plugins: [],
}

export default config
