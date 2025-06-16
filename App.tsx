import { MaterialIcons } from '@expo/vector-icons'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import { Alert, Text, Pressable, StyleSheet } from 'react-native'
import 'react-native-gesture-handler'

import LoadingIndicator from './src/common/components/LoadingIndicator'
import Page from './src/common/components/Page'
import useCallCaregiver from './src/hooks/useCallCaregiver'
import GoogleMapsDirections from './src/pages/GoogleMapsDirections'
import Introduction from './src/pages/Introduction'
import Main from './src/pages/Main'
import Setting from './src/pages/Setting'
import TransitOptions from './src/pages/TransitOptions'
import Authentication from './src/pages/Authentication'
import Registration from './src/pages/Registration'
import OTPVerification from './src/pages/OTPVerification'
import CaregiverMain from './src/pages/CaregiverMain'
import TrackPWIDMap from './src/pages/TrackPWIDMap'
import { RootStackParamList } from './src/types/RootStackParamList.type'
import { AppProvider } from './src/contexts/AppContext'
import { getUserData } from './src/services/storageService'

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  const callCareGiver = useCallCaregiver()
  const [hasAuthen, setHasAuthen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [initialRoute, setInitialRoute] = useState<keyof RootStackParamList>('Authentication')

  useEffect(() => {
  let isMounted = true
  const checkAuthen = async () => {
    try {
      const userData = await getUserData()
      if (userData && isMounted) {
        setHasAuthen(true)
        const route = userData.userType === 'PWID' ? 'Main' : 'CaregiverMain';
        setInitialRoute(route)
      }
    } catch (error) {
      if (isMounted) setInitialRoute('Authentication')
    } finally {
      if (isMounted) setIsLoading(false)
    }
  }
  checkAuthen()
  return () => {
    isMounted = false
  }
}, [])

  if (isLoading) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    )
  }

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
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen
            name='Authentication'
            component={Authentication}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name='Registration'
            component={Registration}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name='OTPVerification'
            component={OTPVerification}
            options={{
              title: '',
            }}
          />
          <Stack.Screen
            name='Introduction'
            component={Introduction}
            options={{ title: 'Welcome' }}
          />
          <Stack.Screen
            name='Main'
            component={Main}
            options={({ navigation }) => ({
              title: 'EasyBoard',
              headerRight: () => (
                <MaterialIcons.Button
                  name='settings'
                  backgroundColor={'transparent'}
                  color={'#000'}
                  size={30}
                  borderRadius={500}
                  style={styles.settingsButton}
                  onPressOut={() => {
                    navigation.navigate('Setting')
                  }}
                />
              )
            })}
          />
          <Stack.Screen
            name='CaregiverMain'
            component={CaregiverMain}
            options={{title: 'Caregiver Dashboard'}}
          />
          <Stack.Screen
            name='TrackPWIDMap'
            component={TrackPWIDMap}
            options={{ title: 'Track PWID Location' }}
          />
          <Stack.Screen
            name='Setting'
            component={Setting}
            options={{ title: 'Settings', headerBackVisible: hasAuthen }}
          />
          <Stack.Screen
            name='GoogleMapsDirections'
            component={GoogleMapsDirections}
            options={{
              title: 'Start your trip',
              headerRight: () => (
                <MaterialIcons
                  name='help-outline'
                  size={28}
                  color='#2a62ff'
                  onPress={onHelpPressed}
                />
              )
            }}
          />
          <Stack.Screen
            name='TransitOptions'
            component={TransitOptions}
            options={{ title: 'Pick a route' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  )
}

const styles = StyleSheet.create({
  settingsButton: { padding: 10, marginRight: -10 }
})
