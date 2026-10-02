import { Button, Text, View } from './index'

export interface LocationCardProps {
  title: string
  subtitle?: string
  onPress?: () => void
  isHome?: boolean
  className?: string
}

export const LocationCard = ({
  title,
  subtitle,
  onPress,
  isHome = false,
  className = ''
}: LocationCardProps) => {
  const content = (
    <View
      className={[
        'bg-[#FCFCFD] rounded-[5px] flex-col items-start justify-center',
        className
      ].join(' ')}
    >
      <View className='flex-col gap-[10px] items-center justify-center px-4 py-2 w-full'>
        <View className='flex-row items-center justify-between w-full'>
          <Text className='flex-1 font-bold text-base text-[#414852]'>
            {title}
            {isHome && '*'}
          </Text>
        </View>
        {subtitle && (
          <Text className='font-normal text-sm text-[#3F98F8] w-full'>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  )

  if (onPress) {
    return (
      <Button onPress={onPress} text={title} className='active:opacity-75'>
        {content}
      </Button>
    )
  }

  return content
}
