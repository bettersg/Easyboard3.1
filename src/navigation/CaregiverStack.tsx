import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CaregiverMain from '../pages/CaregiverMain';
import TrackPWIDMap from '../pages/TrackPWIDMap';
import { RootStackParamList } from '../types/RootStackParamList.type';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function CaregiverStack() {
  return (
    <Stack.Navigator initialRouteName="CaregiverMain">
      <Stack.Screen name="CaregiverMain" component={CaregiverMain} options={{ title: 'Caregiver Dashboard' }} />
      <Stack.Screen name="TrackPWIDMap" component={TrackPWIDMap} options={{ title: 'Track PWID Location' }} />
    </Stack.Navigator>
  );
} 