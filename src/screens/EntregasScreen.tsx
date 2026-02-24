import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { RootStackParamList } from './RutasDisponiblesScreen';

// ─── Tipos ────────────────────────────────────────────────────────────────────
type EstadoPedido = 'pendiente' | 'entregado' | 'rechazado' | 'postergado';

interface PedidoConEstado {
  key: string;
  codigo: string;
  cliente: string;
  direccion: string;
  horario: string;
  estado: EstadoPedido;
  sincronizado: boolean;
}

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Entregas'>;
  route: RouteProp<RootStackParamList, 'Entregas'>;
}

// ─── Colores y etiquetas por estado ──────────────────────────────────────────
const ESTADO_COLOR: Record<EstadoPedido, string> = {
  pendiente:  '#D1D5DB',
  entregado:  '#10B981',
  rechazado:  '#EF4444',
  postergado: '#F59E0B',
};

const ESTADO_LABEL: Record<string, string> = {
  entregado:  'Entregado',
  rechazado:  'Rechazado',
  postergado: 'Postergado',
};

// ─── Datos mock ───────────────────────────────────────────────────────────────
const INIT_FINALIZADOS: PedidoConEstado[] = [
  { key: 'f1', codigo: 'PR24', cliente: 'MARIA TERESA CACERES GONZALEZ', direccion: 'LOS CIPRESES 3422, PUENTE ALTO',     horario: '08:00 - 21:00', estado: 'entregado',  sincronizado: true  },
  { key: 'f2', codigo: 'PR30', cliente: 'DANIEL ANTONIO MOYA ALVARADO',  direccion: 'EL TAMARINDO 2505, PUENTE ALTO',     horario: '08:00 - 21:00', estado: 'rechazado',  sincronizado: true  },
  { key: 'f3', codigo: 'PR29', cliente: 'GLORIA ANDREA GAETE CERDA',     direccion: 'PASAJE EL BALCON 3332, PUENTE ALTO', horario: '08:00 - 21:00', estado: 'postergado', sincronizado: false },
];

