import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types/RootStackParamList.type';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<RouteName extends keyof RootStackParamList>(
    ...args: RouteName extends unknown
    ? undefined extends RootStackParamList[RouteName]
      ? [RouteName] | [RouteName, RootStackParamList[RouteName]]
      : [RouteName, RootStackParamList[RouteName]]
    : never
) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(...args);
  }
} 