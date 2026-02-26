import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Modal,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { colors } from '../constants/colors';
import { RootStackParamList } from './RutasDisponiblesScreen';
import { EstadoPedido, PedidoConEstado } from '../types/pedido';
import DrawerMenu from '../components/DrawerMenu';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Entregas'>;
  route: RouteProp<RootStackParamList, 'Entregas'>;
}

// ─── Colores y etiquetas por estado ──────────────────────────────────────────
const ESTADO_COLOR: Record<EstadoPedido, string> = {
  pendiente:       '#D1D5DB',
  entregado:       '#10B981',
  rechazado:       '#EF4444',
  postergado:      '#F59E0B',
  no_entregado:    '#EF4444',
  entrega_parcial: '#F59E0B',
};

const ESTADO_LABEL: Record<string, string> = {
  entregado:       'Entregado',
  rechazado:       'Rechazado',
  postergado:      'Postergado',
  no_entregado:    'No Entregado',
  entrega_parcial: 'Entrega parcial',
};

// ─── Datos mock ───────────────────────────────────────────────────────────────
const INIT_FINALIZADOS: PedidoConEstado[] = [
  { key: 'f1', codigo: 'PR24', cliente: 'MARIA TERESA CACERES GONZALEZ', direccion: 'LOS CIPRESES 3422, PUENTE ALTO',     horario: '08:00 - 21:00', estado: 'entregado',  sincronizado: true,  lat: -33.6089, lng: -70.5742 },
  { key: 'f2', codigo: 'PR30', cliente: 'DANIEL ANTONIO MOYA ALVARADO',  direccion: 'EL TAMARINDO 2505, PUENTE ALTO',     horario: '08:00 - 21:00', estado: 'rechazado',  sincronizado: true,  lat: -33.6073, lng: -70.5789 },
  { key: 'f3', codigo: 'PR29', cliente: 'GLORIA ANDREA GAETE CERDA',     direccion: 'PASAJE EL BALCON 3332, PUENTE ALTO', horario: '08:00 - 21:00', estado: 'postergado', sincronizado: false, lat: -33.6102, lng: -70.5701 },
];

