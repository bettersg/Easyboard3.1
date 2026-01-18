import type { TransitLine, TravelMode } from '../types/googleRoute'
import { Text, View } from '.'

interface TransitTypePillProps {
  travelMode: TravelMode
  transitLine?: TransitLine
}

/**
 * Pill to show what type of transit it is
 */
export const TransitTypePill = ({
  travelMode,
  transitLine
}: TransitTypePillProps) => {
  if (travelMode === 'WALK') {
    return (
      <View className='flex-row'>
        <View className='my-1 py-1 px-2 rounded-lg flex-row items-center bg-cyan-700'>
          <Text className='text-white text-sm'>🚶 Walk</Text>
        </View>
      </View>
    )
  }

  if (travelMode === 'TRANSIT' && transitLine) {
    const vehicleIcon = transitLine.vehicle.type === 'BUS' ? '🚌' : '🚆'

    return (
      <View className='flex-row'>
        <View
          style={{ backgroundColor: transitLine.color }}
          className='my-1 py-1 px-2 rounded-lg flex-row items-center'
        >
          <Text style={{ color: transitLine.textColor }} className='text-sm'>
            {vehicleIcon} {transitLine.name}
          </Text>
        </View>
      </View>
    )
  }

  // Fallback for TRANSIT without transitLine info
  if (travelMode === 'TRANSIT') {
    return (
      <View className='flex-row'>
        <View className='my-1 py-1 px-2 rounded-lg flex-row items-center bg-blue-600'>
          <Text className='text-white text-sm'>🚌 Transit</Text>
        </View>
      </View>
    )
  }

  return null
}
