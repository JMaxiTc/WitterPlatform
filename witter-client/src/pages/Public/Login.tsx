import { useState } from 'react';
import witterApi from '../../api/witterApi';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  setAuth: (auth: boolean) => void;
  setRole: (role: 'Company' | 'Graduate') => void;
  setName: (name: string) => void;
}

export default function Login({ setAuth, setRole, setName }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Usamos witterApi en lugar de fetch
      const response = await witterApi.post('/auth/login', { email, password });
      
      const { role, token } = response.data; // Axios ya parsea el JSON

      // Guardamos el token para poder enviarlo en cada petición
      if (token) {
        localStorage.setItem('token', token);
      }

      localStorage.setItem('role', response.data.role);
      localStorage.setItem('fullName', response.data.fullName);
      localStorage.setItem('userId', response.data.userId);

      const userNameToSave = response.data.fullName || response.data.email || 'Mi Perfil';
      localStorage.setItem('userName', userNameToSave);
      
      setRole(role);
      setName(userNameToSave);
      setAuth(true);

      if (role === 'Company') {
        navigate('/company/dashboard');
      } else {
        navigate('/graduate/dashboard');
      }

    } catch (err: any) {
      // Axios encapsula los errores del servidor en err.response.data
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--blue-950)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '30px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="brand-icon" style={{ margin: '0 auto 12px' }}>W</div>
          <h1 className="page-title" style={{ color: 'var(--blue-950)' }}>Iniciar Sesión</h1>
          <p className="page-sub">Bienvenido a la plataforma WITTER</p>
        </div>

        {error && (
          <div className="alert alert-warn" style={{ marginBottom: '20px' }}>
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="tu@correo.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={isLoading}
          >
            {isLoading ? 'Verificando...' : 'Entrar a mi cuenta'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px' }}>
          <span style={{ color: 'var(--gray-500)' }}>¿No tienes cuenta? </span>
          <a href="/register" className="link">Regístrate aquí</a>
        </div>
      </div>
    </div>
  );
}