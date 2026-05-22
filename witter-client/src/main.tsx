import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeSelfXSSWarning } from './core/security/selfXssWarning';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Inicializamos la advertencia de seguridad contra Self-XSS en la consola
initializeSelfXSSWarning();

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '823180130041-etnhtqi56smqvrnrsan5gt5nguerk6t6.apps.googleusercontent.com';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
