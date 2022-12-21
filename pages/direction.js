import { useEffect, useRef, useState } from "react";
import { Dimensions, View, Text, Alert, Pressable } from "react-native";
import MapView, { Circle, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import styles from "../styles/style";
import * as Location from "expo-location";
import decodeGooglePlaces from "../shared/decodeGooglePolyline";
import { Colors } from "../styles/color";
import { ScrollView } from "react-native-gesture-handler";
import { CommonActions } from "@react-navigation/native";
import style from "../styles/style";

export default function Direction({ navigation, route }) {
  const { line, currLocation, destinationName, interchanges } = route.params;
  // Map View reference
  const mapViewRef = useRef(null);
  const [directionViewHeight, setDirectionViewHeight] = useState(80);
  const [location, setLocation] = useState(currLocation);
  const [polyLinePath, setPolyLinePath] = useState([]);
  const [stopsCircle, setStopsCircle] = useState([]);
  const [isFocus, setIsFocus] = useState(true);
  const [steps, setSteps] = useState([]);
  const [triggerPoints, setTriggerPoints] = useState([]);
  const [stepsIdx, setSetpsIdx] = useState(0);

  let locationWatch = null;
  const computePolylines = function (line) {
    return line.legs.reduce((acc, curr) => {
      const polyLinePath = decodeGooglePlaces(curr.path);
      const lineColor =
        curr["travel_mode"] == "transit"
          ? Colors[curr.services[0].name] ?? Colors.grey
          : Colors.grey;
      acc.push(
        <Polyline
          key={curr.path}
          coordinates={polyLinePath}
          strokeColor={lineColor}
          strokeWidth={curr["travel_mode"] == "transit" ? 6 : 5}
          lineDashPattern={curr["travel_mode"] == "transit" ? null : [8, 2]}
        ></Polyline>
      );
      return acc;
    }, []);
  };
  const computeCircles = function (line) {
    return line.legs.reduce((acc, curr) => {
      if (curr["travel_mode"] != "walk") {
        const lineColor =
          curr["travel_mode"] == "transit"
            ? Colors[curr.services[0].name] ?? Colors.grey
            : Colors.grey;
        const circles = curr.stops.map((stop, idx) => (
          <Circle
            key={`${stop.name}${idx}`}
            center={{
              latitude: stop.coordinates.lat,
              longitude: stop.coordinates.lon,
            }}
            radius={3.5}
            strokeWidth={5}
            strokeColor={lineColor}
            fillColor={Colors.white}
            zIndex={10}
          ></Circle>
        ));
        return acc.concat(circles);
      }
      return acc;
    }, []);
  };
  const computeSteps = function (line) {
    return line.legs.reduce((acc, curr) => {
      if (curr["travel_mode"] == "walk") {
        let steps = [];
        if (curr.instructions) {
          steps = curr.instructions.map((val, idx) => {
            let walkingDesc = "";
            switch (val.type) {
              case "depart":
                walkingDesc = val["description_text"];
                break;
              case "arrive":
                walkingDesc = `In ${val["distance_meters"]} meters, you will arrive at your destination`;
                break;
              default:
                if (val["type_direction"] != "straight") {
                  const apiDescTxt =
                    val["description_text"].charAt(0).toLowerCase() +
                    val["description_text"].slice(1);
                  walkingDesc = `In ${val["distance_meters"]} meters, ${apiDescTxt}`;
                  break;
                }
                walkingDesc = `${val["description_text"]} for ${val["distance_meters"]} meters`;
                break;
            }

            return (
              <View style={style.directionContainer}>
                <Text style={style.directionText} key={`${curr.path}${idx}`}>
                  {walkingDesc}
                </Text>
              </View>
            );
          });
        } else {
          const idx = line.legs.indexOf(curr);
          if (idx < line.legs.length - 1 && idx >= 0) {
            steps = [
              <View style={style.directionContainer}>
                <Text style={style.directionText} key={curr.path}>
                  Walk to {line.legs[idx + 1].stops[0].name}
                </Text>
              </View>,
            ];
          } else if (idx == line.legs.length - 1) {
            steps = [
              <View style={style.directionContainer}>
                <Text style={style.directionText} key={curr.path}>
                  Walk to {destinationName}
                </Text>
              </View>,
            ];
          }
        }
        acc.push(steps);
      } else if (curr["travel_mode"] == "transit") {
        const steps = curr.stops.map((stop, idx) => (
          <View style={style.directionContainer}>
            <Text style={style.directionText} key={`${curr.path}${idx}`}>
              {stop.name}
            </Text>
          </View>
        ));
        acc.push(steps);
      }
      return acc;
    }, []);
  };
  const computeTriggerPoints = function (line) {
    const test = line.legs.reduce((acc, curr) => {
      if (curr["travel_mode"] != "walk") {
        const triggerPoints = curr.stops.slice(-2).map((stop, idx) => ({
          latitude: stop.coordinates.lat,
          longitude: stop.coordinates.lon,
          isTriggered: false,
        }));
        acc.push({
          triggers: triggerPoints,
          isWalk: false,
          stop: curr.stops[curr.stops.length - 1].name,
        });
      } else {
        const polyLinePath = decodeGooglePlaces(curr.path);
        const idx = line.legs.indexOf(curr);
        const stopName =
          idx < line.legs.length - 1 && idx >= 0
            ? line.legs[idx + 1].stops[0].name
            : "";
        acc.push({
          triggers: [polyLinePath.pop()],
          stop: stopName,
          isWalk: true,
        });
      }
      return acc;
    }, []);
    console.log(JSON.stringify(test));
    return test;
  };
  const computeDistance = function (lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = degToRad(lat2 - lat1); // deg2rad below
    const dLon = degToRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(degToRad(lat1)) *
        Math.cos(degToRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Math.abs(d * 1000); // returning distance in meters
  };

  function degToRad(deg) {
    return deg * (Math.PI / 180);
  }
  // This will emulate the didMount lifecycle in functional components.
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }
        // This is an active lookup to watch the user's current location
        locationWatch = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
          },
          (location) => {
            setLocation(location.coords);
          }
        );
      } catch (e) {
        console.error(e);
      }
    })();
    setStopsCircle(computeCircles(line));
    setPolyLinePath(computePolylines(line));
    setSteps(computeSteps(line));
    setTriggerPoints(computeTriggerPoints(line));
  }, []);

  // This is similar to umount event
  useEffect(
    () => () => {
      (async () => {
        // Remove the watcher
        await locationWatch.remove();
      })();
    },
    []
  );

  useEffect(() => {
    if (isFocus)
      mapViewRef.current.animateToRegion(
        {
          longitude: location.longitude,
          latitude: location.latitude,
          latitudeDelta: 0.009,
          longitudeDelta: 0.009,
        },
        200
      );
    if (triggerPoints.length > 0) {
      const distance = computeDistance(
        location.latitude,
        location.longitude,
        triggerPoints[stepsIdx].triggers[0].latitude,
        triggerPoints[stepsIdx].triggers[0].longitude
      );
      if (
        distance <= 100 &&
        !triggerPoints[stepsIdx].isWalk &&
        !triggerPoints[stepsIdx].isTriggered
      ) {
        const msg =
          triggerPoints[stepsIdx].triggers.length > 1
            ? "Get ready, you have 1 more stop to go."
            : "Get ready, you're approaching your stop.";
        Alert.alert("Notification", msg);
        triggerPoints[stepsIdx].triggers.isTriggered = true;
      } else if (
        distance <= 20 &&
        triggerPoints[stepsIdx].triggers.length == 1
      ) {
        if (triggerPoints.length - 1 != stepsIdx) {
          Alert.alert(
            "Notification",
            `You've reached ${triggerPoints[stepsIdx].stop}.`
          );
          setSetpsIdx(stepsIdx + 1);
        } else {
          Alert.alert("Notification", "You've reached your destination!");
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Main" }],
            })
          );
        }
      }
    }
  }, [location]);

  return (
    <View style={style.containerCenter}>
      <View
        onLayout={(event) => {
          var { height } = event.nativeEvent.layout;
          setDirectionViewHeight(height);
        }}
        style={[
          style.directionWindow,
          {
            maxHeight: Dimensions.get("window").height * 0.4,
            minHeight: Dimensions.get("window").height * 0.1,
          },
        ]}
      >
        <View style={style.directionWindowHeader}>
          <Pressable
            onPress={() => {
              if (stepsIdx >= 1) {
                setSetpsIdx(stepsIdx - 1);
              }
            }}
          >
            <Text style={style.directionWindowBtn}>&lt;</Text>
          </Pressable>
          <Text style={style.directionWindowHeaderText}>
            Directions{" "}
            {interchanges[stepsIdx] != "walk" ??
              `\n Take ${interchanges[stepsIdx]}`}
          </Text>
          <Pressable
            onPress={() => {
              if (stepsIdx < triggerPoints.length - 1) {
                setSetpsIdx(stepsIdx + 1);
              }
            }}
          >
            <Text style={style.directionWindowBtn}>&gt;</Text>
          </Pressable>
        </View>
        <ScrollView style={{ maxHeight: "100%" }}>{steps[stepsIdx]}</ScrollView>
      </View>
      <MapView
        ref={mapViewRef}
        mapPadding={{
          top: 30,
          left: 30,
          bottom: directionViewHeight + 50,
          right: 20,
        }}
        provider={PROVIDER_GOOGLE}
        style={{
          width: Dimensions.get("window").width,
          height: Dimensions.get("window").height,
        }}
        initialRegion={{
          latitude: currLocation.latitude,
          longitude: currLocation.longitude,
          latitudeDelta: 0.00009,
          longitudeDelta: 0.00009,
        }}
        showsUserLocation
        showsMyLocationButton
        onRegionChangeComplete={(region, { isGesture }) => {
          setIsFocus(!isGesture); // isGesture is if the map is panned by the user
        }}
      >
        {stopsCircle}
        {polyLinePath}
      </MapView>
    </View>
  );
}
