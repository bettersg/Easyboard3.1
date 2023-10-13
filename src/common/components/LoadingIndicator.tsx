import { View, ActivityIndicator, Text } from "react-native";

const LoadingIndicator = () => (
  <View className="flex flex-1 items-center justify-center">
    <ActivityIndicator size={"large"} />
    <Text className="text-slate-500 mt-4 text-md">Loading</Text>
  </View>
);
export default LoadingIndicator;
