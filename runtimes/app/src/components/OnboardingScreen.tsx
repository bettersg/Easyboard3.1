import { Text, View } from './index'

export interface OnboardingScreenProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export const OnboardingScreen = ({
  title,
  description,
  children,
  className = ''
}: OnboardingScreenProps) => {
  return (
    <View
      className={['flex-col gap-4 items-center justify-center', className].join(
        ' '
      )}
    >
      <Text className='font-bold text-[32px] text-[#005BBE] text-center w-full'>
        {title}
      </Text>
      {description && (
        <Text className='font-normal text-base text-[#677281] text-center w-full'>
          {description}
        </Text>
      )}
      {children}
    </View>
  )
}
