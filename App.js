import Intro from "./pages/introduction";
import Setting from "./pages/setting";
import Main from "./pages/main";
import CalcTransit from "./pages/calcTransit";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import { Button } from "react-native";
import "react-native-gesture-handler";
import Direction from "./pages/direction";

const Stack = createNativeStackNavigator();

export default function App() {
  const [hasSetting, setHasSettings] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const storedData = await SecureStore.getItemAsync(
          Constants.manifest.extra.settingsStoredKey
        );
        if (storedData) setHasSettings(true);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!hasSetting ? (
          <>
            <Stack.Screen
              name="Introduction"
              component={Intro}
              options={{ title: "Welcome to EasyBoard" }}
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
          name="Direction"
          component={Direction}
          options={{ title: "Live Directions" }}
        ></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
