import { TrackPWIDPage } from '@repo/common/pages'
import { useLocalSearchParams } from 'expo-router'

export default function TrackPWIDScreen() {
  const { phone, name } = useLocalSearchParams<{
    phone: string
    name: string
  }>()

  if (!phone || !name) {
    return null
  }

  return <TrackPWIDPage pwidPhoneNumber={phone} pwidName={name} />
}
