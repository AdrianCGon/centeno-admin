// Función para detectar el entorno de forma segura
const getBaseUrl = (): string => {
  // Solo ejecutar en el cliente (navegador)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    } else {
      return 'http://143.198.185.191:3000';
    }
  }
  
  // Valor por defecto para SSR
  return 'http://localhost:3000';
};

// Configuración de APIs para desarrollo y producción
export const API_CONFIG = {
  // URLs base para las APIs
  BASE_URL: getBaseUrl(),
  
  // Endpoints específicos
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      CHECK: '/api/auth/check',
      LOGOUT: '/api/auth/logout'
    },
    SOLICITUDES: {
      BASE: '/api/solicitudes',
      BY_ID: (id: string) => `/api/solicitudes/${id}`,
      UPDATE_ESTADO: (id: string) => `/api/solicitudes/${id}/estado`
    },
    LIBROS: {
      BASE: '/api/libros',
      BY_ID: (id: string) => `/api/libros/${id}`,
      PUBLIC: '/api/libros/public'
    },
    HEALTH: '/api/health'
  }
};

// Función helper para construir URLs completas
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Función helper para obtener la URL base (exportada para uso externo)
export { getBaseUrl }; 