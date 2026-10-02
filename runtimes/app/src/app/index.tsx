import { Redirect } from 'expo-router'
import { useAuth } from '@/contexts'
import { LandingPage } from '@/screens'

export default function Home() {
  const { hasAuthen } = useAuth()

  if (hasAuthen) {
    return <Redirect href='/home' />
  }

  return <LandingPage />
}
