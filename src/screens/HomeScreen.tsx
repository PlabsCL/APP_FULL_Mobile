import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../constants/colors';
import { RootStackParamList } from './RutasDisponiblesScreen';

const driverName = 'Pablo Lara';

interface HomeScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {/* Header with hamburger */}
      <View style={{ alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 4 }}>
        <TouchableOpacity
          style={{ padding: 8 }}
          onPress={() => {}}
        >
          <View style={{ width: 24, height: 2, backgroundColor: colors.text, marginBottom: 5 }} />
          <View style={{ width: 24, height: 2, backgroundColor: colors.text, marginBottom: 5 }} />
          <View style={{ width: 24, height: 2, backgroundColor: colors.text }} />
        </TouchableOpacity>
      </View>

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingBottom: 48,
        }}
      >
        {/* Logo Circle */}
        <View
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            borderWidth: 4,
            borderColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 32,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: colors.primary,
            }}
          >
            FA
          </Text>
        </View>

        {/* App Title */}
        <Text
          style={{
            fontSize: 32,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          FULL APP
        </Text>

        {/* Driver Name */}
        <Text
          style={{
            fontSize: 16,
            color: colors.textSecondary,
            marginBottom: 48,
            textAlign: 'center',
          }}
        >
          {driverName}
        </Text>

        {/* Routes Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('RutasDisponibles')}
          style={{
            width: '100%',
            minHeight: 56,
            backgroundColor: colors.primary,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: colors.text,
            }}
          >
            Rutas Disponibles
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer Brand */}
      <View style={{ alignItems: 'center', paddingBottom: 8 }}>
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            fontWeight: '600',
          }}
        >
          FULL APP
        </Text>
      </View>
    </SafeAreaView>
  );
}
