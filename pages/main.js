import { useEffect, useState } from "react";
import { Pressable, Text, Image, View } from "react-native";
import styles from "../styles/style";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import { Colors } from "../styles/color";
import LocationInputBtn from "../shared/locationSelector/locationInputBtn";
import call from "react-native-phone-call";

export default function Main({ navigation }) {
  const [userSetting, setUserSetting] = useState(null);
  const [location, setMarkerLocation] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const storedData = await SecureStore.getItemAsync(
          Constants.manifest.extra.settingsStoredKey
        );
        if (storedData) setUserSetting(JSON.parse(storedData));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      try {
        const storedData = await SecureStore.getItemAsync(
          Constants.manifest.extra.settingsStoredKey
        );
        if (storedData) setUserSetting(JSON.parse(storedData));
      } catch (e) {
        console.error(e);
      }
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if(location != null){
      navigation.navigate("CalcTransit", {
        destinationName: location.description,
        destination: location,
      });
    }
  }, [location])

  const cardShadowStyle = function ({ pressed }, backgroundColor = Colors.white) {
    return [
      styles.pressableCard,
      {
        shadowColor: pressed ? Colors.white : Colors.black,
        backgroundColor: backgroundColor,
        borderWidth: pressed ? 0.8 : 1,
      },
    ];
  };

  const callCareTaker = async function () {
    try {
      await call({
        number: userSetting.careGiverPhoneNumber, // String value with the number to call
        prompt: false, // Optional boolean property. Determines if the user should be prompted prior to the call
        skipCanOpen: true, // Skip the canOpenURL check
      });
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <View style={styles.container}>
      {userSetting && (
        <>
          <View>
            <Text
              style={styles.header}
            >
              Go to where?
            </Text>
            <Pressable
              style={(prop) => cardShadowStyle(prop, Colors.success)}
              onPress={() => {
                navigation.navigate("CalcTransit", {
                  destinationName: "Home",
                  destination: userSetting.houseAddrs,
                });
              }}
            >
              <View style={styles.horizontalCardContainer}>
                <Image
                  source={{ uri: userSetting.housePhotoUri }}
                  style={styles.cardImg}
                />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitleText}>Home</Text>
                  <Text style={styles.cardBodyText}>
                    {userSetting.houseAddrs.description}
                  </Text>
                </View>
              </View>
            </Pressable>

            <Pressable
              style={(prop) => cardShadowStyle(prop, Colors.primary)}
              onPress={() => {
                navigation.navigate("CalcTransit", {
                  destination: userSetting.gotoFavAddrs,
                  destinationName: userSetting.gotoFavAddrsName,
                });
              }}
            >
              <View style={styles.horizontalCardContainer}>
                <Image
                  source={{ uri: userSetting.gotoFavPhotoUri[0] }}
                  style={styles.cardImg}
                />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitleText}>{userSetting.gotoFavAddrsName}</Text>
                  <Text style={styles.cardBodyText}>
                    {userSetting.gotoFavAddrs.description}
                  </Text>
                </View>
              </View>
            </Pressable>

            <LocationInputBtn
              onLocationSelect={(markerLocation) =>
                setMarkerLocation(markerLocation)
              }
            />
          </View>

          <View
            style={[
              styles.flexHorizontal,
              styles.footer,
              { justifyContent: "space-between" },
            ]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.mainFooterBtn,
                {
                  backgroundColor: pressed ? Colors.errorDarker : Colors.error,
                },
              ]}
              onPress={callCareTaker}
            >
              <Text style={styles.mainFooterBtnText}>Call my caregiver</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.mainFooterBtn,
                {
                  backgroundColor: pressed
                    ? Colors.warningDarker
                    : Colors.warning,
                },
              ]}
            >
              <Text style={styles.mainFooterBtnText}>Share Location</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
