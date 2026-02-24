# AGENTS.md - Contexto App Repartidores
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
## 📱 Descripción del Proyecto
**Delivery Driver App** — Aplicación móvil para repartidores, construida con Expo y React Native.
**Propósito:** Permitir a los repartidores gestionar entregas, rastrear ubicación, capturar firmas y comunicarse con el backend en tiempo real.
**Idioma:** Español (es-CL)
**Tema:** Modo oscuro (todas las pantallas)
**Tamaño mínimo de área táctil:** 48px (configurado en Tailwind)
**Nombre del proyecto** FULL APP. COn este nombre te debes referir en la aplicación.
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
│   │   └── (vacío - agregar pantallas aquí)
│   ├── components/           # Componentes reutilizables
│   │   └── (vacío - agregar componentes aquí)
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
└── babel.config.js           # Babel + configuración NativeWind
```
---
## 🎨 Sistema de Diseño

### Colores — `src/constants/colors.ts`
Siempre importar desde `colors`, nunca hardcodear estos valores.

| Token | Hex | Uso |
|---|---|---|
| `colors.primary` | `#2563EB` | Botones primarios, acentos azules (pantallas oscuras) |
| `colors.orange` | `#EA580C` | Fondo de header en todas las pantallas del flujo |
| `colors.background` | `#111827` | Fondo pantallas oscuras (Home, Login) y footer bar |
| `colors.surface` | `#1F2937` | Tarjetas y superficies en contexto oscuro |
| `colors.text` | `#F3F4F6` | Texto principal sobre fondo oscuro |
| `colors.textSecondary` | `#D1D5DB` | Texto secundario sobre fondo oscuro |
| `colors.border` | `#374151` | Bordes en contexto oscuro |
| `colors.success` | `#10B981` | Estados de éxito |
| `colors.error` | `#EF4444` | Errores y alertas |
| `colors.warning` | `#F59E0B` | Advertencias, borde de tarjeta seleccionada |

Colores adicionales para pantallas claras (hardcode permitido):

| Valor | Uso |
|---|---|
| `#F5F5F5` | Fondo de pantallas con contenido (listas, formularios) |
| `#FFFFFF` | Fondo de tarjetas en estado normal |
| `#FEF3C7` | Fondo de tarjeta seleccionada (amber claro) |
| `#E5E7EB` | Borde de tarjeta normal |
| `#1F2937` | Texto oscuro principal en pantallas claras |
| `#374151` | Texto medio (labels, selectores de fecha) |
| `#6B7280` | Texto secundario en pantallas claras |
| `#9CA3AF` | Texto placeholder / estado vacío |

---

### Tipografía
Fuente del sistema (`-apple-system`, `system-ui`). Sin fuentes personalizadas.

| Uso | fontSize | fontWeight |
|---|---|---|
| Título de app (Home) | 32 | `'bold'` |
| Título de header | 18 | `'bold'` |
| Valor destacado (ID, número) | 20 | `'bold'` |
| Código / label destacado | 16 | `'bold'` |
| Logo / texto icono | 28 | `'bold'` |
| Label de sección / fecha | 14 | `'600'` |
| Texto de botón | 17 | `'600'` |
| Texto de detalle / metadata | 13 | normal |
| Texto vacío / placeholder | 16 | normal |
| Footer brand | 14 | `'600'` |

---

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

---

### Bordes y radios
| Elemento | borderRadius |
|---|---|
| Tarjetas (cards) | 10 |
| Botones primarios | 12 |
| Avatar / logo circular | 48 (para View de 96px) |
| Dot indicador de estado | 6 (para View de 12px) |

---

### Tarjetas (Cards)
```
Estado normal:      backgroundColor: '#FFFFFF'  borderColor: '#E5E7EB'  borderWidth: 1
Estado seleccionado: backgroundColor: '#FEF3C7'  borderColor: '#F59E0B'  borderWidth: 1.5
borderRadius: 10  |  padding: 16  |  marginBottom: 12
```

---

### Estructura de pantallas del flujo principal
Todas las pantallas de flujo (después de Home) siguen este layout:
```
┌──────────────────────────────────┐
│  SafeAreaView edges={['top']}    │  ← protege barra de estado superior
│  HEADER  (colors.primary)        │  ← atrás | título | acción
│  paddingH:12  paddingV:12        │
├──────────────────────────────────┤
│  SUB-HEADER / BARRA FILTRO       │  ← colors.surface, borderBottom colors.border
│  (selector fecha, tabs, etc.)    │
├──────────────────────────────────┤
│  CONTENIDO  (ScrollView)         │  ← fondo colors.background, padding: 16
│  Tarjetas / listas / formularios │
├──────────────────────────────────┤
│  FOOTER BAR  (colors.background) │  ← botón "Siguiente" / acción final
│  paddingBottom: insets.bottom    │  ← protege botones de navegación del teléfono
└──────────────────────────────────┘
```

