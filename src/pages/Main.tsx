import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import { useEffect, useState } from 'react'
import { Text, View, Alert, ScrollView } from 'react-native'

import EasyboardButton from '../common/components/EasyboardButton'
import Page from '../common/components/Page'
import SavedLocationCard from '../common/components/SavedLocationCard'
import LocationInputButton from '../common/locationSelector/LocationInputButton'
import useCallCaregiver from '../hooks/useCallCaregiver'
import RootStackParamList from '../types/RootStackParamList.type'

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>

export default function Main({ navigation }: Props) {
  const callCareGiver = useCallCaregiver()
  const [userSetting, setUserSetting] = useState<any>(null)
  const [location, setMarkerLocation] = useState<any>(null)

  useEffect(() => {
    ; (async () => {
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
        destination: location
      })
    }
  }, [location])

  const onShareLocation = () => {
    Alert.alert('Feature coming soon')
  }

  return (
    <Page disableScroll>
      {userSetting && (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: 16,
              paddingTop: 24,
              paddingBottom: 120
            }}
          >
            {/* Header Section */}
            <View >
              <Text style={{
                fontSize: 23,
                fontWeight: '700',
                color: '#1F2937',
                marginBottom: 20
              }}>
                Where do you want to go?
              </Text>
            </View>

            {/* Saved Locations Section */}
            <View style={{
              backgroundColor: 'white',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
              padding: 16,
              marginBottom: 24
            }}>
              <SavedLocationCard
                borderColor='border-cyan-800'
                onPress={() => {
                  navigation.navigate('TransitOptions', {
                    destinationName: 'Home',
                    destination: userSetting.houseAddrs
                  })
                }}
                title='Home'
                subtitle={userSetting.houseAddrs.description}
                imageUri={userSetting.housePhotoUri}
                iconName='home'
              />

              <View style={{ height: 16 }} />

              <SavedLocationCard
                borderColor='border-secondary'
                onPress={() => {
                  navigation.navigate('TransitOptions', {
                    destination: userSetting.gotoFavAddrs,
                    destinationName: userSetting.gotoFavAddrsName
                  })
                }}
                title={userSetting.gotoFavAddrsName}
                subtitle={userSetting.gotoFavAddrs.description}
                imageUri={userSetting.gotoFavPhotoUri}
                iconName='map'
              />
              <View style={{ height: 16 }} />

              <LocationInputButton
                onLocationSelect={(markerLocation: any) =>
                  setMarkerLocation(markerLocation)
                }
              />
            </View>
          </ScrollView>

          {/* Fixed Call Caregiver Button */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
            zIndex: 1
          }}>
            <EasyboardButton
              type='bg-primary'
              onPress={callCareGiver}
              title='CALL CAREGIVER'
              iconName='phone-call'
              titleSize="text-lg"
            />
            <View style={{ height: 16 }} />
            {/* <EasyboardButton
              type="bg-secondary"
              onPress={onShareLocation}
              title="SHARE LOCATION"
              iconName="map-pin"
              titleSize="text-lg"
            /> */}
          </View>
        </View>
      )}
    </Page>
  )
}