const INIT_PENDIENTES: PedidoConEstado[] = [
  { key: 'p4',  codigo: 'PR25', cliente: 'HERNAN DAVID SOTO SARAVIA',            direccion: 'PASAJE JORGE ORREGO SALAS 742, PUENTE ALTO', horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p5',  codigo: 'PR23', cliente: 'CRISTOPHER ALEJANDRO APARICIO MEDINA', direccion: 'TOCOPMAL 60, PUENTE ALTO',                    horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p6',  codigo: 'PR31', cliente: 'ROSA ELENA FUENTES VALDIVIA',          direccion: 'AV. CONCHA Y TORO 1520, PUENTE ALTO',         horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p7',  codigo: 'PR18', cliente: 'JUAN CARLOS MENDEZ ROJAS',             direccion: 'CALLE LAS ROSAS 890, PUENTE ALTO',            horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p8',  codigo: 'PR27', cliente: 'CLAUDIA BEATRIZ SILVA PARRA',          direccion: 'PASAJE LOS PINOS 234, PUENTE ALTO',           horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p9',  codigo: 'PR15', cliente: 'ROBERTO ANTONIO DIAZ LEON',            direccion: 'SAN CARLOS DE APOQUINDO 4680, PUENTE ALTO',   horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p10', codigo: 'PR33', cliente: 'ANA MARIA TORRES ESPINOZA',            direccion: 'LO ESPEJO 3101, PUENTE ALTO',                 horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p11', codigo: 'PR12', cliente: 'PABLO ANDRES VERA CONTRERAS',          direccion: 'EYZAGUIRRE 502, PUENTE ALTO',                 horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p12', codigo: 'PR36', cliente: 'VALENTINA PAZ MORALES REYES',          direccion: 'ORIENTE 680, PUENTE ALTO',                    horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p13', codigo: 'PR09', cliente: 'SERGIO IGNACIO CAMPOS NUÑEZ',          direccion: 'AV. GABRIELA PONIENTE 4400, PUENTE ALTO',     horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p14', codigo: 'PR22', cliente: 'CAROLINA ANDREA HERRERA RIOS',         direccion: 'PASAJE LAS LILAS 118, PUENTE ALTO',           horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p15', codigo: 'PR40', cliente: 'FRANCISCO JAVIER PEREZ VEGA',          direccion: 'PEDRO DE VALDIVIA 2230, PUENTE ALTO',         horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p16', codigo: 'PR07', cliente: 'MARCELA ANDREA CASTRO IBAÑEZ',         direccion: 'CALLE LOS AROMOS 754, PUENTE ALTO',           horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p17', codigo: 'PR28', cliente: 'NICOLAS ALEJANDRO FLORES ARAYA',       direccion: 'PASAJE EL SAUCE 321, PUENTE ALTO',            horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p18', codigo: 'PR11', cliente: 'ELIZABETH CAROLINA ROJAS MUNOZ',       direccion: 'LOS QUILLAYES 980, PUENTE ALTO',              horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p19', codigo: 'PR35', cliente: 'ANDRES FELIPE NAVARRO ORTIZ',          direccion: 'PASAJE JAZMINES 455, PUENTE ALTO',            horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p20', codigo: 'PR16', cliente: 'MARIELA FRANCISCA ACOSTA PEÑA',        direccion: 'CALLE COIHUECO 1234, PUENTE ALTO',            horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p21', codigo: 'PR42', cliente: 'JORGE ENRIQUE GUTIERREZ TAPIA',        direccion: 'AV. PRINCIPAL 3300, PUENTE ALTO',             horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p22', codigo: 'PR05', cliente: 'LORENA BEATRIZ SANCHEZ MEDINA',        direccion: 'PASAJE LOS COPIHUES 67, PUENTE ALTO',         horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p23', codigo: 'PR38', cliente: 'DIEGO MATIAS REYES BRAVO',             direccion: 'LAS VIOLETAS 1890, PUENTE ALTO',              horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p24', codigo: 'PR20', cliente: 'NATALIA IGNACIA ROMERO SOTO',          direccion: 'CALLE EL LITRE 720, PUENTE ALTO',             horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p25', codigo: 'PR44', cliente: 'GUSTAVO ADOLFO MOLINA RIOS',           direccion: 'PASAJE LOS CEDROS 88, PUENTE ALTO',           horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p26', codigo: 'PR03', cliente: 'PATRICIA ELENA VARGAS LAGOS',          direccion: 'AV. CAMILO HENRIQUEZ 5500, PUENTE ALTO',      horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p27', codigo: 'PR32', cliente: 'OSCAR MAURICIO LEON FERNANDEZ',        direccion: 'CALLE LAS ENCINAS 430, PUENTE ALTO',          horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p28', codigo: 'PR14', cliente: 'VIVIANA ALEJANDRA BUSTOS ALARCON',     direccion: 'PASAJE LOS ALAMOS 111, PUENTE ALTO',          horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p29', codigo: 'PR45', cliente: 'HECTOR RODRIGO PIZARRO VILLALOBOS',    direccion: 'LAS PALMAS 2780, PUENTE ALTO',                horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
  { key: 'p30', codigo: 'PR01', cliente: 'BEATRIZ SOLEDAD MUÑOZ CONTRERAS',      direccion: 'CALLE SECTOR C 340, PUENTE ALTO',             horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true },
];

const ITEM_HEIGHT = 96;

// ─── Handle de arrastre ───────────────────────────────────────────────────────
function DragHandle({ index, isActive, onStart, onMove, onEnd }: {
  index: number;
  isActive: boolean;
  onStart: (i: number) => void;
  onMove: (i: number, dy: number) => void;
  onEnd: (i: number, dy: number) => void;
}) {
  const cb = useRef({ onStart, onMove, onEnd, index });
  cb.current = { onStart, onMove, onEnd, index };

  const pr = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => cb.current.onStart(cb.current.index),
      onPanResponderMove: (_, gs) => cb.current.onMove(cb.current.index, gs.dy),
      onPanResponderRelease: (_, gs) => cb.current.onEnd(cb.current.index, gs.dy),
      onPanResponderTerminate: (_, gs) => cb.current.onEnd(cb.current.index, gs.dy),
    })
  ).current;

  return (
    <View
      {...pr.panHandlers}
      style={{ width: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
    >
      <View style={{ gap: 4 }}>
        {[0, 1, 2].map(i => (
          <View key={i} style={{
            width: 18, height: 2, borderRadius: 1,
            backgroundColor: isActive ? colors.primary : '#9CA3AF',
          }} />
        ))}
      </View>
    </View>
  );
}

// ─── Indicador de sincronización ─────────────────────────────────────────────
function SyncIndicator({ synced }: { synced: boolean }) {
  return (
    <View style={{
      width: 26, height: 26, borderRadius: 13,
      backgroundColor: synced ? '#10B981' : '#9CA3AF',
      justifyContent: 'center', alignItems: 'center',
      marginRight: 10,
    }}>
      <Ionicons name="checkmark" size={15} color="#FFFFFF" />
    </View>
  );
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function EntregasScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [tabActiva, setTabActiva] = useState<'enruta' | 'finalizados'>('enruta');
  const [pendientes, setPendientes] = useState<PedidoConEstado[]>(INIT_PENDIENTES);
  const finalizados = INIT_FINALIZADOS;

  // ── Drag state ───────────────────────────────────────────────────────────────
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hoverIndex,  setHoverIndex]  = useState(-1);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const dragY = useRef(new Animated.Value(0)).current;
  const listRef = useRef(pendientes);
  listRef.current = pendientes;

  const handleDragStart = useCallback((index: number) => {
    setActiveIndex(index);
    setScrollEnabled(false);
    dragY.setValue(0);
  }, [dragY]);

  const handleDragMove = useCallback((index: number, dy: number) => {
    dragY.setValue(dy);
    const hover = Math.max(0, Math.min(listRef.current.length - 1, index + Math.round(dy / ITEM_HEIGHT)));
    setHoverIndex(hover);
  }, [dragY]);

  const handleDragEnd = useCallback((index: number, dy: number) => {
    const to = Math.max(0, Math.min(listRef.current.length - 1, index + Math.round(dy / ITEM_HEIGHT)));
    if (to !== index) {
      setPendientes(prev => {
        const list = [...prev];
        const [item] = list.splice(index, 1);
        list.splice(to, 0, item);
        return list;
      });
    }
    setActiveIndex(-1);
    setHoverIndex(-1);
    setScrollEnabled(true);
    dragY.setValue(0);
  }, [dragY]);

  const listaActiva = tabActiva === 'enruta' ? pendientes : finalizados;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }} edges={['top']}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}>
        {/* Hamburger */}
        <TouchableOpacity style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}>
          <View style={{ gap: 5 }}>
            {[0, 1, 2].map(i => (
              <View key={i} style={{ width: 22, height: 2, borderRadius: 1, backgroundColor: colors.text }} />
            ))}
          </View>
        </TouchableOpacity>

        {/* Iconos de acción */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={{ minWidth: 40, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="search-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={{ minWidth: 40, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="refresh-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={{ minWidth: 40, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="map-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Lista ───────────────────────────────────────────────────────────── */}
      <ScrollView style={{ flex: 1, backgroundColor: '#F3F4F6' }} scrollEnabled={scrollEnabled}>
        {listaActiva.map((item, index) => {
          const isActive = tabActiva === 'enruta' && activeIndex === index;
          const isHover  = tabActiva === 'enruta' && hoverIndex === index && !isActive;
          const leftColor = ESTADO_COLOR[item.estado];

          return (
            <Animated.View
              key={item.key}
              style={{
                backgroundColor: '#FFFFFF',
                marginBottom: 1,
                flexDirection: 'row',
                alignItems: 'center',
                borderLeftWidth: 5,
                borderLeftColor: leftColor,
                borderTopWidth: isHover ? 2 : 0,
                borderTopColor: colors.primary,
                borderBottomWidth: isHover ? 2 : 1,
                borderBottomColor: isHover ? colors.primary : '#F3F4F6',
                opacity: isActive ? 0.85 : 1,
                elevation: isActive ? 8 : 0,
                zIndex: isActive ? 999 : 0,
                transform: isActive ? [{ translateY: dragY }] : [],
              }}
            >
              {/* Contenido */}
              <View style={{ flex: 1, paddingVertical: 12, paddingLeft: 12, paddingRight: 4 }}>

                {/* Fila 1: sync + código + badge estado */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <SyncIndicator synced={item.sincronizado} />
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.warning, flex: 1 }}>
                    {item.codigo}
                  </Text>
                  {item.estado !== 'pendiente' && (
                    <View style={{
                      backgroundColor: leftColor + '22',
                      borderRadius: 12,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      marginRight: 8,
                    }}>
                      <Text style={{ fontSize: 11, color: leftColor, fontWeight: '700' }}>
                        {ESTADO_LABEL[item.estado]}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Fila 2: dirección */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 3, marginLeft: 36 }}>
                  <Ionicons name="location-outline" size={13} color="#3B82F6" style={{ marginRight: 4, marginTop: 1 }} />
                  <Text style={{ fontSize: 12, color: '#374151', flex: 1 }}>{item.direccion}</Text>
                </View>

                {/* Fila 3: cliente */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3, marginLeft: 36 }}>
                  <Ionicons name="person-outline" size={13} color="#6B7280" style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 12, color: '#6B7280', flex: 1 }}>{item.cliente}</Text>
                </View>

                {/* Fila 4: horario (solo pendientes) */}
                {item.estado === 'pendiente' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 36 }}>
                    <Ionicons name="time-outline" size={13} color="#9CA3AF" style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 12, color: '#9CA3AF' }}>{item.horario}</Text>
                  </View>
                )}
              </View>

              {/* Handle de arrastre (solo pendientes) */}
              {item.estado === 'pendiente' && (
                <DragHandle
                  index={index}
                  isActive={isActive}
                  onStart={handleDragStart}
                  onMove={handleDragMove}
                  onEnd={handleDragEnd}
                />
              )}
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* ── Footer tabs ─────────────────────────────────────────────────────── */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: '#1F2937',
        borderTopWidth: 1,
        borderTopColor: '#374151',
        paddingBottom: insets.bottom || 8,
      }}>
        {/* Tab: En Ruta */}
        <TouchableOpacity
          onPress={() => setTabActiva('enruta')}
          style={{ flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons
            name="navigate"
            size={22}
            color={tabActiva === 'enruta' ? colors.warning : colors.textSecondary}
          />
          <Text style={{
            fontSize: 12, fontWeight: '600', marginTop: 3,
            color: tabActiva === 'enruta' ? colors.warning : colors.textSecondary,
          }}>
            En Ruta : {pendientes.length}
          </Text>
        </TouchableOpacity>

        {/* Divisor */}
        <View style={{ width: 1, backgroundColor: '#374151', marginVertical: 8 }} />

        {/* Tab: Finalizados */}
        <TouchableOpacity
          onPress={() => setTabActiva('finalizados')}
          style={{ flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons
            name="checkmark-done"
            size={22}
            color={tabActiva === 'finalizados' ? colors.warning : colors.textSecondary}
          />
          <Text style={{
            fontSize: 12, fontWeight: '600', marginTop: 3,
            color: tabActiva === 'finalizados' ? colors.warning : colors.textSecondary,
          }}>
            Finalizados : {finalizados.length}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}
