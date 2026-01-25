'use client'

import { LoginProvider } from '@repo/common/hooks'

export default function OnboardingLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <LoginProvider>{children}</LoginProvider>
}
