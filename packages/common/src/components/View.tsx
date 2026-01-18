import { cssInterop } from 'nativewind'
import { View as RNView } from 'react-native'

export const View = cssInterop(RNView, {
  className: 'style'
})
