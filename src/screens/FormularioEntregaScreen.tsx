import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { RootStackParamList } from './RutasDisponiblesScreen';
import { EstadoPedido } from '../types/pedido';

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'FormularioEntrega'>;
  route: RouteProp<RootStackParamList, 'FormularioEntrega'>;
}

const ESTADO_LABEL: Partial<Record<EstadoPedido, string>> = {
  entregado:       'Entregado',
  no_entregado:    'No Entregado',
  entrega_parcial: 'Entrega parcial',
};

const MAX_FOTOS = 10;
const THUMB_SIZE = 90;

// Color de acento según estado
function colorDeEstado(estado: EstadoPedido): string {
  if (estado === 'entregado')      return '#10B981';
  if (estado === 'entrega_parcial') return '#F59E0B';
  if (estado === 'no_entregado')   return '#EF4444';
  return '#F59E0B'; // fallback
}

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function FormularioEntregaScreen({ navigation, route }: Props) {
  const { estado, subestado: subestadoInicial, pedidoCodigo, pedido, bulkPedidos, returnScreen, evidenciasIniciales } = route.params;
  const insets = useSafeAreaInsets();
  const colorActivo = colorDeEstado(estado);

  const [paso, setPaso] = useState(1);
  const [comentarios, setComentarios]   = useState(evidenciasIniciales?.comentarios ?? '');
  const [fotosLugar, setFotosLugar]     = useState<string[]>(evidenciasIniciales?.fotosLugar ?? []);
  const [inputFocused, setInputFocused] = useState(false);

  // ─── Lógica de avance ─────────────────────────────────────────────────────
  const puedeAvanzar =
    paso === 1 ? comentarios.trim().length > 0 :
    fotosLugar.length > 0;

  const handleAnterior = () => {
    if (paso === 1) {
      navigation.goBack();
    } else {
      setPaso(paso - 1);
      setInputFocused(false);
    }
  };

  const handleSiguiente = () => {
    if (!puedeAvanzar) return;
    if (paso < 2) {
      setPaso(paso + 1);
      setInputFocused(false);
    } else {
      // Paso 2 completado → volver a la pantalla origen con evidencias
      if (returnScreen === 'BulkGestion') {
        navigation.navigate('BulkGestion', {
          pedidos: bulkPedidos!,
          formularioCompletado: true,
          estadoRetorno: estado,
          subestadoRetorno: subestadoInicial ?? null,
          evidenciasRetorno: { comentarios, fotosLugar },
        });
      } else {
        navigation.navigate('Pedido', {
          pedido: pedido!,
          formularioCompletado: true,
          estadoRetorno: estado,
          subestadoRetorno: subestadoInicial ?? null,
          evidenciasRetorno: { comentarios, fotosLugar },
        });
      }
    }
  };

  // ─── Cámara ───────────────────────────────────────────────────────────────
  const abrirCamara = async () => {
    if (fotosLugar.length >= MAX_FOTOS) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara para tomar fotos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setFotosLugar(prev => [...prev, result.assets[0].uri]);
    }
  };

  const eliminarFotoLugar = (index: number) => {
    setFotosLugar(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Render de pasos ──────────────────────────────────────────────────────
  const renderPaso = () => {
    const labelEstado = (
      <Text style={{ fontSize: 13, color: colorActivo, fontWeight: '600', marginBottom: 4 }}>
        {ESTADO_LABEL[estado] ?? estado}
      </Text>
    );

    // Paso 1: Comentarios
    if (paso === 1) {
      return (
        <>
          {labelEstado}
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
            Comentarios
          </Text>
          <TextInput
            value={comentarios}
            onChangeText={setComentarios}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Agrega un comentario sobre la entrega…"
            placeholderTextColor="#9CA3AF"
            autoFocus
            multiline
            numberOfLines={4}
            underlineColorAndroid="transparent"
            cursorColor={colorActivo}
            selectionColor={colorActivo}
            style={{
              fontSize: 16,
              color: '#1F2937',
              borderWidth: 1.5,
              borderColor: inputFocused || comentarios ? colorActivo : '#E5E7EB',
              borderRadius: 8,
              paddingVertical: 12,
              paddingHorizontal: 12,
              minHeight: 100,
              textAlignVertical: 'top',
            }}
          />
        </>
      );
    }

    // Paso 2: Fotografía del lugar
    return (
      <>
        {labelEstado}
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
          Fotografía de Lugar
        </Text>

        <TouchableOpacity
          onPress={abrirCamara}
          disabled={fotosLugar.length >= MAX_FOTOS}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: fotosLugar.length < MAX_FOTOS ? colorActivo : '#E5E7EB',
            paddingVertical: 14,
            alignItems: 'center',
            marginBottom: 20,
            opacity: fotosLugar.length < MAX_FOTOS ? 1 : 0.4,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: fotosLugar.length < MAX_FOTOS ? colorActivo : '#9CA3AF' }}>
            Abrir cámara
          </Text>
        </TouchableOpacity>

        {fotosLugar.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {fotosLugar.map((uri, index) => (
              <View key={index} style={{ width: THUMB_SIZE, height: THUMB_SIZE }}>
                <Image
                  source={{ uri }}
                  style={{ width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 8 }}
                />
                <TouchableOpacity
                  onPress={() => eliminarFotoLugar(index)}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    backgroundColor: colorActivo,
                    borderRadius: 12,
                    width: 22,
                    height: 22,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="close" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <Text style={{ fontSize: 15, color: '#6B7280', textAlign: 'center' }}>
          Imágenes a enviar: {fotosLugar.length} / {MAX_FOTOS}
        </Text>
      </>
    );
  };

  // ─── Estilos de botones ───────────────────────────────────────────────────
  const btnStyle = (activo: boolean) => ({
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: activo ? colorActivo : '#E5E7EB',
    opacity: activo ? 1 : 0.4,
  });

  const btnTextStyle = (activo: boolean) => ({
    fontSize: 17,
    fontWeight: '700' as const,
    color: activo ? colorActivo : '#9CA3AF',
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }} edges={['top']}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ minWidth: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginLeft: 4 }}>
          Formulario
        </Text>
      </View>

      {/* ── KAV: empuja el footer sobre el teclado ───────────────────────────── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: '#F3F4F6' }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ padding: 16 }}>
            {renderPaso()}
          </View>
        </ScrollView>

        {/* ── Footer: Anterior + Siguiente ────────────────────────────────── */}
        <View style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: insets.bottom || 12,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          flexDirection: 'row',
          gap: 12,
        }}>
          <TouchableOpacity onPress={handleAnterior} style={btnStyle(true)}>
            <Text style={btnTextStyle(true)}>Anterior</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSiguiente}
            disabled={!puedeAvanzar}
            style={btnStyle(puedeAvanzar)}
          >
            <Text style={btnTextStyle(puedeAvanzar)}>Siguiente</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
