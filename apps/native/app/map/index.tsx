import { useState } from 'react'
import GoogleMapView from '../../../../packages/common/src/components/mapView/GoogleMapView'

export default function MapPage() {
  const [, setSelectedLocation] = useState(null)

  const onLocationMarkerDrop = function (locationMarker: any) {
    setSelectedLocation(locationMarker)
  }

  return (
    <GoogleMapView
      initialCenter={{
        latitude: 1.3521,
        longitude: 103.8198
      }}
      onLocationMarkerDrop={onLocationMarkerDrop}
      value={null}
    />
  )
}
