import axios from 'axios';

// 1. Configuramos la URL base de tu backend en ASP.NET Core
const witterApi = axios.create({
    baseURL: 'http://localhost:5092/api', // Tu puerto real (nota que es http, sin la 's')
    headers: {
        'Content-Type': 'application/json'
    }
});

// 2. INTERCEPTOR DE PETICIÓN (Request)
// Antes de que cualquier petición salga hacia el backend, esta función se ejecuta
witterApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Si hay un token guardado, lo inyectamos automáticamente en la cabecera
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. INTERCEPTOR DE RESPUESTA (Response)
// Evalúa la respuesta del servidor antes de entregarla a tus componentes
witterApi.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Si el backend responde con un 401 (Token expirado, inválido o ausente)
        if (error.response && error.response.status === 401) {
            console.warn('Token expirado o sesión inválida. Cerrando sesión...');
            // Borramos rastros locales
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            // Forzamos la recarga para que App.tsx detecte que ya no hay sesión
            // y el enrutador expulse al usuario a /login
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default witterApi;