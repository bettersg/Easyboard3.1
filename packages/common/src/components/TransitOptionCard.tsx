import { Fragment, useMemo } from 'react'
import { Pressable } from 'react-native'
import type { GoogleRouteStepsOverview } from '../types/googleRoute'
import { Text, View } from '.'
import { TransitTypePill } from './TransitTypePill'

interface TransitOptionCardProps {
  onPress?: () => void
  index?: number
  googleRouteStepsOverview: GoogleRouteStepsOverview
}

/**
 * Card displaying a transit route option with steps overview
 */
export const TransitOptionCard = ({
  onPress,
  googleRouteStepsOverview,
  index
}: TransitOptionCardProps) => {
  const { totalDistance, totalDuration, steps } = googleRouteStepsOverview

  const routeName = useMemo(() => {
    return typeof index !== 'undefined'
      ? `Route ${index + 1}`
      : 'Selected Route'
  }, [index])

  return (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.75 : 1,
          backgroundColor: 'white',
          borderRadius: 8,
          borderWidth: 0.5,
          borderColor: '#CBD5E1',
          padding: 12,
          width: '100%'
        }
      ]}
      onPress={onPress}
    >
      <View className='flex-col'>
        <Text className='text-lg font-bold text-gray-800'>{routeName}</Text>

        {/* Transit steps pills */}
        <View className='flex-row flex-wrap items-center pt-2'>
          {steps.map((step, i) => (
            <Fragment key={i}>
              <TransitTypePill
                travelMode={step.travelMode}
                transitLine={step.transitLine}
              />
              {i !== steps.length - 1 && (
                <View className='px-1'>
                  <Text className='text-gray-500'>›</Text>
                </View>
              )}
            </Fragment>
          ))}
        </View>

        {/* Distance */}
        <View className='flex-row items-baseline justify-between pb-2 pr-1 pt-3'>
          <Text className='text-base text-gray-600'>Estimated distance:</Text>
          <Text className='text-lg font-semibold text-indigo-600'>
            {totalDistance}
          </Text>
        </View>

        {/* Duration */}
        <View className='flex-row items-baseline justify-between pr-2'>
          <Text className='text-base text-gray-600'>
            Estimated journey time:
          </Text>
          <Text className='text-lg font-semibold text-indigo-600'>
            {totalDuration}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}
