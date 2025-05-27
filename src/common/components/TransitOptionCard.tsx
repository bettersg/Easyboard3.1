import { Feather } from '@expo/vector-icons'
import { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'

import TransitTypePill from './TransitTypePill'
import { GoogleRouteStepsOverview } from '../utils/GoogleRouteUtils'

interface Props {
  onPress?: () => void
  index?: number
  googleRouteStepsOverview: GoogleRouteStepsOverview
}
/**
 * This is written as generic as possible, but also as extendible as possible
 * Whenever you come across a new prop or style you want to pass in, feel free to refactor/extend this component
 */
const TransitOptionCard = ({
  onPress,
  googleRouteStepsOverview,
  index
}: Props) => {
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
      <View style={{ flexDirection: 'column' }}>
        <Text style={{ 
          fontSize: 18,
          fontWeight: '700',
          color: '#1F2937'
        }}>
          {routeName}
        </Text>
        <View style={{ 
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          paddingTop: 10
        }}>
          {steps.map((step, i) => {
            return (
              <View key={`step-${i}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TransitTypePill
                  travelMode={step.travelMode}
                  transitLine={step.transitLine}
                />
                {i !== steps.length - 1 && (
                  <View style={{ paddingHorizontal: 4 }}>
                    <Feather name='chevron-right' size={18} color='black' />
                  </View>
                )}
              </View>
            )
          })}
        </View>

        <View style={{ 
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingBottom: 8,
          paddingRight: 4
        }}>
          <Text style={{ 
            fontSize: 16,
            color: '#4B5563'
          }}>
            Estimated distance:
          </Text>
          <Text style={{ 
            fontSize: 18,
            fontWeight: '600',
            color: '#4F46E5'
          }}>
            {totalDistance}
          </Text>
        </View>
        <View style={{ 
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingRight: 8
        }}>
          <Text style={{ 
            fontSize: 16,
            color: '#4B5563'
          }}>
            Estimated journey time:
          </Text>
          <Text style={{ 
            fontSize: 18,
            fontWeight: '600',
            color: '#4F46E5'
          }}>
            {totalDuration}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

export default TransitOptionCard
