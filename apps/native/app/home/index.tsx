import { HomePage } from '@repo/common/pages'
import { useNavigation } from 'expo-router'
import { useEffect } from 'react'

export default function Home() {
  const navigation = useNavigation()

  useEffect(() => {
    // This listener fires whenever the navigation state changes
    const unsubscribe = navigation.addListener('state', () => {
      const state = navigation.getState()
      console.log(
        'Current navigation history:',
        state?.routes.map((route) => route.name)
      )
    })

    return unsubscribe
  }, [navigation])

  return <HomePage />
}
