import { Pressable } from 'react-native'
import type { MarkerData } from '../stores/onboardingStore'
import { Button, Image, Text, View } from '.'

export const SavedPlaceCard = (props: {
  title: string
  onPress?: () => void
  required?: boolean
  location?: MarkerData | null
  imageUri?: string
}) => {
  const { title, onPress, required, location, imageUri } = props
  const hasLocation = !!location?.description

  const cardContent = (
    <View className='w-full bg-[#FCFCFD] pb-2 rounded-md'>
      {(imageUri || location?.photoUri) && (
        <View className='w-full h-32 max-h-32 rounded-t-md overflow-hidden flex items-center justify-center'>
          <Image
            src={imageUri || location?.photoUri || ''}
            alt={title}
            width={500}
            height={128}
            contentFit='cover'
          />
        </View>
      )}
      <View className='flex flex-col items-start justify-between gap-2 px-4 pt-2'>
        <Text className='text-base font-bold text-[#414852]'>
          {`${title}${required && !hasLocation ? '*' : ''}`}
        </Text>
        {hasLocation ? (
          <Text className='text-sm text-[#9F9F9F]'>{location.description}</Text>
        ) : (
          onPress && (
            <Button
              className='p-0 h-fit'
              textClassName='text-[#3F98F8] text-sm font-normal'
              text={`Set ${title.toLowerCase()}`}
              onPress={onPress}
              variant='text'
            />
          )
        )}
      </View>
    </View>
  )

  // Wrap in Pressable when location is set to make entire card clickable
  if (hasLocation && onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          opacity: pressed ? 0.7 : 1
        })}
      >
        {cardContent}
      </Pressable>
    )
  }

  return cardContent
}
