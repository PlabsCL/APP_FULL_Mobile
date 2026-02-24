import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/colors';
import HomeScreen from '../screens/HomeScreen';
import RutasDisponiblesScreen, { RootStackParamList } from '../screens/RutasDisponiblesScreen';
import VehiculosScreen from '../screens/VehiculosScreen';
import RutaScreen from '../screens/RutaScreen';
import ConfirmarScreen from '../screens/ConfirmarScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600' as any,
          },
          cardStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RutasDisponibles"
          component={RutasDisponiblesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Vehiculos"
          component={VehiculosScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Ruta"
          component={RutaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Confirmar"
          component={ConfirmarScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
