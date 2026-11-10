'use client'

export type TripStage =
  | 'story'
  | 'waiting'
  | 'boarding'
  | 'on-bus'
  | 'arriving'
  | 'arrived'

export interface ActiveTrip {
  id: string
  travellerName: string
  travellerPhone?: string
  destination: string
  origin: string
  stage: TripStage
  busNumber: string
  startedAt: number
  updatedAt: number
  caregiverName: string
  caregiverPhone: string
  practice: boolean
}

const TRIP_KEY = 'eb-active-trip'
const TRIP_EVENT = 'eb-trip-change'

export function getActiveTrip(): ActiveTrip | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(TRIP_KEY)
    return raw ? (JSON.parse(raw) as ActiveTrip) : null
  } catch {
    return null
  }
}

export function setActiveTrip(trip: ActiveTrip | null) {
  if (typeof window === 'undefined') return
  try {
    if (trip) {
      window.localStorage.setItem(TRIP_KEY, JSON.stringify(trip))
    } else {
      window.localStorage.removeItem(TRIP_KEY)
    }
    if (typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new Event(TRIP_EVENT))
    }
  } catch {
    // A failed write should not stop the trip flow.
  }
}

export function subscribeToTrip(callback: (trip: ActiveTrip | null) => void) {
  if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return () => {}
  const handler = () => callback(getActiveTrip())
  window.addEventListener(TRIP_EVENT, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(TRIP_EVENT, handler)
    window.removeEventListener('storage', handler)
  }
}

export function stageLabel(stage: TripStage): string {
  switch (stage) {
    case 'story':
      return 'Ready to go'
    case 'waiting':
      return 'Waiting at the stop'
    case 'boarding':
      return 'Boarding now'
    case 'on-bus':
      return 'On the bus'
    case 'arriving':
      return 'Almost there'
    case 'arrived':
      return 'Arrived'
  }
}
