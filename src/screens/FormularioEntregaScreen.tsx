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

// ─── Pantalla ─────────────────────────────────────────────────────────────────
export default function FormularioEntregaScreen({ navigation, route }: Props) {
  const { estado, subestado: subestadoInicial, pedidoCodigo, pedido } = route.params;
  const insets = useSafeAreaInsets();

  const [paso, setPaso] = useState(1);
  const [nombreReceptor, setNombreReceptor] = useState('');
  const [rutReceptor, setRutReceptor]       = useState('');
  const [metodoPago, setMetodoPago]         = useState('');
  const [fotos, setFotos]                   = useState<string[]>([]);
  const [fotosLugar, setFotosLugar]         = useState<string[]>([]);
  const [fotosPOD, setFotosPOD]             = useState<string[]>([]);
  const [inputFocused, setInputFocused]     = useState(false);

  // ─── Lógica de avance ─────────────────────────────────────────────────────
  const puedeAvanzar =
    paso === 1 ? nombreReceptor.trim().length > 0 :
    paso === 2 ? rutReceptor.trim().length > 0 :
    paso === 3 ? fotos.length > 0 :
    paso === 4 ? fotosLugar.length > 0 :
    paso === 5 ? fotosPOD.length > 0 :
    metodoPago.trim().length > 0;

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
    if (paso < 6) {
      setPaso(paso + 1);
      setInputFocused(false);
    } else {
      // Paso 6 completado → volver a PedidoScreen restaurando estado y subestado
      navigation.navigate('Pedido', {
        pedido,
        formularioCompletado: true,
        estadoRetorno: estado,
        subestadoRetorno: subestadoInicial ?? null,
      });
    }
  };

  // ─── Cámara ───────────────────────────────────────────────────────────────
  const abrirCamara = async () => {
    const arrayActual = paso === 3 ? fotos : paso === 4 ? fotosLugar : fotosPOD;
    if (arrayActual.length >= MAX_FOTOS) return;

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
      const uri = result.assets[0].uri;
      if (paso === 3) {
        setFotos(prev => [...prev, uri]);
      } else if (paso === 4) {
        setFotosLugar(prev => [...prev, uri]);
      } else {
        setFotosPOD(prev => [...prev, uri]);
      }
    }
  };

  const eliminarFoto = (index: number) => {
    setFotos(prev => prev.filter((_, i) => i !== index));
  };

  const eliminarFotoLugar = (index: number) => {
    setFotosLugar(prev => prev.filter((_, i) => i !== index));
  };

  const eliminarFotoPOD = (index: number) => {
    setFotosPOD(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Render de pasos ──────────────────────────────────────────────────────
  const renderPaso = () => {
    const labelEstado = (
      <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
        {ESTADO_LABEL[estado] ?? estado}
      </Text>
    );

    if (paso === 1) {
      return (
        <>
          {labelEstado}
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
            Nombre de{'\n'}Receptor
          </Text>
          <TextInput
            value={nombreReceptor}
            onChangeText={setNombreReceptor}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Ingresa el nombre"
            placeholderTextColor="#9CA3AF"
            autoFocus
            underlineColorAndroid="transparent"
            cursorColor={colors.warning}
            selectionColor={colors.warning}
            style={{
              fontSize: 16,
              color: '#1F2937',
              borderBottomWidth: 2,
              borderBottomColor: inputFocused || nombreReceptor ? colors.warning : '#E5E7EB',
              paddingVertical: 8,
              paddingHorizontal: 0,
            }}
          />
        </>
      );
    }

    if (paso === 2) {
      return (
        <>
          {labelEstado}
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
            RUT
          </Text>
          <TextInput
            value={rutReceptor}
            onChangeText={setRutReceptor}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Ej: 12345678-9"
            placeholderTextColor="#9CA3AF"
            autoFocus
            underlineColorAndroid="transparent"
            cursorColor={colors.warning}
            selectionColor={colors.warning}
            keyboardType="default"
            style={{
              fontSize: 16,
              color: '#1F2937',
              borderBottomWidth: 2,
              borderBottomColor: inputFocused || rutReceptor ? colors.warning : '#E5E7EB',
              paddingVertical: 8,
              paddingHorizontal: 0,
            }}
          />
        </>
      );
    }

    // Paso 3: Fotografía Cédula de Identidad
    if (paso === 3) return (
      <>
        {labelEstado}
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
          Fotografía Cédula{'\n'}de Identidad
        </Text>

        {/* Botón Abrir cámara */}
        <TouchableOpacity
          onPress={abrirCamara}
          disabled={fotos.length >= MAX_FOTOS}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: fotos.length < MAX_FOTOS ? colors.primary : '#E5E7EB',
            paddingVertical: 14,
            alignItems: 'center',
            marginBottom: 20,
            opacity: fotos.length < MAX_FOTOS ? 1 : 0.4,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: fotos.length < MAX_FOTOS ? colors.primary : '#9CA3AF' }}>
            Abrir cámara
          </Text>
        </TouchableOpacity>

        {/* Grid de thumbnails */}
        {fotos.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {fotos.map((uri, index) => (
              <View key={index} style={{ width: THUMB_SIZE, height: THUMB_SIZE }}>
                <Image
                  source={{ uri }}
                  style={{ width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 8 }}
                />
                <TouchableOpacity
                  onPress={() => eliminarFoto(index)}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    backgroundColor: colors.primary,
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

        {/* Contador */}
        <Text style={{ fontSize: 15, color: '#6B7280', textAlign: 'center' }}>
          Imágenes a enviar: {fotos.length} / {MAX_FOTOS}
        </Text>
      </>
    );

    // Paso 4: Fotografía de Lugar
    if (paso === 4) return (
      <>
        {labelEstado}
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
          Fotografía de Lugar
        </Text>

        {/* Botón Abrir cámara */}
        <TouchableOpacity
          onPress={abrirCamara}
          disabled={fotosLugar.length >= MAX_FOTOS}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: fotosLugar.length < MAX_FOTOS ? colors.primary : '#E5E7EB',
            paddingVertical: 14,
            alignItems: 'center',
            marginBottom: 20,
            opacity: fotosLugar.length < MAX_FOTOS ? 1 : 0.4,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: fotosLugar.length < MAX_FOTOS ? colors.primary : '#9CA3AF' }}>
            Abrir cámara
          </Text>
        </TouchableOpacity>

        {/* Grid de thumbnails */}
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
                    backgroundColor: colors.primary,
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

        {/* Contador */}
        <Text style={{ fontSize: 15, color: '#6B7280', textAlign: 'center' }}>
          Imágenes a enviar: {fotosLugar.length} / {MAX_FOTOS}
        </Text>
      </>
    );

    // Paso 6: Método de Pago
    if (paso === 6) {
      return (
        <>
          {labelEstado}
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
            Tarjeta/Efectivo
          </Text>
          <TextInput
            value={metodoPago}
            onChangeText={setMetodoPago}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Ej: Tarjeta, Efectivo, Transferencia…"
            placeholderTextColor="#9CA3AF"
            autoFocus
            underlineColorAndroid="transparent"
            cursorColor={colors.warning}
            selectionColor={colors.warning}
            style={{
              fontSize: 16,
              color: '#1F2937',
              borderBottomWidth: 2,
              borderBottomColor: inputFocused || metodoPago ? colors.warning : '#E5E7EB',
              paddingVertical: 8,
              paddingHorizontal: 0,
            }}
          />
        </>
      );
    }

    // Paso 5: Fotografía de POD
    return (
      <>
        {labelEstado}
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
          Fotografía de POD
        </Text>

        <TouchableOpacity
          onPress={abrirCamara}
          disabled={fotosPOD.length >= MAX_FOTOS}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: fotosPOD.length < MAX_FOTOS ? colors.primary : '#E5E7EB',
            paddingVertical: 14,
            alignItems: 'center',
            marginBottom: 20,
            opacity: fotosPOD.length < MAX_FOTOS ? 1 : 0.4,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: fotosPOD.length < MAX_FOTOS ? colors.primary : '#9CA3AF' }}>
            Abrir cámara
          </Text>
        </TouchableOpacity>

        {fotosPOD.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {fotosPOD.map((uri, index) => (
              <View key={index} style={{ width: THUMB_SIZE, height: THUMB_SIZE }}>
                <Image
                  source={{ uri }}
                  style={{ width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 8 }}
                />
                <TouchableOpacity
                  onPress={() => eliminarFotoPOD(index)}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    backgroundColor: colors.primary,
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
          Imágenes a enviar: {fotosPOD.length} / {MAX_FOTOS}
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
    borderColor: activo ? colors.primary : '#E5E7EB',
    opacity: activo ? 1 : 0.4,
  });

  const btnTextStyle = (activo: boolean) => ({
    fontSize: 17,
    fontWeight: '700' as const,
    color: activo ? colors.primary : '#9CA3AF',
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
