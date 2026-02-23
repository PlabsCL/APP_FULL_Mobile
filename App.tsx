import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" />
    </>
  );
}
