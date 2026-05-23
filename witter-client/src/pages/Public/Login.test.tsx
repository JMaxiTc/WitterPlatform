import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login'; 

// Mcks de las dependencias externas
const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../api/witterApi', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock del componente de Google OAuth para controlarlo manualmente
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({ onSuccess, onError }: any) => (
    <div>
      <button onClick={() => onSuccess({ credential: 'mock-google-token' })}>
        Simular Google Success
      </button>
      <button onClick={() => onError()}>
        Simular Google Error
      </button>
    </div>
  ),
}));

import witterApi from '../../api/witterApi';

describe('Login Component', () => {
  const mockProps = {
    setAuth: vi.fn(),
    setRole: vi.fn(),
    setName: vi.fn(),
  };

  beforeEach(() => {
    // Limpiamos el comportamiento y las respuestas previas de los posts falsos
    vi.resetAllMocks();
    localStorage.clear();
  });

  it('debería renderizar el formulario correctamente', () => {
    render(<Login {...mockProps} />);

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@correo.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar a mi cuenta/i })).toBeInTheDocument();
  });

  it('debería iniciar sesión con éxito como Empresa (Company) y redireccionar', async () => {
    const fakeUserData = {
      role: 'Company',
      fullName: 'Empresa Witter',
      userId: 'emp-123',
    };
    vi.mocked(witterApi.post).mockResolvedValueOnce({ data: fakeUserData });

    render(<Login {...mockProps} />);

    // Buscamos directamente por los placeholders
    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: 'hr@company.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /entrar a mi cuenta/i }));

    expect(screen.getByRole('button', { name: /verificando\.\.\./i })).toBeDisabled();

    await waitFor(() => {
      expect(witterApi.post).toHaveBeenCalledWith('/auth/login', {
        email: 'hr@company.com',
        password: 'password123',
      });

      expect(localStorage.getItem('role')).toBe('Company');
      expect(localStorage.getItem('userName')).toBe('Empresa Witter');
      expect(mockProps.setRole).toHaveBeenCalledWith('Company');
      expect(mockNavigate).toHaveBeenCalledWith('/company/dashboard');
    });
  });

  it('debería iniciar sesión con éxito como Graduado (Graduate) y redireccionar', async () => {
    const fakeUserData = {
      role: 'Graduate',
      email: 'graduado@test.com',
      userId: 'grad-456',
    };
    vi.mocked(witterApi.post).mockResolvedValueOnce({ data: fakeUserData });

    render(<Login {...mockProps} />);

    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: 'graduado@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'securePass' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar a mi cuenta/i }));

    await waitFor(() => {
      expect(localStorage.getItem('userName')).toBe('graduado@test.com');
      expect(mockProps.setRole).toHaveBeenCalledWith('Graduate');
      expect(mockNavigate).toHaveBeenCalledWith('/graduate/dashboard');
    });
  });

  it('debería mostrar un mensaje de error si las credenciales fallan en el backend', async () => {
    const axiosError = {
      response: {
        data: { message: 'El correo o la contraseña son incorrectos' },
      },
    };
    vi.mocked(witterApi.post).mockRejectedValueOnce(axiosError);

    render(<Login {...mockProps} />);

    fireEvent.change(screen.getByPlaceholderText('tu@correo.com'), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /entrar a mi cuenta/i }));

    const alertMessage = await screen.findByText('El correo o la contraseña son incorrectos');
    expect(alertMessage).toBeInTheDocument();
  });

  it('debería manejar el inicio de sesión exitoso mediante Google', async () => {
    const fakeGoogleUserData = {
      role: 'Graduate',
      fullName: 'Usuario Google',
      userId: 'goog-789',
    };
    vi.mocked(witterApi.post).mockResolvedValueOnce({ data: fakeGoogleUserData });

    render(<Login {...mockProps} />);

    fireEvent.click(screen.getByRole('button', { name: /simular google success/i }));

    await waitFor(() => {
      expect(witterApi.post).toHaveBeenCalledWith('/auth/google-login', {
        token: 'mock-google-token',
      });
      expect(localStorage.getItem('role')).toBe('Graduate');
      expect(mockProps.setRole).toHaveBeenCalledWith('Graduate');
      expect(mockNavigate).toHaveBeenCalledWith('/graduate/dashboard');
    });
  });

  it('debería mostrar un error si falla el componente nativo de Google', async () => {
    render(<Login {...mockProps} />);

    fireEvent.click(screen.getByRole('button', { name: /simular google error/i }));

    const alertMessage = await screen.findByText('Ocurrió un problema al intentar conectar con Google.');
    expect(alertMessage).toBeInTheDocument();
  });
});