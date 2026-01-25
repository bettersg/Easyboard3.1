'use client'

import { TrackPWIDPage } from '@repo/common/pages'
import { useSearchParams } from 'next/navigation'

export default function TrackPWIDScreen() {
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone')
  const name = searchParams.get('name')

  if (!phone || !name) {
    return null
  }

  return <TrackPWIDPage pwidPhoneNumber={phone} pwidName={name} />
}
