// Note: It looks like CityMapper has stopped?
// https://citymapper.com/news/2596/sdks-and-apis-come-to-an-end
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import Constants from "expo-constants";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import styles from "../styles/style";
import * as Location from "expo-location";
import { Colors } from "../styles/color";
import { CommonActions } from "@react-navigation/native";
import RootStackParamList from "../types/RootStackParamList.type";
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { getGoogleRoute } from "../apis/GoogleRouteApi";
import { decode } from "@googlemaps/polyline-codec";
import TransitTypePill from "../common/components/TransitTypePill";

type Props = NativeStackScreenProps<RootStackParamList, "GoogleMapsDirections">;

export default function GoogleMapsDirections({ navigation, route }: Props) {
  const mapViewRef = useRef<MapView>(null);
  const { googleRoute, destination } = route.params;

  const PolylineCoordinates = useMemo(() => {
    if (googleRoute) {
      return decode(googleRoute.polyline.encodedPolyline).map((e) => {
        return { latitude: e[0], longitude: e[1] };
      });
    } else {
      return [];
    }
  }, [googleRoute]);

  const mapRegion = useMemo(() => {
    const { high, low } = googleRoute.viewport;
    const east = Math.max(high.longitude, low.longitude);
    const west = Math.min(high.longitude, low.longitude);
    const north = Math.max(high.latitude, low.latitude);
    const south = Math.min(high.latitude, low.latitude);
    return {
      longitude: Math.abs((east - west) / 2 + west),
      latitude: Math.abs((north - south) / 2 + south),
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }, [googleRoute.viewport]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.white,
        justifyContent: "space-between",
        position: "relative",
      }}
    >
      <MapView
        initialRegion={mapRegion}
        provider={PROVIDER_GOOGLE}
        ref={mapViewRef}
        className="py-4 px-6 justify-between h-full"
        userLocationPriority="high"
        followsUserLocation={true}
      >
        {/* Render End Marker */}
        <Marker coordinate={destination.latlng} />
        <Polyline
          coordinates={PolylineCoordinates}
          strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
          // strokeColors={new Array(PolylineCoordinates.length).fill("#2abfff")}
          strokeWidth={3}
        />
      </MapView>
      <ScrollView horizontal className="bg-white absolute z-10 bottom-6">
        {googleRoute.legs[0]?.steps.map((step) => (
          <View
            className="rounded-md py-1 px-4 my-2 mx-1 bg-slate-200 flex flex-col justify-between"
            key={step.polyline.encodedPolyline}
          >
            <View className="flex flex-row items-center justify-between">
              <TransitTypePill
                travelMode={step.travelMode}
                transitLine={step.transitDetails?.transitLine}
              />
              <View>
                <Text>
                  {"Duration: "}
                  <Text className="font-semibold">{step.staticDuration}</Text>
                </Text>
              </View>
            </View>
            <View className="mb-2">
              <Text className="font-semibold text-lg">Instructions</Text>
              <Text>{step.navigationInstruction?.instructions}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
