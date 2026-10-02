import { cssInterop } from 'nativewind'
import { Animated as RNAnimated } from 'react-native'

// Only View is used. Typing cssInterop(Animated.ScrollView) exceeds
// TypeScript's union limit on React Native 0.83, so add others only as needed.
export const Animated = {
  View: cssInterop(RNAnimated.View, {
    className: 'style'
  })
}
