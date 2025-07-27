import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Authentication from '../pages/Authentication';
import Registration from '../pages/Registration';
import OTPVerification from '../pages/OTPVerification';
import { RootStackParamList } from '../types/RootStackParamList.type';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="Authentication">
      <Stack.Screen name="Authentication" component={Authentication} options={{ headerShown: false }} />
      <Stack.Screen name="Registration" component={Registration} options={{ headerShown: false }} />
      <Stack.Screen name="OTPVerification" component={OTPVerification} options={{ title: '' }} />
    </Stack.Navigator>
  );
}