import { Image, Pressable, Text, View } from "react-native";
import { styled } from "nativewind";
import { Feather } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import {
  GoogleRouteStepsOverview,
  GoogleRouteStepsOverviewStep,
} from "../utils/GoogleRouteUtils";
import TransitTypePill from "./TransitTypePill";

const StyledPressable = styled(Pressable);

interface Props {
  onPress: () => void;
  index: number;
  googleRouteStepsOverview: GoogleRouteStepsOverview;
}
/**
 * This is written as generic as possible, but also as extendible as possible
 * Whenever you come across a new prop or style you want to pass in, feel free to refactor/extend this component
 */
const TransitOptionCard = ({
  onPress,
  googleRouteStepsOverview,
  index,
}: Props) => {
  const { totalDistance, totalDuration, steps } = googleRouteStepsOverview;

  return (
    <StyledPressable
      className={
        "relative w-full rounded-md border-slate-300 border-[0.5px] p-4 active:opacity-75 mb-4 bg-white"
      }
      onPress={onPress}
    >
      <View className="flex flex-col">
        <Text className="font-bold text-xl">{`Route ${index + 1}`}</Text>
        <View className="flex flex-row flex-wrap pt-4 pb-6 items-center">
          {steps.map((step, i) => {
            return (
              <>
                <TransitTypePill
                  travelMode={step.travelMode}
                  transitLine={step.transitLine}
                />
                {i !== steps.length - 1 && (
                  <View className="px-1">
                    <Feather name="chevron-right" size={20} color={"black"} />
                  </View>
                )}
              </>
            );
          })}
        </View>

        <View className="flex flex-row items-baseline justify-between pr-2 pb-2">
          <Text>Estimated distance:</Text>
          <Text className="font-bold text-lg">{totalDistance}</Text>
        </View>
        <View className="flex flex-row items-baseline justify-between pr-2 pb-2">
          <Text>Estimated journey time:</Text>
          <Text className="font-bold text-lg">{totalDuration}</Text>
        </View>
      </View>
    </StyledPressable>
  );
};
export default TransitOptionCard;
