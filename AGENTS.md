# AGENTS.md - Contexto App Repartidores

## 📱 Descripción del Proyecto
**FULL APP** — Aplicación móvil para repartidores, construida con Expo y React Native.
**Propósito:** Permitir a los repartidores gestionar entregas, rastrear ubicación, capturar firmas y comunicarse con el backend en tiempo real.
**Idioma:** Español (es-CL)
**Tema:** Modo oscuro (todas las pantallas)
**Tamaño mínimo de área táctil:** 48px

---

## 🌐 Ecosistema
Esta app es parte de un sistema de dos aplicaciones:
| Proyecto | Tipo | Usuarios |
|---|---|---|
| `/DeliveryApp` (este proyecto) | App móvil — Expo + React Native | Repartidores |
| `/Dashboard` | App web de escritorio | Administradores |
Ambas se conectarán al **mismo backend en Supabase**.
Los contratos de API deben acordarse antes de construir los endpoints.
Usa Expo SDK 55.

---

## ⚠️ RESTRICCIONES CRÍTICAS — LEER ANTES DE CONSTRUIR CUALQUIER COSA

### 🔐 Seguridad
- **NUNCA** usar `AsyncStorage` para tokens — usar siempre `expo-secure-store`
- **NUNCA** hardcodear API keys, URLs ni passwords en el código — usar `.env`
- **NUNCA** hacer `fetch` directo — todas las llamadas API pasan por `src/services/api.ts`
- **NUNCA** loguear tokens, datos de clientes ni coordenadas GPS en consola
- Tokens JWT: access token expira en 15 minutos, refresh token en `expo-secure-store`
- Al cerrar sesión: limpiar TODO `expo-secure-store` y `AsyncStorage` sin excepción
- Sesión expira automáticamente tras 30 minutos de inactividad
- Cada repartidor solo puede ver sus propias rutas — el backend valida ownership
- Las fotos de entrega se suben inmediatamente al servidor — no guardar en galería del teléfono
- Incluir en cada registro de entrega: timestamp del servidor, coordenadas GPS, device ID, precisión GPS
- `.env` siempre en `.gitignore`

### 📶 Red y Rendimiento (app corre en datos móviles, sin WiFi)
- **Imágenes:** comprimir antes de subir (máx 800px, calidad 70%)
- **Llamadas API:** mínimas por pantalla — no hacer múltiples requests si se puede hacer uno solo
- **Caché:** guardar en `AsyncStorage` los datos del día al inicio para no repetir llamadas
- **Paginación:** nunca cargar listas completas — máximo 20 items por request
- **Polling:** evitar — usar solo cuando sea estrictamente necesario
- **Tiempo de carga:** toda pantalla debe mostrar contenido en menos de 2 segundos en 4G
- **Skeleton/Loading:** siempre mostrar estado de carga mientras llegan los datos
- **Offline:** si no hay conexión, mostrar datos del caché con aviso visible al usuario

### 📱 Dispositivos de Gama Baja
Esta app debe funcionar en teléfonos Android de gama baja (2GB RAM, procesadores lentos).

- **Evitar animaciones pesadas** — sin animaciones complejas, solo transiciones simples
- **Evitar FlatList con renders complejos** — mantener los items de lista simples y livianos
- **Sin librerías de UI pesadas** — no agregar librerías de componentes grandes innecesarias
- **Imágenes:** siempre usar tamaños optimizados, nunca cargar imágenes en resolución original
- **Evitar re-renders innecesarios** — usar `React.memo` y `useCallback` donde corresponda
- **Sin blur effects ni sombras complejas** — costosos en hardware limitado
- **ScrollView vs FlatList:** para listas largas usar siempre `FlatList` con `windowSize` reducido
- **Target mínimo:** la app debe correr fluidamente en Android con 2GB RAM y Android 10

---

## 🛠️ Stack Tecnológico
### Framework Principal
- **Expo SDK 55** — Framework React Native gestionado
- **React Native 0.81.5** — Framework de UI
- **React 19.1.0** — Librería de componentes
- **TypeScript 5.9.2** — Tipado estático

### Navegación
- `@react-navigation/native` — Contenedor de navegación
- `@react-navigation/stack` — Navegador en pila (principal)
- `@react-navigation/bottom-tabs` — Navegador de pestañas (secundario, opcional)

### Estilos y UI
- **NativeWind 4.2.2** — Tailwind CSS para React Native
- **TailwindCSS 3.4.19** — Framework CSS utilitario
- Colores personalizados en `src/constants/colors.ts`

### API y Almacenamiento
- **Axios 1.13.5** — Cliente HTTP con interceptores
- `@react-native-async-storage/async-storage` — Almacenamiento local persistente
- Autenticación Bearer token en interceptores

### Backend
- **Supabase** — Backend compartido con el Dashboard
- Acordar contratos de API antes de implementar endpoints
- Usar el cliente axios de `src/services/api.ts` para todas las llamadas

