'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef(0)

  const showToast = useCallback((next: string) => {
    setMessage(next)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMessage(null), 3200)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return { message, showToast, clearToast: () => setMessage(null) }
}
