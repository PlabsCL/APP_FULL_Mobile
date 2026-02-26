import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { RootStackParamList } from './RutasDisponiblesScreen';
import { EstadoPedido, EvidenciasFormulario, PedidoConEstado } from '../types/pedido';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Pedido'>;
  route: RouteProp<RootStackParamList, 'Pedido'>;
}

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

// ─── Configuración de estados ─────────────────────────────────────────────────
const ESTADO_CONFIG: Record<EstadoPedido, { color: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  pendiente:      { color: '#6B7280', label: 'Pendiente',        icon: 'time-outline'             },
  no_entregado:   { color: '#EF4444', label: 'No Entregado',     icon: 'close-circle-outline'     },
  entrega_parcial:{ color: '#F59E0B', label: 'Entrega parcial',  icon: 'remove-circle-outline'    },
  entregado:      { color: '#10B981', label: 'Entregado',        icon: 'checkmark-circle-outline' },
  rechazado:      { color: '#EF4444', label: 'Rechazado',        icon: 'close-circle-outline'     },
  postergado:     { color: '#F59E0B', label: 'Postergado',       icon: 'calendar-outline'         },
};

// Botones visibles en la pantalla (orden de imagen)
const ESTADOS_BOTONES: EstadoPedido[] = ['no_entregado', 'entrega_parcial', 'entregado'];

