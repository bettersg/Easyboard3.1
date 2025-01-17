import { MaterialIcons } from '@expo/vector-icons'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import { Alert, Button } from 'react-native'

import 'react-native-gesture-handler'

import LoadingIndicator from './src/common/components/LoadingIndicator'
import Page from './src/common/components/Page'
import useCallCaregiver from './src/hooks/useCallCaregiver'
import GoogleMapsDirections from './src/pages/GoogleMapsDirections'
import Introduction from './src/pages/Introduction'
import Main from './src/pages/Main'
import Setting from './src/pages/Setting'
import TransitOptions from './src/pages/TransitOptions'
import RootStackParamList from './src/types/RootStackParamList.type'
import { SettingValues } from './src/types/SettingKey.type'

const Stack = createNativeStackNavigator<RootStackParamList>()
const settingsDefaultValues: SettingValues = {
  name: null,
  careGiverPhoneNumber: '',
  houseAddrs: null,
  housePhotoUri: null,
  gotoFavAddrs: null,
  gotoFavAddrsName: '',
  gotoFavPhotoUri: [],
}

export default function App() {
  const callCareGiver = useCallCaregiver()
  const [isLoading, setIsLoading] = useState(true)
  const [hasSetting, setHasSettings] = useState(false)
  useEffect(() => {
    ;(async () => {
      try {
        const storedData = await SecureStore.getItemAsync(
          Constants.expoConfig?.extra?.settingsStoredKey
        )
        // clearing the settings if its all defult values
        if (JSON.stringify(settingsDefaultValues) == storedData) {
          await SecureStore.setItemAsync(Constants.expoConfig?.extra?.settingsStoredKey, '')
        } else if (storedData) {
          setHasSettings(true)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  if (isLoading) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    )
  }

  const onHelpPressed = () => {
    Alert.alert('Need Help?', 'Contact your Caregiver by pressing "CALL CAREGIVER"', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Call Caregiver',
        isPreferred: true,
        onPress: callCareGiver,
      },
    ])
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!hasSetting && (
          <Stack.Screen
            name="Introduction"
            component={Introduction}
            options={{ title: 'Welcome' }}
          />
        )}
        <Stack.Screen
          name="Main"
          component={Main}
          options={({ navigation }) => ({
            title: 'EasyBoard',
            headerRight: () => (
              <Button title="Setting" onPress={() => navigation.navigate('Setting')} />
            ),
          })}
        />
        <Stack.Screen
          name="Setting"
          component={Setting}
          options={{ title: 'Settings', headerBackVisible: hasSetting }} // set this to a variable to check if the user already has settings or not
        />
        <Stack.Screen
          name="GoogleMapsDirections"
          component={GoogleMapsDirections}
          options={{
            title: 'Start your trip',
            headerRight: () => (
              <MaterialIcons
                name="help-outline"
                size={28}
                color="#2a62ff"
                onPress={onHelpPressed}
              />
            ),
          }}
        />
        <Stack.Screen
          name="TransitOptions"
          component={TransitOptions}
          options={{ title: 'Pick a route' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
