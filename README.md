# Turisteando Web (React Native + Expo)

Frontend web y móvil para la aplicación Turisteando, construido con React Native y Expo.

## Descripción

Esta es una aplicación de turismo que consume la API de `turisteando-api` (backend en Go). La aplicación está diseñada para funcionar en:

- 🌐 **Web** - Navegadores modernos
- 📱 **iOS** - Dispositivos Apple
- 🤖 **Android** - Dispositivos Android

Todo con la **misma base de código** gracias a Expo y React Native.

## Características

- ✅ Autenticación con JWT
- ✅ Gestión de estado con Context API
- ✅ Cliente HTTP con Axios (interceptores automáticos)
- ✅ TypeScript para seguridad de tipos
- ✅ Almacenamiento local con AsyncStorage
- ✅ Exploración de países, ciudades y lugares
- ✅ Gestión de eventos
- ✅ Interfaz responsive

## Stack Tecnológico

- **React Native** - Framework UI multiplataforma
- **Expo** - Plataforma de desarrollo para React Native
- **TypeScript** - Lenguaje tipado
- **Axios** - Cliente HTTP
- **Context API** - Gestión de estado
- **AsyncStorage** - Almacenamiento local

## Requisitos Previos

- Node.js 18+ (se recomienda la última LTS)
- npm o yarn
- Expo CLI (se instala automáticamente)

## Instalación

```bash
# Clonar o descargar el repositorio
cd turisteando-web

# Instalar dependencias
npm install

# O si usas yarn
yarn install
```

## Configuración

### 1. Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api
EXPO_PUBLIC_ENV=development
```

**Notas:**
- Para development local: `http://localhost:8080/api`
- Para producción: reemplazar con tu URL de API real
- En dispositivos físicos/emuladores: usar la IP de tu máquina en lugar de `localhost`

### 2. Configurar la URL de API en dispositivos físicos

Si estás usando un emulador o dispositivo físico:

```env
# Para Android emulator/device
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api

# Para iOS simulator
EXPO_PUBLIC_API_URL=http://localhost:8080/api

# Para dispositivo físico (reemplaza con tu IP)
EXPO_PUBLIC_API_URL=http://192.168.x.x:8080/api
```

## Desarrollo

### Web (Navegador)

```bash
npm run web
```

Esto abrirá la aplicación en `http://localhost:19006`

### Android (Emulador o Dispositivo)

```bash
npm run android
```

**Requisitos:**
- Android SDK instalado
- Emulador de Android corriendo O dispositivo conectado

### iOS (Simulator o Dispositivo)

```bash
npm run ios
```

**Requisitos:**
- macOS
- Xcode instalado

### Expo Go (Alternativa rápida)

```bash
npm start
```

Luego:
- Escanear código QR con Expo Go app en tu dispositivo
- O presionar `w` para web, `a` para Android, `i` para iOS

## Estructura del Proyecto

```
src/
├── api/                  # Cliente HTTP y servicios
│   ├── client.ts        # Cliente Axios con interceptores
│   ├── config.ts        # Configuración de API endpoints
│   ├── authService.ts   # Servicios de autenticación
│   └── services.ts      # Servicios de datos (lugares, eventos, etc)
│
├── context/             # Context API para estado global
│   ├── AuthContext.tsx  # Contexto de autenticación y usuario
│   └── DataContext.tsx  # Contexto de datos de la aplicación
│
├── screens/             # Pantallas principales
│   ├── ProfileScreen.tsx
│   ├── CountriesScreen.tsx
│   └── ...
│
├── components/          # Componentes reutilizables
│   └── Common.tsx       # Loading, ErrorBanner, etc
│
├── types/               # Tipos TypeScript
│   └── index.ts         # Definiciones de tipos del API
│
├── utils/               # Utilidades
│   └── env.ts          # Variables de entorno
│
└── App.tsx              # Componente raíz
```

## Uso de Contextos

### Autenticación

```tsx
import { useAuth } from './context/AuthContext';

export const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated ? (
        <Text>Bienvenido, {user?.name}</Text>
      ) : (
        <Text>Por favor, inicia sesión</Text>
      )}
    </>
  );
};
```

### Datos Globales

```tsx
import { useData } from './context/DataContext';

export const CountriesList = () => {
  const { countries, fetchCountries, isLoadingCountries } = useData();

  useEffect(() => {
    fetchCountries();
  }, []);

  return (
    // Renderizar countries...
  );
};
```

## API Client

El cliente HTTP (`src/api/client.ts`) incluye:

- ✅ Inyección automática de tokens JWT
- ✅ Manejo de errores 401 (token expirado)
- ✅ Timeout de 30 segundos
- ✅ Headers predeterminados

## Deployment

### Web (Vercel, Netlify, etc)

```bash
# Build para web
npm run web

# Copia la carpeta web/ a tu hosting
```

### Expo (EAS Build)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar el proyecto
eas build:configure

# Build
eas build --platform android
eas build --platform ios
```

## Troubleshooting

### "Cannot find module" error

```bash
npm install
```

### API no responde (desarrollo local)

- Verificar que el backend está corriendo en `http://localhost:8080`
- En emulador Android, usar `http://10.0.2.2:8080` en lugar de `localhost`
- Verificar variables de entorno en `.env`

### Port ya está en uso

```bash
# Encontrar proceso en puerto 19006
lsof -i :19006

# Matar el proceso
kill -9 <PID>
```

## Scripts Disponibles

```bash
npm run web          # Ejecutar en navegador
npm run android      # Ejecutar en Android
npm run ios          # Ejecutar en iOS
npm start            # Iniciar Expo CLI
npm run create-env   # Crear archivo .env
```

## Notas de Desarrollo

1. **TypeScript**: El proyecto está configurado con tipos estrictos. Siempre define tipos para variables y funciones.

2. **Console**: En desarrollo, usa `console.log()` de React Native, no el browser console.

3. **AsyncStorage**: Los datos se persisten localmente, útil para caché y offline.

4. **Context API**: Suficiente para esta app. Si crece mucho, considera Redux o Zustand.

5. **Componentes**: Reutiliza componentes de `src/components/` en todas las pantallas.

## Próximos Pasos

- [ ] Implementar navegación (React Navigation)
- [ ] Crear más pantallas (Login, Register, Places, Events)
- [ ] Agregar búsqueda y filtros
- [ ] Implementar mapa (React Native Maps)
- [ ] Agregar imágenes y caching
- [ ] Gestión offline
- [ ] Tests unitarios e integración
- [ ] CI/CD con GitHub Actions

## Contacto

Para preguntas o reportar issues: [tu contacto]

## Licencia

MIT
