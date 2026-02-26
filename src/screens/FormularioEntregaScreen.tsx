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
  const { estado, subestado: subestadoInicial, pedidoCodigo, pedido, evidenciasIniciales } = route.params;
  const insets = useSafeAreaInsets();

  const esEntregado = estado === 'entregado';
  const totalPasos  = esEntregado ? 6 : 2;

  const [paso, setPaso] = useState(1);
  const [inputFocused, setInputFocused] = useState(false);

  // ─── Estado para flujo Entregado (6 pasos) ────────────────────────────────
  const [nombreReceptor, setNombreReceptor] = useState(evidenciasIniciales?.nombreReceptor ?? '');
  const [rutReceptor, setRutReceptor]       = useState(evidenciasIniciales?.rutReceptor ?? '');
  const [fotos, setFotos]                   = useState<string[]>(evidenciasIniciales?.fotos ?? []);
  const [fotosLugar, setFotosLugar]         = useState<string[]>(evidenciasIniciales?.fotosLugar ?? []);
  const [fotosPOD, setFotosPOD]             = useState<string[]>(evidenciasIniciales?.fotosPOD ?? []);
  const [metodoPago, setMetodoPago]         = useState(evidenciasIniciales?.metodoPago ?? '');

  // ─── Estado para flujo simple (2 pasos) ──────────────────────────────────
  const [comentarios, setComentarios] = useState(evidenciasIniciales?.comentarios ?? '');

  // ─── Lógica de avance ─────────────────────────────────────────────────────
  const puedeAvanzar = esEntregado
    ? paso === 1 ? nombreReceptor.trim().length > 0
    : paso === 2 ? rutReceptor.trim().length > 0
    : paso === 3 ? fotos.length > 0
    : paso === 4 ? fotosLugar.length > 0
    : paso === 5 ? fotosPOD.length > 0
    : metodoPago.trim().length > 0
    : paso === 1 ? comentarios.trim().length > 0
    : fotosLugar.length > 0;

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
    if (paso < totalPasos) {
      setPaso(paso + 1);
      setInputFocused(false);
    } else {
      const evidenciasRetorno = esEntregado
        ? { nombreReceptor, rutReceptor, fotos, fotosLugar, fotosPOD, metodoPago }
        : { comentarios, fotosLugar };
      navigation.navigate('Pedido', {
        pedido,
        formularioCompletado: true,
        estadoRetorno: estado,
        subestadoRetorno: subestadoInicial ?? null,
        evidenciasRetorno,
      });
    }
  };

  // ─── Cámara ───────────────────────────────────────────────────────────────
  const abrirCamara = async () => {
    const arrayActual = esEntregado
      ? (paso === 3 ? fotos : paso === 4 ? fotosLugar : fotosPOD)
      : fotosLugar;
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
      if (esEntregado) {
        if (paso === 3) setFotos(prev => [...prev, uri]);
        else if (paso === 4) setFotosLugar(prev => [...prev, uri]);
        else setFotosPOD(prev => [...prev, uri]);
      } else {
        setFotosLugar(prev => [...prev, uri]);
      }
    }
  };

  // ─── Helpers fotos ────────────────────────────────────────────────────────
  const eliminarFoto      = (i: number) => setFotos(prev => prev.filter((_, j) => j !== i));
  const eliminarFotoLugar = (i: number) => setFotosLugar(prev => prev.filter((_, j) => j !== i));
  const eliminarFotoPOD   = (i: number) => setFotosPOD(prev => prev.filter((_, j) => j !== i));

  // ─── Render foto grid ─────────────────────────────────────────────────────
  const renderFotoGrid = (uris: string[], onDelete: (i: number) => void, count: number) => (
    <>
      <TouchableOpacity
        onPress={abrirCamara}
        disabled={uris.length >= MAX_FOTOS}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: uris.length < MAX_FOTOS ? colors.primary : '#E5E7EB',
          paddingVertical: 14,
          alignItems: 'center',
          marginBottom: 20,
          opacity: uris.length < MAX_FOTOS ? 1 : 0.4,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: uris.length < MAX_FOTOS ? colors.primary : '#9CA3AF' }}>
          Abrir cámara
        </Text>
      </TouchableOpacity>

      {uris.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {uris.map((uri, index) => (
            <View key={index} style={{ width: THUMB_SIZE, height: THUMB_SIZE }}>
              <Image source={{ uri }} style={{ width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 8 }} />
              <TouchableOpacity
                onPress={() => onDelete(index)}
                style={{
                  position: 'absolute', top: -6, right: -6,
                  backgroundColor: colors.primary, borderRadius: 12,
                  width: 22, height: 22, justifyContent: 'center', alignItems: 'center',
                }}
              >
                <Ionicons name="close" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <Text style={{ fontSize: 15, color: '#6B7280', textAlign: 'center' }}>
        Imágenes a enviar: {count} / {MAX_FOTOS}
      </Text>
    </>
  );

  // ─── Render de campo de texto ─────────────────────────────────────────────
  const renderCampoTexto = (
    value: string,
    onChangeText: (t: string) => void,
    placeholder: string,
    keyboardType: 'default' | 'email-address' = 'default',
    multiline = false,
  ) => (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      onFocus={() => setInputFocused(true)}
      onBlur={() => setInputFocused(false)}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      autoFocus
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      underlineColorAndroid="transparent"
      cursorColor={colors.warning}
      selectionColor={colors.warning}
      keyboardType={keyboardType}
      textAlignVertical={multiline ? 'top' : 'auto'}
      style={{
        fontSize: 16,
        color: '#1F2937',
        borderBottomWidth: multiline ? 0 : 2,
        borderWidth: multiline ? 1.5 : 0,
        borderColor: inputFocused || value ? colors.warning : '#E5E7EB',
        borderRadius: multiline ? 8 : 0,
        paddingVertical: multiline ? 12 : 8,
        paddingHorizontal: multiline ? 12 : 0,
        minHeight: multiline ? 100 : undefined,
      }}
    />
  );

  // ─── Render de pasos ──────────────────────────────────────────────────────
  const renderPaso = () => {
    const labelEstado = (
      <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>
        {ESTADO_LABEL[estado] ?? estado}
      </Text>
    );

    // ── Flujo Entregado (6 pasos) ──
    if (esEntregado) {
      if (paso === 1) return (
        <>
          {labelEstado}
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
            Nombre de{'\n'}Receptor
          </Text>
          {renderCampoTexto(nombreReceptor, setNombreReceptor, 'Ingresa el nombre')}
        </>
      );

      if (paso === 2) return (
        <>
          {labelEstado}
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
            RUT
          </Text>
          {renderCampoTexto(rutReceptor, setRutReceptor, 'Ej: 12345678-9')}
        </>
      );

      if (paso === 3) return (
        <>
          {labelEstado}
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
            Fotografía Cédula{'\n'}de Identidad
          </Text>
          {renderFotoGrid(fotos, eliminarFoto, fotos.length)}
        </>
      );

      if (paso === 4) return (
        <>
          {labelEstado}
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
            Fotografía de Lugar
          </Text>
          {renderFotoGrid(fotosLugar, eliminarFotoLugar, fotosLugar.length)}
        </>
      );

      if (paso === 5) return (
        <>
          {labelEstado}
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
            Fotografía de POD
          </Text>
          {renderFotoGrid(fotosPOD, eliminarFotoPOD, fotosPOD.length)}
        </>
      );

      // paso === 6
      return (
        <>
          {labelEstado}
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
            Tarjeta/Efectivo
          </Text>
          {renderCampoTexto(metodoPago, setMetodoPago, 'Ej: Tarjeta, Efectivo, Transferencia…')}
        </>
      );
    }

    // ── Flujo simple (2 pasos: entrega_parcial / no_entregado) ──
    if (paso === 1) return (
      <>
        {labelEstado}
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
          Comentarios
        </Text>
        {renderCampoTexto(comentarios, setComentarios, 'Agrega un comentario sobre la entrega…', 'default', true)}
      </>
    );

    // paso === 2
    return (
      <>
        {labelEstado}
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 }}>
          Fotografía de Lugar
        </Text>
        {renderFotoGrid(fotosLugar, eliminarFotoLugar, fotosLugar.length)}
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

      {/* ── KAV ─────────────────────────────────────────────────────────────── */}
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
