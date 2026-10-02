'use client'

import { createContext, type ReactNode, useContext, useState } from 'react'

interface InitialLoadContextType {
  hasInitiallyLoaded: boolean
  markAsLoaded: () => void
}

const InitialLoadContext = createContext<InitialLoadContextType | undefined>(
  undefined
)

export function InitialLoadProvider({ children }: { children: ReactNode }) {
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)

  const markAsLoaded = () => {
    setHasInitiallyLoaded(true)
  }

  return (
    <InitialLoadContext.Provider value={{ hasInitiallyLoaded, markAsLoaded }}>
      {children}
    </InitialLoadContext.Provider>
  )
}

export function useInitialLoad() {
  const context = useContext(InitialLoadContext)
  if (context === undefined) {
    throw new Error('useInitialLoad must be used within InitialLoadProvider')
  }
  return context
}