### Funcionalidades del Dispositivo
- `expo-camera` — Acceso a cámara
- `expo-location` — Servicios de ubicación GPS
- `react-native-signature-canvas` — Captura de firma digital
- `react-native-screens` — Optimización de pantallas nativas
- `react-native-safe-area-context` — Manejo de área segura
- `expo-splash-screen` — Gestión de pantalla de inicio

---

## 📂 Estructura de Carpetas
```
root/
├── src/
│   ├── screens/              # Pantallas de funcionalidades (un archivo por pantalla)
│   ├── components/           # Componentes reutilizables
│   ├── navigation/
│   │   └── AppNavigator.tsx  # Navegador en pila, configuración de pantallas
│   ├── services/
│   │   └── api.ts            # Instancia Axios + interceptores
│   └── constants/
│       └── colors.ts         # Paleta de colores
├── App.tsx                   # Componente raíz
├── app.json                  # Configuración Expo
├── package.json              # Dependencias
├── tsconfig.json             # Configuración TypeScript
├── tailwind.config.js        # Configuración Tailwind
├── babel.config.js           # Babel + configuración NativeWind
├── AGENTS.md                 # Este archivo
└── SECURITY.md               # Guía de seguridad detallada
```

---

## 🎨 Sistema de Diseño

### Colores — `src/constants/colors.ts`
Siempre importar desde `colors`, nunca hardcodear estos valores.

| Token | Hex | Uso |
|---|---|---|
| `colors.primary` | `#2563EB` | Botones primarios, acentos azules |
| `colors.orange` | `#EA580C` | Fondo de header en pantallas de flujo |
| `colors.background` | `#111827` | Fondo pantallas oscuras y footer bar |
| `colors.surface` | `#1F2937` | Tarjetas y superficies en contexto oscuro |
| `colors.text` | `#F3F4F6` | Texto principal sobre fondo oscuro |
| `colors.textSecondary` | `#D1D5DB` | Texto secundario sobre fondo oscuro |
| `colors.border` | `#374151` | Bordes en contexto oscuro |
| `colors.success` | `#10B981` | Estados de éxito |
| `colors.error` | `#EF4444` | Errores y alertas |
| `colors.warning` | `#F59E0B` | Advertencias, borde tarjeta seleccionada |

Colores adicionales para pantallas claras (hardcode permitido):

| Valor | Uso |
|---|---|
| `#F5F5F5` | Fondo de pantallas con contenido |
| `#FFFFFF` | Fondo de tarjetas en estado normal |
| `#FEF3C7` | Fondo de tarjeta seleccionada |
| `#E5E7EB` | Borde de tarjeta normal |
| `#1F2937` | Texto oscuro principal en pantallas claras |
| `#374151` | Texto medio (labels, selectores de fecha) |
| `#6B7280` | Texto secundario en pantallas claras |
| `#9CA3AF` | Texto placeholder / estado vacío |

### Tipografía
Fuente del sistema (`-apple-system`, `system-ui`). Sin fuentes personalizadas.

| Uso | fontSize | fontWeight |
|---|---|---|
| Título de app (Home) | 32 | `'bold'` |
| Título de header | 18 | `'bold'` |
| Valor destacado | 20 | `'bold'` |
| Código / label destacado | 16 | `'bold'` |
| Logo / texto icono | 28 | `'bold'` |
| Label de sección / fecha | 14 | `'600'` |
| Texto de botón | 17 | `'600'` |
| Texto de detalle / metadata | 13 | normal |
| Texto vacío / placeholder | 16 | normal |
| Footer brand | 14 | `'600'` |

### Espaciado
| Elemento | Valor |
|---|---|
| Padding de pantalla / ScrollView | 16px |
| Padding interior de tarjetas | 16px |
| Padding header (H y V) | 12px |
| Margen entre tarjetas | 12px |
| Min-height botón acción principal | 56px |
| Min-height botón footer ("Siguiente") | 52px |
| Área táctil mínima | `minWidth: 48, minHeight: 48` |

### Bordes y radios
| Elemento | borderRadius |
|---|---|
| Tarjetas (cards) | 10 |
| Botones primarios | 12 |
| Avatar / logo circular | 48 |
| Dot indicador de estado | 6 |

### Tarjetas (Cards)
```
Estado normal:       backgroundColor: '#FFFFFF'  borderColor: '#E5E7EB'  borderWidth: 1
Estado seleccionado: backgroundColor: '#FEF3C7'  borderColor: '#F59E0B'  borderWidth: 1.5
borderRadius: 10  |  padding: 16  |  marginBottom: 12
```

