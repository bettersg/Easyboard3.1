import { View } from './View'

export interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  className?: string
}

export const ProgressIndicator = ({
  currentStep,
  totalSteps,
  className = ''
}: ProgressIndicatorProps) => {
  return (
    <View className={['flex-row gap-[5px] items-start', className].join(' ')}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber <= currentStep
        return (
          <View
            key={index}
            className={[
              'flex-1 h-1 rounded-full',
              isActive ? 'bg-[#005BBE]' : 'bg-[#C0DEFF]'
            ].join(' ')}
          />
        )
      })}
    </View>
  )
}
