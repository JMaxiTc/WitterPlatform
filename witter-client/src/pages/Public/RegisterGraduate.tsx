import { useState } from 'react';
import witterApi from '../../api/witterApi';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterGraduate() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado inicial que coincide con el GraduateRegisterDto de .NET (sin skills)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    school: 'Tecnológico de Colima',
    degree: 'Ingeniería Informática',
    githubUrl: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Usamos nuestro cliente centralizado en lugar de fetch
      const response = await witterApi.post('/users/register/graduate', formData);

      // Axios guarda la respuesta del backend directamente en response.data
      alert(`¡Registro exitoso! Edad calculada en el sistema: ${response.data.calculatedAge} años.`);
      navigate('/login');

    } catch (err: any) {
      // Manejo de errores limpio con Axios
      setError(err.response?.data?.message || 'Error al registrar el egresado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--blue-950)', padding: '40px 20px' }}>
      <div className="card" style={{ maxWidth: '700px', width: '100%', padding: '30px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 className="page-title" style={{ color: 'var(--blue-950)', fontSize: '24px' }}>Registro de Egresado</h1>
          <p className="page-sub">Únete a WITTER y conecta con proyectos de primer nivel</p>
        </div>

        {error && (
          <div className="alert alert-warn" style={{ marginBottom: '20px' }}>
            <span>⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Datos Personales y Cuenta</div>
          <div className="form-grid" style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label>Nombres</label>
              <input type="text" name="firstName" value={formData.firstName} autoComplete="off" onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Apellidos</label>
              <input type="text" name="lastName" value={formData.lastName} autoComplete="off" onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Correo Electrónico</label>
              <input type="email" name="email" value={formData.email} autoComplete="off" onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" name="password" value={formData.password} autoComplete="off" onChange={handleInputChange} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Fecha de Nacimiento</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} required />
              <div className="form-hint">Para cálculo automático de edad</div>
            </div>
          </div>

          <div className="form-section-title">Perfil Académico y Profesional</div>
          <div className="form-grid" style={{ marginBottom: '24px' }}>
            <div className="form-group">
              <label>Institución de Egreso</label>
              <select name="school" value={formData.school} onChange={handleInputChange}>
                <option value="Tecnológico de Colima">Tecnológico de Colima</option>
                <option value="Universidad de Colima">Universidad de Colima</option>
                <option value="IPN">Instituto Politécnico Nacional</option>
                <option value="Otra">Otra Institución</option>
              </select>
            </div>
            <div className="form-group">
              <label>Carrera / Especialidad</label>
              <input type="text" name="degree" value={formData.degree} onChange={handleInputChange} required />
            </div>
            <div className="form-group full">
              <label>Portafolio / GitHub URL</label>
              <div className="input-prefix">
                <span className="input-prefix-label">https://</span>
                <input type="text" name="githubUrl" placeholder="github.com/tu-usuario" autoComplete="off" value={formData.githubUrl} onChange={handleInputChange} required />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Completar Registro'}
          </button>
        </form>

          {/* Enlace de regreso al Login (El original) */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
            <span style={{ color: 'var(--gray-500)' }}>¿Ya tienes cuenta? </span>
            <Link to="/login" className="link">Inicia sesión aquí</Link>
          </div>

        </div>
      </div>
  );
}