// Google OAuth para Expo Web
// Usando popup con postMessage para obtener el token

// Replace this with your NEW Web Application Client ID from Google Cloud Console
export const GOOGLE_CLIENT_ID = '897686868037-1jromirdle5dv9r5kln4g9m0qeollkvj.apps.googleusercontent.com';

// Obtener la URL base dinámicamente (localhost:3000 en dev)
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }
  return 'http://localhost:3000';
};

const REDIRECT_URI = () => `${getBaseUrl()}/auth-callback.html`;

// Decodificar JWT manualmente (sin librerías)
export const decodeToken = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');

    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Estructura de datos que recibirás del ID Token
export interface GoogleUserData {
  sub: string; // Google User ID
  email: string;
  email_verified: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  iat: number;
  exp: number;
}

// Para web: Abrir ventana emergente de Google y obtener el token
export const getGoogleAuthToken = (): Promise<string | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      console.error('❌ getGoogleAuthToken solo funciona en navegador');
      resolve(null);
      return;
    }

    const state = Math.random().toString(36).substring(7);
    const nonce = Math.random().toString(36).substring(7);
    const scope = encodeURIComponent('openid profile email');
    const clientId = GOOGLE_CLIENT_ID;
    const redirectUri = REDIRECT_URI();
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=id_token&` +
      `scope=${scope}&` +
      `state=${state}&` +
      `nonce=${nonce}&` +
      `prompt=login`;

    console.log('🔵 Abriendo Google OAuth en ventana emergente');
    console.log('📍 Redirect URI:', redirectUri);
    
    // Abrir ventana emergente
    const width = 500;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    const popup = window.open(
      authUrl,
      'google_auth_popup',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      console.error('❌ No se pudo abrir la ventana emergente - Probablemente está bloqueada');
      console.error('💡 Sugerencia: Verifica que los popups no estén bloqueados en el navegador');
      resolve(null);
      return;
    }

    if (popup.closed) {
      console.error('❌ La ventana emergente se cerró inmediatamente - Probablemente está bloqueada');
      resolve(null);
      return;
    }

    console.log('✅ Ventana emergente abierta');
    console.log('📍 URL de Auth:', authUrl.substring(0, 100) + '...');

    let hasResolved = false;

    // Escuchar mensajes de la ventana hijo
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 Mensaje recibido de callback');
      
      // Verificar origen (en desarrollo, aceptar localhost)
      if (!event.origin.includes('localhost') && event.origin !== window.location.origin) {
        console.warn('⚠️ Mensaje de origen desconocido:', event.origin);
        return;
      }

      if (event.data.token) {
        console.log('✅ Token recibido:', event.data.token.substring(0, 30) + '...');
        if (!hasResolved) {
          hasResolved = true;
          cleanup();
          resolve(event.data.token);
        }
      } else if (event.data.error) {
        console.error('❌ Error en Google Auth:', event.data.error);
        if (!hasResolved) {
          hasResolved = true;
          cleanup();
          resolve(null);
        }
      }
    };

    const cleanup = () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
      clearInterval(checkPopup);
      try {
        if (popup && !popup.closed) {
          popup.close();
        }
      } catch (e) {
        // Ignorar errores de acceso a popup.closed (CORS)
      }
    };

    window.addEventListener('message', handleMessage);

    // Timeout de 10 minutos
    const timeout = setTimeout(() => {
      console.error('❌ Google Auth timeout');
      if (!hasResolved) {
        hasResolved = true;
        cleanup();
        resolve(null);
      }
    }, 600000);

    // Verificar si la ventana se cerró sin resultado
    // Esperar 2 segundos antes de empezar a verificar (dar tiempo a Google para procesar)
    const checkPopup = setInterval(() => {
      try {
        if (popup.closed) {
          console.log('⚠️ Ventana emergente cerrada');
          // Esperar un poco antes de resolver en caso de que el token esté en camino
          if (!hasResolved) {
            setTimeout(() => {
              if (!hasResolved) {
                hasResolved = true;
                cleanup();
                resolve(null);
              }
            }, 500);
          }
        }
      } catch (e) {
        // CORS error al intentar acceder a popup.closed
        // Ignorar y continuar - si hay un token, vendrá vía postMessage
        // Si no hay token en 5 minutos, se resolverá el timeout
      }
    }, 1000);
  });
};


