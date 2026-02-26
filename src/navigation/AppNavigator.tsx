import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/colors';
import { navigationRef } from './navigationRef';
import HomeScreen from '../screens/HomeScreen';
import RutasDisponiblesScreen, { RootStackParamList } from '../screens/RutasDisponiblesScreen';
import VehiculosScreen from '../screens/VehiculosScreen';
import RutaScreen from '../screens/RutaScreen';
import ConfirmarScreen from '../screens/ConfirmarScreen';
import ConfiguracionScreen from '../screens/ConfiguracionScreen';
import EntregasScreen from '../screens/EntregasScreen';
import PedidoScreen from '../screens/PedidoScreen';
import FormularioEntregaScreen from '../screens/FormularioEntregaScreen';
import BulkGestionScreen from '../screens/BulkGestionScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
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
        <Stack.Screen
          name="Configuracion"
          component={ConfiguracionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Entregas"
          component={EntregasScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Pedido"
          component={PedidoScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FormularioEntrega"
          component={FormularioEntregaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BulkGestion"
          component={BulkGestionScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
