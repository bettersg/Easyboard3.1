import type { Config } from 'tailwindcss'

const config: Config = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    './index.js',
    './app/**/*.{js,jsx,ts,tsx}',
    '../../packages/common/src/**/*.{js,jsx,mjs,ts,tsx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
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
