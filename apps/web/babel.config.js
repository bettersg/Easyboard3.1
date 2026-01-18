module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          alias: {
            'react-native': '../../node_modules/react-native-web',
            // Uncomment this if you want fast-refresh to work with reanimated:
            'react-native-reanimated':
              '../../node_modules/react-native-reanimated/src'
          }
        }
      ],
      ['react-native-worklets/plugin', workletsPluginOptions]
    ]
  }
}
