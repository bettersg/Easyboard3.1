import { Image, Pressable, Text, View } from "react-native";
import { styled } from "nativewind";
import { Feather } from "@expo/vector-icons";
import { useMemo } from "react";

const StyledPressable = styled(Pressable);

interface Props {
  borderColor: string;
  onPress: () => void;
  title: "Home" | string;
  subtitle: string;
  imageUri: string;
  iconName?: "home" | "globe" | "help-circle" | "map" | "star";
}
/**
 * This is written as generic as possible, but also as extendible as possible
 * Whenever you come across a new prop or style you want to pass in, feel free to refactor/extend this component
 */
const SavedLocationCard = ({
  borderColor,
  onPress,
  title,
  subtitle,
  iconName = "help-circle",
  imageUri,
}: Props) => {
  const renderBackupImage = useMemo(() => {
    if (title === "Home") {
      return (
        <Image
          source={require("../../../assets/default-home-image.jpg")}
          className="w-full h-full overflow-hidden"
        />
      );
    }
    return (
      <Image
        source={require("../../../assets/default-other-image.jpg")}
        className="w-full h-full overflow-hidden"
      />
    );
  }, [title]);
  return (
    <StyledPressable
      className={[
        "relative w-full h-44 rounded-sm border-slate-500 border-2 active:opacity-75",
        borderColor,
      ].join(" ")}
      onPress={onPress}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          className="w-full h-full overflow-hidden"
        />
      ) : (
        renderBackupImage
      )}
      <View
        style={{ backgroundColor: "rgba(0,0, 0, 0.7)" }}
        className="bg-slate-600 bg-opacity-10 absolute bottom-0 left-0 right-0 flex flex-row items-center px-3 py-1 rounded-b-sm"
      >
        {iconName && <Feather name={iconName} size={36} color="white" />}
        <View className="pl-3">
          <Text numberOfLines={2} className={`text-white font-bold text-lg `}>
            {title}
          </Text>
          <Text numberOfLines={2} className={`text-white pb-1 pr-5`}>
            {subtitle}
          </Text>
        </View>
      </View>
    </StyledPressable>
  );
};
export default SavedLocationCard;
