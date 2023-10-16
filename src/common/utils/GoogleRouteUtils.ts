import { Leg, TransitLine, TravelMode } from '../../types/GoogleRoute.type'

export interface GoogleRouteStepsOverview {
  totalDistance: string
  totalDuration: string
  steps: GoogleRouteStepsOverviewStep[]
}
export interface GoogleRouteStepsOverviewStep {
  travelMode: TravelMode
  instruction?: string
  transitLine?: TransitLine
}

/**
 * Get quick overview of what this route consists of
 * Typically used to show overview to select a route
 * @param leg
 * @returns
 */
export const getStepsOverViewFromGoogleRouteLeg = (leg: Leg): GoogleRouteStepsOverview => {
  const totalDuration = leg.localizedValues.duration.text
  const totalDistance = leg.localizedValues.distance.text
  const steps = leg.stepsOverview.multiModalSegments.map((e) => {
    const overview: GoogleRouteStepsOverviewStep = {
      travelMode: e.travelMode,
      instruction: e.navigationInstruction?.instructions,
    }
    if (e.travelMode === 'TRANSIT') {
      // We try to get more information.
      const idx = e.stepStartIndex
      overview.transitLine = leg.steps[idx]?.transitDetails?.transitLine
    }
    return overview
  })
  return {
    totalDistance,
    totalDuration,
    steps,
  }
}
