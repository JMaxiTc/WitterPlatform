import { useState, useEffect } from 'react';
import witterApi from '../../api/witterApi';

export default function CompanyProfile() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  // Estado para los datos fiscales y del representante legal
  const [companyData, setCompanyData] = useState({
    companyName: '',
    rfc: '',
    industry: 'Tecnología / Software',
    website: '',
    phone: '',
    email: '',
    description: '',
    repName: '',
    repCurp: ''
  });

  // Estado para la cuenta bancaria
  const [bankData, setBankData] = useState({
    bank: 'BBVA México',
    clabe: '',
    holderName: ''
  });

  // Efecto para cargar los datos reales al entrar a la pantalla
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const response = await witterApi.get('/users/me');
        const { profile, email, isKycVerified } = response.data;

        setCompanyData(prev => ({
          ...prev,
          companyName: profile.companyName || '',
          rfc: profile.rfc || '',
          industry: profile.sector || 'Tecnología / Software',
          website: profile.website || '',
          email: email || ''
        }));
        
        setIsVerified(isKycVerified);
      } catch (error) {
        console.error("Error al cargar perfil de empresa:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyProfile();
  }, []);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({ ...prev, [name]: value }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBankData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    // Simulación de guardado en la API (esto lo conectaremos a un PUT más adelante)
    setTimeout(() => {
      setIsSaving(false);
      alert('Datos de la empresa actualizados correctamente.');
    }, 1000);
  };

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando información corporativa...</div>;
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Perfil de la Empresa</div>
          <div className="page-sub">Gestión de identidad legal de {companyData.companyName}</div>
        </div>
        <div className="topbar-actions">
          {/* Badge dinámico dependiendo de isVerified */}
          <span className={`badge ${isVerified ? 'badge-verificado' : 'badge-kyc'}`}>
            {isVerified ? 'KYC Verificado' : 'KYC Pendiente'}
          </span>
          <button className="topbar-btn primary" onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <div className="content">
        {/* Alerta dinámica si no está verificado */}
        {!isVerified && (
          <div className="alert alert-warn">
            <span>⚠</span>
            <span>Para publicar proyectos y fondear el Escrow, completa el proceso de <strong>Verificación KYC</strong>.</span>
          </div>
        )}

        <div className="grid-2" style={{ alignItems: 'start' }}>
          
          {/* COLUMNA IZQUIERDA: Datos Fiscales y Representante */}
          <div className="card">
            <div className="form-section-title">Datos Fiscales</div>
            <div className="form-section">
              <div className="form-grid">
                <div className="form-group full">
                  <label>Razón Social</label>
                  <input type="text" name="companyName" value={companyData.companyName} onChange={handleCompanyChange} />
                </div>
                <div className="form-group">
                  <label>RFC</label>
                  <input 
                    type="text" 
                    name="rfc" 
                    value={companyData.rfc} 
                    onChange={handleCompanyChange} 
                    placeholder="XAXX010101000" 
                    readOnly={isVerified} // Si ya está verificado, no se puede editar el RFC
                  />
                  <div className="form-hint">12 o 13 caracteres</div>
                </div>
                <div className="form-group">
                  <label>Industria</label>
                  <select name="industry" value={companyData.industry} onChange={handleCompanyChange}>
                    <option value="Tecnología / Software">Tecnología / Software</option>
                    <option value="Finanzas">Finanzas</option>
                    <option value="Salud">Salud</option>
                    <option value="Manufactura">Manufactura</option>
                    <option value="Educación">Educación</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Sitio Web</label>
                  <div className="input-prefix">
                    <span className="input-prefix-label">https://</span>
                    <input type="text" name="website" value={companyData.website} onChange={handleCompanyChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Teléfono de Contacto</label>
                  <div className="input-prefix">
                    <span className="input-prefix-label">+52</span>
                    <input type="text" name="phone" value={companyData.phone} onChange={handleCompanyChange} />
                  </div>
                </div>
                <div className="form-group full">
                  <label>Email de Facturación</label>
                  <input type="email" name="email" value={companyData.email} onChange={handleCompanyChange} />
                </div>
                <div className="form-group full">
                  <label>Descripción de la Empresa</label>
                  <textarea name="description" value={companyData.description} onChange={handleCompanyChange}></textarea>
                </div>
              </div>
            </div>
            
            <div className="divider"></div>
            
            <div className="form-section-title" style={{ marginBottom: '14px' }}>Representante Legal</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre completo</label>
                <input type="text" name="repName" value={companyData.repName} onChange={handleCompanyChange} />
              </div>
              <div className="form-group">
                <label>CURP</label>
                <input type="text" name="repCurp" value={companyData.repCurp} onChange={handleCompanyChange} />
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: KYC y Cuenta Bancaria */}
          <div>
            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="card-header">
                <div>
                  <div className="card-title">Verificación KYC Nivel 1</div>
                  <div className="card-sub">Auditoría legal y fiscal</div>
                </div>
                {/* Marcador dinámico */}
                <span className={`badge ${isVerified ? 'badge-verificado' : 'badge-kyc'}`}>
                  {isVerified ? 'Completado' : 'Pendiente'}
                </span>
              </div>
              
              <div>
                <div className="verify-step">
                  <div className="verify-icon vi-done">✓</div>
                  <div className="verify-label">
                    Datos básicos y registro
                    <div className="verify-sub">Completado</div>
                  </div>
                  <span className="badge badge-liberado">Listo</span>
                </div>
                <div className="verify-step">
                  {/* Icono y texto dinámico para la revisión final */}
                  <div className={`verify-icon ${isVerified ? 'vi-done' : 'vi-pending'}`}>
                    {isVerified ? '✓' : '!'}
                  </div>
                  <div className="verify-label">
                    Revisión de administración (KYC)
                    <div className="verify-sub">
                      {isVerified ? 'Documentación validada' : 'Pendiente de autorización de fondos'}
                    </div>
                  </div>
                  {isVerified ? (
                    <span className="badge badge-liberado">Aprobado</span>
                  ) : (
                    <span className="badge badge-pendiente">En revisión</span>
                  )}
                </div>
              </div>
              
              <div className="progress-wrap" style={{ marginTop: '12px' }}>
                <div className="progress-label">
                  <span>Progreso KYC</span>
                  <span>{isVerified ? '100%' : '50%'}</span>
                </div>
                <div className="progress-bar" style={{ height: '8px' }}>
                  <div 
                    className={`progress-fill ${isVerified ? 'progress-green' : 'progress-amber'}`} 
                    style={{ width: isVerified ? '100%' : '50%' }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: '12px' }}>Cuenta Bancaria para Escrow</div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>Banco</label>
                <select name="bank" value={bankData.bank} onChange={handleBankChange}>
                  <option value="BBVA México">BBVA México</option>
                  <option value="Banamex">Banamex</option>
                  <option value="Banorte">Banorte</option>
                  <option value="HSBC">HSBC</option>
                  <option value="Santander">Santander</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label>CLABE Interbancaria (SPEI)</label>
                <input type="text" name="clabe" value={bankData.clabe} onChange={handleBankChange} placeholder="18 dígitos" />
              </div>
              <div className="form-group">
                <label>Nombre del Titular</label>
                <input type="text" name="holderName" value={bankData.holderName} onChange={handleBankChange} placeholder="Como aparece en el banco" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}