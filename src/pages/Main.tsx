import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import { Text, View, Alert } from 'react-native'
import call from 'react-native-phone-call'

import EasyboardButton from '../common/components/EasyboardButton'
import Page from '../common/components/Page'
import SavedLocationCard from '../common/components/SavedLocationCard'
import LocationInputButton from '../common/locationSelector/LocationInputButton'
import RootStackParamList from '../types/RootStackParamList.type'

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>

export default function Main({ navigation }: Props) {
  const [userSetting, setUserSetting] = useState<any>(null)
  const [location, setMarkerLocation] = useState<any>(null)
  useEffect(() => {
    ;(async () => {
      try {
        const storedData = await SecureStore.getItemAsync(
          Constants?.expoConfig?.extra?.settingsStoredKey
        )
        if (storedData) setUserSetting(JSON.parse(storedData))
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const storedData = await SecureStore.getItemAsync(
          Constants?.expoConfig?.extra?.settingsStoredKey
        )
        if (storedData) setUserSetting(JSON.parse(storedData))
      } catch (e) {
        console.error(e)
      }
    })

    return unsubscribe
  }, [navigation])

  useEffect(() => {
    if (location != null) {
      navigation.navigate('TransitOptions', {
        destinationName: location.description,
        destination: location,
      })
    }
  }, [location])

  const callCareTaker = async function () {
    try {
      await call({
        number: userSetting.careGiverPhoneNumber, // String value with the number to call
        prompt: false, // Optional boolean property. Determines if the user should be prompted prior to the call
        skipCanOpen: true, // Skip the canOpenURL check
      })
    } catch (e) {
      console.error(e)
    }
  }
  const onShareLocation = () => {
    Alert.alert('Feature coming soon')
  }
  return (
    <Page>
      {userSetting && (
        <>
          <View>
            <Text className="mb-3 text-xl font-bold">Where do you want to go?</Text>
            <SavedLocationCard
              borderColor="border-cyan-800"
              onPress={() => {
                navigation.navigate('TransitOptions', {
                  destinationName: 'Home',
                  destination: userSetting.houseAddrs,
                })
              }}
              title="Home"
              subtitle={userSetting.houseAddrs.description}
              imageUri={userSetting.housePhotoUri}
              iconName="home"
            />
            <View className="h-2" />
            <SavedLocationCard
              borderColor="border-secondary"
              onPress={() => {
                navigation.navigate('TransitOptions', {
                  destination: userSetting.gotoFavAddrs,
                  destinationName: userSetting.gotoFavAddrsName,
                })
              }}
              title={userSetting.gotoFavAddrsName}
              subtitle={userSetting.gotoFavAddrs.description}
              imageUri={userSetting.gotoFavPhotoUri}
              iconName="map"
            />
            <LocationInputButton
              onLocationSelect={(markerLocation: any) => setMarkerLocation(markerLocation)}
            />
          </View>

          <View className="flex flex-col">
            <EasyboardButton
              type="bg-primary"
              onPress={callCareTaker}
              title="CALL CAREGIVER"
              iconName="phone-call"
            />
            <View className="h-2" />
            <EasyboardButton
              type="bg-secondary"
              onPress={onShareLocation}
              title="SHARE LOCATION"
              iconName="map-pin"
            />
          </View>
        </>
      )}
    </Page>
  )
}
