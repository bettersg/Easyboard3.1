import axios from "axios";
import Constants from "expo-constants";

const GOOGLE_MAPS_API_BASE_URL = "https://maps.googleapis.com/maps/api";

// no good way to store this without a backend. Since regardless it is expose.
// PS: both ios and android will be using the same key for now (21/09/2022)
const apiKey = Constants.expoConfig.extra.googleMapsAPI;
export async function queryGooglePlacesAsync(searchTerm) {
  if (searchTerm.trim())
    try {
      const result = await axios.request({
        method: "post",
        url: `${GOOGLE_MAPS_API_BASE_URL}/place/autocomplete/json?key=${apiKey}&input=${searchTerm}&components=country:sg`,
      });
      if (result) {
        const {
          data: { predictions },
        } = result;
        return predictions;
      }
    } catch (e) {
      console.error(e);
    }
}

export async function getGooglePlacesLocationAsync(placeId) {
  try {
    const result = await axios.request({
      method: "post",
      url: `${GOOGLE_MAPS_API_BASE_URL}/place/details/json?key=${apiKey}&place_id=${placeId}`,
    });
    if (result) {
      const {
        data: {
          result: {
            geometry: { location },
          },
        },
      } = result;
      return location;
    }
  } catch (e) {
    console.error(e);
  }
}

export async function getGoogleReverseGeoCodingAsync(latitude, longitude) {
  try {
    const result = await axios.request({
      method: "get",
      url: `${GOOGLE_MAPS_API_BASE_URL}/geocode/json?key=${apiKey}&latlng=${latitude},${longitude}`,
    });
    if (result) {
      return result.data.results[0].formatted_address;
    }
  } catch (e) {
    console.error(e);
  }
  return "";
}

