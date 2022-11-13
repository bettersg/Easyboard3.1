import { useEffect, useState } from "react";
import { Pressable, Modal, Text, View, StyleSheet, Button } from "react-native";
import GoogleMapView from "./googleMapView";

export default function LocationTextInput({ onLocationSelect , value}) {
  const [isModalOpen, setModalOpenState] = useState(false);
  const [location, setSelectedLocation] = useState(null);

  useEffect(() => {
    setSelectedLocation(value)
  },[value])

  const onLocationMarkerDrop = function (locationMarker) {
    setSelectedLocation(locationMarker);
    onLocationSelect(locationMarker); // Propagate back to parent
  };
  return (
    <View>
      <Modal
        presentationStyle="pageSheet"
        statusBarTranslucent={true}
        animationType="slide"
        visible={isModalOpen}
        onRequestClose={() => setModalOpenState(false)}
        onDismiss={() => setModalOpenState(false)}
      >
        <View style={styles.container}>
          <View style={styles.doneBtnContainer}>
            <Pressable>
              <Text style={styles.doneBtn} onPress={() => setModalOpenState(false)}>Done</Text>
            </Pressable>
          </View>
          <GoogleMapView onLocationMarkerDrop={onLocationMarkerDrop} value={location}/>
        </View>
      </Modal>

      <Pressable onPress={() => setModalOpenState(true)}>
        <Text style={styles.inputBtn}>
          {location == null ? "Select location ..." : location.description}
        </Text>
      </Pressable>
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
  inputBtn: {
    borderColor: "#000",
    borderWidth: 1,
    padding: 10,
    marginVertical: 5,
    color: "#000",
  },
  doneBtnContainer:{ 
    zIndex: 2, 
    position: "absolute", 
    top: 10, 
    right: 10 
  },
  doneBtn: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 21,
  }
});
