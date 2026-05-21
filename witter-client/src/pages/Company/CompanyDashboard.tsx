import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import witterApi from '../../api/witterApi';

// Interfaces basadas en los modelos de tu base de datos
interface MilestonePending {
  id: number;
  projectId: number;
  title: string;
  projectName: string;
  graduateName: string;
  amount: number;
  repoUrl: string;
}

interface ProjectActive {
  id: number;
  name: string;
  graduateName: string;
  startDate: string;
  currentMilestone: number;
  totalMilestones: number;
  progressPct: number;
  budget: number;
  colorClass: string; // Para el diseño visual
  status: string;
}

export default function CompanyDashboard() {
  const [escrowTotal, setEscrowTotal] = useState(0);
  const [stats, setStats] = useState({ activeProjects: 0, paymentsReleased: 0, pendingMilestones: 0 });
  const [pendingMilestones, setPendingMilestones] = useState<MilestonePending[]>([]);
  const [activeProjects, setActiveProjects] = useState<ProjectActive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await witterApi.get('/dashboard/company');
        
        if (res.status === 200) {
          const data = res.data;
          setEscrowTotal(data.escrowTotal);
          setStats(data.stats);
          setPendingMilestones(data.pendingMilestones);
          setActiveProjects(data.activeProjects);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleApproveMilestone = (id: number) => {
    // Aquí llamarías al endpoint: PUT /api/applications/{id}/accept
    alert(`Aprobando y liberando pago del hito ID: ${id}`);
    setPendingMilestones(prev => prev.filter(m => m.id !== id));
    setStats(prev => ({ ...prev, pendingMilestones: prev.pendingMilestones - 1 }));
  };

  const getBadgeClassForStatus = (status: string) => {
    if (status === 'Finalizado') return 'badge-finalizado';
    if (status === 'En curso') return 'badge-curso';
    return 'badge-activo';
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">{new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div className="topbar-actions">
          <Link to="/company/projects/new" className="topbar-btn primary">+ Nuevo Proyecto</Link>
        </div>
      </div>

      <div className="content">
        {/* Banner de Escrow */}
        <div className="escrow-banner">
          <div>
            <div className="eb-label">Fondos en Escrow</div>
            <div className="eb-value">${escrowTotal.toLocaleString('es-MX')} MXN</div>
            <div className="eb-sub">Distribuidos en {stats.activeProjects} proyectos activos</div>
          </div>
          <div className="eb-actions">
            <button className="btn btn-ghost" style={{ borderColor: 'rgba(255,255,255,.2)', color: '#fff' }}>Ver detalle</button>
            <button className="btn btn-primary">Depositar fondos</button>
          </div>
        </div>

        {/* Tarjetas de Estadísticas */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">◈</div>
            <div className="stat-label">Proyectos Activos</div>
            <div className="stat-value">{stats.activeProjects}</div>
            <div className="stat-change">↑ 1 este mes</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green">✓</div>
            <div className="stat-label">Pagos Liberados</div>
            <div className="stat-value">${stats.paymentsReleased.toLocaleString('es-MX')}</div>
            <div className="stat-change">↑ $12,000 esta semana</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-amber">◎</div>
            <div className="stat-label">Hitos Pendientes</div>
            <div className="stat-value">{stats.pendingMilestones}</div>
            <div className="stat-change neg">Requieren tu aprobación</div>
          </div>
        </div>

        {/* Tabla de Hitos por Aprobar */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Hitos por Aprobar</div>
              <div className="card-sub">Entregables pendientes de revisión y liberación de pago</div>
            </div>
            {stats.pendingMilestones > 0 && (
              <span className="badge badge-pendiente">{stats.pendingMilestones} pendientes</span>
            )}
          </div>
          
          {pendingMilestones.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px' }}>
              <div className="empty-text">No hay hitos pendientes de revisión.</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Hito</th>
                    <th>Proyecto</th>
                    <th>Egresado</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Entregable</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingMilestones.map((milestone) => (
                    <tr key={milestone.id}>
                      <td className="td-bold">{milestone.title}</td>
                      <td>{milestone.projectName}</td>
                      <td>{milestone.graduateName}</td>
                      <td><span className="code">${milestone.amount.toLocaleString('es-MX')} MXN</span></td>
                      <td><span className="badge badge-pendiente">Pendiente</span></td>
                      <td><a href={`https://${milestone.repoUrl}`} target="_blank" rel="noreferrer" className="link">{milestone.repoUrl}</a></td>
                      <td style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleApproveMilestone(milestone.id)}>✓ Liberar</button>
                        <Link to={`/company/projects/${milestone.projectId}`} className="btn btn-ghost btn-sm">Ver</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Lista de Proyectos Activos */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Proyectos Activos</div>
              <div className="card-sub">Estado actual de todos los proyectos</div>
            </div>
            <button className="btn btn-ghost btn-sm">Ver todos</button>
          </div>
          <div className="project-list">
            {activeProjects.map((project) => (
              <div className="project-item" key={project.id}>
                <div className="project-color" style={{ background: project.colorClass }}></div>
                <div className="project-info">
                  <div className="project-name">{project.name}</div>
                  <div className="project-meta">{project.graduateName} · Inicio: {project.startDate}</div>
                  <div className="progress-wrap">
                    <div className="progress-label">
                      <span>Hito {project.currentMilestone} / {project.totalMilestones}</span>
                      <span>{project.progressPct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${project.progressPct}%`, background: project.colorClass }}></div>
                    </div>
                  </div>
                </div>
                <div className="project-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className={`badge ${getBadgeClassForStatus(project.status || 'Activo')}`}>
                    {project.status || 'Activo'}
                  </span>
                  <span className="code">${project.budget.toLocaleString('es-MX')} MXN</span>
                  <Link to={`/company/projects/${project.id}`} className="btn btn-ghost btn-sm" style={{ border: '1px solid var(--gray-300)' }}>Gestionar</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}