import { useAuth } from '@repo/common/contexts'
import { LandingPage } from '@repo/common/pages'
import { Redirect } from 'expo-router'

export default function Home() {
  const { hasAuthen } = useAuth()

  if (hasAuthen) {
    return <Redirect href='/home' />
  }

  return <LandingPage />
}
