'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'solito/navigation'
import { LoadingIndicator, Text, View } from '../components'
import { useAuth } from '../contexts'

interface AuthRouteGuardProps {
  children: React.ReactNode
}

// Combined routes from both platforms to ensuring coverage
const PUBLIC_ROUTES = ['/', '/login', '/onboarding', '/index']
const AUTH_REDIRECT_ROUTES = ['/login', '/onboarding', '/index', '/']

export function AuthRouteGuard({ children }: AuthRouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { hasAuthen, isLoading } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Wait for AuthContext to finish restoring session
    if (isLoading) return

    const checkAuth = () => {
      const currentPath = pathname || ''

      // Check if current path matches any public route
      const isPublicRoute = PUBLIC_ROUTES.some(
        (route) => currentPath === route || currentPath.startsWith(`${route}/`)
      )

      // Scenario 1: User is accessing a public route
      if (isPublicRoute) {
        // If authenticated and accessing a redirect route (like login), send to home
        const shouldRedirectToHome = AUTH_REDIRECT_ROUTES.some(
          (route) =>
            currentPath === route || currentPath.startsWith(`${route}/`)
        )

        if (hasAuthen && shouldRedirectToHome) {
          router.replace('/home')
          return
        }

        // Otherwise allow access to public route
        setIsChecking(false)
        return
      }

      // Scenario 2: User is accessing a protected route
      if (!hasAuthen) {
        router.replace('/login')
      } else {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [hasAuthen, isLoading, pathname, router])

  if (isLoading || isChecking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}
      >
        <LoadingIndicator />
        <Text style={{ marginTop: 10, color: '#677281' }}>Loading...</Text>
      </View>
    )
  }

  return <>{children}</>
}
