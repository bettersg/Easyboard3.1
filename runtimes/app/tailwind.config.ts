import type { Config } from 'tailwindcss'

const config: Config = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: 'Inter'
      }
    }
  },
  plugins: [],
  corePlugins: {
    borderOpacity: false
  }
}

export default config
