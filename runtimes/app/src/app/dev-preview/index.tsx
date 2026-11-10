import { Redirect, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Text, View } from '../../components'
import { seedPreviewUser } from '../../services/devPreview'

export default function DevPreviewScreen() {
  const router = useRouter()
  const { role } = useLocalSearchParams<{ role?: string }>()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!__DEV__) return
    seedPreviewUser(role === 'caregiver' ? 'CAREGIVER' : 'PWID')
      .then(() => router.replace('/home'))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not open preview')
      })
  }, [role, router])

  if (!__DEV__) return <Redirect href='/' />

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 16, color: '#5E6B62', textAlign: 'center' }}>
        {error || 'Opening traveller preview…'}
      </Text>
    </View>
  )
}
