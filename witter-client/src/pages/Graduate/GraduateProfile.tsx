import { useState, useEffect } from 'react';
import witterApi from '../../api/witterApi';

interface Skill {
  id: number;
  name: string;
}

export default function GraduateProfile() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga
  const [allSkills, setAllSkills] = useState<Skill[]>([]); // Habilidades 

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
    const fetchData = async () => {
      try {
        const [profileResponse, skillsResponse] = await Promise.all([
          witterApi.get('/users/me'),
          witterApi.get('/skills')
        ]);
        
        const data = profileResponse.data.profile;
        setAllSkills(skillsResponse.data);

        setProfileData(prev => ({
          ...prev,
          fullName: `${data.firstName} ${data.lastName}`,
          school: data.school,
          campus: data.campus || '',
          degree: data.degree,
          egressYear: data.egressYear || '',
          licenseId: data.licenseId || '',
          githubUrl: data.githubUrl || '',
          linkedinUrl: data.linkedinUrl || '',
          skills: profileResponse.data.skillIds || [],
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

    fetchData();
  }, []);

  // ... el resto del código (handleProfileChange, handleBankChange) se queda igual ...

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Validación para que Cédula Profesional solo acepte números
    if (name === 'licenseId') {
      const onlyNumbers = value.replace(/[^0-9]/g, '');
      setProfileData(prev => ({ ...prev, [name]: onlyNumbers }));
      return;
    }

    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBankData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    if (selectedId && !profileData.skills.includes(selectedId)) {
      setProfileData(prev => ({ ...prev, skills: [...prev.skills, selectedId] }));
    }
  };

  const handleRemoveSkill = (idToRemove: number) => {
    setProfileData(prev => ({ ...prev, skills: prev.skills.filter(id => id !== idToRemove) }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // 1. Guardar las habilidades actualizadas en la API
      await witterApi.put('/users/me/skills', { skillIds: profileData.skills });
      
      // 2. Guardar el resto de la información del perfil (campus, carrera, github)
      await witterApi.put('/users/me', {
        school: profileData.school,
        campus: profileData.campus,
        degree: profileData.degree,
        egressYear: profileData.egressYear ? Number(profileData.egressYear) : null,
        licenseId: profileData.licenseId,
        githubUrl: profileData.githubUrl,
        linkedinUrl: profileData.linkedinUrl
      });

      alert('Cambios guardados exitosamente en tu perfil y habilidades.');
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Ocurrió un error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
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
                  <input 
                    type="text" 
                    name="licenseId" 
                    value={profileData.licenseId} 
                    onChange={handleProfileChange} 
                    placeholder="Solo números (7 o 8 dígitos)"
                    maxLength={8}
                  />
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
              
              {/* Renderizado de Etiquetas (Tags) Dinámico */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px' }}>Habilidades</label>
                
                {/* Selector para agregar nuevas habilidades */}
                <div style={{ marginBottom: '12px' }}>
                  <select 
                    className="form-control" 
                    style={{ maxWidth: '350px', padding: '8px', borderRadius: '4px', border: '1px solid var(--gray-300)' }}
                    onChange={handleAddSkill}
                    value=""
                  >
                    <option value="" disabled>+ Selecciona Habilidades para agregar</option>
                    {allSkills
                      .filter(skill => !profileData.skills.includes(skill.id))
                      .map(skill => (
                        <option key={skill.id} value={skill.id}>{skill.name}</option>
                    ))}
                  </select>
                </div>

                {/* Lista de chips seleccionados */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {profileData.skills.length === 0 && <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>Aún no has agregado habilidades.</span>}
                  
                  {profileData.skills.map((skillId, index) => {
                    const skillName = allSkills.find(s => s.id === skillId)?.name || `Skill ${skillId}`;
                    return (
                      <span key={index} className="tag" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {skillName}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSkill(skillId)}
                          style={{ background: 'transparent', border: 'none', color: 'currentcolor', cursor: 'pointer', opacity: 0.7, padding: 0, fontWeight: 'bold' }}
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
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