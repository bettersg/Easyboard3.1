export default function decodeGooglePlaces(encodedPolyline) {
  const poly = [];
  let index = 0,
    len = encodedPolyline.length;
  let lat = 0,
    lng = 0;

  while (index < len) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encodedPolyline.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encodedPolyline.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;
    const p = new LatLong((lat / 1e5), (lng / 1e5));
    poly.push(p);
  }
  return poly;
}

class LatLong {
  constructor(lat, long) {
    this.latitude = lat;
    this.longitude = long;
  }
}
