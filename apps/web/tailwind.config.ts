import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/common/src/**/*.{js,jsx,mjs,ts,tsx}',
    '../.storybook/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  important: 'html',
  /* eslint-disable @typescript-eslint/no-require-imports */
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-pt-sans)', 'sans-serif']
      }
    }
  },
  plugins: [],
  corePlugins: {
    borderOpacity: true
  }
}
export default config
