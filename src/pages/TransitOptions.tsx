import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useEffect, useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

import LoadingIndicator from '../common/components/LoadingIndicator'
import Page from '../common/components/Page'
import TransitOptionCard from '../common/components/TransitOptionCard'
import { getStepsOverViewFromGoogleRouteLeg } from '../common/utils/GoogleRouteUtils'
import { dummy1 } from '../common/utils/temp-data'
import { Leg, Route } from '../types/GoogleRoute.type'
import RootStackParamList from '../types/RootStackParamList.type'

type Props = NativeStackScreenProps<RootStackParamList, 'TransitOptions'>

const TransitOptions = ({ navigation, route }: Props) => {
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [googleRoutes, setGoogleRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const fetchGoogleRoute = async () => {
    try {
      // const currentLocation = await Location.getCurrentPositionAsync({
      //   accuracy: Location.LocationAccuracy.BestForNavigation,
      // });
      // const newGoogleRoute = await getGoogleRoute(
      //   {
      //     latitude: currentLocation.coords.latitude,
      //     longitude: currentLocation.coords.longitude,
      //   },
      //   route.params.destination.latlng
      // );
      // if (newGoogleRoute) {
      //   setGoogleRoutes(newGoogleRoute.routes);
      // }
      setGoogleRoutes(dummy1.routes)
      // setGoogleRoutes(dummy2.routes);
      // setGoogleRoutes(dummy3.routes);
    } catch (e) {
      setErrorMessage("Error - can't get current location or directions")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGoogleRoute()
  }, [])

  const onTransitOptionPressed = (i: number) => {
    if (googleRoutes && googleRoutes[i]) {
      // console.log(googleRoutes[i]);
      navigation.navigate('GoogleMapsDirections', {
        destination: route.params.destination,
        destinationName: route.params.destinationName,
        googleRoute: googleRoutes[i] as Route
      })
    }
  }

  const transitOptions = useMemo(() => {
    if (googleRoutes && googleRoutes.length) {
      return googleRoutes.map((route) => {
        return getStepsOverViewFromGoogleRouteLeg(route.legs[0] as Leg)
      })
    }
    return []
  }, [googleRoutes])

  if (isLoading) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    )
  }

  return (
    <Page disableScroll>
      <View style={{
        backgroundColor: '#F9FAFB',
        flex: 1
      }}>
        <View style={{
          paddingHorizontal: 12,
          paddingTop: 16,
          paddingBottom: 8,
          backgroundColor: '#F9FAFB'
        }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            color: '#1F2937',
            marginBottom: 8
          }}>
            Directions to{' '}
            <Text style={{
              color: '#4F46E5',
              fontWeight: '700'
            }}>
              {route.params.destinationName}
            </Text>
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#6B7280',
            lineHeight: 20,
            fontWeight: '500',
            paddingBottom: 8,
          }}>
            Choose your preferred route
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {transitOptions.length === 0 && (
            <View style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
            }}>
              <Text style={{
                fontSize: 16,
                color: '#EF4444',
                fontWeight: '500'
              }}>
                {errorMessage ?? 'Error: No routes found'}
              </Text>
            </View>
          )}

          <View style={{ gap: 8 }}>
            {transitOptions.map((t, i) => (
              <TransitOptionCard
                key={i}
                index={i}
                googleRouteStepsOverview={t}
                onPress={() => {
                  onTransitOptionPressed(i)
                }}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </Page>
  )
}

export default TransitOptions
