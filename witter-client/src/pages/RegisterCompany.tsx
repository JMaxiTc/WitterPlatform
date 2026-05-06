import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import witterApi from '../api/witterApi';

export default function RegisterCompany() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    rfc: '',
    sector: 'Tecnología / Software',
    website: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await witterApi.post('/users/register/company', formData);
      setSuccessMsg(response.data.message);
      // Ocultamos el formulario y mostramos mensaje de éxito
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar la solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  if (successMsg) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--blue-950)' }}>
        <div className="card" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h2 className="page-title">Solicitud Enviada</h2>
          <p style={{ color: 'var(--gray-500)', marginTop: '10px', marginBottom: '30px' }}>
            Tu solicitud para registrar a <strong>{formData.companyName}</strong> ha sido enviada al equipo de administración. Recibirás un correo cuando sea aprobada para que puedas iniciar sesión.
          </p>
          <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex' }}>Volver al Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--blue-950)', padding: '40px 20px' }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 className="page-title" style={{ color: 'var(--blue-950)', fontSize: '24px' }}>Registro para Empresas</h1>
          <p className="page-sub">Publica proyectos y contrata talento tecnológico validado</p>
        </div>

        {error && <div className="alert alert-warn" style={{ marginBottom: '20px' }}>⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginBottom: '24px' }}>
            <div className="form-group full">
              <label>Razón Social / Nombre de la Empresa</label>
              <input type="text" name="companyName" value={formData.companyName} autoComplete="off" onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>RFC</label>
              <input type="text" name="rfc" value={formData.rfc} autoComplete="off" onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Sector / Industria</label>
              <select name="sector" value={formData.sector} onChange={handleInputChange}>
                <option value="Tecnología / Software">Tecnología / Software</option>
                <option value="Finanzas">Finanzas</option>
                <option value="Salud">Salud</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Sitio Web</label>
              <input type="text" name="website" placeholder="www.tuempresa.com" value={formData.website} autoComplete="off" onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Correo Corporativo</label>
              <input type="email" name="email" value={formData.email} autoComplete="off" onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" name="password" value={formData.password} autoComplete="off"onChange={handleInputChange} required minLength={6} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center' }} disabled={isLoading}>
            {isLoading ? 'Enviando solicitud...' : 'Solicitar Cuenta de Empresa'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
          <span style={{ color: 'var(--gray-500)' }}>¿Eres egresado? </span>
          <Link to="/register" className="link">Regístrate como talento</Link>
        </div>
      </div>
    </div>
  );
}