const INIT_PENDIENTES: PedidoConEstado[] = [
  { key: 'p4',  codigo: 'PR25', cliente: 'HERNAN DAVID SOTO SARAVIA',            direccion: 'PASAJE JORGE ORREGO SALAS 742, PUENTE ALTO', horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6135, lng: -70.5768 },
  { key: 'p5',  codigo: 'PR23', cliente: 'CRISTOPHER ALEJANDRO APARICIO MEDINA', direccion: 'TOCOPMAL 60, PUENTE ALTO',                    horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6058, lng: -70.5756 },
  { key: 'p6',  codigo: 'PR31', cliente: 'ROSA ELENA FUENTES VALDIVIA',          direccion: 'AV. CONCHA Y TORO 1520, PUENTE ALTO',         horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6094, lng: -70.5712 },
  { key: 'p7',  codigo: 'PR18', cliente: 'JUAN CARLOS MENDEZ ROJAS',             direccion: 'CALLE LAS ROSAS 890, PUENTE ALTO',            horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6120, lng: -70.5791 },
  { key: 'p8',  codigo: 'PR27', cliente: 'CLAUDIA BEATRIZ SILVA PARRA',          direccion: 'PASAJE LOS PINOS 234, PUENTE ALTO',           horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6065, lng: -70.5728 },
  { key: 'p9',  codigo: 'PR15', cliente: 'ROBERTO ANTONIO DIAZ LEON',            direccion: 'SAN CARLOS DE APOQUINDO 4680, PUENTE ALTO',   horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6110, lng: -70.5742 },
  { key: 'p10', codigo: 'PR33', cliente: 'ANA MARIA TORRES ESPINOZA',            direccion: 'LO ESPEJO 3101, PUENTE ALTO',                 horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6087, lng: -70.5770 },
  { key: 'p11', codigo: 'PR12', cliente: 'PABLO ANDRES VERA CONTRERAS',          direccion: 'EYZAGUIRRE 502, PUENTE ALTO',                 horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6078, lng: -70.5798 },
  { key: 'p12', codigo: 'PR36', cliente: 'VALENTINA PAZ MORALES REYES',          direccion: 'ORIENTE 680, PUENTE ALTO',                    horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6130, lng: -70.5725 },
  { key: 'p13', codigo: 'PR09', cliente: 'SERGIO IGNACIO CAMPOS NUÑEZ',          direccion: 'AV. GABRIELA PONIENTE 4400, PUENTE ALTO',     horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6055, lng: -70.5762 },
  { key: 'p14', codigo: 'PR22', cliente: 'CAROLINA ANDREA HERRERA RIOS',         direccion: 'PASAJE LAS LILAS 118, PUENTE ALTO',           horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6098, lng: -70.5784 },
  { key: 'p15', codigo: 'PR40', cliente: 'FRANCISCO JAVIER PEREZ VEGA',          direccion: 'PEDRO DE VALDIVIA 2230, PUENTE ALTO',         horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6115, lng: -70.5752 },
  { key: 'p16', codigo: 'PR07', cliente: 'MARCELA ANDREA CASTRO IBAÑEZ',         direccion: 'CALLE LOS AROMOS 754, PUENTE ALTO',           horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6072, lng: -70.5715 },
  { key: 'p17', codigo: 'PR28', cliente: 'NICOLAS ALEJANDRO FLORES ARAYA',       direccion: 'PASAJE EL SAUCE 321, PUENTE ALTO',            horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6142, lng: -70.5778 },
  { key: 'p18', codigo: 'PR11', cliente: 'ELIZABETH CAROLINA ROJAS MUNOZ',       direccion: 'LOS QUILLAYES 980, PUENTE ALTO',              horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6063, lng: -70.5745 },
  { key: 'p19', codigo: 'PR35', cliente: 'ANDRES FELIPE NAVARRO ORTIZ',          direccion: 'PASAJE JAZMINES 455, PUENTE ALTO',            horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6099, lng: -70.5731 },
  { key: 'p20', codigo: 'PR16', cliente: 'MARIELA FRANCISCA ACOSTA PEÑA',        direccion: 'CALLE COIHUECO 1234, PUENTE ALTO',            horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6085, lng: -70.5799 },
  { key: 'p21', codigo: 'PR42', cliente: 'JORGE ENRIQUE GUTIERREZ TAPIA',        direccion: 'AV. PRINCIPAL 3300, PUENTE ALTO',             horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6127, lng: -70.5763 },
  { key: 'p22', codigo: 'PR05', cliente: 'LORENA BEATRIZ SANCHEZ MEDINA',        direccion: 'PASAJE LOS COPIHUES 67, PUENTE ALTO',         horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6047, lng: -70.5751 },
  { key: 'p23', codigo: 'PR38', cliente: 'DIEGO MATIAS REYES BRAVO',             direccion: 'LAS VIOLETAS 1890, PUENTE ALTO',              horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6108, lng: -70.5718 },
  { key: 'p24', codigo: 'PR20', cliente: 'NATALIA IGNACIA ROMERO SOTO',          direccion: 'CALLE EL LITRE 720, PUENTE ALTO',             horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6091, lng: -70.5779 },
  { key: 'p25', codigo: 'PR44', cliente: 'GUSTAVO ADOLFO MOLINA RIOS',           direccion: 'PASAJE LOS CEDROS 88, PUENTE ALTO',           horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6070, lng: -70.5735 },
  { key: 'p26', codigo: 'PR03', cliente: 'PATRICIA ELENA VARGAS LAGOS',          direccion: 'AV. CAMILO HENRIQUEZ 5500, PUENTE ALTO',      horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6118, lng: -70.5796 },
  { key: 'p27', codigo: 'PR32', cliente: 'OSCAR MAURICIO LEON FERNANDEZ',        direccion: 'CALLE LAS ENCINAS 430, PUENTE ALTO',          horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6052, lng: -70.5769 },
  { key: 'p28', codigo: 'PR14', cliente: 'VIVIANA ALEJANDRA BUSTOS ALARCON',     direccion: 'PASAJE LOS ALAMOS 111, PUENTE ALTO',          horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6080, lng: -70.5744 },
  { key: 'p29', codigo: 'PR45', cliente: 'HECTOR RODRIGO PIZARRO VILLALOBOS',    direccion: 'LAS PALMAS 2780, PUENTE ALTO',                horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6103, lng: -70.5758 },
  { key: 'p30', codigo: 'PR01', cliente: 'BEATRIZ SOLEDAD MUÑOZ CONTRERAS',      direccion: 'CALLE SECTOR C 340, PUENTE ALTO',             horario: '08:00 - 21:00', estado: 'pendiente', sincronizado: true,  lat: -33.6068, lng: -70.5782 },
];

