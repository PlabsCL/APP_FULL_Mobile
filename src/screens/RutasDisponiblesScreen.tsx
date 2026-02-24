import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../constants/colors';
import { Ruta } from '../types/routes';
import api from '../services/api';
import { Ionicons } from '@expo/vector-icons';

// ─── Tipos de navegación ──────────────────────────────────────────────────────
export type RootStackParamList = {
  Home: undefined;
  RutasDisponibles: undefined;
  Vehiculos: { ruta: Ruta };
  Ruta: { ruta: Ruta };
  Confirmar: { ruta: Ruta; totalGuias: number };
  Configuracion: undefined;
  Entregas: { ruta: Ruta; totalGuias: number };
};

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'RutasDisponibles'>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const MOCK_RUTAS: Ruta[] = [
  {
    id: '42760197',
    codigo: 'ORTE-01',
    nombre: 'ORTE-01',
    destino: 'Santiago',
    cantidadParadas: 10,
    horaInicio: '09:00-AM',
    fecha: formatDate(new Date()),
  },
  {
    id: '42760198',
    codigo: 'ORTE-01',
    nombre: 'ORTE-01',
    destino: 'Maipú',
    cantidadParadas: 8,
    horaInicio: '11:00-AM',
    fecha: formatDate(new Date()),
  },
];

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function RutasDisponiblesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rutas, setRutas] = useState<Ruta[]>(MOCK_RUTAS);
  const [selectedRuta, setSelectedRuta] = useState<Ruta | null>(MOCK_RUTAS[0]);
  const [loading, setLoading] = useState(false);

  const hoy = formatDate(new Date());
  const fechaActual = formatDate(selectedDate);
  const esHoy = fechaActual === hoy;
  const labelFecha = esHoy
    ? `Ordenes de hoy - ${fechaActual}`
    : `Ordenes del día - ${fechaActual}`;

  const actualizarDatos = async () => {
    setLoading(true);
    try {
      const res = await api.get<Ruta[]>(`/rutas/disponibles?fecha=${fechaActual}`);
      setRutas(res.data);
      setSelectedRuta(res.data[0] ?? null);
    } catch {
      // sin conexión real aún
    } finally {
      setLoading(false);
    }
  };

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
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>
          Rutas disponibles
        </Text>

        <TouchableOpacity
          onPress={actualizarDatos}
          style={{ minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'flex-end' }}
        >
          {loading
            ? <ActivityIndicator color={colors.text} size="small" />
            : <Ionicons name="refresh" size={22} color={colors.text} />
          }
        </TouchableOpacity>
      </View>

      {/* ── Selector de fecha ───────────────────────────────────────────────── */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <TouchableOpacity
          onPress={() => setSelectedDate(prev => addDays(prev, -1))}
          style={{ padding: 12, minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
        </TouchableOpacity>

        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>
          {labelFecha}
        </Text>

        <TouchableOpacity
          onPress={() => setSelectedDate(prev => addDays(prev, 1))}
          style={{ padding: 12, minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Lista de rutas ──────────────────────────────────────────────────── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {rutas.length === 0 ? (
          <View style={{ marginTop: 60, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
              No hay rutas para este día
            </Text>
          </View>
        ) : (
          rutas.map((ruta) => {
            const seleccionada = selectedRuta?.id === ruta.id;
            return (
              <TouchableOpacity
                key={ruta.id}
                onPress={() => setSelectedRuta(ruta)}
                style={{
                  backgroundColor: seleccionada ? colors.primary : colors.surface,
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: seleccionada ? colors.primary : colors.border,
                  opacity: seleccionada ? 0.95 : 1,
                }}
              >
                {/* Fila superior: checkbox + ID + codigo */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Checkbox */}
                    <View style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: seleccionada ? colors.text : colors.textSecondary,
                      backgroundColor: seleccionada ? colors.text : 'transparent',
                      marginRight: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      {seleccionada && (
                        <Ionicons name="checkmark" size={14} color={colors.primary} />
                      )}
                    </View>
                    <Text style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: colors.text,
                    }}>
                      {ruta.id}
                    </Text>
                  </View>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: seleccionada ? colors.warning : colors.primary
                  }}>
                    {ruta.codigo}
                  </Text>
                </View>

                {/* Fila inferior: hora + fecha */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    Hora de inicio({ruta.horaInicio})
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />{' '}{ruta.fecha}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ── Botón Siguiente ─────────────────────────────────────────────────── */}
      <View style={{ backgroundColor: colors.background, paddingTop: 4, paddingBottom: insets.bottom || 12 }}>
        <TouchableOpacity
          disabled={!selectedRuta}
          onPress={() => {
            if (selectedRuta) {
              navigation.navigate('Vehiculos', { ruta: selectedRuta });
            }
          }}
          style={{
            minHeight: 52,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: selectedRuta ? 1 : 0.4,
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
