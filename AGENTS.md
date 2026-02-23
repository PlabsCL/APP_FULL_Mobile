# AGENTS.md - Contexto App Repartidores

## 🌐 Ecosistema

Esta app es parte de un sistema de dos aplicaciones:

| Proyecto | Tipo | Usuarios |
|---|---|---|
| `/DeliveryApp` (este proyecto) | App móvil — Expo + React Native | Repartidores |
| `/Dashboard` | App web de escritorio | Administradores |

Ambas se conectarán al **mismo backend en Supabase**.
Los contratos de API deben acordarse antes de construir los endpoints.

---

## 📱 Descripción del Proyecto

**Delivery Driver App** — Aplicación móvil para repartidores, construida con Expo y React Native.

**Propósito:** Permitir a los repartidores gestionar entregas, rastrear ubicación, capturar firmas y comunicarse con el backend en tiempo real.

**Idioma:** Español (es-CL)
**Tema:** Modo oscuro (todas las pantallas)
**Tamaño mínimo de área táctil:** 48px (configurado en Tailwind)

---

## 🛠️ Stack Tecnológico

### Framework Principal
- **Expo 54** — Framework React Native gestionado
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

### Colores (`src/constants/colors.ts`)
```typescript
primary: '#2563EB'        // Azul — acciones, enlaces
background: '#111827'     // Negro oscuro — fondo de pantallas
surface: '#1F2937'        // Gris oscuro — tarjetas, superficies
text: '#F3F4F6'           // Gris claro — texto principal
textSecondary: '#D1D5DB'  // Gris medio — texto secundario
border: '#374151'         // Gris — bordes
success: '#10B981'        // Verde — estados de éxito
error: '#EF4444'          // Rojo — errores
warning: '#F59E0B'        // Naranja — advertencias
```

### Tipografía
- Fuentes del sistema (`-apple-system`, `system-ui`)
- Sin fuentes personalizadas preconfiguradas
- Tamaños: escala Tailwind (text-sm, text-base, text-lg, etc.)

### Espaciado y Áreas Táctiles
- Mínimo 48px para elementos interactivos
- Utilidades Tailwind `min-h-[48px]` y `min-w-[48px]` disponibles
- Padding recomendado: `p-4` (16px), `p-3` (12px), `p-6` (24px)

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
# Iniciar servidor de desarrollo (elegir plataforma)
npm start

# Ejecutar en plataforma específica
npm run android
npm run ios
npm run web

# Verificar tipos
npx tsc --noEmit

# Verificar tipos durante el desarrollo
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

- **Aún no existen pantallas** — usar este scaffold como base
- **Pantalla placeholder** existe en AppNavigator — reemplazar al agregar pantallas reales
- **TailwindCSS está configurado** — usar prop `className` en lugar de `style`
- **Tema oscuro obligatorio** — todas las pantallas deben usar fondo oscuro
- **La app está en español** — todos los textos visibles al usuario deben ir en español
- **Áreas táctiles de 48px** — verificar que todos los elementos interactivos cumplan este mínimo
- **Backend compartido con Dashboard** — coordinar contratos de API antes de implementar endpoints nuevos

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
