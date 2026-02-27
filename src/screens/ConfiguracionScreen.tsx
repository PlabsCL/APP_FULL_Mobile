import React, { useState, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors } from '../constants/colors';
import { RootStackParamList } from './RutasDisponiblesScreen';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Configuracion'>;
};

// ─── Checkbox ─────────────────────────────────────────────────────────────────
function Checkbox({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity onPress={onToggle} style={{ padding: 4 }}>
      <View style={{
        width: 24, height: 24,
        borderWidth: 2,
        borderColor: value ? colors.warning : '#9CA3AF',
        backgroundColor: value ? colors.warning : 'transparent',
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {value && (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Fila con toggle ──────────────────────────────────────────────────────────
function ToggleRow({
  label, description, value, onToggle,
}: { label: string; description?: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
      backgroundColor: '#FFFFFF',
    }}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ fontSize: 15, color: '#1F2937', fontWeight: '500' }}>{label}</Text>
        {description && (
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{description}</Text>
        )}
      </View>
      <Checkbox value={value} onToggle={onToggle} />
    </View>
  );
}

// ─── Fila informativa (solo lectura) ──────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
      backgroundColor: '#FFFFFF',
    }}>
      <Text style={{ fontSize: 15, color: '#1F2937', fontWeight: '500' }}>{label}</Text>
      <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{value}</Text>
    </View>
  );
}

