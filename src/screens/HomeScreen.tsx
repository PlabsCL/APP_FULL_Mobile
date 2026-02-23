import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../services/api';
import { colors } from '../constants/colors';
import { Ruta } from '../types/routes';

const driverName = 'Pablo Lara';

interface HomeScreenProps {}

export default function HomeScreen({}: HomeScreenProps) {
  const [loading, setLoading] = useState(false);

  const verificarRutas = async () => {
    setLoading(true);
    try {
      const res = await api.get<Ruta[]>('/rutas/disponibles');
      if (res.data && res.data.length === 0) {
        Alert.alert(
          'Sin rutas',
          'No hay rutas disponibles en este momento.'
        );
      }
      // Si hay rutas: sin acción por ahora
    } catch {
      Alert.alert(
        'Error',
        'No se pudo verificar las rutas. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
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
          onPress={verificarRutas}
          disabled={loading}
          style={{
            width: '100%',
            minHeight: 56,
            backgroundColor: colors.primary,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: loading ? 0.8 : 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} size="large" />
          ) : (
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: colors.text,
              }}
            >
              Rutas Disponibles
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer Brand */}
      <View style={{ alignItems: 'center', paddingBottom: 16 }}>
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            fontWeight: '600',
          }}
        >
          DispatchTrack
        </Text>
      </View>
    </SafeAreaView>
  );
}
