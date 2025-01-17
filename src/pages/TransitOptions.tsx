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
        googleRoute: googleRoutes[i] as Route,
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
      <Text className="pb-4 text-2xl">
        {`Directions to `}
        <Text className="font-semibold text-primary">{route.params.destinationName}</Text>
      </Text>
      <ScrollView>
        {transitOptions.length === 0 && (
          <View>
            <Text className="text-lg">{errorMessage ?? 'Error: No routes found'}</Text>
          </View>
        )}
        {transitOptions.map((t, i) => (
          <TransitOptionCard
            index={i}
            googleRouteStepsOverview={t}
            onPress={() => {
              onTransitOptionPressed(i)
            }}
          />
        ))}
      </ScrollView>
    </Page>
  )
}
export default TransitOptions
