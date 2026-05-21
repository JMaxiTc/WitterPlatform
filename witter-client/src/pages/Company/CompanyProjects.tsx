import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import witterApi from '../../api/witterApi';

interface ProjectActive {
  id: number;
  name: string;
  graduateName: string;
  startDate: string;
  currentMilestone: number;
  totalMilestones: number;
  progressPct: number;
  budget: number;
  colorClass: string;
  status: string;
}

export default function CompanyProjects() {
  const [activeProjects, setActiveProjects] = useState<ProjectActive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await witterApi.get('/dashboard/company');
        if (res.status === 200) {
          setActiveProjects(res.data.activeProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando proyectos...</div>;

  const getBadgeClassForStatus = (status: string) => {
    if (status === 'Finalizado') return 'badge-finalizado';
    if (status === 'En curso') return 'badge-curso';
    return 'badge-activo';
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Mis Proyectos</div>
          <div className="page-sub">Gestiona tus proyectos publicados y postulaciones</div>
        </div>
        <div className="topbar-actions">
          <Link to="/company/projects/new" className="topbar-btn primary">+ Nuevo Proyecto</Link>
        </div>
      </div>

      <div className="content">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Todos tus Proyectos</div>
              <div className="card-sub">Haz clic en un proyecto para gestionar sus postulaciones o hitos</div>
            </div>
          </div>
          <div className="project-list" style={{ marginTop: '20px' }}>
            {activeProjects.map((project) => (
              <div className="project-item" key={project.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div className="project-color" style={{ background: project.colorClass }}></div>
                  <div className="project-info">
                    <div className="project-name">{project.name}</div>
                    <div className="project-meta">{project.graduateName} · Inicio: {project.startDate}</div>
                  </div>
                </div>
                <div className="project-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span className={`badge ${getBadgeClassForStatus(project.status || 'Activo')}`}>
                    {project.status || 'Activo'}
                  </span>
                  <Link to={`/company/projects/${project.id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }}>
                    Ver Postulaciones
                  </Link>
                </div>
              </div>
            ))}
            {activeProjects.length === 0 && (
              <div style={{ padding: '20px', color: 'var(--gray-500)' }}>Aún no has publicado ningún proyecto.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}