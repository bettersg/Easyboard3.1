import { LoginProvider } from '@repo/common/hooks'
import { Stack } from 'expo-router'

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
