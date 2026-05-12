import { useState, useEffect } from 'react';
import witterApi from '../../api/witterApi';

interface PendingCompany {
  userId: string;
  email: string;
  companyName: string;
  rfc: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [pendingCompanies, setPendingCompanies] = useState<PendingCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await witterApi.get('/admin/pending-companies');
      setPendingCompanies(res.data);
    } catch (error) {
      console.error("Error fetching pending companies", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: string, companyName: string) => {
    if (!window.confirm(`¿Seguro que deseas aprobar a la empresa ${companyName}?`)) return;
    
    try {
      await witterApi.put(`/admin/approve-company/${userId}`);
      alert('Empresa aprobada exitosamente.');
      fetchPending(); // Recargar la lista
    } catch (error) {
      alert('Error al aprobar empresa');
    }
  };

  return (
    <>
      <div className="topbar" style={{ background: '#0a1628', color: 'white' }}>
        <div>
          <div className="page-title" style={{ color: 'white' }}>Panel de Superusuario</div>
          <div className="page-sub" style={{ color: '#94a3b8' }}>Centro de control y auditoría WITTER</div>
        </div>
        <div className="topbar-actions">
          <span className="badge" style={{ background: '#dc2626', color: 'white' }}>Nivel ROOT</span>
        </div>
      </div>

      <div className="content">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Solicitudes de Empresas Pendientes</div>
              <div className="card-sub">Aprobación de cuentas B2B (KYC Nivel 1)</div>
            </div>
            <span className="badge badge-pendiente">{pendingCompanies.length} pendientes</span>
          </div>

          {isLoading ? (
            <div style={{ padding: '20px' }}>Cargando solicitudes...</div>
          ) : pendingCompanies.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-500)' }}>
              No hay solicitudes de empresas pendientes.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>RFC</th>
                    <th>Correo</th>
                    <th>Fecha de Solicitud</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCompanies.map(company => (
                    <tr key={company.userId}>
                      <td className="td-bold">{company.companyName}</td>
                      <td>{company.rfc}</td>
                      <td>{company.email}</td>
                      <td>{new Date(company.createdAt).toLocaleDateString()}</td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(company.userId, company.companyName)}>
                          ✓ Aprobar
                        </button>
                        <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-500)' }}>
                          ✕ Rechazar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}