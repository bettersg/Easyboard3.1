import Introduction from "./src/pages/Introduction";
import CalcTransit from "./src/pages/CalcTransit";
import Setting from "./src/pages/Setting";
import Main from "./src/pages/Main";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { Button } from "react-native";
import "react-native-gesture-handler";
import Direction from "./src/pages/direction";

import RootStackParamList from "./src/types/RootStackParamList.type";
import { SettingValues } from "./src/types/SettingKey.type";
import Page from "./src/common/components/Page";
import LoadingIndicator from "./src/common/components/LoadingIndicator";
import GoogleMapsDirections from "./src/pages/GoogleMapsDirections";
import TransitOptions from "./src/pages/TransitOptions";

const Stack = createNativeStackNavigator<RootStackParamList>();
const settingsDefaultValues: SettingValues = {
  name: null,
  careGiverPhoneNumber: "",
  houseAddrs: null,
  housePhotoUri: null,
  gotoFavAddrs: null,
  gotoFavAddrsName: "",
  gotoFavPhotoUri: [],
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSetting, setHasSettings] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const storedData = await SecureStore.getItemAsync(
          Constants.expoConfig?.extra?.settingsStoredKey
        );
        // clearing the settings if its all defult values
        if (JSON.stringify(settingsDefaultValues) == storedData) {
          await SecureStore.setItemAsync(
            Constants.expoConfig?.extra?.settingsStoredKey,
            ""
          );
        } else if (storedData) {
          setHasSettings(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!hasSetting ? (
          <>
            <Stack.Screen
              name="Introduction"
              component={Introduction}
              options={{ title: "Welcome" }}
            />
            <Stack.Screen
              name="Main"
              component={Main}
              options={({ navigation }) => ({
                title: "EasyBoard",
                headerRight: () => (
                  <Button
                    title="Setting"
                    onPress={() => navigation.navigate("Setting")}
                  />
                ),
              })}
            />
          </>
        ) : (
          <Stack.Screen
            name="Main"
            component={Main}
            options={({ navigation }) => ({
              title: "EasyBoard",
              headerRight: () => (
                <Button
                  title="Setting"
                  onPress={() => navigation.navigate("Setting")}
                />
              ),
            })}
          />
        )}
        <Stack.Screen
          name="Setting"
          component={Setting}
          options={{ title: "Settings", headerBackVisible: hasSetting }} // set this to a variable to check if the user already has settings or not
        />
        <Stack.Screen
          name="CalcTransit"
          component={CalcTransit}
          options={{ title: "Pick a route" }}
        />
        <Stack.Screen
          name="GoogleMapsDirections"
          component={GoogleMapsDirections}
          options={{ title: "Pick a route" }}
        />
        <Stack.Screen
          name="TransitOptions"
          component={TransitOptions}
          options={{ title: "Pick a route" }}
        />
        <Stack.Screen
          name="Direction"
          component={Direction}
          options={{ title: "Live Directions" }}
        ></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
