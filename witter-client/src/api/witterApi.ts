import axios from 'axios';

// Configuramos la URL base de tu backend en ASP.NET Core
const witterApi = axios.create({
    baseURL: '/api',
    withCredentials: true, // Permitir el envío de cookies para autenticacion
    headers: {
        'Content-Type': 'application/json'
    }
});

// Funcion para solicitar el Token CSRF
let csrfToken: string | null = null;
export const fetchCsrfToken = async () => {
    try{
        const response = await witterApi.get('/auth/csrf-token');
        csrfToken = response.data.csrfToken;
    } catch (error){
        console.error('Error al obtener el CSRF token: ', error)
    }
};

// INTERCEPTOR DE PETICIÓN (Request)
// Antes de que cualquier petición salga hacia el backend, esta función se ejecuta
witterApi.interceptors.request.use(
    (config) => {
        if (csrfToken && config.method !== 'get') {
            config.headers['X-CSRF-TOKEN'] = csrfToken;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// INTERCEPTOR DE RESPUESTA (Response)
witterApi.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Si el back responde con un 401 (Token expirado, inválido o ausente)
        if (error.response && error.response.status === 401) {
            console.warn('Token expirado o sesión inválida. Cerrando sesión...');
            // Borramos rastros locales
            localStorage.removeItem('role');
            localStorage.removeItem('userName');
            localStorage.removeItem('fullName');
            localStorage.removeItem('userId');
            // expulsamos al usuario a /login
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default witterApi;