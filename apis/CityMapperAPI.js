import axios from "axios";
import Constants from "expo-constants";

const CITY_MAPPER_API_URL = "https://api.external.citymapper.com/api/1";
const apiKey = Constants.manifest.extra.cityMapperAPI;
export async function getDirectionsAsync(
  originLat,
  originLong,
  destLat,
  destLong
) {
  let test = []
  try {
    const result = await axios.request({
      method: "get",
      url: `${CITY_MAPPER_API_URL}/directions/transit?start=${originLat},${originLong}&end=${destLat},${destLong}`,
      headers: {
        "Citymapper-Partner-Key": apiKey,
      },
    });
    if (result) {
      if (result.data.routes.length > 0) test = result.data.routes;
    }
  } catch (e) {
    console.error(e);
  }
  try {
    const result = await axios.request({
      method: "get",
      url: `${CITY_MAPPER_API_URL}/directions/walk?start=${originLat},${originLong}&end=${destLat},${destLong}`,
      headers: {
        "Citymapper-Partner-Key": apiKey,
      },
    });
    test = [...test,...result.data.routes]
  } catch (innerError) {
    console.error(innerError);
  }
  test.sort((a,b) => a['duration_seconds'] - b['duration_seconds'])
  test.splice(5)
  return test;
}
