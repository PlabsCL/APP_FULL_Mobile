import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { RootStackParamList } from './RutasDisponiblesScreen';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Confirmar'>;
  route: RouteProp<RootStackParamList, 'Confirmar'>;
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function ConfirmarScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { ruta, totalGuias, escaneados, ordenPedidos, pedidosOrdenados } = route.params;
  const noEscaneados = totalGuias - escaneados;

  const horaActual = new Date().toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const filas: { label: string; valor: string; color?: string }[] = [
    { label: 'Fecha de Ruta',               valor: ruta.fecha },
    { label: 'Vehículo',                     valor: ruta.codigo },
    { label: 'Guías totales',                valor: String(totalGuias) },
    { label: 'Guías escaneadas',             valor: String(escaneados), color: '#10B981' },
    { label: 'Guías no escaneadas',          valor: String(noEscaneados), color: noEscaneados > 0 ? '#F59E0B' : '#10B981' },
    { label: 'Guías no georreferenciadas',   valor: '0' },
    { label: 'Hora de Inicio',               valor: horaActual },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }} edges={['top']}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
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
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>
          Confirmar
        </Text>

        <View style={{ minWidth: 48 }} />
      </View>

      {/* ── Contenido ───────────────────────────────────────────────────────── */}
      <View style={{ flex: 1, paddingHorizontal: 24 }}>

        {/* Checkmark */}
        <View style={{ alignItems: 'center', paddingVertical: 36 }}>
          <View style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            backgroundColor: colors.success,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Ionicons name="checkmark" size={52} color="#FFFFFF" />
          </View>
        </View>

        {/* Separador */}
        <View style={{ height: 1, backgroundColor: '#E5E7EB' }} />

        {/* Filas de datos */}
        {filas.map((fila, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 15,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            }}
          >
            <Text style={{ fontSize: 14, color: '#374151', flex: 1, marginRight: 12 }}>
              {fila.label}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: fila.color || '#1F2937' }}>
              {fila.valor}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: colors.background,
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: insets.bottom || 12,
      }}>
        {/* Botón principal */}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Entregas', { ruta, totalGuias, ordenPedidos, pedidosOrdenados });
          }}
          style={{
            backgroundColor: colors.warning,
            borderRadius: 10,
            minHeight: 52,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <Text style={{ color: '#1F2937', fontSize: 15, fontWeight: 'bold', letterSpacing: 0.5 }}>
            CONFIRMAR E INICIAR RUTA
          </Text>
        </TouchableOpacity>

        {/* Anterior */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: colors.primary, fontSize: 17, fontWeight: '600' }}>
            Anterior
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}
