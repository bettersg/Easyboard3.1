import { ActivityIndicator } from 'react-native'
import { Text } from './Text'
import { View } from './View'

export const LoadingIndicator = () => (
  <View className='flex flex-1 items-center justify-center'>
    <ActivityIndicator size='large' color='#3F98F8' />
    <Text className='text-md mt-4 text-slate-500'>Loading</Text>
  </View>
)
