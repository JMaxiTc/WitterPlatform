import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeSelfXSSWarning } from './core/security/selfXssWarning';

// Inicializamos la advertencia de seguridad contra Self-XSS en la consola
initializeSelfXSSWarning();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
