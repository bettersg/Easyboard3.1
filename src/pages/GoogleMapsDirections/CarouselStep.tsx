import { Text, View } from 'react-native'

import TransitTypePill from '../../common/components/TransitTypePill'
import { Step } from '../../types/GoogleRoute.type'

interface Props {
  step: Step
}

const CarouselStep = ({ step }: Props) => {
  return (
    <View
      className="mx-1 flex flex-col justify-between rounded-md bg-slate-50 px-4 py-2 shadow shadow-slate-800"
      key={step.polyline.encodedPolyline}
    >
      <View className="flex flex-row items-center justify-between">
        <TransitTypePill
          travelMode={step.travelMode}
          transitLine={step.transitDetails?.transitLine}
        />
        <View>
          <Text>
            {'Duration: '}
            <Text className="font-semibold">
              {step.localizedValues.staticDuration.text ?? step.staticDuration}
            </Text>
          </Text>
        </View>
      </View>
      <View className="mb-2">
        <Text className="text-lg font-semibold">Instructions</Text>
        <View className="flex flex-row items-baseline">
          <Text>
            {step.navigationInstruction?.instructions ??
              `Continue ${step.travelMode === 'WALK' ? 'Walking' : 'on the ride'}`}
          </Text>
          {step.transitDetails?.stopCount && (
            <Text>{` (${step.transitDetails?.stopCount} Stops)`}</Text>
          )}
        </View>
      </View>
    </View>
  )
}
export default CarouselStep
