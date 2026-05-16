import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import witterApi from '../../api/witterApi';

interface ApplicationData {
  id: number;
  projectId: number;
  appliedAt: string;
  applicationStatus: string;
  projectTitle: string;
  projectBudget: number;
  projectStatus: string;
  companyName: string;
}

export default function GraduateProjects() {
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        const res = await witterApi.get('/projects/my-applications');
        if (res.status === 200) {
          // Filtramos para mostrar solo los proyectos donde el egresado fue 'Accepted'
          const acceptedApplications = res.data.filter((app: ApplicationData) => app.applicationStatus === 'Accepted');
          setApplications(acceptedApplications);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyApplications();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando tus postulaciones...</div>;

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Mis Proyectos</div>
          <div className="page-sub">Da seguimiento a tus proyectos asignados</div>
        </div>
        <div className="topbar-actions">
          <Link to="/graduate/explore" className="topbar-btn primary">Explorar Nuevos</Link>
        </div>
      </div>

      <div className="content">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Proyectos Asignados</div>
              <div className="card-sub">Consulta los proyectos en los que has sido aceptado</div>
            </div>
          </div>
          <div className="project-list" style={{ marginTop: '20px' }}>
            {applications.map((app) => (
              <div className="project-item" key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div className="project-info">
                    <div className="project-name">{app.projectTitle}</div>
                    <div className="project-meta">{app.companyName} · Postulado el {new Date(app.appliedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="project-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span className="badge" style={{ 
                      background: app.applicationStatus === 'Accepted' ? '#dcfce7' : app.applicationStatus === 'Rejected' ? '#fee2e2' : 'var(--gray-100)',
                      color: app.applicationStatus === 'Accepted' ? '#166534' : app.applicationStatus === 'Rejected' ? '#991b1b' : 'var(--gray-600)'
                    }}>
                      {app.applicationStatus === 'Pending' ? 'Pendiente' : app.applicationStatus === 'Accepted' ? 'Aceptada' : 'Rechazada'}
                  </span>
                  <span className="code">${app.projectBudget.toLocaleString('es-MX')} MXN</span>
                  <Link to={`/graduate/projects/${app.projectId}`} className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--gray-300)' }}>
                    Ver Proyecto
                  </Link>
                </div>
              </div>
            ))}
            {applications.length === 0 && (
              <div style={{ padding: '20px', color: 'var(--gray-500)' }}>No tienes proyectos asignados actualmente.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}