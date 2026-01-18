import { LoginProvider } from '@repo/common/hooks'
import { Stack } from 'expo-router'

export default function OnboardingLayout() {
  return (
    <LoginProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          presentation: 'card', // Card presentation with default slide animation
          gestureEnabled: true, // Enable swipe back gesture on native
          gestureDirection: 'horizontal',
          animationTypeForReplace: 'push' // Use push animation even for replace
        }}
      >
        {/* Expo Router auto-discovers routes - no need to explicitly declare them */}
        {/* The screenOptions above will apply to all screens in this stack */}
      </Stack>
    </LoginProvider>
  )
}
