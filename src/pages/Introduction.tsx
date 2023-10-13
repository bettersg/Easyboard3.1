import { StatusBar } from "expo-status-bar";
import { Image, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import RootStackParamList from "../types/RootStackParamList.type";
import Page from "../common/components/Page";
import EasyboardButton from "../common/components/EasyboardButton";

type Props = NativeStackScreenProps<RootStackParamList, "Introduction">;

const Introduction = ({ navigation }: Props) => {
  return (
    <Page>
      <View className="flex items-center flex-1">
        <Image
          source={require("./../../assets/adaptive-icon.png")}
          className="aspect-square w-56 h-56"
        />
        <Text className="text-3xl">
          Welcome to <Text className="font-bold">Easyboard</Text>
        </Text>
        <View className="pt-8 pb-6">
          <Text className="text-lg py-2 text-slate-800">
            This app is designed to empower Persons with Intellectual
            Disabilities (PWIDs) navigate to and from work and school with
            greater independence.
          </Text>
          <Text className="text-lg py-2 text-slate-800">
            Please take a moment to do one time user profile setup.
          </Text>
          <Text className="text-lg py-2 text-slate-800">
            These Settings can be updated anytime from the settings page.
          </Text>
        </View>
      </View>
      <View className="mt-5">
        <EasyboardButton
          onPress={() => navigation.navigate("Setting")}
          type="bg-primary"
          iconName="chevron-right"
          title="LET'S GO!"
          titleSize="text-lg"
        />
      </View>
      <StatusBar style="auto" />
    </Page>
  );
};

export default Introduction;