### Estructura de pantallas del flujo principal
```
┌──────────────────────────────────┐
│  SafeAreaView edges={['top']}    │
│  HEADER  (colors.orange)         │  ← atrás | título | acción
│  paddingH:12  paddingV:12        │
├──────────────────────────────────┤
│  SUB-HEADER / BARRA FILTRO       │  ← colors.surface, borderBottom colors.border
├──────────────────────────────────┤
│  CONTENIDO  (ScrollView)         │  ← fondo #F5F5F5, padding: 16
├──────────────────────────────────┤
│  FOOTER BAR  (colors.background) │  ← botón "Siguiente"
│  paddingBottom: insets.bottom    │
└──────────────────────────────────┘
```

### Regla obligatoria de Safe Area
```typescript
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
  {/* contenido */}
  <View style={{
    backgroundColor: colors.background,
    paddingTop: 4,
    paddingBottom: insets.bottom || 12,
  }}>
    <TouchableOpacity style={{ minHeight: 52 }}>
      <Text>Siguiente</Text>
    </TouchableOpacity>
  </View>
</SafeAreaView>
```

---

## 💻 Convenciones de Código

### Nomenclatura de Archivos
- **Pantallas:** PascalCase — `HomeScreen.tsx`, `DetalleEntregaScreen.tsx`
- **Componentes:** PascalCase — `Button.tsx`, `TarjetaRepartidor.tsx`
- **Servicios:** camelCase — `api.ts`, `location.ts`
- **Hooks:** camelCase con prefijo `use` — `useDriver.ts`, `useLocation.ts`
- **Constantes:** camelCase o UPPER_SNAKE_CASE — `colors.ts`, `API_ENDPOINTS.ts`

### TypeScript
- Usar `interface` para props de componentes
- Usar `type` para uniones y tipos complejos
- Siempre exportar los tipos de las interfaces de props
- No usar `any` salvo que sea absolutamente necesario

### Plantilla de Componente
```typescript
import { View, Text } from 'react-native';

interface NombrePantallaProps {
  // Definir props
}

export default function NombrePantalla({ }: NombrePantallaProps) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Contenido</Text>
    </View>
  );
}
```

### Orden de Imports
1. React y React Native
2. Navegación
3. Servicios y utilidades
4. Componentes
5. Constantes
6. Tipos e interfaces

### Uso de API
```typescript
import api from '../services/api';
const response = await api.get('/deliveries');
```

---

## 🚀 Cómo Agregar Funcionalidades

### Nueva Pantalla
1. Crear `src/screens/NombrePantallaScreen.tsx`
2. Importar en `src/navigation/AppNavigator.tsx`
3. Agregar `<Stack.Screen>`
4. Configurar opciones (título, header, etc.)

### Nuevo Componente
1. Crear `src/components/NombreComponente.tsx`
2. Exportar como default
3. Definir interface de props
4. Usar StyleSheet inline (no className/NativeWind)

### Nuevo Servicio
1. Crear `src/services/nombreServicio.ts`
2. Usar instancia de `api.ts` para llamadas HTTP

---

## 🔧 Comandos de Desarrollo
```bash
npm start          # Iniciar servidor de desarrollo (Expo Go)
npm run android    # Ejecutar en Android
npx tsc --noEmit   # Verificar tipos
```

---

## 📋 Notas para Agentes
- **Estilos:** usar `StyleSheet` inline — el proyecto usa estilos inline consistentemente, NO usar `className`/NativeWind
- **Pantallas existentes:** `HomeScreen` y `RutasDisponiblesScreen` — respetar su estilo al crear nuevas
- **Dos contextos visuales:** pantallas oscuras (Home/Login) usan `colors.background`; pantallas de flujo usan `#F5F5F5` + header naranja
- **Datos mock:** mientras no exista backend, usar constantes `MOCK_*` dentro del mismo archivo de pantalla
- **Backend compartido con Dashboard** — coordinar contratos de API antes de implementar endpoints nuevos

---

## 🤖 Selección de Modelo
Antes de ejecutar cualquier tarea, recomendar el modelo adecuado:
- **Haiku:** ediciones simples, config, renombrar archivos, cambios menores
- **Sonnet:** construir pantallas, lógica compleja, debugging, componentes nuevos

---

## 🎯 Decisiones de Arquitectura
### ¿Por qué Expo? — Build gestionado, OTA updates, sin código nativo, ciclo rápido
### ¿Por qué StyleSheet inline? — Más predecible en React Native que NativeWind, mejor rendimiento
### ¿Por qué Axios? — Interceptores para auth, mejor manejo de errores que fetch
### ¿Por qué Supabase? — Backend compartido, auth + DB + storage + realtime en uno, SDK para RN

---

## 🔄 Flujo de Git
- Mensajes de commit en español
- Commits atómicos (una funcionalidad por commit)
- Actualizar este archivo al agregar funcionalidades mayores o cambiar arquitectura
- **Al hacer commit (haz commit / sube todo / guardalo):** ejecutar `git add`, `git commit`, y `git push` en el mismo paso → local y GitHub quedan sincronizados