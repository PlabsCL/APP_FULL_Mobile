import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
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
  navigation: StackNavigationProp<RootStackParamList, 'BulkGestion'>;
  route: RouteProp<RootStackParamList, 'BulkGestion'>;
}

// ─── Configuración de estados ─────────────────────────────────────────────────
const ESTADO_CONFIG: Record<EstadoPedido, { color: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  pendiente:       { color: '#6B7280', label: 'Pendiente',        icon: 'time-outline'             },
  no_entregado:    { color: '#EF4444', label: 'No Entregado',     icon: 'close-circle-outline'     },
  entrega_parcial: { color: '#F59E0B', label: 'Entrega parcial',  icon: 'remove-circle-outline'    },
  entregado:       { color: '#10B981', label: 'Entregado',        icon: 'checkmark-circle-outline' },
  rechazado:       { color: '#EF4444', label: 'Rechazado',        icon: 'close-circle-outline'     },
  postergado:      { color: '#F59E0B', label: 'Postergado',       icon: 'calendar-outline'         },
};

const ESTADOS_BOTONES: EstadoPedido[] = ['no_entregado', 'entrega_parcial', 'entregado'];

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
  no_entregado: [
    'Cambia Direccion de Entrega',
    'Cliente Comprara en Sucursal',
    'Cliente no de Acuerdo con el Monto Facturado',
    'Cliente se Arrepiente de Compra',
    'Contacto no Conocido en Destino',
    'Desiste por Retraso en la Entrega',
    'Dirección Errónea',
    'Direccion Fuera Cobertura Entrega',
    'Direccion no Encontrada',
    'Fraude',
    'Negocio se Encuentra Duplicado',
    'No Acepta Modalidad Pago Contraentrega',
    'Prefiere Otra Compañía',
    'Producto Dañado',
    'Producto Extraviado',
    'Productos no Corresponden a Solicitados',
    'RC - Cliente se arrepiente de compra',
    'RC - Demora en la entrega',
    'RC - Diferencias en Monto de pago',
    'RC - No Cumplimiento Protocolos de Entrega',
    'RC - Oferta no corresponde a lo solicitado',
    'RC - Producto no solicitado',
    'RT - Cliente no encontrado - inubicable',
    'RT - Dirección errónea',
    'RT - Fuera Cobertura Transporte',
    'RT - Otra Región - Comuna',
    'RT - Pedido incompleto',
    'RT - Producto extraviado',
    'RT - Rechazo por Deuda Portabilidad',
    'RT - Sin Código Autenticación',
    'RT - Sin Documentos o Vencidos',
    'RT - Solicitado por Seguridad',
    'Sector Peligroso Cambiar Direccion',
    'Sin Morador',
  ],
};

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
export default function BulkGestionScreen({ navigation, route }: Props) {
  const { pedidos, formularioCompletado, estadoRetorno, subestadoRetorno, evidenciasRetorno } = route.params;
  const insets = useSafeAreaInsets();

  const [estado, setEstado] = useState<EstadoPedido>(() => {
    if (formularioCompletado && estadoRetorno) return estadoRetorno;
    return 'pendiente';
  });
  const [subestado, setSubestado] = useState<string | null>(() => {
    if (formularioCompletado && subestadoRetorno !== undefined) return subestadoRetorno;
    return null;
  });
  const [evidencias, setEvidencias] = useState<EvidenciasFormulario | undefined>(() => {
    return evidenciasRetorno;
  });
  const [dropdownAbierto, setDropdownAbierto] = useState(false);

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
  const esNoEntregado    = estado === 'no_entregado';
  const colorActivo = esEntregado ? '#10B981' : esEntregaParcial ? '#F59E0B' : esNoEntregado ? '#EF4444' : null;
  const bgActivo    = esEntregado ? '#F0FDF4' : esEntregaParcial ? '#FFFBEB' : esNoEntregado ? '#FEF2F2' : '#FFFFFF';
  const iconActivo: React.ComponentProps<typeof Ionicons>['name'] | null =
    (esEntregado || esEntregaParcial || esNoEntregado) ? 'checkmark-circle' : null;

  const subestadosDisponibles = SUBESTADOS[estado] ?? [];
  const tieneSubestados = subestadosDisponibles.length > 0;

  const estadoCompletado =
    estado !== 'pendiente' &&
    (tieneSubestados ? subestado !== null : true);

  const puedeConfirmar = estadoCompletado && pruebasCompletadas;

  const handleSetEstado = (nuevo: EstadoPedido) => {
    setEstado(nuevo);
    setSubestado(null);
    setDropdownAbierto(false);
  };

  const handleConfirmar = () => {
    navigation.navigate('Entregas', {
      pedidosBulkGestionados: {
        keys: pedidos.map(p => p.key),
        nuevoEstado: estado,
        subestado,
        evidencias,
      },
    });
  };

  const n = pedidos.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }} edges={['top']}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingTop: 6,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ marginLeft: 4 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
            Gestión masiva
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>
            {n} pedido{n !== 1 ? 's' : ''} seleccionado{n !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* ── Contenido ───────────────────────────────────────────────────────── */}
      <ScrollView style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
        <View style={{ padding: 16 }}>

          {/* Lista de pedidos seleccionados */}
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 13, color: '#6B7280', fontWeight: '600', marginBottom: 8 }}>
              Pedidos seleccionados
            </Text>
            {pedidos.map((p, i) => (
              <View key={p.key} style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 7,
                borderTopWidth: i > 0 ? 1 : 0,
                borderTopColor: '#F3F4F6',
              }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.warning, width: 60 }}>
                  {p.codigo}
                </Text>
                <Text style={{ fontSize: 12, color: '#374151', flex: 1 }} numberOfLines={1}>
                  {p.cliente}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Tarjeta Estado ── */}
          <View style={{
            backgroundColor: bgActivo,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            borderWidth: colorActivo ? 1.5 : 0,
            borderColor: colorActivo ?? 'transparent',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: colorActivo ?? '#6B7280', fontWeight: '700' }}>
                Estado
              </Text>
              {iconActivo && (
                <Ionicons name={iconActivo} size={24} color="#10B981" />
              )}
            </View>

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

            {tieneSubestados && (
              <View style={{ marginTop: 16 }}>
                <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600', marginBottom: 8 }}>
                  Subestado
                </Text>
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

                {dropdownAbierto && (
                  <View style={{
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    borderRadius: 8,
                    marginTop: 4,
                    overflow: 'hidden',
                  }}>
                    {subestadosDisponibles.map((opcion) => (
                      <TouchableOpacity
                        key={opcion}
                        onPress={() => {
                          setSubestado(opcion);
                          setDropdownAbierto(false);
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

          {/* ── Pruebas de entrega ── */}
          <TouchableOpacity
            onPress={() => estadoCompletado && navigation.navigate('FormularioEntrega', {
              estado,
              subestado,
              pedidoCodigo: `${n} pedidos`,
              returnScreen: 'BulkGestion',
              bulkPedidos: pedidos,
              evidenciasIniciales: evidencias,
            })}
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
      </ScrollView>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
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
          <Text style={{ fontSize: 17, fontWeight: '600', color: '#FFFFFF' }}>
            Confirmar {n} pedido{n !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}
