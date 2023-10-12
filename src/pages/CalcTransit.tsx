// Note: It looks like CityMapper has stopped?
// https://citymapper.com/news/2596/sdks-and-apis-come-to-an-end
import { useEffect, useState } from "react";
import {
  Pressable,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { getDirectionsAsync } from "../apis/CityMapperAPI";
import styles from "../styles/style";
import * as Location from "expo-location";
import { Colors } from "../styles/color";
import { CommonActions } from "@react-navigation/native";
import RootStackParamList from "../types/RootStackParamList.type";
import { CityMapperRoute } from "../apis/CityMapperAPI.interface";

type Props = NativeStackScreenProps<RootStackParamList, "CalcTransit">;

export default function CalcTransit({ navigation, route }: Props) {
  const { destination, destinationName } = route.params;
  const [transits, setTransits] = useState<CityMapperRoute[]>([]);
  const [displayRoutes, setDisplayRoutes] = useState<any>([]);
  const [interchanges, setInterchanges] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currLocation, setCurrLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const cardShadowStyle = ({ pressed }: { pressed: Boolean }) => {
    return [
      styles.pressableCard,
      {
        shadowColor: pressed ? Colors.white : Colors.black,
        backgroundColor: Colors.white,
        borderWidth: pressed ? 0.8 : 1,
      },
    ];
  };
  const mrtTagStyle = function (mrtLine: string) {
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
  // Function to compute the route navigation tags and the associated interchanges
  const computeRoutings = function (lines: CityMapperRoute[]) {
    const routings = lines.map((route) => {
      interface ComputedTransit {
        interchanges: string[];
        transitTags: React.ReactElement[];
      }
      const computedTransit: ComputedTransit = route.legs.reduce(
        (acc, curr) => {
          if (
            curr["travel_mode"] == "transit" &&
            curr["vehicle_types"].includes("bus")
          ) {
            let busNumber = curr.services[0].name;
            if (curr.services.length > 1) {
              for (let i = 1; i < curr.services.length; i++) {
                busNumber += ` / ${curr.services[i].name}`;
              }
            }
            acc.interchanges.push(`Bus ${busNumber}`);
            acc.transitTags.push(
              <View style={styles.transitTag} key={busNumber}>
                <Text style={styles.transitTagText}>{`Bus ${busNumber}`}</Text>
              </View>
            );
          } else if (
            curr["travel_mode"] == "transit" &&
            curr["vehicle_types"].includes("metro")
          ) {
            let trainLine = curr.services[0].name;
            if (curr.services.length > 1) {
              for (let i = 1; i < curr.services.length; i++) {
                trainLine += `${curr.services[i]}`;
              }
            }
            acc.interchanges.push(`Train ${trainLine}: ${curr.stops[0]?.name}`);
            acc.transitTags.push(
              <View style={mrtTagStyle(trainLine)} key={trainLine}>
                <Text style={styles.transitTagText}>{trainLine}</Text>
              </View>
            );
          } else {
            acc.interchanges.push("walk");
          }
          return acc;
        },
        {
          transitTags: [] as React.ReactElement[],
          interchanges: [] as string[],
        }
      );
      if (computedTransit.transitTags.length > 0) {
        computedTransit.transitTags = computedTransit.transitTags.flatMap(
          (value, index, array) =>
            array.length - 1 !== index // check for the last item
              ? [
                  value,
                  <View style={styles.transitTagTo} key={index}>
                    <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                      &gt;
                    </Text>
                  </View>,
                ]
              : value
        );
      } else {
        computedTransit.transitTags = [
          <View style={styles.transitTag} key={route.signature}>
            <Text style={styles.transitTagText}>Walk</Text>
          </View>,
        ];
      }
      return computedTransit;
    });
    setDisplayRoutes(routings.map((x) => x.transitTags)); // This is to show the tags
    setInterchanges(routings.map((x) => x.interchanges)); // This is to pass to the directions map to show the next interchange to take
  };

  useEffect(() => {
    (async () => {
      try {
        const {
          latlng: { latitude, longitude },
        } = destination;
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          // setErrorMsg("Permission to access location was denied");
          console.error("Permission to access location was denied");
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
        computeRoutings(lines);
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
                              interchanges: interchanges[idx],
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
