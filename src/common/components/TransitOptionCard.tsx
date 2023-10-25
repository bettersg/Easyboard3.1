import { Feather } from '@expo/vector-icons'
import { styled } from 'nativewind'
import { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'

import TransitTypePill from './TransitTypePill'
import { GoogleRouteStepsOverview } from '../utils/GoogleRouteUtils'

const StyledPressable = styled(Pressable)

interface Props {
  onPress?: () => void
  index?: number
  googleRouteStepsOverview: GoogleRouteStepsOverview
}
/**
 * This is written as generic as possible, but also as extendible as possible
 * Whenever you come across a new prop or style you want to pass in, feel free to refactor/extend this component
 */
const TransitOptionCard = ({ onPress, googleRouteStepsOverview, index }: Props) => {
  const { totalDistance, totalDuration, steps } = googleRouteStepsOverview
  const routeName = useMemo(() => {
    return typeof index !== 'undefined' ? `Route ${index + 1}` : 'Selected Route'
  }, [index])
  return (
    <StyledPressable
      className={[
        `relative mb-4 w-full rounded-md border-[0.5px] border-slate-300 bg-white p-4`,
        onPress ? 'active:opacity-75' : '',
      ].join(' ')}
      onPress={onPress}
    >
      <View className="flex flex-col">
        <Text className="text-xl font-bold">{routeName}</Text>
        <View className="flex flex-row flex-wrap items-center pb-6 pt-4">
          {steps.map((step, i) => {
            return (
              <>
                <TransitTypePill travelMode={step.travelMode} transitLine={step.transitLine} />
                {i !== steps.length - 1 && (
                  <View className="px-1">
                    <Feather name="chevron-right" size={20} color="black" />
                  </View>
                )}
              </>
            )
          })}
        </View>

        <View className="flex flex-row items-baseline justify-between pb-2 pr-2">
          <Text>Estimated distance:</Text>
          <Text className="text-lg font-bold">{totalDistance}</Text>
        </View>
        <View className="flex flex-row items-baseline justify-between pb-2 pr-2">
          <Text>Estimated journey time:</Text>
          <Text className="text-lg font-bold">{totalDuration}</Text>
        </View>
      </View>
    </StyledPressable>
  )
}
export default TransitOptionCard
