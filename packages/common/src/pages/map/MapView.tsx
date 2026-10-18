// deprecated, uncomment for testing if needed
// 'use client'

// import { useState } from 'react'
// import { GoogleMapView } from '@repo/common/components'
// import type { MarkerData } from '@repo/common/types'

// export function MapView() {
//   const [_, setSelectedLocation] = useState<MarkerData | null>(null)
//   const onLocationMarkerDrop = (locationMarker: MarkerData) => {
//     setSelectedLocation(locationMarker)
//   };

//   return (
//     <GoogleMapView
//       initialCenter={{
//         latitude: 1.3521,
//         longitude: 103.8198,
//       }}
//       onLocationMarkerDrop={onLocationMarkerDrop}
//       value={null}
//     />
//   )
// }
