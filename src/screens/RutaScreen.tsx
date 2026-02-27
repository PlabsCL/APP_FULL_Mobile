import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../constants/colors';
import { RootStackParamList } from './RutasDisponiblesScreen';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface PedidoEntrega {
  key: string;
  codigo: string;
  cliente: string;
  direccion: string;
  lat: number;
  lng: number;
}

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Ruta'>;
  route: RouteProp<RootStackParamList, 'Ruta'>;
}

// ─── 10 pedidos de prueba ─────────────────────────────────────────────────────
const MOCK_PEDIDOS: PedidoEntrega[] = [
  { key: '1',  codigo: 'PR24', cliente: 'MARIA TERESA CACERES GONZALEZ',        direccion: 'LOS CIPRESES 3422, PUENTE ALTO',             lat: -33.598, lng: -70.561 },
  { key: '2',  codigo: 'PR30', cliente: 'DANIEL ANTONIO MOYA ALVARADO',         direccion: 'EL TAMARINDO 2505, PUENTE ALTO',             lat: -33.603, lng: -70.568 },
  { key: '3',  codigo: 'PR29', cliente: 'GLORIA ANDREA GAETE CERDA',            direccion: 'PASAJE EL BALCON 3332, PUENTE ALTO',         lat: -33.610, lng: -70.574 },
  { key: '4',  codigo: 'PR25', cliente: 'HERNAN DAVID SOTO SARAVIA',            direccion: 'PASAJE JORGE ORREGO SALAS 742, PUENTE ALTO', lat: -33.615, lng: -70.580 },
  { key: '5',  codigo: 'PR23', cliente: 'CRISTOPHER ALEJANDRO APARICIO MEDINA', direccion: 'TOCOPMAL 60, PUENTE ALTO',                   lat: -33.620, lng: -70.566 },
  { key: '6',  codigo: 'PR31', cliente: 'ROSA ELENA FUENTES VALDIVIA',          direccion: 'AV. CONCHA Y TORO 1520, PUENTE ALTO',        lat: -33.608, lng: -70.571 },
  { key: '7',  codigo: 'PR18', cliente: 'JUAN CARLOS MENDEZ ROJAS',             direccion: 'CALLE LAS ROSAS 890, PUENTE ALTO',           lat: -33.625, lng: -70.558 },
  { key: '8',  codigo: 'PR27', cliente: 'CLAUDIA BEATRIZ SILVA PARRA',          direccion: 'PASAJE LOS PINOS 234, PUENTE ALTO',          lat: -33.630, lng: -70.563 },
  { key: '9',  codigo: 'PR15', cliente: 'ROBERTO ANTONIO DIAZ LEON',            direccion: 'SAN CARLOS DE APOQUINDO 4680, PUENTE ALTO',  lat: -33.594, lng: -70.577 },
  { key: '10', codigo: 'PR33', cliente: 'ANA MARIA TORRES ESPINOZA',            direccion: 'LO ESPEJO 3101, PUENTE ALTO',                lat: -33.601, lng: -70.584 },
];

const ITEM_HEIGHT = 76;

// ─── Handle de arrastre ───────────────────────────────────────────────────────
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

