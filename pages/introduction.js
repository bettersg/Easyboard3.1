import { StatusBar } from "expo-status-bar";
import { Pressable, Text, View } from "react-native";
import styles from "../styles/style";

export default function Intro({ navigation }) {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.boldText}>
          This app is designed to empower Persons with Intellectual Disabilities
          (PWIDs) navigate to and from work and school with greater
          independence.
        </Text>
        <Text style={styles.boldText}>
          Please take a moment to do one time user profile setup.
        </Text>
        <Text style={styles.boldText}>
          These Settings can be updated anytime from the settings page.
        </Text>
      </View>
      <View style={styles.footer}>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('Setting')}
        >
          <Text style={styles.buttonText}>Begin Setup</Text>
        </Pressable>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}
