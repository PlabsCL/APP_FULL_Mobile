import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const DRAWER_WIDTH = Dimensions.get('window').width * 0.75;
const DRIVER_NAME = 'Pablo Lara';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: { navigate: (screen: any, params?: any) => void };
}

// ─── Ítem del drawer ──────────────────────────────────────────────────────────
function DrawerItem({ label, iconName, onPress }: {
  label: string;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
}) {
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

// ─── Drawer ───────────────────────────────────────────────────────────────────
export default function DrawerMenu({ isOpen, onClose, navigation }: DrawerMenuProps) {
  const translateX     = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      Animated.parallel([
        Animated.timing(translateX,      { toValue: 0,            duration: 280, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 1,            duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX,      { toValue: -DRAWER_WIDTH, duration: 240, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0,             duration: 240, useNativeDriver: true }),
      ]).start(() => setVisible(false));
    }
  }, [isOpen]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
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
        {/* Cabecera */}
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
            {DRIVER_NAME}
          </Text>
        </View>

        {/* Ítems */}
        <View style={{ flex: 1, paddingTop: 8 }}>
          <DrawerItem label="Perfil"        iconName="person-outline"    onPress={onClose} />
          <DrawerItem label="Chat"          iconName="chatbubble-outline" onPress={onClose} />

          <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 8, marginHorizontal: 16 }} />

          <DrawerItem
            label="Configuración"
            iconName="settings-outline"
            onPress={() => { navigation.navigate('Configuracion'); onClose(); }}
          />
          <DrawerItem label="Cerrar sesión" iconName="log-out-outline" onPress={onClose} />
        </View>
      </Animated.View>
    </>
  );
}
