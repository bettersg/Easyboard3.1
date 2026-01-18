'use client'

import { LoginProvider } from '@repo/common/hooks'

export default function LoginLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <LoginProvider>{children}</LoginProvider>
}
