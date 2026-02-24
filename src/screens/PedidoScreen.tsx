import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { RootStackParamList } from './RutasDisponiblesScreen';
import { EstadoPedido, PedidoConEstado } from '../types/pedido';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Pedido'>;
  route: RouteProp<RootStackParamList, 'Pedido'>;
}

// ─── Detalle adicional mock (datos tipo Excel) ────────────────────────────────
interface PedidoDetalle {
  telefono: string;
  fechaDesde: string;
  horaDesde: string;
  diaSemanaDesde: string;
  fechaHasta: string;
  horaHasta: string;
  diaSemanaHasta: string;
  comuna: string;
  tipoNegocio: string;
  valor: number;
  numeroNegocio: string;
  rut: string;
  clientes: string;
  canal: string;
  prioridadFecha: string;
  canalLikewise: string;
}

const DEFAULT_DETALLE: PedidoDetalle = {
  telefono: '+56912345678',
  fechaDesde: '11',
  horaDesde: '08:00',
  diaSemanaDesde: 'mié',
  fechaHasta: '12',
  horaHasta: '21:00',
  diaSemanaHasta: 'jue',
  comuna: 'PUENTE ALTO',
  tipoNegocio: 'PRO',
  valor: 34480,
  numeroNegocio: 'T1116',
  rut: '12345678-5',
  clientes: 'APPFULL',
  canal: 'PersonasCC (S078)',
  prioridadFecha: '2025-10-15',
  canalLikewise: 'TDE',
};

// ─── Colores por estado ───────────────────────────────────────────────────────
const ESTADO_CONFIG: Record<EstadoPedido, { color: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  pendiente:  { color: '#6B7280', label: 'Pendiente',  icon: 'time-outline'        },
  entregado:  { color: '#10B981', label: 'Entregado',  icon: 'checkmark-circle-outline' },
  rechazado:  { color: '#EF4444', label: 'Rechazado',  icon: 'close-circle-outline' },
  postergado: { color: '#F59E0B', label: 'Postergado', icon: 'calendar-outline'    },
};

// ─── Fila de dato ─────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <View style={{ paddingVertical: 14, paddingHorizontal: 16 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#1F2937' }}>
          {label}: <Text style={{ fontWeight: '400', color: '#374151' }}>{value}</Text>
        </Text>
      </View>
      <View style={{ height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 16 }} />
    </View>
  );
}

