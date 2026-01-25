'use client'

import { GoogleMapView } from '@repo/common/components'
import type { MarkerData } from '@repo/common/types'
import { useState } from 'react'

export default function MapPage() {
  const [_location, setSelectedLocation] = useState<MarkerData | null>(null)

  const onLocationMarkerDrop = function (locationMarker: MarkerData) {
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
