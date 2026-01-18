import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./**/*.{js,ts,jsx,tsx,mdx}'],
  important: 'html',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {}
  },
  plugins: []
}
export default config
