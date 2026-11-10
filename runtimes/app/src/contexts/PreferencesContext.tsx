'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

export type PrivacyMode = 'trip-only' | 'always' | 'paused'

export interface Preferences {
  easyRead: boolean
  textScale: number
  privacyMode: PrivacyMode
}

const DEFAULT_PREFERENCES: Preferences = {
  easyRead: false,
  textScale: 1,
  privacyMode: 'trip-only'
}

const STORAGE_KEY = 'eb-preferences'

function readPreferences(): Preferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PREFERENCES
    const parsed = JSON.parse(raw) as Partial<Preferences>
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      textScale: Math.min(1.3, Math.max(1, Number(parsed.textScale) || 1))
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

interface PreferencesContextValue {
  preferences: Preferences
  updatePreferences: (patch: Partial<Preferences>) => void
  scale: (size: number) => number
  bodyLine: (size: number) => number
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(
  undefined
)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(readPreferences)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    } catch {
      // Preferences are a convenience; ignore private-mode failures.
    }
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('easy-read', preferences.easyRead)
    }
  }, [preferences])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setPreferences(readPreferences())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const updatePreferences = useCallback((patch: Partial<Preferences>) => {
    setPreferences(current => ({ ...current, ...patch }))
  }, [])

  const scale = useCallback(
    (size: number) => {
      const factor = preferences.textScale * (preferences.easyRead ? 1.08 : 1)
      return Math.round(size * factor)
    },
    [preferences.easyRead, preferences.textScale]
  )

  const bodyLine = useCallback(
    (size: number) => Math.round(scale(size) * (preferences.easyRead ? 1.65 : 1.5)),
    [preferences.easyRead, scale]
  )

  const value = useMemo(
    () => ({ preferences, updatePreferences, scale, bodyLine }),
    [preferences, updatePreferences, scale, bodyLine]
  )

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return context
}