// ─── Fila accionable ──────────────────────────────────────────────────────────
function ActionRow({ label, description, onPress }: { label: string; description?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
      }}
    >
      <Text style={{ fontSize: 15, color: '#1F2937', fontWeight: '500' }}>{label}</Text>
      {description && (
        <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{description}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Fila con input de texto ──────────────────────────────────────────────────
function InputRow({
  label, description, value, onChangeText, placeholder,
}: { label: string; description?: string; value: string; onChangeText: (t: string) => void; placeholder?: string }) {
  return (
    <View style={{
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
      backgroundColor: '#FFFFFF',
    }}>
      <Text style={{ fontSize: 15, color: '#1F2937', fontWeight: '500' }}>{label}</Text>
      {description && (
        <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{description}</Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={{
          marginTop: 8,
          backgroundColor: '#F3F4F6',
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 14,
          color: '#1F2937',
        }}
      />
    </View>
  );
}

// ─── Encabezado de sección ────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.warning }}>{title}</Text>
    </View>
  );
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function ConfiguracionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  const [settings, setSettings] = useState({
    guiasAlfanumericas: false,
    codigosBarra: true,
    cerosIzquierda: true,
    usarWaze: true,
    escanearAutomatico: false,
    habilitarNotificaciones: true,
    sonido: true,
    vibrar: true,
    notificarDespachos: true,
  });

  const [direccionInicio, setDireccionInicio] = useState('');

  useEffect(() => {
    SecureStore.getItemAsync('usarWaze').then(val => {
      if (val !== null) setSettings(prev => ({ ...prev, usarWaze: val === 'true' }));
    });
    SecureStore.getItemAsync('direccionInicio').then(val => {
      if (val !== null) setDireccionInicio(val);
    });
    SecureStore.getItemAsync('inicioLat').then(val => {
      if (val !== null) setGeocodeStatus('ok');
    });
  }, []);

  const [geocodeStatus, setGeocodeStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const geocodificar = async (direccion: string) => {
    if (!direccion.trim()) {
      setGeocodeStatus('idle');
      return;
    }
    setGeocodeStatus('loading');
    try {
      const results = await Location.geocodeAsync(direccion);
      if (results.length > 0) {
        await SecureStore.setItemAsync('inicioLat', String(results[0].latitude));
        await SecureStore.setItemAsync('inicioLng', String(results[0].longitude));
        setGeocodeStatus('ok');
      } else {
        setGeocodeStatus('error');
      }
    } catch {
      setGeocodeStatus('error');
    }
  };

  const handleDireccionChange = (text: string) => {
    setDireccionInicio(text);
    SecureStore.setItemAsync('direccionInicio', text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => geocodificar(text), 1200);
  };

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === 'usarWaze') SecureStore.setItemAsync('usarWaze', String(next.usarWaze));
      return next;
    });
  };

  const horaLocal = new Date().toLocaleString('es-CL', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }) + ' GMT-03:00';

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
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: 'bold', marginLeft: 4 }}>
          Configuración
        </Text>
      </View>

      {/* ── Contenido ───────────────────────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom || 16 }}
      >
        {/* Nombre de usuario */}
        <InfoRow label="Nombre de Usuario" value="Pablo Lara" />

        {/* Toggles generales */}
        <ToggleRow
          label="Guías alfanuméricas"
          description="Permitir letras y números en guías y despachos"
          value={settings.guiasAlfanumericas}
          onToggle={() => toggle('guiasAlfanumericas')}
        />
        <ToggleRow
          label="Códigos de barra"
          description="Permitir escaneo de códigos de barra"
          value={settings.codigosBarra}
          onToggle={() => toggle('codigosBarra')}
        />
        <ToggleRow
          label="Ceros a la izquierda"
          description="Ignorar ceros a la izquierda en códigos de barra"
          value={settings.cerosIzquierda}
          onToggle={() => toggle('cerosIzquierda')}
        />
        <ToggleRow
          label="Usar Waze para direcciones"
          value={settings.usarWaze}
          onToggle={() => toggle('usarWaze')}
        />
        <ToggleRow
          label="Escanear automático"
          value={settings.escanearAutomatico}
          onToggle={() => toggle('escanearAutomatico')}
        />

        {/* Inicio de ruta */}
        <SectionHeader title="Inicio de ruta" />
        <InputRow
          label="Dirección de salida"
          description="Desde donde parte el transportista para optimizar la ruta"
          value={direccionInicio}
          onChangeText={handleDireccionChange}
          placeholder="Ej: Av. Concha y Toro 100, Puente Alto"
        />
        {geocodeStatus !== 'idle' && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 6,
            paddingHorizontal: 16, paddingVertical: 8,
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
          }}>
            <Ionicons
              name={geocodeStatus === 'loading' ? 'hourglass-outline' : geocodeStatus === 'ok' ? 'checkmark-circle' : 'alert-circle'}
              size={16}
              color={geocodeStatus === 'loading' ? '#6B7280' : geocodeStatus === 'ok' ? '#10B981' : '#EF4444'}
            />
            <Text style={{
              fontSize: 12,
              color: geocodeStatus === 'loading' ? '#6B7280' : geocodeStatus === 'ok' ? '#10B981' : '#EF4444',
            }}>
              {geocodeStatus === 'loading' ? 'Buscando coordenadas…' : geocodeStatus === 'ok' ? 'Ubicación encontrada' : 'No se encontró la dirección'}
            </Text>
          </View>
        )}

        {/* Actualización */}
        <SectionHeader title="Actualización" />
        <ActionRow
          label="Sincronizar datos"
          description="Actualiza formularios, subestados, entre otros."
        />

        {/* Notificaciones del equipo */}
        <SectionHeader title="Notificaciones del equipo" />
        <ToggleRow
          label="Habilitar notificaciones"
          value={settings.habilitarNotificaciones}
          onToggle={() => toggle('habilitarNotificaciones')}
        />
        <ToggleRow
          label="Sonido"
          value={settings.sonido}
          onToggle={() => toggle('sonido')}
        />
        <ToggleRow
          label="Vibrar"
          value={settings.vibrar}
          onToggle={() => toggle('vibrar')}
        />
        <ToggleRow
          label="Notificar nuevos despachos"
          value={settings.notificarDespachos}
          onToggle={() => toggle('notificarDespachos')}
        />

        {/* Acerca de */}
        <SectionHeader title="Acerca de" />
        <InfoRow label="Versión" value="3.5.61 / 487" />
        <InfoRow label="SDK" value="36 / 16" />
        <InfoRow label="Conexión servidor" value="OK 2026-02-11T13:02:31.369Z (999 ms)" />
        <InfoRow label="Hora local" value={horaLocal} />
        <InfoRow
          label="Llave de sesión"
          value="bf3206722cefbf3a1984923e4a8edc89a162d6352b6126e85d7c7f3b6f7fe02"
        />
      </ScrollView>

    </SafeAreaView>
  );
}