const ITEM_HEIGHT = 96;

// Región inicial del mapa (centro de Puente Alto)
const MAP_REGION = {
  latitude: -33.6094,
  longitude: -70.5751,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

// ─── Abrir mapa según preferencia ────────────────────────────────────────────
async function openMapForPedido(pedido: PedidoConEstado) {
  const wazeVal = await SecureStore.getItemAsync('usarWaze');
  const useWaze = wazeVal === 'true';

  if (useWaze) {
    // waze://?ll={lat},{lng}&navigate=yes inicia navegación directamente al punto
    const wazeNative = `waze://?ll=${pedido.lat},${pedido.lng}&navigate=yes`;
    Linking.openURL(wazeNative).catch(() => {
      Linking.openURL(`https://waze.com/ul?ll=${pedido.lat},${pedido.lng}&navigate=yes`)
        .catch(() => Alert.alert('Error', 'No se pudo abrir Waze.'));
    });
  } else {
    // maps.google.com/maps?daddr abre Google Maps con la ruta ya cargada al destino
    Linking.openURL(`https://maps.google.com/maps?daddr=${pedido.lat},${pedido.lng}`)
      .catch(() => Alert.alert('Error', 'No se pudo abrir Google Maps.'));
  }
}

// ─── Item deslizable hacia la derecha ────────────────────────────────────────
function SwipeableItem({ children, onSwipeRight, disabled }: { children: React.ReactNode; onSwipeRight: () => void; disabled?: boolean }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  // El fondo solo aparece cuando hay desplazamiento (evita que se vea en gaps entre items)
  const bgOpacity = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) =>
      !disabledRef.current && Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5 && gs.dx > 0,
    onPanResponderMove: (_, gs) => {
      if (gs.dx > 0) translateX.setValue(Math.min(gs.dx, 90));
    },
    onPanResponderRelease: (_, gs) => {
      if (gs.dx > 60) onSwipeRight();
      Animated.spring(translateX, { toValue: 0, useNativeDriver: false, friction: 8 }).start();
    },
    onPanResponderTerminate: () => {
      Animated.spring(translateX, { toValue: 0, useNativeDriver: false, friction: 8 }).start();
    },
  })).current;

  return (
    <View style={{ overflow: 'hidden', marginBottom: 1 }}>
      {/* Fondo acción — invisible hasta que empieza el swipe */}
      <Animated.View style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 90,
        backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center',
        opacity: bgOpacity,
      }}>
        <Ionicons name="navigate-outline" size={24} color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '600', marginTop: 3 }}>Navegar</Text>
      </Animated.View>
      <Animated.View {...panResponder.panHandlers} style={{ transform: [{ translateX }] }}>
        {children}
      </Animated.View>
    </View>
  );
}

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
export default function EntregasScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [tabActiva, setTabActiva] = useState<'enruta' | 'finalizados'>('enruta');
  const [pendientes, setPendientes] = useState<PedidoConEstado[]>(INIT_PENDIENTES);
  const [finalizados, setFinalizados] = useState<PedidoConEstado[]>(INIT_FINALIZADOS);

  // Procesar pedido confirmado cuando se navega de vuelta desde PedidoScreen
  useEffect(() => {
    const pg = route.params?.pedidoGestionado;
    if (!pg) return;
    setPendientes(prev => {
      const pedido = prev.find(p => p.key === pg.key);
      if (!pedido) return prev;
      setFinalizados(fin => [
        { ...pedido, estado: pg.nuevoEstado, subestado: pg.subestado, evidencias: pg.evidencias },
        ...fin,
      ]);
      setTabActiva('enruta');
      return prev.filter(p => p.key !== pg.key);
    });
  }, [route.params?.pedidoGestionado]);

  // Procesar pedidos gestionados en bulk al volver desde BulkEntregaScreen
  useEffect(() => {
    const bulk = route.params?.pedidosGestionadosBulk;
    if (!bulk || bulk.length === 0) return;
    const bulkMap = new Map(bulk.map(b => [b.key, b]));
    setPendientes(prev => {
      const aFinalizar = prev.filter(p => bulkMap.has(p.key));
      if (aFinalizar.length === 0) return prev;
      setFinalizados(fin => [
        ...aFinalizar.map(p => {
          const b = bulkMap.get(p.key)!;
          return { ...p, estado: b.nuevoEstado, evidencias: b.evidencias };
        }),
        ...fin,
      ]);
      setModoSeleccion(false);
      setSeleccionados(new Set());
      return prev.filter(p => !bulkMap.has(p.key));
    });
  }, [route.params?.pedidosGestionadosBulk]);

  const [drawerOpen, setDrawerOpen] = useState(false);

  // ── Selección bulk ───────────────────────────────────────────────────────────
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  const toggleModoSeleccion = () => {
    setModoSeleccion(prev => !prev);
    setSeleccionados(new Set());
  };

  const toggleSeleccion = (key: string) => {
    setSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // ── Finalizar ruta ───────────────────────────────────────────────────────────
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [sincronizadoCompleto, setSincronizadoCompleto] = useState(false);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleIniciarSincronizacion = () => {
    setModalFinalizar(true);
    setProgreso(0);
    setSincronizadoCompleto(false);
    let p = 0;
    intervaloRef.current = setInterval(() => {
      p += 2;
      setProgreso(p);
      if (p >= 100) {
        if (intervaloRef.current) clearInterval(intervaloRef.current);
        setSincronizadoCompleto(true);
      }
    }, 50); // 50ms × 50 pasos = 2.5 segundos
  };

  const handleFinalizarRuta = () => {
    setModalFinalizar(false);
    (navigation as any).popTo('Home', { rutaFinalizada: true });
  };

  // ── Búsqueda ─────────────────────────────────────────────────────────────────
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Mapa ─────────────────────────────────────────────────────────────────────
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<PedidoConEstado | null>(null);
  const mapRef = useRef<MapView>(null);

  // ── Cámara / Escáner ─────────────────────────────────────────────────────────
  const [cameraVisible, setCameraVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const scannedRef = useRef(false);

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

  // ── Centrar en ubicación actual ──────────────────────────────────────────────
  const handleLocateMe = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación para centrar el mapa.');
      return;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    mapRef.current?.animateToRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    }, 500);
  };

  // ── Lista activa con filtro ───────────────────────────────────────────────────
  const listaBase = tabActiva === 'enruta' ? pendientes : finalizados;
  const listaActiva = searchQuery.trim()
    ? listaBase.filter(p => p.codigo.toLowerCase().includes(searchQuery.toLowerCase()))
    : listaBase;

  // ── Abrir cámara ─────────────────────────────────────────────────────────────
  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      Alert.alert(
        'Acceso a la cámara',
        'Se necesita acceso a la cámara para escanear el código de barras del pedido físico.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Permitir',
            onPress: async () => {
              const result = await requestPermission();
              if (!result.granted) {
                Alert.alert(
                  'Permiso denegado',
                  'Sin acceso a la cámara no es posible escanear códigos de barras. Puedes activarlo desde los ajustes del teléfono.'
                );
                return;
              }
              scannedRef.current = false;
              setCameraVisible(true);
            },
          },
        ]
      );
      return;
    }
    scannedRef.current = false;
    setCameraVisible(true);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scannedRef.current) return;
    scannedRef.current = true;
    setCameraVisible(false);
    setSearchQuery(data);
    setSearchVisible(true);
  };

  // ── Toggle búsqueda ──────────────────────────────────────────────────────────
  const handleToggleSearch = () => {
    if (searchVisible) {
      setSearchVisible(false);
      setSearchQuery('');
    } else {
      setSearchVisible(true);
    }
  };

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
        <TouchableOpacity
          onPress={() => setDrawerOpen(true)}
          style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
        >
          <View style={{ gap: 5 }}>
            {[0, 1, 2].map(i => (
              <View key={i} style={{ width: 22, height: 2, borderRadius: 1, backgroundColor: colors.text }} />
            ))}
          </View>
        </TouchableOpacity>

        {/* Iconos de acción */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Lupa */}
          <TouchableOpacity
            onPress={handleToggleSearch}
            style={{ minWidth: 40, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
          >
            <Ionicons
              name={searchVisible ? 'search' : 'search-outline'}
              size={22}
              color={searchVisible ? colors.warning : colors.text}
            />
          </TouchableOpacity>

          {/* Actualizar */}
          <TouchableOpacity style={{ minWidth: 40, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="refresh-outline" size={22} color={colors.text} />
          </TouchableOpacity>

          {/* Mapa */}
          <TouchableOpacity
            onPress={() => setMapVisible(true)}
            style={{ minWidth: 40, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
          >
            <Ionicons name="map-outline" size={22} color={colors.text} />
          </TouchableOpacity>

          {/* Selección bulk */}
          <TouchableOpacity
            onPress={modoSeleccion && seleccionados.size > 0
              ? () => {
                  const pedidosSeleccionados = pendientes.filter(p => seleccionados.has(p.key));
                  navigation.navigate('BulkEntrega', { pedidos: pedidosSeleccionados });
                }
              : toggleModoSeleccion
            }
            style={{ minWidth: 40, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
          >
            <Ionicons
              name={
                modoSeleccion && seleccionados.size > 0
                  ? 'arrow-forward-circle-outline'
                  : modoSeleccion
                  ? 'close-circle-outline'
                  : 'checkbox-outline'
              }
              size={22}
              color={modoSeleccion ? colors.warning : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Barra de búsqueda ───────────────────────────────────────────────── */}
      {searchVisible && (
        <View style={{
          backgroundColor: '#FFFFFF',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        }}>
          {/* Ícono de cámara */}
          <TouchableOpacity
            onPress={handleOpenCamera}
            style={{ padding: 6, marginRight: 8 }}
          >
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
          </TouchableOpacity>

          {/* Campo de texto */}
          <TextInput
            style={{
              flex: 1,
              fontSize: 15,
              color: '#1F2937',
              paddingVertical: 6,
              paddingHorizontal: 4,
            }}
            placeholder="Buscar ID de pedido..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            autoCapitalize="characters"
            returnKeyType="search"
          />

          {/* Limpiar */}
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 6 }}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Lista ───────────────────────────────────────────────────────────── */}
      <ScrollView style={{ flex: 1, backgroundColor: '#F3F4F6' }} scrollEnabled={scrollEnabled}>

        {/* Estado vacío: sin resultados de búsqueda */}
        {listaActiva.length === 0 && searchQuery.trim().length > 0 && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Ionicons name="search-outline" size={40} color="#D1D5DB" />
            <Text style={{ color: '#9CA3AF', marginTop: 12, fontSize: 14 }}>
              Sin resultados para "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Estado vacío: todos los pedidos gestionados */}
        {pendientes.length === 0 && tabActiva === 'enruta' && !searchQuery.trim() && (
          <View style={{ flex: 1, alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 }}>
            <Ionicons name="checkmark-done-circle-outline" size={80} color={colors.primary} style={{ opacity: 0.25 }} />
            <Text style={{
              fontSize: 20,
              fontWeight: '700',
              color: '#1F2937',
              textAlign: 'center',
              marginTop: 24,
              lineHeight: 28,
            }}>
              ¡Completaste todos{'\n'}los despachos!
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#6B7280',
              textAlign: 'center',
              marginTop: 10,
              lineHeight: 20,
            }}>
              Puedes finalizar la ruta para sincronizar los resultados con el servidor.
            </Text>
            <TouchableOpacity
              onPress={handleIniciarSincronizacion}
              style={{
                marginTop: 32,
                backgroundColor: colors.warning,
                borderRadius: 12,
                paddingVertical: 15,
                paddingHorizontal: 40,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 }}>
                Finalizar ruta
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {listaActiva.map((item, index) => {
          const isActive = tabActiva === 'enruta' && activeIndex === index;
          const isHover  = tabActiva === 'enruta' && hoverIndex === index && !isActive;
          const leftColor = ESTADO_COLOR[item.estado];

          return (
            <SwipeableItem key={item.key} onSwipeRight={() => openMapForPedido(item)} disabled={modoSeleccion}>
            <Animated.View
              style={{
                backgroundColor: '#FFFFFF',
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
              {/* Checkbox bulk (solo En Ruta en modo selección) */}
              {modoSeleccion && tabActiva === 'enruta' && (
                <TouchableOpacity
                  onPress={() => toggleSeleccion(item.key)}
                  style={{ paddingHorizontal: 12, justifyContent: 'center', alignSelf: 'stretch' }}
                >
                  <Ionicons
                    name={seleccionados.has(item.key) ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={seleccionados.has(item.key) ? colors.primary : '#9CA3AF'}
                  />
                </TouchableOpacity>
              )}

              {/* Contenido */}
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 12, paddingLeft: modoSeleccion && tabActiva === 'enruta' ? 4 : 12, paddingRight: 4 }}
                onPress={() => {
                  if (modoSeleccion && tabActiva === 'enruta') {
                    toggleSeleccion(item.key);
                  } else {
                    navigation.navigate('Pedido', {
                      pedido: item,
                      formularioCompletado: tabActiva === 'finalizados' ? true : undefined,
                      modoEdicion: tabActiva === 'finalizados' ? true : undefined,
                    });
                  }
                }}
                activeOpacity={0.7}
              >

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
              </TouchableOpacity>

              {/* Handle de arrastre (solo pendientes, fuera de modo selección) */}
              {item.estado === 'pendiente' && !modoSeleccion && (
                <DragHandle
                  index={index}
                  isActive={isActive}
                  onStart={handleDragStart}
                  onMove={handleDragMove}
                  onEnd={handleDragEnd}
                />
              )}
            </Animated.View>
            </SwipeableItem>
          );
        })}
      </ScrollView>

      <DrawerMenu
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />

      {/* ── Footer tabs ─────────────────────────────────────────────────────── */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: '#1F2937',
        borderTopWidth: 1,
        borderTopColor: '#374151',
        paddingBottom: insets.bottom || 8,
      }}>
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

        <View style={{ width: 1, backgroundColor: '#374151', marginVertical: 8 }} />

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

      {/* ── Modal: Mapa ─────────────────────────────────────────────────────── */}
      <Modal
        visible={mapVisible}
        animationType="slide"
        onRequestClose={() => { setMapVisible(false); setSelectedPedido(null); }}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }} edges={['top']}>
          {/* Header del mapa */}
          <View style={{
            backgroundColor: colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}>
            <TouchableOpacity
              onPress={() => { setMapVisible(false); setSelectedPedido(null); }}
              style={{ minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{
              flex: 1,
              fontSize: 17,
              fontWeight: '600',
              color: colors.text,
              marginLeft: 8,
            }}>
              Puntos en Ruta ({pendientes.length})
            </Text>
          </View>

          {/* Contenedor mapa + controles */}
          <View style={{ flex: 1 }}>
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
              initialRegion={MAP_REGION}
              showsUserLocation
              onPress={() => setSelectedPedido(null)}
            >
              {pendientes.map((item) => (
                <Marker
                  key={item.key}
                  coordinate={{ latitude: item.lat, longitude: item.lng }}
                  onPress={(e) => { e.stopPropagation(); setSelectedPedido(item); }}
                />
              ))}
            </MapView>

            {/* Botón: centrar en ubicación actual */}
            <TouchableOpacity
              onPress={handleLocateMe}
              style={{
                position: 'absolute',
                right: 16,
                bottom: selectedPedido ? 176 : 24,
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#FFFFFF',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
              }}
            >
              <Ionicons name="locate" size={24} color={colors.primary} />
            </TouchableOpacity>

            {/* Tarjeta info del pedido seleccionado */}
            {selectedPedido && (
              <View style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: '#FFFFFF',
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: insets.bottom || 20,
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
              }}>
                {/* Línea indicadora */}
                <View style={{
                  width: 36, height: 4, borderRadius: 2,
                  backgroundColor: '#D1D5DB',
                  alignSelf: 'center',
                  marginBottom: 14,
                }} />

                {/* Código + cerrar */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 22, fontWeight: 'bold', color: colors.warning, flex: 1 }}>
                    {selectedPedido.codigo}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedPedido(null)} style={{ padding: 4 }}>
                    <Ionicons name="close" size={22} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Dirección */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
                  <Ionicons name="location-outline" size={16} color="#3B82F6" style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={{ fontSize: 14, color: '#374151', flex: 1, lineHeight: 20 }}>
                    {selectedPedido.direccion}
                  </Text>
                </View>

                {/* Cliente */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="person-outline" size={16} color="#6B7280" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 14, color: '#6B7280', flex: 1 }}>
                    {selectedPedido.cliente}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── Modal: Cámara / Escáner ──────────────────────────────────────────── */}
      <Modal
        visible={cameraVisible}
        animationType="fade"
        onRequestClose={() => setCameraVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['code128', 'code39', 'ean13', 'ean8', 'qr', 'pdf417'],
            }}
            onBarcodeScanned={handleBarcodeScanned}
          />

          {/* Overlay con marco de escaneo */}
          <View style={styles.scanOverlay}>
            {/* Zona superior oscura */}
            <View style={styles.scanDark} />

            {/* Zona central con marco */}
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.scanDarkSide} />
              <View style={styles.scanFrame}>
                {/* Esquinas del marco */}
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
              </View>
              <View style={styles.scanDarkSide} />
            </View>

            {/* Zona inferior oscura */}
            <View style={styles.scanDark} />
          </View>

          {/* Texto + botón cancelar */}
          <View style={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}>
            <Text style={{ color: '#FFF', fontSize: 14, marginBottom: 24, opacity: 0.85 }}>
              Apunta al código de barras del pedido
            </Text>
            <TouchableOpacity
              onPress={() => setCameraVisible(false)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                paddingHorizontal: 32,
                paddingVertical: 12,
                borderRadius: 24,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.4)',
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Modal: Finalizar ruta ────────────────────────────────────────────── */}
      <Modal
        visible={modalFinalizar}
        transparent
        animationType="fade"
        onRequestClose={() => !sincronizadoCompleto && setModalFinalizar(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.55)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}>
          <View style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            width: '100%',
            padding: 28,
            alignItems: 'center',
          }}>
            {!sincronizadoCompleto ? (
              <>
                <Ionicons name="cloud-upload-outline" size={48} color={colors.primary} style={{ marginBottom: 16 }} />
                <Text style={{ fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 6 }}>
                  Sincronizando ruta
                </Text>
                <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 24, textAlign: 'center' }}>
                  Enviando {finalizados.length} gestiones al servidor…
                </Text>
                {/* Barra de progreso */}
                <View style={{
                  width: '100%',
                  height: 10,
                  backgroundColor: '#E5E7EB',
                  borderRadius: 5,
                  overflow: 'hidden',
                  marginBottom: 10,
                }}>
                  <View style={{
                    width: `${progreso}%`,
                    height: '100%',
                    backgroundColor: colors.primary,
                    borderRadius: 5,
                  }} />
                </View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                  {progreso}%
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={56} color="#10B981" style={{ marginBottom: 16 }} />
                <Text style={{ fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 6 }}>
                  ¡Sincronización completa!
                </Text>
                <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 28, textAlign: 'center' }}>
                  Todos los datos han sido enviados correctamente.
                </Text>
                <TouchableOpacity
                  onPress={handleFinalizarRuta}
                  style={{
                    backgroundColor: colors.warning,
                    borderRadius: 10,
                    paddingVertical: 14,
                    paddingHorizontal: 40,
                    width: '100%',
                    alignItems: 'center',
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                    Finalizar ruta
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─── Estilos del escáner ──────────────────────────────────────────────────────
const FRAME_SIZE = 240;

const styles = StyleSheet.create({
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  scanDark: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  scanDarkSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#FACC15',
    borderWidth: 3,
  },
  cornerTL: { top: 0,    left: 0,    borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0,    right: 0,   borderLeftWidth: 0,  borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0,    borderRightWidth: 0, borderTopWidth: 0    },
  cornerBR: { bottom: 0, right: 0,   borderLeftWidth: 0,  borderTopWidth: 0    },
});
