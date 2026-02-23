import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import { colors } from '../constants/colors';

const Stack = createStackNavigator();

// Temporary placeholder component - replace with actual screens
const PlaceholderScreen = () => (
  <View style={{ flex: 1, backgroundColor: colors.background }}>
    <Text style={{ color: colors.text }}>Ready for screens</Text>
  </View>
);

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
        {/* Replace PlaceholderScreen with actual screens as needed */}
        <Stack.Screen
          name="Placeholder"
          component={PlaceholderScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
