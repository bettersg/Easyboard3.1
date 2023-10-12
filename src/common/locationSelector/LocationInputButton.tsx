import { useEffect, useState } from "react";
import { Pressable, Modal, Text, View, StyleSheet, Button } from "react-native";
import styles from "../../styles/style";
import GoogleMapView from "./GoogleMapView";

export default function LocationInputButton({
  onLocationSelect,
}: {
  onLocationSelect: any;
}) {
  const [isModalOpen, setModalOpenState] = useState(false);
  const [location, setSelectedLocation] = useState(null);

  const onLocationMarkerDrop = function (locationMarker: any) {
    setSelectedLocation(locationMarker);
  };

  const cardShadowStyle = function (
    { pressed }: { pressed: Boolean },
    backgroundColor = "#fff"
  ) {
    return [
      styles.pressableCard,
      {
        shadowColor: pressed ? "#fff" : "#171717",
        backgroundColor: backgroundColor,
        borderWidth: pressed ? 0.8 : 1,
      },
    ];
  };

  return (
    <View>
      <Modal
        presentationStyle="pageSheet"
        statusBarTranslucent={true}
        animationType="slide"
        visible={isModalOpen}
        onRequestClose={() => {
          if (location != null) onLocationSelect(location);
          setModalOpenState(false);
        }}
        onDismiss={() => {
          if (location != null) onLocationSelect(location);
          setModalOpenState(false);
        }}
      >
        <View style={localStyles.container}>
          <View style={localStyles.doneBtnContainer}>
            <Pressable>
              <Text
                style={localStyles.doneBtn}
                onPress={() => setModalOpenState(false)}
              >
                Done
              </Text>
            </Pressable>
          </View>
          <GoogleMapView
            onLocationMarkerDrop={onLocationMarkerDrop}
            value={null}
          />
        </View>
      </Modal>

      <Pressable
        style={(prop) => cardShadowStyle(prop)}
        onPress={() => setModalOpenState(true)}
      >
        <Text style={styles.cardTitleOnlyText}>Other Location</Text>
      </Pressable>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  doneBtnContainer: {
    zIndex: 2,
    position: "absolute",
    top: 10,
    right: 10,
  },
  doneBtn: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 21,
  },
});