// ─── Botón de acción de estado ────────────────────────────────────────────────
function EstadoBtn({ estado, current, onPress }: {
  estado: EstadoPedido;
  current: EstadoPedido;
  onPress: () => void;
}) {
  const cfg = ESTADO_CONFIG[estado];
  const isActive = estado === current;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: isActive ? cfg.color + '18' : '#F9FAFB',
        borderWidth: 1.5,
        borderColor: isActive ? cfg.color : '#E5E7EB',
        marginHorizontal: 4,
      }}
    >
      <Ionicons name={cfg.icon} size={24} color={isActive ? cfg.color : '#9CA3AF'} />
      <Text style={{
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
        color: isActive ? cfg.color : '#9CA3AF',
      }}>
        {cfg.label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function PedidoScreen({ navigation, route }: Props) {
  const { pedido } = route.params;
  const detalle = DEFAULT_DETALLE;

  const [tabActiva, setTabActiva] = useState<'gestion' | 'info'>('info');
  const [estado, setEstado] = useState<EstadoPedido>(pedido.estado);

  const handleLlamar = () => {
    Linking.openURL(`tel:${detalle.telefono}`).catch(() =>
      Alert.alert('Error', 'No se pudo abrir la aplicación de llamadas.')
    );
  };

  const handleVoyLlegando = () => {
    Alert.alert('Voy llegando', 'Se enviará una notificación al destinatario. (Funcionalidad pendiente de integración con servidor)');
  };

  const handleMapa = () => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(pedido.direccion)}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'No se pudo abrir el mapa.')
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }} edges={['top']}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingTop: 6,
        paddingBottom: 0,
      }}>
        {/* Fila: back + título */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginLeft: 4 }}>
            {pedido.codigo}
          </Text>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row' }}>
          {(['gestion', 'info'] as const).map((tab) => {
            const label = tab === 'gestion' ? 'GESTIÓN' : 'INFORMACIÓN';
            const isActive = tabActiva === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setTabActiva(tab)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  borderBottomWidth: 3,
                  borderBottomColor: isActive ? '#FFFFFF' : 'transparent',
                }}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: '700',
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                  letterSpacing: 0.5,
                }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Contenido ───────────────────────────────────────────────────────── */}
      <ScrollView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>

        {/* ══ GESTIÓN ══════════════════════════════════════════════════════════ */}
        {tabActiva === 'gestion' && (
          <View style={{ padding: 16 }}>

            {/* Estado actual */}
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 12 }}>
                ESTADO ACTUAL
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{
                  width: 12, height: 12, borderRadius: 6,
                  backgroundColor: ESTADO_CONFIG[estado].color,
                  marginRight: 8,
                }} />
                <Text style={{ fontSize: 16, fontWeight: '700', color: ESTADO_CONFIG[estado].color }}>
                  {ESTADO_CONFIG[estado].label}
                </Text>
              </View>
            </View>

            {/* Botones de cambio de estado */}
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 12 }}>
                CAMBIAR ESTADO
              </Text>
              <View style={{ flexDirection: 'row', marginHorizontal: -4 }}>
                <EstadoBtn estado="entregado"  current={estado} onPress={() => setEstado('entregado')}  />
                <EstadoBtn estado="rechazado"  current={estado} onPress={() => setEstado('rechazado')}  />
                <EstadoBtn estado="postergado" current={estado} onPress={() => setEstado('postergado')} />
              </View>
            </View>

            {/* Observaciones */}
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 16,
            }}>
              <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 8 }}>
                OBSERVACIONES
              </Text>
              <Text style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>
                Sin observaciones registradas.
              </Text>
            </View>
          </View>
        )}

        {/* ══ INFORMACIÓN ══════════════════════════════════════════════════════ */}
        {tabActiva === 'info' && (
          <View style={{ padding: 16 }}>

            {/* Hora de compromiso */}
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              marginBottom: 12,
              overflow: 'hidden',
            }}>
              <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 }}>
                <Text style={{ fontSize: 13, color: '#6B7280' }}>Hora de compromiso</Text>
              </View>
              <View style={{ height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 16 }} />
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}>
                {/* Desde */}
                <View style={{ alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>
                    {detalle.diaSemanaDesde} {detalle.fechaDesde}
                  </Text>
                  <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1F2937' }}>
                    {detalle.horaDesde}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Entrega</Text>
                </View>

                <Ionicons name="arrow-forward" size={18} color="#9CA3AF" style={{ marginHorizontal: 16 }} />

                {/* Hasta */}
                <View style={{ alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>
                    {detalle.diaSemanaHasta} {detalle.fechaHasta}
                  </Text>
                  <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1F2937' }}>
                    {detalle.horaHasta}
                  </Text>
                </View>
              </View>
            </View>

            {/* Destinatario */}
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              marginBottom: 12,
              overflow: 'hidden',
            }}>
              <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 }}>
                <Text style={{ fontSize: 13, color: '#6B7280' }}>Destinatario</Text>
              </View>
              <View style={{ height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 16 }} />
              <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 14 }}>
                  {pedido.cliente}
                </Text>
                {/* Acciones */}
                <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                  <TouchableOpacity
                    onPress={handleLlamar}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 12,
                      borderRightWidth: 1,
                      borderRightColor: '#E5E7EB',
                    }}
                  >
                    <Ionicons name="call-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '500' }}>Llamar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleVoyLlegando}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 12,
                    }}
                  >
                    <Ionicons name="navigate-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '500' }}>Voy llegando</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Dirección de entrega */}
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              marginBottom: 12,
              overflow: 'hidden',
            }}>
              <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4 }}>
                <Text style={{ fontSize: 13, color: '#6B7280' }}>Dirección de entrega</Text>
              </View>
              <View style={{ height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 16 }} />
              <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 12 }}>
                  {pedido.direccion}
                </Text>
                <TouchableOpacity
                  onPress={handleMapa}
                  style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="map-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '500' }}>Mapa</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Información adicional */}
            <View style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              marginBottom: 16,
              overflow: 'hidden',
            }}>
              <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
                <Text style={{ fontSize: 13, color: '#6B7280' }}>Información adicional</Text>
              </View>
              <View style={{ height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 16 }} />
              <InfoRow label="COMUNA"          value={detalle.comuna} />
              <InfoRow label="TIPO DE NEGOCIO" value={detalle.tipoNegocio} />
              <InfoRow label="VALOR"           value={`${detalle.valor.toLocaleString('es-CL')}`} />
              <InfoRow label="NUMERO NEGOCIO"  value={detalle.numeroNegocio} />
              <InfoRow label="RUT"             value={detalle.rut} />
              <InfoRow label="CLIENTES"        value={detalle.clientes} />
              <InfoRow label="CANAL"           value={detalle.canal} />
              <InfoRow label="NUMERO GUIA"     value={pedido.codigo} />
              <InfoRow label="PRIORIDAD FECHA" value={detalle.prioridadFecha} />
              <InfoRow label="CANAL LIKEWISE"  value={detalle.canalLikewise} />
            </View>

          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}
