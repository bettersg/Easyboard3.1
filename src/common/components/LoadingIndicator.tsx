import { View, ActivityIndicator, Text } from 'react-native'

const LoadingIndicator = () => (
  <View className="flex flex-1 items-center justify-center">
    <ActivityIndicator size="large" />
    <Text className="text-md mt-4 text-slate-500">Loading</Text>
  </View>
)
export default LoadingIndicator
