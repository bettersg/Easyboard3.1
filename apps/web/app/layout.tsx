'use client'

import 'raf/polyfill'

import { PT_Sans } from 'next/font/google'
import '../global.css'
import { AuthRouteGuard } from '@repo/common/components'
import {
  AuthProvider,
  LocationSharingProvider,
  NavigationProvider
} from '@repo/common/contexts'
import { Provider } from '@repo/common/provider'
import { FirebaseInit } from '../components/FirebaseInit'

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
  display: 'swap'
})

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' className={ptSans.variable}>
      <body>
        <FirebaseInit />
        <Provider>
          <AuthProvider>
            <NavigationProvider>
              <LocationSharingProvider>
                <AuthRouteGuard>{children}</AuthRouteGuard>
              </LocationSharingProvider>
            </NavigationProvider>
          </AuthProvider>
        </Provider>
      </body>
    </html>
  )
}
