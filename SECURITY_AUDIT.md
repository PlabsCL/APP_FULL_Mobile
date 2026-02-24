# SECURITY AUDIT REPORT
**Fecha**: 2026-02-24
**Auditor**: Claude Sonnet 4.6
**Estado**: ⚠️ REQUIERE CORRECCIONES CRÍTICAS

---

## 📊 Resumen Ejecutivo

| Punto | Estado | Severidad |
|---|---|---|
| 1. Autenticación y sesiones | ❌ CRÍTICO | 🔴 CRÍTICA |
| 2. Seguridad de red/API | ⚠️ PARCIAL | 🟠 ALTA |
| 3. GPS y ubicación | ⏸️ NO IMPLEMENTADO | ⚠️ MEDIA |
| 4. Almacenamiento local | ❌ CRÍTICO | 🔴 CRÍTICA |
| 5. Fotos y firmas | ⏸️ NO IMPLEMENTADO | ⚠️ MEDIA |
| 6. Protección del APK | ⚠️ INCOMPLETO | 🟠 ALTA |
| 7. Control de acceso | ⏸️ NO IMPLEMENTADO | ⚠️ MEDIA |
| 8. Detección de fraude | ⏸️ BACKEND ONLY | — |
| 9. Checklist pre-release | ❌ VARIAS FALLAS | 🔴 CRÍTICA |

---

## 🔴 CRÍTICOS - DEBEN CORREGIRSE ANTES DE PRODUCCIÓN

### 1.1 ❌ Tokens guardados en AsyncStorage (CRÍTICO)
**Ubicación**: `src/services/api.ts:14`
**Problema**:
```typescript
const token = await AsyncStorage.getItem('authToken');  // ❌ INSEGURO
```

**Por qué es peligroso**:
- AsyncStorage es texto plano sin cifrado
- Un atacante que acceda al dispositivo puede leer el token
- El token se expone si el dispositivo es robado o comprometido
- Violación directa de OWASP Top 10

**Corrección requerida**:
```typescript
import * as SecureStore from 'expo-secure-store';

// ✅ Correcto
const token = await SecureStore.getItemAsync('accessToken');
```

**Acción**: IMPLEMENTAR INMEDIATAMENTE

---

### 1.2 ❌ URL hardcodeada (CRÍTICO)
**Ubicación**: `src/services/api.ts:4`
**Problema**:
```typescript
const API_BASE_URL = 'https://api.example.com'; // ❌ Hardcodeada + TODO
```

**Por qué es peligroso**:
- URL de producción expuesta en el código fuente
- Si el APK se descompila, la URL de API es visible
- Cambiar el endpoint requiere rebuild + redistribución del APK
- No hay forma de switchear entre entornos (dev/staging/prod)

**Corrección requerida**:
1. Crear `.env` con:
```bash
API_BASE_URL=https://api.example.com
```

2. Usar `dotenv` o `expo-env` para cargar:
```typescript
import { API_BASE_URL } from '@env';
```

3. Actualizar `.gitignore`:
```
.env
.env.local
```

4. Crear `.env.example`:
```bash
API_BASE_URL=https://api.example.com
```

**Acción**: IMPLEMENTAR INMEDIATAMENTE

---

### 1.3 ❌ Sin manejo de expiración de sesión
**Ubicación**: `src/services/api.ts:29-32`
**Problema**:
```typescript
if (error.response?.status === 401) {
  await AsyncStorage.removeItem('authToken');
  // TODO: Navigate to login
}
```

- Token expirado pero NO navega a login automáticamente
- Usuario se queda en pantalla sin sesión válida
- Sin timeout de inactividad (debería ser 30 minutos)
- Sin reintentos con refresh token

**Corrección requerida**:
- Implementar refresh token flow
- Navegar a login en estado 401
- Auto-logout después de 30 min inactividad (con react-native-app-state)
- Guardar refresh token en SecureStore

**Acción**: IMPLEMENTAR EN PRÓXIMA FASE

---

## 🟠 ALTOS - REQUIEREN ATENCIÓN ANTES DE RELEASE

### 2.1 ⚠️ Sin validación de respuestas API
**Ubicación**: `src/services/api.ts:27`
**Problema**:
```typescript
api.interceptors.response.use(
  (response) => response,  // ❌ Sin validación
)
```

Simplemente retorna la respuesta sin verificar:
- Si tiene estructura esperada
- Si los datos sensibles no fueron filtrados
- Si hay valores inesperados

**Corrección requerida**:
```typescript
(response) => {
  // Validar estructura mínima
  if (!response.data) throw new Error('Invalid response structure');
  // Validar que no hay tokens/secretos en la respuesta
  return response;
}
```

**Acción**: IMPLEMENTAR EN PRÓXIMA FASE

