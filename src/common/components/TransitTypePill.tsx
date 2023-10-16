import { FontAwesome5 } from '@expo/vector-icons'
import { Text, View } from 'react-native'

import { TransitLine, TravelMode } from '../../types/GoogleRoute.type'

interface Props {
  travelMode: TravelMode
  transitLine?: TransitLine
}

/**
 * Pill to show what type of transit it is
 */
const TransitTypePill = ({ travelMode, transitLine }: Props) => {
  const baseClass = 'my-2 py-1 px-2 rounded-lg flex flex-row items-center'
  if (travelMode === 'WALK') {
    return (
      <View className="flex flex-row">
        <View className={`${baseClass} bg-cyan-800`}>
          <FontAwesome5 name="walking" size={14} color="white" />
          <Text className="ml-1 text-white">Walk</Text>
        </View>
      </View>
    )
  }
  if (travelMode === 'TRANSIT') {
    if (transitLine) {
      return (
        <View className="flex flex-row">
          <View style={{ backgroundColor: transitLine.color }} className={baseClass}>
            <FontAwesome5
              name={transitLine.vehicle.type === 'BUS' ? 'bus' : 'train'}
              size={14}
              color={transitLine.textColor}
            />
            <Text style={{ color: transitLine.textColor }} className="ml-2">
              {transitLine.name}
            </Text>
          </View>
        </View>
      )
    }
  }
}
export default TransitTypePill
