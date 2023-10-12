// Note: This interface is not 100% comprehensive
// Ref: https://docs.external.citymapper.com/api/#operation/transitdirections
export interface CityMapperRoute {
  start: StartOrEnd;
  end: StartOrEnd;
  duration_seconds: number;
  legs: LegsEntity[];
  signature: string;
}
interface StartOrEnd {
  coordinates: Coordinates;
}
interface Coordinates {
  lat: number;
  lon: number;
}
interface LegsEntity {
  travel_mode: 'walk' | 'transit' | 'self_piloted' | 'on_demand';
  duration_seconds?: number;
  path: string;
  instructions?: (InstructionsEntity)[] | null;
  vehicle_types: VehicleTypes[]
  services? : any
  stops: LegStop[]
}
interface LegStop {
  id: string
  name: string
  coordinates: Coordinates
  indicator_text: string
  code: string
}
type VehicleTypes = "bike" | "bus" | "bus_rapid_transit" | "car" | "ebike" | "escooter" | "ferry" | "funicular" | "gondola" | "helicopter" | "light_rail" | "metro" | "monorail" | "motorscooter" | "rail" | "subway" | "streetcar" | "tram" | "trolley" | "trolleybus"
interface InstructionsEntity {
  path_index: number;
  description_text: string;
  type: string;
  distance_meters?: number | null;
  time_seconds?: number | null;
  type_direction?: string | null;
}
