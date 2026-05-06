import { useState, useEffect } from 'react';
import witterApi from '../api/witterApi';

export default function GraduateProfile() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga

  // Estado inicial vacío
  const [profileData, setProfileData] = useState({
    fullName: '',
    school: '',
    campus: 'Villa de Álvarez', // Lo dejamos por defecto
    degree: '',
    egressYear: '2026',
    licenseId: 'En trámite',
    githubUrl: '',
    linkedinUrl: '',
    skills: [] as number[],
    age: 0
  });

  const [bankData, setBankData] = useState({
    bank: 'BBVA México',
    clabe: '012 180 0123456789 0',
    holderName: ''
  });

  // Efecto para cargar los datos al entrar a la pantalla
  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const response = await witterApi.get('/users/me');
        const data = response.data.profile;

        setProfileData(prev => ({
          ...prev,
          fullName: `${data.firstName} ${data.lastName}`,
          school: data.school,
          degree: data.degree,
          githubUrl: data.githubUrl || '',
          skills: response.data.skillIds || [],
          age: data.age // Tu propiedad calculada del backend
        }));

        setBankData(prev => ({
          ...prev,
          holderName: `${data.firstName} ${data.lastName}`
        }));

      } catch (error) {
        console.error("Error al cargar perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyProfile();
  }, []);

  // ... el resto del código (handleProfileChange, handleBankChange) se queda igual ...

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBankData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    // Simulación de guardado en la API
    setTimeout(() => {
      setIsSaving(false);
      alert('Cambios guardados exitosamente en tu perfil.');
    }, 1000);
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Mi Perfil</div>
          <div className="page-sub">Información académica y verificación de identidad</div>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-verificado">KYC Verificado</span>
          <button className="topbar-btn primary" onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <div className="content">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Cargando tus datos reales...</div>
        ) : (
          <div className="grid-2" style={{ alignItems: 'start' }}>
            
            {/* COLUMNA IZQUIERDA: Datos Académicos */}
          <div>
            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="form-section-title">Datos Académicos</div>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Nombre completo</label>
                  <input type="text" name="fullName" value={profileData.fullName} onChange={handleProfileChange} />
                </div>
                <div className="form-group">
                  <label>Institución Académica</label>
                  <select name="school" value={profileData.school} onChange={handleProfileChange}>
                    <option value="Tecnológico de Colima">Tecnológico de Colima</option>
                    <option value="IPN">Instituto Politécnico Nacional</option>
                    <option value="UNAM">UNAM</option>
                    <option value="Otra">Otra</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Campus / Unidad</label>
                  <input type="text" name="campus" value={profileData.campus} onChange={handleProfileChange} />
                </div>
                <div className="form-group">
                  <label>Especialidad / Carrera</label>
                  <input type="text" name="degree" value={profileData.degree} onChange={handleProfileChange} />
                </div>
                <div className="form-group">
                  <label>Año de egreso</label>
                  <input type="text" name="egressYear" value={profileData.egressYear} onChange={handleProfileChange} />
                </div>
                <div className="form-group">
                  <label>Cédula Profesional</label>
                  <input type="text" name="licenseId" value={profileData.licenseId} onChange={handleProfileChange} />
                  <div className="form-hint">Para verificación SEP</div>
                </div>
                <div className="form-group full">
                  <label>URL Portafolio / GitHub</label>
                  <div className="input-prefix">
                    <span className="input-prefix-label">https://</span>
                    <input type="text" name="githubUrl" value={profileData.githubUrl} onChange={handleProfileChange} />
                  </div>
                </div>
                <div className="form-group full">
                  <label>LinkedIn</label>
                  <div className="input-prefix">
                    <span className="input-prefix-label">linkedin.com/in/</span>
                    <input type="text" name="linkedinUrl" value={profileData.linkedinUrl} onChange={handleProfileChange} />
                  </div>
                </div>
              </div>
              
              <div className="divider"></div>
              
              {/* Renderizado de Etiquetas (Tags) */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Habilidades validadas</label>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {profileData.skills.map((skill, index) => (
                    <span key={index} className="tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: KYC y Cuenta Bancaria */}
          <div>
            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Estado de Verificación KYC</div>
                  <div className="card-sub">Identidad verificada por WITTER</div>
                </div>
                <span className="badge badge-verificado">Completado</span>
              </div>
              
              <div>
                <div className="verify-step">
                  <div className="verify-icon vi-done">✓</div>
                  <div className="verify-label">
                    INE / IFE verificada
                    <div className="verify-sub">Completado el 02/05/2026</div>
                  </div>
                  <span className="badge badge-liberado">Listo</span>
                </div>
                <div className="verify-step">
                  <div className="verify-icon vi-done">✓</div>
                  <div className="verify-label">
                    Cédula Profesional o Historial Académico
                    <div className="verify-sub">Verificada contra institución</div>
                  </div>
                  <span className="badge badge-liberado">Listo</span>
                </div>
                <div className="verify-step">
                  <div className="verify-icon vi-done">✓</div>
                  <div className="verify-label">
                    Selfie de verificación
                    <div className="verify-sub">Reconocimiento facial completado</div>
                  </div>
                  <span className="badge badge-liberado">Listo</span>
                </div>
                <div className="verify-step" style={{ border: 'none' }}>
                  <div className="verify-icon vi-done">✓</div>
                  <div className="verify-label">
                    Entrevista WITTER
                    <div className="verify-sub">Aprobada el 05/05/2026</div>
                  </div>
                  <span className="badge badge-liberado">Listo</span>
                </div>
              </div>
              
              <div className="progress-wrap" style={{ marginTop: '10px' }}>
                <div className="progress-label">
                  <span>KYC Completo</span>
                  <span>100%</span>
                </div>
                <div className="progress-bar" style={{ height: '8px' }}>
                  <div className="progress-fill progress-green" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: '12px' }}>Cuenta para Recibir Pagos</div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Banco</label>
                <select name="bank" value={bankData.bank} onChange={handleBankChange}>
                  <option value="BBVA México">BBVA México</option>
                  <option value="Banamex">Banamex</option>
                  <option value="Banorte">Banorte</option>
                  <option value="Santander">Santander</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>CLABE Interbancaria</label>
                <input type="text" name="clabe" value={bankData.clabe} onChange={handleBankChange} placeholder="18 dígitos" />
              </div>
              <div className="form-group">
                <label>Nombre del Titular</label>
                <input type="text" name="holderName" value={bankData.holderName} onChange={handleBankChange} />
              </div>
            </div>
          </div>

        </div>
        )}
      </div>
    </>
  );
}