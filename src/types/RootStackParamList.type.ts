import { Route } from './GoogleRoute.type'
import LatLong from '../interfaces/LatLong.interface'

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
  Registration: undefined
  OTPVerification: {
    phoneNumber: string
    userType: 'PWID' | 'CAREGIVER'
    isRegistration?: boolean
  }
  CaregiverMain: undefined
  TrackPWIDMap: { pwidPhoneNumber: string }
}
