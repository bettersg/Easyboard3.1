import { useState, useEffect, useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import {
  getGooglePlacesLocationAsync,
  getGoogleReverseGeoCodingAsync,
  queryGooglePlacesAsync,
} from "../../apis/GooglePlacesAPI";
import { useDebounce } from "../../hooks/_debounce";
import Autocomplete from "react-native-autocomplete-input";
import * as Location from 'expo-location'

export default function GoogleMapView({ onLocationMarkerDrop, value }) {
  // Map View reference
  const mapViewRef = useRef(null);

  // Search location states
  const [search, setSearch] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [hidePrediction, setHidePrediction] = useState(true);
  const [showUserLocation, setShowUserLocation] = useState(false);

  // Marker States
  const [marker, setMarker] = useState(value);

  const queryLocation = async function () {
    try {
      if (!hidePrediction) {
        const predictions = await queryGooglePlacesAsync(search);
        setPredictions(predictions);
      }
    } catch (e) {
      console.error(e);
    }
  };
  useDebounce(queryLocation, 600, [hidePrediction, search]);

  const tapPrediction = async function (placeId, description) {
    try {
      setSearch(description);
      setHidePrediction(true);
      Keyboard.dismiss();
      const { lng, lat } = await getGooglePlacesLocationAsync(placeId);
      setMarker({ description, latlng: { latitude: lat, longitude: lng } });
      mapViewRef.current.animateToRegion(
        {
          longitude: lng,
          latitude: lat,
          latitudeDelta: 0.09,
          longitudeDelta: 0.09,
        },
        400
      );
    } catch (e) {
      console.error(e);
    }
  };

  const selectPosition = async function (coordinate){
    try{
      const description = await getGoogleReverseGeoCodingAsync(coordinate.latitude, coordinate.longitude);
      setSearch(description);
      setMarker({ description, latlng: coordinate });
    }catch(e){
      console.error(e);
    }
  }

  // watch marker value change and update the parent component
  useEffect(() => {
    if(marker) onLocationMarkerDrop(marker)
  },[marker])

  // This will emulate the didMount lifecycle in functional components.
  useEffect(() => {
    (async () => {
      try{
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }
        // if value prop is not null by checking if its truthy
        const coords = value == true ? value.latlng : (await Location.getCurrentPositionAsync({})).coords
        setShowUserLocation(true)
        if(mapViewRef.current && !value)
          mapViewRef.current.animateToRegion(
            {
              longitude: coords.longitude,
              latitude: coords.latitude,
              latitudeDelta: 0.09,
              longitudeDelta: 0.09,
            },
            400
          );
      }catch(e){
        console.error(e)
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.autocompleteContainer}>
        <Autocomplete
          inputContainerStyle={{ borderWidth: 0 }}
          style={styles.autocompleteInput}
          hideResults={hidePrediction}
          placeholder="Search for location"
          data={predictions}
          value={search}
          onChangeText={(searchTerm) => {
            setSearch(searchTerm)
            setHidePrediction(false)
          }}
          returnKeyType="done"
          flatListProps={{
            keyExtractor: (item) => item.place_id,
            style: styles.autocompleteList,
            renderItem: ({ item }) => (
              <TouchableOpacity
                onPress={() => tapPrediction(item.place_id, item.description)}
              >
                <View style={styles.autocompleteItem}>
                  <Text style={styles.autocompleteItemText} numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ),
          }}
        />
      </View>
      <MapView
        ref={mapViewRef}
        mapPadding={{ top: 30, left: 30, bottom: 30, right: 20 }}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 1.364917,
          longitude: 103.822872,
          latitudeDelta: 0.3,
          longitudeDelta: 0.3,
        }}
        showsUserLocation={showUserLocation}
        showsMyLocationButton
        onPress={({nativeEvent: {coordinate}}) => selectPosition(coordinate) }
      >
        {marker != null && (
          <Marker
            title="Selected location"
            description={marker.description}
            coordinate={marker.latlng}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  autocompleteContainer: {
    paddingHorizontal: 10,
    paddingTop: 20,
    flex: 1,
    left: 0,
    position: "absolute",
    right: 0,
    top: 30,
    zIndex: 1,
  },
  autocompleteInput: {
    height: 40,
    paddingHorizontal: 10,
    // This is for IOS
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    //  this is for android
    elevation: 5,
  },
  autocompleteItemText: {
    fontSize: 18,
  },
  autocompleteItem: {
    padding: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1.6,
    borderColor: "#ebe8e8",
    backgroundColor: "#fff",
  },
});
