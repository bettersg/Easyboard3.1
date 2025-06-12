import { Route } from './GoogleRoute.type'
import LatLong from '../interfaces/LatLong.interface'
import { FirebaseAuthTypes } from '@react-native-firebase/auth'

export type RootStackParamList = {
  Main: undefined
  Introduction: undefined
  CalcTransit: {
    destination: any
    destinationName: string
  }
  GoogleMapsDirections: {
    googleRoute: Route
    destination: {
      description: string
      latlng: LatLong
    }
    destinationName: string
  }
  TransitOptions: {
    destination: any
    destinationName: string
  }
  Direction: undefined
  Setting: undefined
  Authentication: undefined
  OTPVerification: {
    phoneNumber: string
    userType: 'PWID' | 'CAREGIVER'
    confirmation: FirebaseAuthTypes.ConfirmationResult
  }
  CaregiverMain: undefined
  TrackPWIDMap: undefined
}