### Regla obligatoria de Safe Area (TODAS las pantallas)
```typescript
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// En el componente:
const insets = useSafeAreaInsets();

// SafeAreaView solo maneja el TOP (para que el header del footer tenga el color correcto)
<SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>

  {/* ... contenido ... */}

  {/* Footer bar: paddingBottom dinámico para no quedar bajo los botones del sistema */}
  <View style={{
    backgroundColor: colors.background,
    paddingTop: 4,
    paddingBottom: insets.bottom || 12,
  }}>
    <TouchableOpacity style={{ minHeight: 52, ... }}>
      <Text>Siguiente</Text>
    </TouchableOpacity>
  </View>

</SafeAreaView>
```

### Pantallas oscuras (Home, Login, Splash)
```
backgroundColor: colors.background (#111827)
text:            colors.text (#F3F4F6)
cards/surface:   colors.surface (#1F2937)
borders:         colors.border (#374151)
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
    <View className="flex-1 bg-dark">
      <Text className="text-text">Contenido</Text>
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
// El Bearer token se agrega automáticamente por los interceptores
const response = await api.get('/deliveries');
```
---
## 🚀 Cómo Agregar Funcionalidades
### Agregar una Nueva Pantalla
1. Crear `src/screens/NombrePantallaScreen.tsx`
2. Importar en `src/navigation/AppNavigator.tsx`
3. Agregar elemento `<Stack.Screen>`
4. Configurar opciones de pantalla (encabezado, título, etc.)
### Agregar un Componente
1. Crear `src/components/NombreComponente.tsx`
2. Exportar como default
3. Definir interface de props
4. Usar clases NativeWind para estilos
### Agregar un Servicio
1. Crear `src/services/nombreServicio.ts`
2. Exportar funciones o clase
3. Usar instancia API de `api.ts` para llamadas HTTP
### Agregar Constantes
- Colores: `src/constants/colors.ts`
- API: `src/constants/api.ts` (crear si es necesario)
- Rutas: `src/constants/routes.ts` (crear si es necesario)
---
## 🔧 Comandos de Desarrollo
```bash
# Iniciar servidor de desarrollo
npm start
# Ejecutar en plataforma específica
npm run android
npm run ios
npm run web
# Verificar tipos
npx tsc --noEmit
npx tsc --watch
```
---
## 🔐 Configuración de API
**Ubicación:** `src/services/api.ts`
- URL base: configurar en `API_BASE_URL` (actualmente `https://api.example.com`)
- Autenticación: Bearer token desde `AsyncStorage.getItem('authToken')`
- Interceptores:
  - Agrega automáticamente el header de auth a todas las solicitudes
  - Maneja respuestas 401 (limpia el token)
  - Se puede extender para logs y manejo de errores
---
## 📋 Notas para Agentes
- **Pantallas existentes:** `HomeScreen` y `RutasDisponiblesScreen` — respetar su estilo al crear nuevas
- **Estilos:** usar `StyleSheet` inline (no `className`/NativeWind) — el proyecto usa estilos inline consistentemente
- **Dos contextos visuales:** pantallas oscuras (Home/Login) usan `colors.background`; pantallas de flujo usan `#F5F5F5` + header naranja
- **La app está en español (es-CL)** — todos los textos visibles al usuario deben ir en español
- **Áreas táctiles de 48px** — `minWidth: 48, minHeight: 48` en todo `TouchableOpacity`
- **Backend compartido con Dashboard** — coordinar contratos de API antes de implementar endpoints nuevos
- **Datos mock** — mientras no exista backend, usar constantes `MOCK_*` dentro del mismo archivo de pantalla
---
## 🤖 Selección de Modelo
Antes de ejecutar cualquier tarea, recomendar el modelo adecuado:
- **Haiku:** ediciones simples, config, renombrar archivos, cambios menores
- **Sonnet:** construir pantallas, lógica compleja, debugging, componentes nuevos
---
## 🎯 Decisiones de Arquitectura
### ¿Por qué Expo?
- Servicio de build gestionado, sin código nativo
- Capacidad de actualizaciones OTA
- Ecosistema rico de módulos preconfigurados
- Ciclo de desarrollo más rápido
### ¿Por qué NativeWind + Tailwind?
- Estilos consistentes entre plataformas
- Enfoque utilitario reduce CSS personalizado
- Sistema de temas sencillo
- Mejor rendimiento que estilos en línea
### ¿Por qué Axios?
- API más simple que fetch
- Interceptores integrados para auth
- Transformación de solicitudes y respuestas
- Mejor manejo de errores
### ¿Por qué Supabase?
- Backend compartido entre móvil y Dashboard
- Auth, base de datos y storage en un solo servicio
- Tiempo real con suscripciones
- SDK oficial para React Native
---
## 🔄 Flujo de Git
- Mensajes de commit en español
- Commits atómicos (una funcionalidad por commit)
- Actualizar este archivo al agregar funcionalidades mayores o cambiar arquitectura