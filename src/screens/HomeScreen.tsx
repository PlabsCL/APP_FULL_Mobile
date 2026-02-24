import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../constants/colors';
import { RootStackParamList } from './RutasDisponiblesScreen';

const driverName = 'Pablo Lara';
const DRAWER_WIDTH = Dimensions.get('window').width * 0.75;

interface HomeScreenProps {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
}

// ─── Drawer item ──────────────────────────────────────────────────────────────
function DrawerItem({ label, iconName, onPress }: { label: string; iconName: React.ComponentProps<typeof Ionicons>['name']; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 }}
    >
      <Ionicons name={iconName} size={20} color="#374151" style={{ marginRight: 16 }} />
      <Text style={{ fontSize: 15, color: '#1F2937', fontWeight: '500' }}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }: HomeScreenProps) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [drawerVisible, setDrawerVisible] = useState(false);

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start(() => setDrawerVisible(false));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* ── Header con hamburguesa ─────────────────────────────────────────── */}
      <View style={{ alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 4 }}>
        <TouchableOpacity style={{ padding: 8 }} onPress={openDrawer}>
          <View style={{ width: 24, height: 2, backgroundColor: colors.text, marginBottom: 5 }} />
          <View style={{ width: 24, height: 2, backgroundColor: colors.text, marginBottom: 5 }} />
          <View style={{ width: 24, height: 2, backgroundColor: colors.text }} />
        </TouchableOpacity>
      </View>

      {/* ── Contenido principal ───────────────────────────────────────────── */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 48 }}>

        {/* Logo */}
        <View style={{
          width: 96, height: 96, borderRadius: 48,
          borderWidth: 4, borderColor: colors.primary,
          justifyContent: 'center', alignItems: 'center',
          marginBottom: 32,
        }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.primary }}>FA</Text>
        </View>

        {/* Título */}
        <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.text, marginBottom: 8, textAlign: 'center' }}>
          FULL APP
        </Text>

        {/* Nombre conductor */}
        <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 48, textAlign: 'center' }}>
          {driverName}
        </Text>

        {/* Botón Rutas */}
        <TouchableOpacity
          onPress={() => navigation.navigate('RutasDisponibles')}
          style={{ width: '100%', minHeight: 56, backgroundColor: colors.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
            Rutas Disponibles
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <View style={{ alignItems: 'center', paddingBottom: 8 }}>
        <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: '600' }}>FULL APP</Text>
      </View>

      {/* ── Drawer ───────────────────────────────────────────────────────── */}
      {drawerVisible && (
        <>
          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <Animated.View style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              opacity: backdropOpacity,
            }} />
          </TouchableWithoutFeedback>

          {/* Panel lateral */}
          <Animated.View style={{
            position: 'absolute', top: 0, bottom: 0, left: 0,
            width: DRAWER_WIDTH,
            backgroundColor: '#FFFFFF',
            transform: [{ translateX }],
            shadowColor: '#000',
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 16,
          }}>
            {/* Cabecera del drawer */}
            <View style={{
              backgroundColor: colors.primary,
              paddingTop: 48,
              paddingBottom: 20,
              paddingHorizontal: 20,
            }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                FULL APP
              </Text>
              <Text style={{ color: colors.text, fontSize: 14, opacity: 0.85 }}>
                {driverName}
              </Text>
            </View>

            {/* Ítems del menú */}
            <View style={{ flex: 1, paddingTop: 8 }}>
              <DrawerItem label="Perfil"         iconName="person-outline"     onPress={closeDrawer} />
              <DrawerItem label="Chat"           iconName="chatbubble-outline"  onPress={closeDrawer} />

              <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 8, marginHorizontal: 16 }} />

              <DrawerItem label="Configuración"  iconName="settings-outline"   onPress={() => navigation.navigate('Configuracion')} />
              <DrawerItem label="Cerrar sesión"  iconName="log-out-outline"    onPress={closeDrawer} />
            </View>
          </Animated.View>
        </>
      )}

    </SafeAreaView>
  );
}
