import type { Journey, PWIDUser } from '../types'
import { getUserData, updateUserData } from './userService'

function sorted(journeys: Journey[]) {
  return [...journeys].sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getJourneys(pwidPhone: string): Promise<Journey[]> {
  if (!pwidPhone) return []
  const user = await getUserData(pwidPhone)
  if (!user || user.userType !== 'PWID') return []
  return sorted((user as PWIDUser).journeys ?? [])
}

export async function saveJourney(
  pwidPhone: string,
  journey: Journey
): Promise<Journey[]> {
  const existing = await getJourneys(pwidPhone)
  const next = sorted([
    journey,
    ...existing.filter(item => item.id !== journey.id)
  ])
  await updateUserData(pwidPhone, { journeys: next })
  return next
}

export async function deleteJourney(
  pwidPhone: string,
  journeyId: string
): Promise<Journey[]> {
  const existing = await getJourneys(pwidPhone)
  const next = existing.filter(item => item.id !== journeyId)
  await updateUserData(pwidPhone, { journeys: next })
  return next
}

export function findJourneyForDestination(
  journeys: Journey[],
  destinationName: string
): Journey | null {
  const target = destinationName.trim().toLowerCase()
  return (
    journeys.find(
      journey =>
        journey.destinationName.trim().toLowerCase() === target
    ) ?? null
  )
}
