'use client'

import { useEffect } from 'react'
import { useRouter } from 'solito/navigation'

export default function OnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/onboarding/1')
  }, [router])

  return null
}
