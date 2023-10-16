import { Route } from './GoogleRoute.type'

type RootStackParamList = {
  Main: undefined
  Introduction: undefined
  CalcTransit: {
    destination: any
    destinationName: string
  }
  GoogleMapsDirections: {
    googleRoute: Route
    destination: any
    destinationName: string
  }
  TransitOptions: {
    destination: any
    destinationName: string
  }
  Direction: undefined
  Setting: undefined
}
export default RootStackParamList
