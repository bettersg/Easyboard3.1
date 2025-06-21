import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Introduction from '../pages/Introduction';
import Main from '../pages/Main';
import Setting from '../pages/Setting';
import GoogleMapsDirections from '../pages/GoogleMapsDirections';
import TransitOptions from '../pages/TransitOptions';
import { RootStackParamList } from '../types/RootStackParamList.type';
import { MaterialIcons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import useCallCaregiver from '../hooks/useCallCaregiver'
import { useAuth } from '../contexts/AppContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function PWIDStack() {
  const { firstTimeUser } = useAuth();
  const callCareGiver = useCallCaregiver()
  const onHelpPressed = () => {
    Alert.alert(
      'Need Help?',
      'Contact your Caregiver by pressing "CALL CAREGIVER"',
      [
        {
          text: 'Cancel',
          onPress: () => { },
          style: 'cancel'
        },
        {
          text: 'Call Caregiver',
          isPreferred: true,
          onPress: callCareGiver
        }
      ]
    )
  }

  return (
    <Stack.Navigator initialRouteName={firstTimeUser ? "Introduction" : "Main"}>
      <Stack.Screen name="Introduction" component={Introduction} options={{ title: 'Welcome' }} />
      <Stack.Screen
        name="Main"
        component={Main}
        options={({ navigation }) => ({
          title: 'EasyBoard',
          headerRight: () => (
            <MaterialIcons.Button
              name="settings"
              backgroundColor={'transparent'}
              color={'#000'}
              size={30}
              borderRadius={500}
              style={{ padding: 10, marginRight: -10 }}
              onPressOut={() => {
                navigation.navigate('Setting');
              }}
            />
          )
        })}
      />
      <Stack.Screen
        name="Setting"
        component={Setting}
        options={{ title: 'Settings', headerBackVisible: true }}
      />
      <Stack.Screen
        name="GoogleMapsDirections"
        component={GoogleMapsDirections}
        options={({ navigation }) => ({
          title: 'Start your trip',
          headerRight: () => (
            <MaterialIcons
              name="help-outline"
              size={28}
              color="#2a62ff"
              onPress={onHelpPressed}
            />
          )
        })}
      />
      <Stack.Screen
        name="TransitOptions"
        component={TransitOptions}
        options={{ title: 'Pick a route' }}
      />
    </Stack.Navigator>
  );
} 