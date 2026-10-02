import { cssInterop } from 'nativewind'
import { Animated as RNAnimated } from 'react-native'

export const Animated = {
  View: cssInterop(RNAnimated.View, {
    className: 'style'
  }),
  Text: cssInterop(RNAnimated.Text, {
    className: 'style'
  }),
  Image: cssInterop(RNAnimated.Image, {
    className: 'style'
  }),
  ScrollView: cssInterop(RNAnimated.ScrollView, {
    className: 'style',
    contentContainerClassName: 'contentContainerStyle'
  })
}
