import { useState } from 'react';

export default function CompanyProfile() {
  const [isSaving, setIsSaving] = useState(false);

  // Estado para los datos fiscales y del representante legal
  const [companyData, setCompanyData] = useState({
    companyName: 'TechCorp S.A. de C.V.',
    rfc: 'TCO200101AB9',
    industry: 'Tecnología / Software',
    website: 'techcorp.mx',
    phone: '55 1234 5678',
    email: 'facturacion@techcorp.mx',
    description: 'Empresa de desarrollo de software con más de 10 años en el mercado mexicano especializada en soluciones empresariales.',
    repName: 'Roberto Gómez Ortega',
    repCurp: 'GORR800101HDFMXB04'
  });

  // Estado para la cuenta bancaria
  const [bankData, setBankData] = useState({
    bank: 'BBVA México',
    clabe: '',
    holderName: ''
  });

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
    // Simulación de guardado en la API
    setTimeout(() => {
      setIsSaving(false);
      alert('Datos de la empresa actualizados correctamente.');
    }, 1000);
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Perfil de la Empresa</div>
          <div className="page-sub">Información fiscal y verificación de identidad</div>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-kyc">KYC Pendiente</span>
          <button className="topbar-btn primary" onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      <div className="content">
        <div className="alert alert-warn">
          <span>⚠</span>
          <span>Para publicar proyectos y realizar pagos, completa el proceso de <strong>Verificación KYC</strong>.</span>
        </div>

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
                  <input type="text" name="rfc" value={companyData.rfc} onChange={handleCompanyChange} placeholder="XAXX010101000" />
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
                  <div className="card-title">Verificación KYC</div>
                  <div className="card-sub">Completa los 4 pasos para habilitar tu cuenta</div>
                </div>
                <span className="badge badge-kyc">2 / 4</span>
              </div>
              
              <div>
                <div className="verify-step">
                  <div className="verify-icon vi-done">✓</div>
                  <div className="verify-label">
                    Datos fiscales registrados
                    <div className="verify-sub">Completado el 10/06/2026</div>
                  </div>
                  <span className="badge badge-liberado">Listo</span>
                </div>
                <div className="verify-step">
                  <div className="verify-icon vi-done">✓</div>
                  <div className="verify-label">
                    Acta Constitutiva
                    <div className="verify-sub">Documento verificado</div>
                  </div>
                  <span className="badge badge-liberado">Listo</span>
                </div>
                <div className="verify-step">
                  <div className="verify-icon vi-pending">!</div>
                  <div className="verify-label">
                    Comprobante de domicilio fiscal
                    <div className="verify-sub">Pendiente de carga</div>
                  </div>
                  <button className="btn btn-ghost btn-sm">Cargar</button>
                </div>
                <div className="verify-step" style={{ border: 'none' }}>
                  <div className="verify-icon vi-empty">○</div>
                  <div className="verify-label">
                    Entrevista de validación
                    <div className="verify-sub">Disponible al completar paso 3</div>
                  </div>
                  <span className="badge badge-pendiente">Bloqueado</span>
                </div>
              </div>
              
              <div className="progress-wrap" style={{ marginTop: '12px' }}>
                <div className="progress-label">
                  <span>Progreso KYC</span>
                  <span>50%</span>
                </div>
                <div className="progress-bar" style={{ height: '8px' }}>
                  <div className="progress-fill progress-amber" style={{ width: '50%' }}></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title" style={{ marginBottom: '12px' }}>Cuenta Bancaria para Pagos</div>
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
                <label>CLABE Interbancaria</label>
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