// ─── Distancia haversine (km) ─────────────────────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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

  // ── Escáner barcode ──────────────────────────────────────────────────────────
  const [pedidosVerificados, setPedidosVerificados] = useState<Set<string>>(new Set());
  const [scannerVisible, setScannerVisible] = useState(false);
  const [pedidoEscaneando, setPedidoEscaneando] = useState<PedidoEntrega | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [codigoManual, setCodigoManual] = useState('');
  const [permission, requestPermission] = useCameraPermissions();

  // ── Mapa ─────────────────────────────────────────────────────────────────────
  const [mapaVisible, setMapaVisible] = useState(false);
  const [inicioCoords, setInicioCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [inicioDireccion, setInicioDireccion] = useState('');

  useEffect(() => {
    Promise.all([
      SecureStore.getItemAsync('inicioLat'),
      SecureStore.getItemAsync('inicioLng'),
      SecureStore.getItemAsync('direccionInicio'),
    ]).then(([lat, lng, dir]) => {
      if (lat && lng) setInicioCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
      if (dir) setInicioDireccion(dir);
    });
  }, []);

  const dragY = useRef(new Animated.Value(0)).current;
  const pedidosRef = useRef(pedidos);
  pedidosRef.current = pedidos;

  // ── Drag handlers ─────────────────────────────────────────────────────────────
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

  // ── Optimizar: nearest-neighbor desde punto de partida ──────────────────────
  const optimizarRuta = async () => {
    setOptimizando(true);

    const latStr = await SecureStore.getItemAsync('inicioLat');
    const lngStr = await SecureStore.getItemAsync('inicioLng');
    const startLat = latStr ? parseFloat(latStr) : -33.585;
    const startLng = lngStr ? parseFloat(lngStr) : -70.570;

    setTimeout(() => {
      setPedidos(prev => {
        const remaining = [...prev];
        const ordered: PedidoEntrega[] = [];
        let curLat = startLat;
        let curLng = startLng;

        while (remaining.length > 0) {
          let nearestIdx = 0;
          let minDist = Infinity;
          for (let i = 0; i < remaining.length; i++) {
            const d = haversine(curLat, curLng, remaining[i].lat, remaining[i].lng);
            if (d < minDist) { minDist = d; nearestIdx = i; }
          }
          const pick = remaining.splice(nearestIdx, 1)[0];
          ordered.push(pick);
          curLat = pick.lat;
          curLng = pick.lng;
        }

        return ordered;
      });
      setOptimizando(false);
    }, 500);
  };

  // ── Actualizar: simula recarga desde API ──────────────────────────────────────
  const actualizarDatos = () => {
    setActualizando(true);
    setTimeout(() => setActualizando(false), 800);
  };

  // ── Escáner: abrir / cerrar / procesar ────────────────────────────────────────
  const abrirScanner = async (pedido: PedidoEntrega) => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return;
    }
    setPedidoEscaneando(pedido);
    setScanError(null);
    setCodigoManual('');
    setScannerVisible(true);
  };

  const handleConfirmarManual = () => {
    if (!pedidoEscaneando) return;
    handleBarcodeScanned({ data: codigoManual.trim().toUpperCase() });
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!pedidoEscaneando) return;
    if (data.trim() === pedidoEscaneando.codigo) {
      setPedidosVerificados(prev => new Set(prev).add(pedidoEscaneando.key));
      setScannerVisible(false);
      setScanError(null);
    } else {
      setScanError(`Código incorrecto. Esperado: ${pedidoEscaneando.codigo}`);
      setTimeout(() => setScanError(null), 2500);
    }
  };

  const verificados = pedidosVerificados.size;
  const total = pedidos.length;

  // ── Coordenadas para el mapa ───────────────────────────────────────────────────
  const pedidoCoords = pedidos.map(p => ({ latitude: p.lat, longitude: p.lng }));
  const mapaCoords = inicioCoords
    ? [{ latitude: inicioCoords.lat, longitude: inicioCoords.lng }, ...pedidoCoords]
    : pedidoCoords;

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
        {/* Izquierda: back */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ minWidth: 44, minHeight: 48, justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>Ruta</Text>

        {/* Derecha: shuffle + refresh + mapa */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={optimizarRuta}
            disabled={optimizando}
            style={{ minWidth: 40, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
          >
            {optimizando
              ? <ActivityIndicator color={colors.text} size="small" />
              : <Ionicons name="shuffle-outline" size={22} color={colors.text} />
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={actualizarDatos}
            style={{ minWidth: 40, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
          >
            {actualizando
              ? <ActivityIndicator color={colors.text} size="small" />
              : <Ionicons name="refresh" size={22} color={colors.text} />
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMapaVisible(true)}
            style={{ minWidth: 40, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
          >
            <MapRouteIcon />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Sub-header: contador de escaneados ──────────────────────────────── */}
      <View style={{
        backgroundColor: colors.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>
          Pedidos en ruta: <Text style={{ fontWeight: '600', color: colors.text }}>{total}</Text>
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons
            name={verificados === total ? 'checkmark-circle' : 'barcode-outline'}
            size={16}
            color={verificados === total ? colors.success : colors.textSecondary}
          />
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            color: verificados === total ? colors.success : colors.textSecondary,
          }}>
            {verificados} / {total} escaneados
          </Text>
        </View>
      </View>

      {/* ── Lista arrastrable ───────────────────────────────────────────────── */}
      <ScrollView style={{ flex: 1 }} scrollEnabled={scrollEnabled}>
        {pedidos.map((item, index) => {
          const isActive    = activeIndex === index;
          const isHover     = hoverIndex === index && !isActive;
          const esVerificado = pedidosVerificados.has(item.key);

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
                  <Ionicons name="person-outline" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>{item.cliente}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location-outline" size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>{item.direccion}</Text>
                </View>
              </View>

              {/* Ícono escáner / verificado */}
              <TouchableOpacity
                onPress={() => !esVerificado && abrirScanner(item)}
                style={{ minWidth: 44, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
              >
                <Ionicons
                  name={esVerificado ? 'checkmark-circle' : 'barcode-outline'}
                  size={24}
                  color={esVerificado ? colors.success : colors.textSecondary}
                />
              </TouchableOpacity>
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
        {/* Anterior */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            flex: 1,
            minHeight: 52,
            justifyContent: 'center',
            alignItems: 'center',
            borderRightWidth: 1,
            borderRightColor: colors.border,
          }}
        >
          <Text style={{ color: colors.primary, fontSize: 17, fontWeight: '600' }}>
            Anterior
          </Text>
        </TouchableOpacity>

        {/* Siguiente */}
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('Confirmar', {
              ruta: route.params.ruta,
              totalGuias: pedidos.length,
              escaneados: pedidosVerificados.size,
              ordenPedidos: pedidos.map(p => p.codigo),
              pedidosOrdenados: pedidos.map(p => ({
                key: p.key,
                codigo: p.codigo,
                cliente: p.cliente,
                direccion: p.direccion,
                horario: '08:00 - 21:00',
                estado: 'pendiente' as const,
                sincronizado: true,
                lat: p.lat,
                lng: p.lng,
              })),
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

      {/* ── Modal: Escáner de código de barras ──────────────────────────────── */}
      <Modal
        visible={scannerVisible}
        animationType="slide"
        onRequestClose={() => setScannerVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top']}>
          {/* Header del scanner */}
          <View style={{
            backgroundColor: colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}>
            <View>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: 'bold' }}>
                Escanear pedido
              </Text>
              {pedidoEscaneando && (
                <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                  Código esperado: <Text style={{ color: colors.warning, fontWeight: '600' }}>{pedidoEscaneando.codigo}</Text>
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => setScannerVisible(false)}
              style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            >
              <Ionicons name="close" size={26} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Cámara */}
          <View style={{ flex: 1 }}>
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['code128', 'code39', 'qr', 'ean13', 'ean8'] }}
              onBarcodeScanned={handleBarcodeScanned}
            />
            {/* Overlay de mira */}
            <View style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              justifyContent: 'center', alignItems: 'center',
              pointerEvents: 'none',
            }}>
              <View style={{
                width: 240, height: 140,
                borderWidth: 2, borderColor: colors.text, borderRadius: 10,
                backgroundColor: 'transparent',
              }} />
              <Text style={{ color: colors.text, fontSize: 13, marginTop: 16, opacity: 0.8 }}>
                Apunta al código de barras del pedido
              </Text>
            </View>
            {/* Mensaje de error */}
            {scanError && (
              <View style={{
                position: 'absolute', bottom: 40, left: 24, right: 24,
                backgroundColor: colors.error,
                borderRadius: 10, padding: 14, alignItems: 'center',
              }}>
                <Text style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>{scanError}</Text>
              </View>
            )}
          </View>

          {/* Ingreso manual */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={{
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              padding: 16,
              gap: 10,
            }}>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                ¿Código ilegible? Ingrésalo manualmente:
              </Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TextInput
                  value={codigoManual}
                  onChangeText={t => setCodigoManual(t.toUpperCase())}
                  placeholder="Ej: PR24"
                  placeholderTextColor={colors.border}
                  autoCapitalize="characters"
                  returnKeyType="done"
                  onSubmitEditing={handleConfirmarManual}
                  style={{
                    flex: 1,
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontSize: 16,
                    fontWeight: '600',
                    letterSpacing: 1,
                  }}
                />
                <TouchableOpacity
                  onPress={handleConfirmarManual}
                  disabled={!codigoManual.trim()}
                  style={{
                    backgroundColor: codigoManual.trim() ? colors.primary : colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 18,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>
                    OK
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* ── Modal: Mapa de ruta ─────────────────────────────────────────────── */}
      <Modal
        visible={mapaVisible}
        animationType="slide"
        onRequestClose={() => setMapaVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
          {/* Header del mapa */}
          <View style={{
            backgroundColor: colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold' }}>
              Mapa de ruta
            </Text>
            <TouchableOpacity
              onPress={() => setMapaVisible(false)}
              style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            >
              <Ionicons name="close" size={26} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Mapa */}
          <MapView
            style={{ flex: 1 }}
            initialRegion={{
              latitude: -33.618,
              longitude: -70.572,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {inicioCoords && (
              <Marker
                coordinate={{ latitude: inicioCoords.lat, longitude: inicioCoords.lng }}
                title="Punto de partida"
                description={inicioDireccion || 'Dirección de inicio'}
                pinColor={colors.warning}
              />
            )}
            {pedidos.map((p, i) => (
              <Marker
                key={p.key}
                coordinate={{ latitude: p.lat, longitude: p.lng }}
                title={`${i + 1}. ${p.codigo}`}
                description={p.cliente}
                pinColor={i === 0 ? '#10B981' : colors.primary}
              />
            ))}
            <Polyline
              coordinates={mapaCoords}
              strokeColor={colors.primary}
              strokeWidth={3}
            />
          </MapView>

          {/* Leyenda */}
          <View style={{
            backgroundColor: colors.surface,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.warning }} />
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>Inicio</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#10B981' }} />
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>1er pedido</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 30, height: 3, backgroundColor: colors.primary, borderRadius: 2 }} />
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>Trazo</Text>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}
