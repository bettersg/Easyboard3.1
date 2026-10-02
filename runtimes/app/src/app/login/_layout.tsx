import { Stack } from 'expo-router'
import { LoginProvider } from '@/hooks'

export default function LoginLayout() {
  return (
    <LoginProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          presentation: 'card',
          gestureEnabled: true,
          gestureDirection: 'horizontal'
        }}
      />
    </LoginProvider>
  )
}
