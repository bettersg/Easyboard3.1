import { CommonProviders } from '../contexts/CommonProviders'
import HydrationWrapper from './hydration'
import { SafeArea } from './safeArea'

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <HydrationWrapper>
      <CommonProviders>
        <SafeArea>{children as React.ReactElement}</SafeArea>
      </CommonProviders>
    </HydrationWrapper>
  )
}

export { useSafeArea } from './safeArea/useSafeArea'
