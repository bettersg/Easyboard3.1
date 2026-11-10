import type { TripStage } from '../../services/tripStore'

export interface StoryStep {
  id: string
  title: string
  detail: string
  photoUrl?: string
  icon:
    | 'walk-outline'
    | 'time-outline'
    | 'bus-outline'
    | 'card-outline'
    | 'person-outline'
    | 'navigate-outline'
    | 'exit-outline'
    | 'flag-outline'
}

export function getStorySteps(destinationName: string): StoryStep[] {
  return [
    { id: 'walk', title: 'Walk to the bus stop', detail: '3 minutes', icon: 'walk-outline' },
    { id: 'wait', title: 'Wait for bus 2', detail: 'Stand near the blue sign', icon: 'time-outline' },
    { id: 'board', title: 'Get on bus 2', detail: 'Wait for the door to open', icon: 'bus-outline' },
    { id: 'tap', title: 'Tap your card', detail: 'The reader is near the door', icon: 'card-outline' },
    { id: 'sit', title: 'Sit near the driver', detail: 'The driver can see you', icon: 'person-outline' },
    { id: 'ride', title: 'Ride 8 stops', detail: 'About 15 minutes', icon: 'navigate-outline' },
    { id: 'alight', title: `Get off at ${destinationName}`, detail: 'Press the bell after 7 stops', icon: 'exit-outline' },
    { id: 'arrive', title: `Walk to ${destinationName}`, detail: 'Follow the last part of the route', icon: 'flag-outline' }
  ]
}


export const STORY_STEP_ICONS: Record<string, StoryStep['icon']> = {
  walk: 'walk-outline',
  wait: 'time-outline',
  board: 'bus-outline',
  tap: 'card-outline',
  sit: 'person-outline',
  ride: 'navigate-outline',
  alight: 'exit-outline',
  arrive: 'flag-outline'
}

export function getStoryStepIcon(stepId: string): StoryStep['icon'] {
  return STORY_STEP_ICONS[stepId] ?? 'navigate-outline'
}

export type ScreenStage = 'story' | 'wait' | 'board' | 'tap' | 'ride' | 'alight' | 'arrived'

export const STAGE_INDEX: Record<ScreenStage, number> = {
  story: 0,
  wait: 2,
  board: 3,
  tap: 4,
  ride: 6,
  alight: 7,
  arrived: 8
}

export function toTripStage(stage: ScreenStage): TripStage {
  switch (stage) {
    case 'story':
      return 'story'
    case 'wait':
      return 'waiting'
    case 'board':
      return 'boarding'
    case 'tap':
    case 'ride':
      return 'on-bus'
    case 'alight':
      return 'arriving'
    case 'arrived':
      return 'arrived'
  }
}

export const STAGE_COPY: Record<
  Exclude<ScreenStage, 'story' | 'arrived'>,
  {
    title: string
    detail: string
    scene: 'stop' | 'door' | 'card' | 'seat' | 'destination'
    primary: string
    next: ScreenStage
  }
> = {
  wait: {
    title: 'Wait for bus 2',
    detail: 'Stand near the blue sign. When the bus stops, the door will open.',
    scene: 'stop',
    primary: 'The bus has stopped',
    next: 'board'
  },
  board: {
    title: 'Get on bus 2',
    detail: 'The bus has stopped. The door is open. Check the number: 2.',
    scene: 'door',
    primary: 'I am on the bus',
    next: 'tap'
  },
  tap: {
    title: 'Tap your card',
    detail: 'Hold your card on the reader near the door. Wait for the green light.',
    scene: 'card',
    primary: 'My card is tapped',
    next: 'ride'
  },
  ride: {
    title: 'Sit near the driver',
    detail: 'Ride 8 stops. I will count with you.',
    scene: 'seat',
    primary: 'I see my stop',
    next: 'alight'
  },
  alight: {
    title: 'Get off at your stop',
    detail: 'Press the bell after 7 stops. Then walk to your destination.',
    scene: 'destination',
    primary: 'I am off the bus',
    next: 'arrived'
  }
}
