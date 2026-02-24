import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { RootStackParamList } from './RutasDisponiblesScreen';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface PedidoEntrega {
  key: string;
  codigo: string;
  cliente: string;
  direccion: string;
}

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Ruta'>;
  route: RouteProp<RootStackParamList, 'Ruta'>;
}

// ─── 30 pedidos de prueba ─────────────────────────────────────────────────────
const MOCK_PEDIDOS: PedidoEntrega[] = [
  { key: '1',  codigo: 'PR24', cliente: 'MARIA TERESA CACERES GONZALEZ',        direccion: 'LOS CIPRESES 3422, PUENTE ALTO' },
  { key: '2',  codigo: 'PR30', cliente: 'DANIEL ANTONIO MOYA ALVARADO',         direccion: 'EL TAMARINDO 2505, PUENTE ALTO' },
  { key: '3',  codigo: 'PR29', cliente: 'GLORIA ANDREA GAETE CERDA',            direccion: 'PASAJE EL BALCON 3332, PUENTE ALTO' },
  { key: '4',  codigo: 'PR25', cliente: 'HERNAN DAVID SOTO SARAVIA',            direccion: 'PASAJE JORGE ORREGO SALAS 742, PUENTE ALTO' },
  { key: '5',  codigo: 'PR23', cliente: 'CRISTOPHER ALEJANDRO APARICIO MEDINA', direccion: 'TOCOPMAL 60, PUENTE ALTO' },
  { key: '6',  codigo: 'PR31', cliente: 'ROSA ELENA FUENTES VALDIVIA',          direccion: 'AV. CONCHA Y TORO 1520, PUENTE ALTO' },
  { key: '7',  codigo: 'PR18', cliente: 'JUAN CARLOS MENDEZ ROJAS',             direccion: 'CALLE LAS ROSAS 890, PUENTE ALTO' },
  { key: '8',  codigo: 'PR27', cliente: 'CLAUDIA BEATRIZ SILVA PARRA',          direccion: 'PASAJE LOS PINOS 234, PUENTE ALTO' },
  { key: '9',  codigo: 'PR15', cliente: 'ROBERTO ANTONIO DIAZ LEON',            direccion: 'SAN CARLOS DE APOQUINDO 4680, PUENTE ALTO' },
  { key: '10', codigo: 'PR33', cliente: 'ANA MARIA TORRES ESPINOZA',            direccion: 'LO ESPEJO 3101, PUENTE ALTO' },
  { key: '11', codigo: 'PR12', cliente: 'PABLO ANDRES VERA CONTRERAS',          direccion: 'EYZAGUIRRE 502, PUENTE ALTO' },
  { key: '12', codigo: 'PR36', cliente: 'VALENTINA PAZ MORALES REYES',          direccion: 'ORIENTE 680, PUENTE ALTO' },
  { key: '13', codigo: 'PR09', cliente: 'SERGIO IGNACIO CAMPOS NUÑEZ',          direccion: 'AV. GABRIELA PONIENTE 4400, PUENTE ALTO' },
  { key: '14', codigo: 'PR22', cliente: 'CAROLINA ANDREA HERRERA RIOS',         direccion: 'PASAJE LAS LILAS 118, PUENTE ALTO' },
  { key: '15', codigo: 'PR40', cliente: 'FRANCISCO JAVIER PEREZ VEGA',          direccion: 'PEDRO DE VALDIVIA 2230, PUENTE ALTO' },
  { key: '16', codigo: 'PR07', cliente: 'MARCELA ANDREA CASTRO IBAÑEZ',         direccion: 'CALLE LOS AROMOS 754, PUENTE ALTO' },
  { key: '17', codigo: 'PR28', cliente: 'NICOLAS ALEJANDRO FLORES ARAYA',       direccion: 'PASAJE EL SAUCE 321, PUENTE ALTO' },
  { key: '18', codigo: 'PR11', cliente: 'ELIZABETH CAROLINA ROJAS MUNOZ',       direccion: 'LOS QUILLAYES 980, PUENTE ALTO' },
  { key: '19', codigo: 'PR35', cliente: 'ANDRES FELIPE NAVARRO ORTIZ',          direccion: 'PASAJE JAZMINES 455, PUENTE ALTO' },
  { key: '20', codigo: 'PR16', cliente: 'MARIELA FRANCISCA ACOSTA PEÑA',        direccion: 'CALLE COIHUECO 1234, PUENTE ALTO' },
  { key: '21', codigo: 'PR42', cliente: 'JORGE ENRIQUE GUTIERREZ TAPIA',        direccion: 'AV. PRINCIPAL 3300, PUENTE ALTO' },
  { key: '22', codigo: 'PR05', cliente: 'LORENA BEATRIZ SANCHEZ MEDINA',        direccion: 'PASAJE LOS COPIHUES 67, PUENTE ALTO' },
  { key: '23', codigo: 'PR38', cliente: 'DIEGO MATIAS REYES BRAVO',             direccion: 'LAS VIOLETAS 1890, PUENTE ALTO' },
  { key: '24', codigo: 'PR20', cliente: 'NATALIA IGNACIA ROMERO SOTO',          direccion: 'CALLE EL LITRE 720, PUENTE ALTO' },
  { key: '25', codigo: 'PR44', cliente: 'GUSTAVO ADOLFO MOLINA RIOS',           direccion: 'PASAJE LOS CEDROS 88, PUENTE ALTO' },
  { key: '26', codigo: 'PR03', cliente: 'PATRICIA ELENA VARGAS LAGOS',          direccion: 'AV. CAMILO HENRIQUEZ 5500, PUENTE ALTO' },
  { key: '27', codigo: 'PR32', cliente: 'OSCAR MAURICIO LEON FERNANDEZ',        direccion: 'CALLE LAS ENCINAS 430, PUENTE ALTO' },
  { key: '28', codigo: 'PR14', cliente: 'VIVIANA ALEJANDRA BUSTOS ALARCON',     direccion: 'PASAJE LOS ALAMOS 111, PUENTE ALTO' },
  { key: '29', codigo: 'PR45', cliente: 'HECTOR RODRIGO PIZARRO VILLALOBOS',    direccion: 'LAS PALMAS 2780, PUENTE ALTO' },
  { key: '30', codigo: 'PR01', cliente: 'BEATRIZ SOLEDAD MUÑOZ CONTRERAS',      direccion: 'CALLE SECTOR C 340, PUENTE ALTO' },
];

