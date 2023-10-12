import axios from "axios";
import Constants from "expo-constants";
import { CityMapperRoute } from "./CityMapperAPI.interface";

const CITY_MAPPER_API_URL = "https://api.external.citymapper.com/api/1";
const apiKey = Constants.expoConfig?.extra?.cityMapperAPI;

interface CityMapperDirectionsApi {
  routes: CityMapperRoute[]
  language?: string
}

export async function getDirectionsAsync(
  originLat: string | number,
  originLong: string | number,
  destLat: string | number,
  destLong: string | number
): Promise<CityMapperRoute[]> {
  let directions: CityMapperRoute[] = []
  // CityMapper Transit
  // Ref: https://docs.external.citymapper.com/api/#operation/transitdirections
  try {
    const result = await axios.request<CityMapperDirectionsApi>({
      method: "get",
      url: `${CITY_MAPPER_API_URL}/directions/transit?start=${originLat},${originLong}&end=${destLat},${destLong}`,
      headers: {
        "Citymapper-Partner-Key": apiKey,
      },
    });
    if (result) {
      if (result.data.routes.length > 0) directions = result.data.routes;
    }
  } catch (e) {
    console.error(e);
  }
  // CityMapper Walking Direcitons
  // Ref: https://docs.external.citymapper.com/api/#operation/walkdirections
  try {
    const result = await axios.request<CityMapperDirectionsApi>({
      method: "get",
      url: `${CITY_MAPPER_API_URL}/directions/walk?start=${originLat},${originLong}&end=${destLat},${destLong}`,
      headers: {
        "Citymapper-Partner-Key": apiKey,
      },
    });
    directions = [...directions,...result.data.routes]
  } catch (innerError) {
    console.error(innerError);
  }
  directions.sort((a,b) => a['duration_seconds'] - b['duration_seconds'])
  directions.splice(5)
  return directions;
}
