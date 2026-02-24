import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../screens/RutasDisponiblesScreen';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateToHome() {
  if (navigationRef.isReady()) {
    navigationRef.reset({ index: 0, routes: [{ name: 'Home' }] });
  }
}
