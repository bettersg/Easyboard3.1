import { Pressable, Text } from "react-native";
import { styled } from "nativewind";
import { Feather } from "@expo/vector-icons";

const StyledPressable = styled(Pressable);

interface Props {
  type?:
    | "bg-primary"
    | "bg-secondary"
    | "bg-error"
    | "bg-warning"
    | "bg-success"
    | "bg-white";
  fullWidth?: boolean;
  onPress: () => void;
  title: string;
  iconName?:
    | "phone-call"
    | "save"
    | "map-pin"
    | "chevron-right"
    | "chevron-left";
  iconSize?: number;
  titleSize?: string;
}
/**
 * This is written as generic as possible, but also as extendible as possible
 * Whenever you come across a new prop or style you want to pass in, feel free to refactor/extend this component
 */
const EasyboardButton = ({
  type,
  fullWidth,
  onPress,
  title,
  titleSize = "text-base",
  iconName,
  iconSize = 20,
}: Props) => {
  return (
    <StyledPressable
      className={[
        "h-12 flex flex-row items-center justify-center rounded-3xl px-4 active:opacity-75 bg-primary",
        type,
        type === "bg-white" ? "border-slate-800 border-2" : "",
        fullWidth ? "w-full" : "",
      ].join(" ")}
      onPress={onPress}
    >
      <>
        {iconName && (
          <Feather
            name={iconName}
            size={iconSize}
            color={type === "bg-white" ? "black" : "white"}
          />
        )}
        <Text
          className={`text-center ${
            type === "bg-white" ? "text-slate-800" : "text-white"
          } font-semibold px-2 ${titleSize}`}
        >
          {title}
        </Text>
      </>
    </StyledPressable>
  );
};
export default EasyboardButton;
