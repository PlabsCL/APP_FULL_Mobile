import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { RootStackParamList } from './RutasDisponiblesScreen';

const DRIVER_NAME = 'Pablo Lara';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Vehiculos'>;
  route: RouteProp<RootStackParamList, 'Vehiculos'>;
}

export default function VehiculosScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { ruta } = route.params;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ minWidth: 48, minHeight: 48, justifyContent: 'center' }}
        >
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>

        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>
          Vehículos
        </Text>

        {/* Espaciador para centrar el título */}
        <View style={{ minWidth: 48 }} />
      </View>

      {/* ── Contenido ──────────────────────────────────────────────────────── */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>

        {/* Avatar */}
        <View style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          backgroundColor: colors.surface,
          borderWidth: 2,
          borderColor: colors.border,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <Text style={{ fontSize: 48, color: colors.textSecondary }}>👤</Text>
        </View>

        {/* Nombre del conductor */}
        <Text style={{
          fontSize: 22,
          fontWeight: 'bold',
          color: colors.text,
          marginBottom: 32,
        }}>
          {DRIVER_NAME}
        </Text>

        {/* Separador */}
        <View style={{ width: '100%', height: 1, backgroundColor: colors.border, marginBottom: 32 }} />

        {/* Label vehículo */}
        <Text style={{
          fontSize: 14,
          color: colors.textSecondary,
          marginBottom: 16,
        }}>
          Tu vehículo asignado es
        </Text>

        {/* Código de vehículo */}
        <View style={{
          borderWidth: 2,
          borderColor: colors.warning,
          borderRadius: 8,
          paddingHorizontal: 32,
          paddingVertical: 12,
        }}>
          <Text style={{
            fontSize: 22,
            fontWeight: 'bold',
            color: colors.warning,
            letterSpacing: 1,
          }}>
            {ruta.codigo}
          </Text>
        </View>

      </View>

      {/* ── Footer: Anterior + Siguiente ────────────────────────────────────── */}
      <View style={{
        backgroundColor: colors.background,
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: insets.bottom || 12,
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flex: 1,
            minHeight: 52,
            justifyContent: 'center',
            alignItems: 'center',
            borderRightWidth: 1,
            borderRightColor: colors.border,
          }}
        >
          <Text style={{ color: colors.primary, fontSize: 17, fontWeight: '600' }}>
            Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Ruta', { ruta })}
          style={{
            flex: 1,
            minHeight: 52,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.primary, fontSize: 17, fontWeight: '600' }}>
            Siguiente
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}
