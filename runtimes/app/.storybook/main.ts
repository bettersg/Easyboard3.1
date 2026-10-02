import type { StorybookConfig } from '@storybook/react-native-web-vite'
import tailwindcss from '@tailwindcss/vite'
import { uniwind } from 'uniwind/vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {}
  },
  // Same styling pipeline as the app: Tailwind 4 compiled by Uniwind
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = [
      ...(viteConfig.plugins ?? []),
      tailwindcss(),
      uniwind({ cssEntryFile: './global.css' })
    ]
    return viteConfig
  }
}

export default config
