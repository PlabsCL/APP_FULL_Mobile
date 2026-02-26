import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { RootStackParamList } from './RutasDisponiblesScreen';
import { EstadoPedido, EvidenciasFormulario } from '../types/pedido';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'BulkEntrega'>;
  route: RouteProp<RootStackParamList, 'BulkEntrega'>;
}

// ─── Configuración de estados (igual que PedidoScreen) ────────────────────────
const ESTADO_CONFIG: Record<string, { color: string; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  no_entregado:    { color: '#EF4444', label: 'No Entregado',    icon: 'close-circle-outline'     },
  entrega_parcial: { color: '#F59E0B', label: 'Entrega Parcial', icon: 'remove-circle-outline'    },
  entregado:       { color: '#10B981', label: 'Entregado',       icon: 'checkmark-circle-outline' },
};

const ESTADOS_BOTONES: EstadoPedido[] = ['no_entregado', 'entrega_parcial', 'entregado'];

// SubEstados (idéntico a PedidoScreen)
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

// ─── Botón de estado (igual que PedidoScreen) ─────────────────────────────────
function EstadoBtn({ estadoKey, current, onPress }: {
  estadoKey: EstadoPedido;
  current: EstadoPedido | null;
  onPress: () => void;
}) {
  const cfg = ESTADO_CONFIG[estadoKey];
  const isActive = estadoKey === current;
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
export default function BulkEntregaScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { pedidos, formularioCompletado, estadoRetorno, subestadoRetorno, evidenciasRetorno } = route.params;

  // Inicializar desde params al igual que PedidoScreen con estadoRetorno/subestadoRetorno
  const [estado, setEstado] = useState<EstadoPedido | null>(() => {
    if (formularioCompletado && estadoRetorno) return estadoRetorno;
    return null;
  });
  const [subestado, setSubestado] = useState<string | null>(() => {
    if (formularioCompletado && subestadoRetorno !== undefined) return subestadoRetorno;
    return null;
  });
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [evidencias, setEvidencias] = useState<EvidenciasFormulario | undefined>(() => {
    if (evidenciasRetorno) return evidenciasRetorno;
    return undefined;
  });

  // Cubrir el caso en que el componente ya estaba montado (no remount) y los params cambian
  useEffect(() => {
    if (formularioCompletado) {
      if (estadoRetorno) setEstado(estadoRetorno);
      if (subestadoRetorno !== undefined) setSubestado(subestadoRetorno);
      if (evidenciasRetorno) setEvidencias(evidenciasRetorno);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formularioCompletado]);

  const handleSetEstado = (nuevo: EstadoPedido) => {
    if (nuevo !== estado) setEvidencias(undefined);
    setEstado(nuevo);
    setSubestado(null);
    setDropdownAbierto(false);
  };

  const subestadosDisponibles = estado ? (SUBESTADOS[estado] ?? []) : [];
  const tieneSubestados = subestadosDisponibles.length > 0;

  const estadoCompletado =
    estado !== null &&
    (tieneSubestados ? subestado !== null : true);

  const pruebasCompletadas = evidencias !== undefined;
  const puedeConfirmar = estadoCompletado && pruebasCompletadas;

  // Colores dinámicos igual que PedidoScreen
  const colorActivo = estado ? ESTADO_CONFIG[estado]?.color ?? null : null;
  const bgActivo = estado === 'entregado' ? '#F0FDF4'
    : estado === 'entrega_parcial' ? '#FFFBEB'
    : estado === 'no_entregado'    ? '#FEF2F2'
    : '#FFFFFF';

  const handleConfirmar = () => {
    if (!puedeConfirmar || !estado) return;
    const pedidosGestionadosBulk = pedidos.map(p => ({
      key: p.key,
      nuevoEstado: estado,
      subestado,
      evidencias,
    }));
    (navigation as any).popTo('Entregas', { pedidosGestionadosBulk });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F3F4F6' }} edges={['top']}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ minWidth: 48, minHeight: 48, justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginLeft: 4, flex: 1 }}>
          Gestión en lote
        </Text>
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: 12,
          paddingHorizontal: 10,
          paddingVertical: 3,
        }}>
          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>
            {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* ── Contenido ───────────────────────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: (insets.bottom || 16) + 80 }}
      >
        {/* Lista de pedidos seleccionados */}
        <View style={{ paddingBottom: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.warning, letterSpacing: 0.5 }}>
            PEDIDOS SELECCIONADOS
          </Text>
        </View>
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
          {pedidos.map((p, i) => (
            <View
              key={p.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderBottomWidth: i < pedidos.length - 1 ? 1 : 0,
                borderBottomColor: '#F3F4F6',
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB', marginRight: 12 }} />
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.warning, marginRight: 10, minWidth: 46 }}>
                {p.codigo}
              </Text>
              <Text style={{ fontSize: 13, color: '#6B7280', flex: 1 }} numberOfLines={1}>
                {p.cliente}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Tarjeta Estado (igual a PedidoScreen) ── */}
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
            {estadoCompletado && (
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            )}
          </View>

          {/* Botones de estado */}
          <View style={{ flexDirection: 'row', marginHorizontal: -4 }}>
            {ESTADOS_BOTONES.map(e => (
              <EstadoBtn
                key={e}
                estadoKey={e}
                current={estado}
                onPress={() => handleSetEstado(e)}
              />
            ))}
          </View>

          {/* Subestado */}
          {tieneSubestados && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ fontSize: 13, color: '#374151', fontWeight: '600', marginBottom: 8 }}>
                Subestado
              </Text>
              <TouchableOpacity
                onPress={() => setDropdownAbierto(!dropdownAbierto)}
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
                {dropdownAbierto
                  ? <Ionicons name="chevron-up" size={20} color="#6B7280" />
                  : subestado
                    ? <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    : <Ionicons name="chevron-down" size={20} color="#6B7280" />
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
                  {subestadosDisponibles.map(opcion => (
                    <TouchableOpacity
                      key={opcion}
                      onPress={() => {
                        if (opcion !== subestado) setEvidencias(undefined);
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

        {/* Pruebas de entrega (igual a PedidoScreen) */}
        <TouchableOpacity
          onPress={() => estadoCompletado && estado && navigation.navigate('BulkFormulario', {
            pedidos,
            estado,
            subestado,
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
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name="camera-outline"
              size={20}
              color={pruebasCompletadas ? (colorActivo ?? '#10B981') : estadoCompletado ? colors.primary : '#9CA3AF'}
              style={{ marginRight: 8 }}
            />
            <Text style={{
              fontSize: 14,
              fontWeight: '700',
              color: pruebasCompletadas ? (colorActivo ?? '#10B981') : estadoCompletado ? colors.primary : '#9CA3AF',
            }}>
              Pruebas de entrega
            </Text>
          </View>
          {pruebasCompletadas
            ? <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            : <Ionicons name="chevron-forward" size={20} color={estadoCompletado ? colors.primary : '#9CA3AF'} />
          }
        </TouchableOpacity>
      </ScrollView>

      {/* ── Footer: Confirmar ────────────────────────────────────────────────── */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: insets.bottom || 16,
      }}>
        <TouchableOpacity
          onPress={handleConfirmar}
          disabled={!puedeConfirmar}
          style={{
            backgroundColor: puedeConfirmar ? colors.primary : '#D1D5DB',
            borderRadius: 10,
            paddingVertical: 15,
            alignItems: 'center',
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
            Confirmar gestión
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}
