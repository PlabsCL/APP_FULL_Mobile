# SECURITY.md - Guía de Seguridad

## ⚠️ Contexto de Riesgo
Esta app maneja rutas de entrega de mercadería de alto valor (dispositivos, electrónica,
productos de hasta $1.5M CLP por unidad). Un compromiso de seguridad puede significar
pérdidas económicas directas, fraude operacional o robo físico coordinado.

---

## 🔐 1. AUTENTICACIÓN Y SESIONES

### Reglas obligatorias
- NUNCA usar `AsyncStorage` para guardar tokens — es texto plano, sin cifrado
- SIEMPRE usar `expo-secure-store` para tokens (usa el Keychain de iOS y Keystore de Android)
- Tokens JWT con expiración corta: **15 minutos** para access token
- Refresh token de larga duración guardado en `expo-secure-store`
- Al cerrar sesión: borrar TODOS los datos de `expo-secure-store` sin excepción
- Sesión automática expirada tras **30 minutos de inactividad**
- Bloquear cuenta tras **5 intentos fallidos** de login

### Implementación
```typescript
import * as SecureStore from 'expo-secure-store';

// ✅ Correcto
await SecureStore.setItemAsync('accessToken', token);

// ❌ Incorrecto — nunca hacer esto
await AsyncStorage.setItem('accessToken', token);
```

---

## 📡 2. SEGURIDAD DE RED Y API

### Reglas obligatorias
- **Solo HTTPS** — rechazar cualquier conexión HTTP
- Todas las llamadas API deben pasar por `src/services/api.ts` — nunca `fetch` directo
- Validar SIEMPRE la respuesta del servidor antes de usar los datos
- No loguear tokens, rutas completas ni datos de clientes en consola
- Rate limiting en el backend para todos los endpoints
- Nunca exponer IDs internos de base de datos en la URL

### Variables de entorno
```bash
# ✅ Correcto — en .env (nunca subir al repo)
API_BASE_URL=https://api.miempresa.cl

# ❌ Incorrecto — nunca hardcodear en el código
const baseURL = "https://api.miempresa.cl"
```

- `.env` siempre en `.gitignore`
- Usar `.env.example` con valores vacíos como referencia

---

## 📍 3. GPS Y UBICACIÓN — CRÍTICO PARA ESTA APP

### El problema real
Transportistas pueden usar apps de **GPS spoofing** (Fake GPS, GPS JoyStick) para:
- Simular entregas que nunca ocurrieron
- Aparecer en otra ubicación para evitar rutas
- Cobrar por trabajo no realizado
- Coordinar robos revelando ubicación a terceros

### Medidas a implementar
- **Nunca confiar solo en el GPS del cliente** — el backend debe validar coherencia
- Registrar timestamps del servidor (no del dispositivo) en cada entrega
- Detectar saltos imposibles: si el repartidor estaba en Maipú hace 2 min y aparece en Providencia, flaggear
- Guardar historial de ubicaciones en el backend para auditoría
- Geofencing: marcar entrega solo si el GPS está dentro de X metros de la dirección real
- Registrar el `device ID` al hacer login para detectar cambio de dispositivo

### En el código
```typescript
// Al registrar una entrega, siempre incluir:
{
  entregaId: string,
  timestamp: Date,           // timestamp del servidor, no del cliente
  gpsLat: number,
  gpsLng: number,
  deviceId: string,          // para auditoría
  accuracy: number           // precisión del GPS en metros
}
```

---

## 💾 4. ALMACENAMIENTO LOCAL

| Dato | Dónde guardar |
|---|---|
| Access token | `expo-secure-store` |
| Refresh token | `expo-secure-store` |
| Datos del repartidor (nombre, ID) | `expo-secure-store` |
| Ruta del día (cache offline) | `AsyncStorage` (no sensible) |
| Fotos de entrega | Solo en memoria hasta subir al servidor |

- **Nunca** guardar: contraseñas, datos completos de clientes, montos
- Limpiar `AsyncStorage` y `SecureStore` al cerrar sesión
- No persistir el estado completo de Redux/Context si contiene datos sensibles

---

## 📸 5. PRUEBAS DE ENTREGA (Fotos y Firmas)

- Las fotos deben subirse **inmediatamente** al servidor — no guardar en galería del teléfono
- Incluir metadata: timestamp del servidor, coordenadas GPS, device ID
- Las firmas deben convertirse a imagen y subirse — no guardar en texto
- Implementar checksum para verificar que la foto no fue manipulada
- El backend debe ser la fuente de verdad — si no llega la foto al servidor, la entrega no se marca como completada

---

## 🔒 6. PROTECCIÓN DEL APK

Como distribuyes por APK directo (no Play Store), el APK puede ser:
- Descompilado para ver lógica del negocio
- Modificado para deshabilitar validaciones
- Redistribuido con código malicioso

### Medidas
- Habilitar **Hermes** (ya incluido en Expo) — ofusca el bundle JS
- En producción: habilitar `proguard` en `app.json` para Android
- No incluir lógica crítica de negocio en el cliente — toda validación importante va en el backend
- Verificar integridad del APK al hacer updates: usar `expo-updates` con firma
```json
// app.json
{
  "android": {
    "enableProguardInReleaseBuilds": true
  }
}
```

---

## 👤 7. CONTROL DE ACCESO

- Cada repartidor solo puede ver **sus propias rutas** — nunca las de otros
- El backend debe validar que el `driverId` del token coincide con el recurso solicitado
- Roles definidos en el backend: `driver`, `admin` — el cliente solo declara quién es, el servidor valida
- Un repartidor no puede modificar el estado de una entrega que no le fue asignada

---

## 🚨 8. DETECCIÓN DE FRAUDE (Backend — coordinar con Dashboard)

El Dashboard debe implementar alertas cuando:
- Un repartidor marca entrega completada pero el GPS no estuvo en la dirección
- Más de 3 entregas completadas en menos de 5 minutos (imposible físicamente)
- El mismo dispositivo aparece con dos cuentas diferentes
- Entrega marcada fuera del horario asignado
- GPS del dispositivo desactivado durante la ruta

---

## 🛡️ 9. CHECKLIST ANTES DE CADA RELEASE

- [ ] No hay API keys ni tokens en el código
- [ ] `.env` está en `.gitignore`
- [ ] Todos los tokens se guardan en `expo-secure-store`
- [ ] Logout limpia todo el almacenamiento
- [ ] Todas las llamadas API usan HTTPS
- [ ] Las fotos no se guardan en la galería del teléfono
- [ ] El APK tiene Proguard habilitado
- [ ] El backend valida ownership de recursos (el repartidor solo ve sus datos)

---

## 📋 INSTRUCCIONES PARA EL AGENTE

Al construir cualquier pantalla o funcionalidad, verificar:
1. ¿Se está guardando algún dato sensible en `AsyncStorage`? → Mover a `expo-secure-store`
2. ¿Hay algún `console.log` con datos de usuario o tokens? → Eliminar
3. ¿Se hace algún `fetch` directo? → Reemplazar con `api.ts`
4. ¿Se registra ubicación GPS? → Incluir validación de coherencia
5. ¿Se hardcodea alguna key o URL? → Mover a `.env`
