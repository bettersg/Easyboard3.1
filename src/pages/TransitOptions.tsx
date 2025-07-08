import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as Location from 'expo-location'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ScrollView, Text, View, StyleSheet } from 'react-native'
import { getGoogleRoute } from '../apis/GoogleRouteApi'
import LoadingIndicator from '../common/components/LoadingIndicator'
import Page from '../common/components/Page'
import TransitOptionCard from '../common/components/TransitOptionCard'
import { getStepsOverViewFromGoogleRouteLeg } from '../common/utils/GoogleRouteUtils'
import { Leg, Route } from '../types/GoogleRoute.type'
import { RootStackParamList } from '../types/RootStackParamList.type'
import { Colors } from '../styles/color'

type Props = NativeStackScreenProps<RootStackParamList, 'TransitOptions'>

const TransitOptions = ({ navigation, route }: Props) => {
  const [googleRoutes, setGoogleRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const fetchGoogleRoute = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage('')
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setErrorMessage("Location permission is required to get directions")
        return
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })
      // Fetch Google route from current location to destination
      const newGoogleRoute = await getGoogleRoute(
        {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        },
        route.params.destination.latlng
      )

      if (newGoogleRoute && typeof newGoogleRoute === 'object' && newGoogleRoute.routes?.length > 0) {
        setGoogleRoutes(newGoogleRoute.routes)
      } else {
        setErrorMessage("No routes found to your destination")
      }
    } catch (e) {
      setErrorMessage("Error - can't get current location or directions")
    } finally {
      setIsLoading(false)
    }
  }, [route.params.destination.latlng])

  useEffect(() => {
    fetchGoogleRoute()
  }, [fetchGoogleRoute])

  const onTransitOptionPressed = useCallback((index: number) => {
    if (googleRoutes?.[index]) {
      navigation.navigate('GoogleMapsDirections', {
        destination: route.params.destination,
        destinationName: route.params.destinationName,
        googleRoute: googleRoutes[index] as Route
      })
    }
  }, [googleRoutes, navigation, route.params])

  const transitOptions = useMemo(() =>
    googleRoutes?.map((route) =>
      getStepsOverViewFromGoogleRouteLeg(route.legs[0] as Leg)
    ) ?? [],
    [googleRoutes]
  );

  if (isLoading) {
    return (
      <Page>
        <LoadingIndicator />
      </Page>
    )
  }

  return (
    <Page disableScroll>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>
            Directions to{' '}
            <Text style={styles.destinationName}>
              {route.params.destinationName}
            </Text>
          </Text>
          <Text style={styles.subtitle}>
            Choose your preferred route
          </Text>
        </View>

        {/* Routes List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
        >
          {/* Error Message */}
          {errorMessage && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Transit Options */}
          {transitOptions.length > 0 && (
            <View style={styles.routesContainer}>
              {transitOptions.map((route, index) => (
                <TransitOptionCard
                  key={index}
                  index={index}
                  googleRouteStepsOverview={route}
                  onPress={() => onTransitOptionPressed(index)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </Page>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    flex: 1
  },
  headerContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#F9FAFB'
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8
  },
  destinationName: {
    color: '#4F46E5',
    fontWeight: '700'
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 20,
    fontWeight: '500',
    paddingBottom: 8,
  },
  scrollView: {
    flex: 1
  },
  errorCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 8
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '500'
  },
  routesContainer: {
    gap: 8
  }
})

export default TransitOptions
