import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../constants/colors';
import { Ruta } from '../types/routes';
import api from '../services/api';

// ─── Tipos de navegación ──────────────────────────────────────────────────────
export type RootStackParamList = {
  Home: undefined;
  RutasDisponibles: undefined;
  DetalleRuta: { ruta: Ruta };
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
];

// ─── Componente ───────────────────────────────────────────────────────────────
export default function RutasDisponiblesScreen({ navigation }: Props) {
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
      // sin conexión real aún — no mostrar error
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }} edges={['top']}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: colors.orange,
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
          <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>

        <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>
          Rutas disponibles
        </Text>

        <TouchableOpacity
          onPress={actualizarDatos}
          style={{ minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'flex-end' }}
        >
          {loading
            ? <ActivityIndicator color="#FFF" size="small" />
            : <Text style={{ color: '#FFF', fontSize: 22 }}>↻</Text>
          }
        </TouchableOpacity>
      </View>

      {/* ── Selector de fecha ───────────────────────────────────────────────── */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
      }}>
        <TouchableOpacity
          onPress={() => setSelectedDate(prev => addDays(prev, -1))}
          style={{ padding: 12, minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#374151' }}>{'<'}</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
          {labelFecha}
        </Text>

        <TouchableOpacity
          onPress={() => setSelectedDate(prev => addDays(prev, 1))}
          style={{ padding: 12, minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#374151' }}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Lista de rutas ──────────────────────────────────────────────────── */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        {rutas.length === 0 ? (
          <View style={{ marginTop: 60, alignItems: 'center' }}>
            <Text style={{ color: '#9CA3AF', fontSize: 16 }}>
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
                  backgroundColor: seleccionada ? '#FEF3C7' : '#FFFFFF',
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: seleccionada ? 1.5 : 1,
                  borderColor: seleccionada ? '#F59E0B' : '#E5E7EB',
                }}
              >
                {/* Fila superior: dot + ID + codigo */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: colors.orange,
                      marginRight: 10,
                    }} />
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937' }}>
                      {ruta.id}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.orange }}>
                    {ruta.codigo}
                  </Text>
                </View>

                {/* Fila inferior: hora + fecha */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: '#6B7280' }}>
                    Hora de inicio({ruta.horaInicio})
                  </Text>
                  <Text style={{ fontSize: 13, color: '#6B7280' }}>
                    📅 {ruta.fecha}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ── Botón Siguiente ─────────────────────────────────────────────────── */}
      <View style={{ backgroundColor: '#111827', paddingVertical: 4 }}>
        <TouchableOpacity
          disabled={!selectedRuta}
          onPress={() => {
            if (selectedRuta) {
              // navigation.navigate('DetalleRuta', { ruta: selectedRuta });
            }
          }}
          style={{
            minHeight: 52,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: selectedRuta ? 1 : 0.4,
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '600' }}>
            Siguiente
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}