---

### 2.2 ⚠️ Falta `expo-secure-store` en dependencies
**Ubicación**: `package.json`
**Problema**: No está instalado

```bash
# Necesario instalar:
npx expo install expo-secure-store
```

**Acción**: INSTALAR INMEDIATAMENTE

---

### 6.1 ⚠️ Proguard no habilitado en app.json
**Ubicación**: `app.json:22-26`
**Problema**:
```json
"android": {
  "adaptiveIcon": { ... }
  // ❌ Falta enableProguardInReleaseBuilds
}
```

El APK se puede descompila y leer todo el código JS. Hermes no es suficiente.

**Corrección requerida**:
```json
"android": {
  "adaptiveIcon": { ... },
  "enableProguardInReleaseBuilds": true
}
```

**Acción**: AGREGAR ANTES DE RELEASE

---

## ⏸️ NO IMPLEMENTADOS (Preparar para siguiente fase)

### 3. GPS Y UBICACIÓN
- ✅ Se recopila GPS en `EntregasScreen`
- ❌ No hay validación de coherencia en backend
- ❌ No hay detección de GPS spoofing
- ❌ No hay geofencing
- ❌ No se registra device ID

**Requerido para: Entrega física real**

---

### 5. FOTOS DE ENTREGA
- ❌ No hay pantalla de captura de foto
- ❌ No hay upload automático
- ❌ No hay metadata de foto (timestamp servidor, GPS, device ID)
- ❌ No hay compresión ni encriptación

**Requerido para: Proof of delivery**

---

### 7. CONTROL DE ACCESO
- ⏸️ No hay login implementado
- ❌ No hay validación que repartidor solo vea sus datos
- ❌ No hay roles (driver/admin)

**Requerido para: Multi-user (cuando hay >1 repartidor)**

---

## ✅ BIEN IMPLEMENTADO

1. **No hay console.logs**: Verificado en todos los TS/TSX - CORRECTO
2. **Sin fetch directo**: Todo usa axios vía `api.ts` - CORRECTO
3. **Permisos en español**: app.json bien configurado - CORRECTO
4. **Sin datos sensibles en pantallas**: No hay contraseñas hardcodeadas - CORRECTO
5. **SafeAreaView/Ionicons**: Arquitectura correcta - CORRECTO

---

## 📋 PLAN DE REMEDIACIÓN (ORDEN DE PRIORIDAD)

### BLOQUEAR PRODUCCIÓN (Esta semana)
- [ ] Instalar `expo-secure-store`
- [ ] Mover tokens a SecureStore en `api.ts`
- [ ] Crear `.env` y cargar API_BASE_URL
- [ ] Actualizar `.gitignore`
- [ ] Agregar `enableProguardInReleaseBuilds` a `app.json`

### SIGUIENTE RELEASE (Próximas 2 semanas)
- [ ] Implementar refresh token flow
- [ ] Auto-logout en 401
- [ ] Validación de respuestas API
- [ ] Timeout de inactividad (30 min)
- [ ] Pruebas de seguridad en staging

### FASE 2 (Antes de entregas reales)
- [ ] Validación GPS en backend
- [ ] Detección de GPS spoofing
- [ ] Pantalla de captura de foto
- [ ] Upload automático con metadata
- [ ] Geofencing

### FASE 3 (Multi-user)
- [ ] Login con jwt
- [ ] Control de acceso por repartidor
- [ ] Roles (driver/admin)
- [ ] Audit log

---

## 🛡️ VERIFICACIÓN PRE-RELEASE

### ANTES DE CUALQUIER BUILD PARA PRODUCCIÓN:

- [ ] **Autenticación**: ¿Tokens en SecureStore?
- [ ] **URLs**: ¿Usa `.env`, no hardcodeadas?
- [ ] **Console**: ¿Sin console.logs con datos sensibles?
- [ ] **Network**: ¿Solo HTTPS?
- [ ] **APK**: ¿Proguard habilitado?
- [ ] **Logout**: ¿Limpia SecureStore completo?
- [ ] **Backend**: ¿Valida ownership de recursos?
- [ ] **Tests**: ¿Pasa suite de seguridad?

---

## 📞 RECOMENDACIONES

1. **Inmediato**: Corregir los 3 puntos CRÍTICOS antes de cualquier release
2. **Integración**: Coordina con backend para:
   - Refresh token flow
   - Rate limiting
   - Validación de GPS
   - Detección de fraude
3. **Testing**: Implementar security tests en CI/CD
4. **Documentación**: Actualizar SECURITY.md después de cada corrección

---

**Auditoría completada por**: Claude Sonnet 4.6
**Revisado contra**: SECURITY.md v1.0
**Siguiente auditoría sugerida**: Después de implementar remediaciones críticas