// SubEstados por estado
const SUBESTADOS: Partial<Record<EstadoPedido, string[]>> = {
  entregado: ['Entrega Exitosa'],
  entrega_parcial: [
    'Cliente sin Visitar',
    'Contacto no disponible',
    'Full - Frecuencia',
    'Monto a Recaudar no Disponible',
    'No se Carga a Transporte',
    'Postergado a Peticion del Cliente',
    'Sector Peligroso Cambiar Dirección',
    'Sin Moradores',
  ],
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

// ─── Botón de estado ──────────────────────────────────────────────────────────
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
        textAlign: 'center',
      }}>
        {cfg.label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function PedidoScreen({ navigation, route }: Props) {
  const { pedido, formularioCompletado, estadoRetorno, subestadoRetorno, modoEdicion, evidenciasRetorno } = route.params;
  const detalle = DEFAULT_DETALLE;
  const insets = useSafeAreaInsets();

  const [tabActiva, setTabActiva] = useState<'gestion' | 'info'>('gestion');

  // Al volver del formulario, restaurar estado/subestado desde params.
  // En modoEdicion (Finalizados), el pedido ya trae el estado confirmado.
  const [estado, setEstado] = useState<EstadoPedido>(() => {
    if (formularioCompletado && estadoRetorno) return estadoRetorno;
    return pedido.estado;
  });
  const [subestado, setSubestado] = useState<string | null>(() => {
    if (formularioCompletado && subestadoRetorno !== undefined) return subestadoRetorno;
    // modoEdicion: usar subestado guardado en el pedido, o auto-seleccionar el primero
    if (modoEdicion) {
      if (pedido.subestado !== undefined) return pedido.subestado;
      const opciones = SUBESTADOS[pedido.estado] ?? [];
      return opciones.length > 0 ? opciones[0] : null;
    }
    return null;
  });
  const [evidencias, setEvidencias] = useState<EvidenciasFormulario | undefined>(() => {
    if (evidenciasRetorno) return evidenciasRetorno;
    if (modoEdicion) return pedido.evidencias;
    return undefined;
  });
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [busquedaSubestado, setBusquedaSubestado] = useState('');

  // Si el componente ya estaba montado y los params cambian (formulario completado),
  // sincronizar estado/subestado/evidencias desde los params (cubre el caso de no-remount).
  useEffect(() => {
    if (formularioCompletado && estadoRetorno) {
      setEstado(estadoRetorno);
      setSubestado(subestadoRetorno ?? null);
      if (evidenciasRetorno) setEvidencias(evidenciasRetorno);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formularioCompletado]);

  const pruebasCompletadas = evidencias !== undefined;

  const esEntregado      = estado === 'entregado';
  const esEntregaParcial = estado === 'entrega_parcial';
  // Color activo según estado — verde para entregado, amarillo para entrega_parcial
  const colorActivo = esEntregado ? '#10B981' : esEntregaParcial ? '#F59E0B' : null;
  const bgActivo    = esEntregado ? '#F0FDF4' : esEntregaParcial ? '#FFFBEB' : '#FFFFFF';
  const iconActivo: React.ComponentProps<typeof Ionicons>['name'] | null =
    (esEntregado || esEntregaParcial) ? 'checkmark-circle' : null;

  const subestadosDisponibles = SUBESTADOS[estado] ?? [];
  const tieneSubestados = subestadosDisponibles.length > 0;
  const subestadosFiltrados = busquedaSubestado.trim()
    ? subestadosDisponibles.filter(s => s.toLowerCase().includes(busquedaSubestado.toLowerCase()))
    : subestadosDisponibles;

  const estadoCompletado =
    estado !== 'pendiente' &&
    (tieneSubestados ? subestado !== null : true);

  const puedeConfirmar = estadoCompletado && pruebasCompletadas;

  const handleSetEstado = (nuevo: EstadoPedido) => {
    setEstado(nuevo);
    setSubestado(null);
    setDropdownAbierto(false);
    setBusquedaSubestado('');
  };

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

  const handleConfirmar = () => {
    if (modoEdicion) {
      // Pedido ya finalizado — guardar cambios en backend (integración pendiente)
      Alert.alert('Guardado', 'Los datos de entrega han sido actualizados.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      navigation.navigate('Entregas', {
        pedidoGestionado: { key: pedido.key, nuevoEstado: estado, subestado, evidencias },
      });
    }
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

            {/* ── Tarjeta Estado — se tiñe según estado activo ── */}
            <View style={{
              backgroundColor: bgActivo,
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
              borderWidth: colorActivo ? 1.5 : 0,
              borderColor: colorActivo ?? 'transparent',
            }}>
              {/* Título + ícono confirmación */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: colorActivo ?? '#6B7280', fontWeight: '700' }}>
                  Estado
                </Text>
                {iconActivo && (
                  <Ionicons name={iconActivo} size={24} color="#10B981" />
                )}
              </View>

              {/* Botones de estado */}
              <View style={{ flexDirection: 'row', marginHorizontal: -4 }}>
                {ESTADOS_BOTONES.map((e) => (
                  <EstadoBtn
                    key={e}
                    estado={e}
                    current={estado}
                    onPress={() => handleSetEstado(e)}
                  />
                ))}
              </View>

              {/* Subestado — solo si el estado tiene subestados */}
              {tieneSubestados && (
                <View style={{ marginTop: 16 }}>
                  <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600', marginBottom: 8 }}>
                    Subestado
                  </Text>

                  {/* Selector — desactivado una vez seleccionado */}
                  <TouchableOpacity
                    onPress={() => !subestado && setDropdownAbierto(!dropdownAbierto)}
                    disabled={subestado !== null}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: subestado ? colorActivo! : '#D1D5DB',
                      borderRadius: 8,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      backgroundColor: subestado ? bgActivo : '#FFFFFF',
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      color: subestado ? colorActivo! : '#9CA3AF',
                      fontWeight: subestado ? '600' : '400',
                    }}>
                      {subestado ?? 'Seleccionar Sub Estado'}
                    </Text>
                    {subestado
                      ? <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                      : <Ionicons name={dropdownAbierto ? 'chevron-up' : 'chevron-down'} size={20} color="#6B7280" />
                    }
                  </TouchableOpacity>

                  {/* Lista de opciones con buscador (visible cuando hay más de 3 subestados) */}
                  {dropdownAbierto && (
                    <View style={{
                      backgroundColor: '#FFFFFF',
                      borderWidth: 1,
                      borderColor: '#E5E7EB',
                      borderRadius: 8,
                      marginTop: 4,
                      overflow: 'hidden',
                    }}>
                      {subestadosDisponibles.length > 3 && (
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: '#F3F4F6',
                        }}>
                          <Ionicons name="search-outline" size={16} color="#9CA3AF" style={{ marginRight: 8 }} />
                          <TextInput
                            value={busquedaSubestado}
                            onChangeText={setBusquedaSubestado}
                            placeholder="Buscar subestado"
                            placeholderTextColor="#9CA3AF"
                            style={{ flex: 1, fontSize: 14, color: '#1F2937', paddingVertical: 2 }}
                          />
                        </View>
                      )}
                      {subestadosFiltrados.map((opcion) => (
                        <TouchableOpacity
                          key={opcion}
                          onPress={() => {
                            setSubestado(opcion);
                            setDropdownAbierto(false);
                            setBusquedaSubestado('');
                          }}
                          style={{
                            paddingHorizontal: 14,
                            paddingVertical: 14,
                            borderBottomWidth: 1,
                            borderBottomColor: '#F3F4F6',
                          }}
                        >
                          <Text style={{ fontSize: 14, color: '#1F2937' }}>{opcion}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Pruebas de entrega — activo solo cuando Estado está completo */}
            <TouchableOpacity
              onPress={() => estadoCompletado && navigation.navigate('FormularioEntrega', { estado, subestado, pedidoCodigo: pedido.codigo, pedido, evidenciasIniciales: evidencias })}
              disabled={!estadoCompletado}
              style={{
                backgroundColor: pruebasCompletadas ? bgActivo : '#FFFFFF',
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: pruebasCompletadas ? (colorActivo ?? '#10B981') : estadoCompletado ? colors.primary : '#E5E7EB',
                marginTop: 16,
                opacity: estadoCompletado ? 1 : 0.4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name="camera-outline"
                  size={20}
                  color={pruebasCompletadas ? (colorActivo ?? '#10B981') : estadoCompletado ? colors.primary : '#9CA3AF'}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ fontSize: 14, fontWeight: '700', color: pruebasCompletadas ? (colorActivo ?? '#10B981') : estadoCompletado ? colors.primary : '#9CA3AF' }}>
                  Pruebas de entrega
                </Text>
              </View>
              {pruebasCompletadas
                ? <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                : <Ionicons name="chevron-forward" size={20} color={estadoCompletado ? colors.primary : '#9CA3AF'} />
              }
            </TouchableOpacity>

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
                alignItems: 'flex-start',
                paddingHorizontal: 16,
                paddingVertical: 14,
              }}>
                <View style={{ alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 12, color: '#6B7280' }}>
                    {detalle.diaSemanaDesde} {detalle.fechaDesde}
                  </Text>
                  <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1F2937' }}>
                    {detalle.horaDesde}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Entrega</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#9CA3AF" style={{ marginHorizontal: 16, marginTop: 20 }} />
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

            {/* Dirección */}
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

      {/* ── Footer: Confirmar Gestión ────────────────────────────────────────── */}
      {tabActiva === 'gestion' && (
        <View style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: insets.bottom || 12,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        }}>
          <TouchableOpacity
            onPress={handleConfirmar}
            disabled={!puedeConfirmar}
            style={{
              backgroundColor: puedeConfirmar ? (colorActivo ?? '#10B981') : '#D1D5DB',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              minHeight: 52,
              justifyContent: 'center',
            }}
          >
            <Text style={{
              fontSize: 17,
              fontWeight: '600',
              color: '#FFFFFF',
            }}>
              {modoEdicion ? 'Guardar cambios' : 'Confirmar gestión'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  );
}
