import { Pressable, Text, View } from "react-native";
import { styled } from "nativewind";

const StyledPressable = styled(Pressable);

interface Props {
  additionalClassName?: string;
  onPress: () => void;
  value?: string;
  placeholder?: string;
  textClassName?: string;
}
/**
 * This is written as generic as possible, but also as extendible as possible
 * Whenever you come across a new prop or style you want to pass in, feel free to refactor/extend this component
 */
const ImageUploadButton = ({
  additionalClassName,
  onPress,
  value,
  placeholder = "Upload Image",
  textClassName,
}: Props) => {
  return (
    <StyledPressable
      className={[
        "active:opacity-75 rounded-sm border-[0.5px] border-textInputBorder flex flex-row",
        additionalClassName,
      ].join(" ")}
      onPress={onPress}
    >
      <View className="px-2 py-3 flex flex-1">
        <Text
          numberOfLines={1}
          className={[
            "text-md",
            value ? "text-black" : "text-gray-600",
            textClassName,
          ].join(" ")}
        >
          {value ? value : placeholder}
        </Text>
      </View>
      <View className="px-3 py-3 border-textInputBorder bg-slate-200 border-l-[0.5px] flex items-center justify-center rounded-r-sm">
        <Text className="text-md text-black">Browse</Text>
      </View>
    </StyledPressable>
  );
};
export default ImageUploadButton;
