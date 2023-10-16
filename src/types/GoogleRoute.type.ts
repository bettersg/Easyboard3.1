import LatLong from '../interfaces/LatLong.interface'

export interface GoogleRoute {
  routes: Route[]
}
export interface Route {
  legs: Leg[]
  distanceMeters: number
  duration: string
  staticDuration: string
  polyline: Polyline
  viewport: Viewport
  travelAdvisory: TravelAdvisory
  localizedValues: LegLocalizedValues
  routeLabels: string[]
}

export interface Leg {
  distanceMeters: number
  duration: string
  staticDuration: string
  polyline: Polyline
  startLocation: Location
  endLocation: Location
  steps: Step[]
  localizedValues: LegLocalizedValues
  stepsOverview: StepsOverview
}

export interface Location {
  latLng: LatLong
}

export interface LegLocalizedValues {
  distance: Distance
  duration: Distance
  staticDuration: Distance
  transitFare?: TransitFare
}

export interface Distance {
  text: string
}

export interface TransitFare {}

export interface Polyline {
  encodedPolyline: string
}

export interface Step {
  distanceMeters: number
  staticDuration: string
  polyline: Polyline
  startLocation: Location
  endLocation: Location
  navigationInstruction?: StepNavigationInstruction
  localizedValues: StepLocalizedValues
  travelMode: TravelMode
  transitDetails?: TransitDetails
}

export interface StepLocalizedValues {
  distance: Distance
  staticDuration: Distance
}

export interface StepNavigationInstruction {
  maneuver?: Maneuver
  instructions: string
}

export type Maneuver =
  | 'DEPART'
  | 'TURN_LEFT'
  | 'TURN_RIGHT'
  | 'TURN_SLIGHT_RIGHT'
  | 'TURN_SLIGHT_LEFT'

export interface TransitDetails {
  stopDetails: StopDetails
  localizedValues: TransitDetailsLocalizedValues
  headsign: string
  headway: string
  transitLine: TransitLine
  stopCount: number
}

export interface TransitDetailsLocalizedValues {
  arrivalTime: Time
  departureTime: Time
}

export interface Time {
  time: Distance
  timeZone: string
}

export interface StopDetails {
  arrivalStop: Stop
  arrivalTime: Date
  departureStop: Stop
  departureTime: Date
}

export interface Stop {
  name: string
  location: Location
}

export interface TransitLine {
  agencies: Agency[]
  name: string
  color: string
  textColor: string
  vehicle: Vehicle
}

export interface Agency {
  name: string
  phoneNumber: string
  uri: string
}

export interface Vehicle {
  name: Distance
  type: string
  iconUri: string
}

export type TravelMode = 'TRANSIT' | 'WALK'

export interface StepsOverview {
  multiModalSegments: MultiModalSegment[]
}

export interface MultiModalSegment {
  stepStartIndex: number
  stepEndIndex: number
  navigationInstruction?: MultiModalSegmentNavigationInstruction
  travelMode: TravelMode
}

export interface MultiModalSegmentNavigationInstruction {
  instructions: string
}

export interface TravelAdvisory {
  transitFare: TransitFare
}

export interface Viewport {
  low: LatLong
  high: LatLong
}
