'use client'

import * as Speech from 'expo-speech'
import { useCallback } from 'react'

export function useReadAloud() {
  const speak = useCallback((text: string) => {
    Speech.stop()
    Speech.speak(text, {
      language: 'en-SG',
      rate: 0.92,
      pitch: 1
    })
    return true
  }, [])

  const stop = useCallback(() => {
    Speech.stop()
  }, [])

  return { speak, stop, supported: true }
}
