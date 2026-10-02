import { Animated as RNAnimated } from 'react-native'
import { withUniwind } from 'uniwind'

// Uniwind styles core components directly; animated ones need withUniwind
export const Animated = {
  View: withUniwind(RNAnimated.View)
}