const ITEM_HEIGHT = 76;

// ─── Handle de arrastre ───────────────────────────────────────────────────────
// Usa PanResponder nativo (sin reanimated) — compatible con Expo Go
function DragHandle({
  index,
  isActive,
  onStart,
  onMove,
  onEnd,
}: {
  index: number;
  isActive: boolean;
  onStart: (i: number) => void;
  onMove: (i: number, dy: number) => void;
  onEnd: (i: number, dy: number) => void;
}) {
  // Refs para evitar closures desactualizados en el PanResponder
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
      style={{ width: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
    >
      <View style={{ gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{
              width: 18,
              height: 2,
              borderRadius: 1,
              backgroundColor: isActive ? colors.primary : colors.textSecondary,
            }}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Icono mapa ───────────────────────────────────────────────────────────────
function MapRouteIcon() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 22, height: 22 }}>
      <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.text }} />
      <View style={{ width: 1.5, height: 7, backgroundColor: colors.text }} />
      <View style={{ width: 7, height: 7, borderRadius: 3.5, borderWidth: 2, borderColor: colors.text }} />
    </View>
  );
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function RutaScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [pedidos, setPedidos] = useState<PedidoEntrega[]>(MOCK_PEDIDOS);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [hoverIndex, setHoverIndex] = useState<number>(-1);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [optimizando, setOptimizando] = useState(false);
  const [actualizando, setActualizando] = useState(false);

  const dragY = useRef(new Animated.Value(0)).current;
  // Ref para que handleDragEnd siempre vea la lista actualizada
  const pedidosRef = useRef(pedidos);
  pedidosRef.current = pedidos;

  // ── Drag handlers ────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((index: number) => {
    setActiveIndex(index);
    setScrollEnabled(false);
    dragY.setValue(0);
  }, [dragY]);

  const handleDragMove = useCallback((index: number, dy: number) => {
    dragY.setValue(dy);
    const hover = Math.max(0, Math.min(
      pedidosRef.current.length - 1,
      index + Math.round(dy / ITEM_HEIGHT),
    ));
    setHoverIndex(hover);
  }, [dragY]);

  const handleDragEnd = useCallback((index: number, dy: number) => {
    const to = Math.max(0, Math.min(
      pedidosRef.current.length - 1,
      index + Math.round(dy / ITEM_HEIGHT),
    ));

    if (to !== index) {
      setPedidos(prev => {
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

  // ── Optimizar: ordenar por código ────────────────────────────────────────────
  const optimizarRuta = () => {
    setOptimizando(true);
    setTimeout(() => {
      setPedidos(prev => [...prev].sort((a, b) => {
        const nA = parseInt(a.codigo.replace(/\D/g, ''), 10);
        const nB = parseInt(b.codigo.replace(/\D/g, ''), 10);
        return nA - nB;
      }));
      setOptimizando(false);
    }, 900);
  };

  // ── Actualizar: simula recarga desde API ────────────────────────────────────
  const actualizarDatos = () => {
    setActualizando(true);
    setTimeout(() => setActualizando(false), 800);
  };

  // ── Abrir mapa con todos los puntos ─────────────────────────────────────────
  const abrirMapa = () => {
    const waypoints = pedidos.map(p => encodeURIComponent(p.direccion)).join('/');
    const url = Platform.OS === 'ios'
      ? `maps://maps.apple.com/?daddr=${waypoints}`
      : `https://www.google.com/maps/dir/${waypoints}`;
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>

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
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold' }}>←</Text>
        </TouchableOpacity>

        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>Ruta</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={actualizarDatos}
            style={{ minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
          >
            {actualizando
              ? <ActivityIndicator color={colors.text} size="small" />
              : <Text style={{ color: colors.text, fontSize: 20 }}>↻</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={abrirMapa}
            style={{ minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
          >
            <MapRouteIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Lista arrastrable ───────────────────────────────────────────────── */}
      <ScrollView style={{ flex: 1 }} scrollEnabled={scrollEnabled}>
        {pedidos.map((item, index) => {
          const isActive = activeIndex === index;
          const isHover  = hoverIndex === index && !isActive;

          return (
            <Animated.View
              key={item.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isActive ? colors.surface : colors.background,
                borderBottomWidth: 1,
                borderBottomColor: isHover ? colors.primary : colors.border,
                borderTopWidth: isHover ? 2 : 0,
                borderTopColor: colors.primary,
                paddingVertical: 12,
                paddingRight: 16,
                opacity: isActive ? 0.85 : 1,
                // El item arrastrado flota encima de los demás
                elevation: isActive ? 8 : 0,
                zIndex: isActive ? 999 : 0,
                transform: isActive ? [{ translateY: dragY }] : [],
              }}
            >
              {/* Handle */}
              <DragHandle
                index={index}
                isActive={isActive}
                onStart={handleDragStart}
                onMove={handleDragMove}
                onEnd={handleDragEnd}
              />

              {/* Contenido */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.warning, marginBottom: 2 }}>
                  {item.codigo}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 3 }}>
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginRight: 4 }}>👤</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>{item.cliente}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: colors.textSecondary, marginRight: 4 }}>📍</Text>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>{item.direccion}</Text>
                </View>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: colors.background,
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: insets.bottom || 12,
      }}>
        {/* Optimizar ruta */}
        <TouchableOpacity
          onPress={optimizarRuta}
          disabled={optimizando}
          style={{
            flex: 1,
            minHeight: 52,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
            borderRightWidth: 1,
            borderRightColor: colors.border,
            opacity: optimizando ? 0.5 : 1,
          }}
        >
          {optimizando
            ? <ActivityIndicator color={colors.primary} size="small" />
            : <Text style={{ fontSize: 16 }}>📍</Text>
          }
          <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '600' }}>
            Optimizar ruta
          </Text>
        </TouchableOpacity>

        {/* Siguiente */}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Confirmar', {
              ruta: route.params.ruta,
              totalGuias: pedidos.length,
            });
          }}
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
