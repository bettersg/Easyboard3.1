// https://github.com/nandorojo/solito/blob/master/example-monorepos/with-expo-router/packages/app/provider/safe-area/use-safe-area.ts

import type { useSafeArea as nativeHook } from './useSafeArea.native'

const area = {
  bottom: 0,
  left: 0,
  right: 0,
  top: 0
}

export function useSafeArea(): ReturnType<typeof nativeHook> {
  return area
}
