import { useEffect, useState } from "react";
import {
  Pressable,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { getDirectionsAsync } from "../apis/CityMapperAPI";
import styles from "../styles/style";
import * as Location from "expo-location";
import { Colors } from "../styles/color";
import { CommonActions } from "@react-navigation/native";

export default function CalcTransit({ navigation, route }) {
  const { destination, destinationName } = route.params;
  const [transits, setTransits] = useState([]);
  const [displayRoutes, setDisplayRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currLocation, setCurrLocation] = useState(null);
  const cardShadowStyle = function ({ pressed }) {
    return [
      styles.pressableCard,
      {
        shadowColor: pressed ? Colors.white : Colors.black,
        backgroundColor: Colors.white,
        borderWidth: pressed ? 0.8 : 1,
      },
    ];
  };
  const mrtTagStyle = function (mrtLine) {
    switch (mrtLine) {
      case "NE":
        return [styles.transitTag, styles.transitTagNE];
      case "NS":
        return [styles.transitTag, styles.transitTagNS];
      case "CC":
        return [styles.transitTag, styles.transitTagCC];
      case "DT":
        return [styles.transitTag, styles.transitTagDT];
      case "EW":
        return [styles.transitTag, styles.transitTagEW];
      case "TE":
        return [styles.transitTag, styles.transitTagTE];
      default:
        return [styles.transitTag];
    }
  };
  // Function to compute the route navigation tags
  const computeRoutings = function (lines) {
    const routesTags = lines.map((route) => {
      const transitTags = route.legs.reduce((acc, curr) => {
        if (
          curr["travel_mode"] == "transit" &&
          curr["vehicle_types"] == "bus"
        ) {
          let busNumber = curr.services[0].name;
          if (curr.services.length > 1) {
            for (let i = 1; i < curr.services.length; i++) {
              busNumber += ` / ${curr.services[i].name}`;
            }
          }
          acc.push(
            <View style={styles.transitTag} key={busNumber}>
              <Text style={styles.transitTagText}>{`Bus ${busNumber}`}</Text>
            </View>
          );
        } else if (
          curr["travel_mode"] == "transit" &&
          curr["vehicle_types"] == "metro"
        ) {
          let trainLine = curr.services[0].name;
          if (curr.services.length > 1) {
            for (let i = 1; i < curr.services.length; i++) {
              trainLine += `${curr.services[i]}`;
            }
          }
          acc.push(
            <View style={mrtTagStyle(trainLine)} key={trainLine}>
              <Text style={styles.transitTagText}>{trainLine}</Text>
            </View>
          );
        }
        return acc;
      }, []);
      if (transitTags.length > 0) {
        return transitTags.flatMap((value, index, array) =>
          array.length - 1 !== index // check for the last item
            ? [
                value,
                <View style={styles.transitTagTo} key={index}>
                  <Text style={{ fontWeight: "bold", fontSize: 18 }}>&gt;</Text>
                </View>,
              ]
            : value
        );
      }else{
        return [
          (
            <View style={styles.transitTag} key={route.signature}>
              <Text style={styles.transitTagText}>Walk</Text>
            </View>
          )
        ]
      }
    });
    return routesTags;
  };

  useEffect(() => {
    (async () => {
      try {
        const {
          latlng: { latitude, longitude },
        } = destination;
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }
        // if value prop is not null by checking if its truthy
        const { coords } = await Location.getCurrentPositionAsync({});
        setCurrLocation(coords);
        const lines = await getDirectionsAsync(
          coords.latitude,
          coords.longitude,
          latitude,
          longitude
        );
        setTransits(lines);
        setDisplayRoutes(computeRoutings(lines));
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    })();
  }, []);

  return (
    <View style={[styles.container, { justifyContent: "flex-start" }]}>
      <Text style={styles.header}>{destinationName}</Text>
      <View>
        {isLoading && (
          <ActivityIndicator style={{ marginTop: 30 }} size="large" />
        )}
        {!isLoading && (
          <ScrollView>
            {transits.length > 0 &&
              transits.map((transit, idx) => (
                <Pressable
                  style={(prop) => cardShadowStyle(prop)}
                  key={idx}
                  onPress={() => {
                    navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [
                          { name: "Main" },
                          {
                            name: "Direction",
                            params: {
                              line: transit,
                              currLocation,
                              destinationName,
                            },
                          },
                        ],
                      })
                    );
                  }}
                >
                  <View>
                    <View style={styles.transitOption}>
                      <Text style={styles.transitText}>
                        Estimated Journey Time:
                      </Text>
                      <Text style={styles.transitEtaText}>
                        {Math.ceil(transit["duration_seconds"] / 60)} Minutes
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.transitText}>Route:</Text>
                      <Text key={idx}>{displayRoutes[idx]}</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            {transits.length == 0 && (
              <Text>
                No routes found, You might be too close to the location already.
              </Text>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
