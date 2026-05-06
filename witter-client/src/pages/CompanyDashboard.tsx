import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Interfaces basadas en los modelos de tu base de datos
interface MilestonePending {
  id: number;
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
}

export default function CompanyDashboard() {
  // Estados para almacenar la información (Simulando la carga desde la API)
  const [escrowTotal, setEscrowTotal] = useState(248500);
  const [stats, setStats] = useState({ activeProjects: 4, paymentsReleased: 84200, pendingMilestones: 3 });
  const [pendingMilestones, setPendingMilestones] = useState<MilestonePending[]>([]);
  const [activeProjects, setActiveProjects] = useState<ProjectActive[]>([]);

  useEffect(() => {
    // Aquí en el futuro harás el fetch a tu API: fetch('https://localhost:7112/api/dashboard/company')
    // Por ahora, cargamos los datos de prueba basados en tu maqueta
    setPendingMilestones([
      { id: 1, title: 'Sprint 2 — API REST', projectName: 'Sistema CRM', graduateName: 'Ana Torres', amount: 18000, repoUrl: 'github.com/.../pr/42' },
      { id: 2, title: 'Módulo de Reportes', projectName: 'BI Dashboard', graduateName: 'Carlos Ruiz', amount: 22500, repoUrl: 'github.com/.../pr/17' },
      { id: 3, title: 'Diseño UX Mobile', projectName: 'App Logística', graduateName: 'Sofía Méndez', amount: 14000, repoUrl: 'figma.com/...' }
    ]);

    setActiveProjects([
      { id: 1, name: 'Sistema CRM Integrado', graduateName: 'Ana Torres', startDate: '01/05/2026', currentMilestone: 2, totalMilestones: 4, progressPct: 50, budget: 72000, colorClass: 'var(--blue-500)' },
      { id: 2, name: 'BI Dashboard Financiero', graduateName: 'Carlos Ruiz', startDate: '15/04/2026', currentMilestone: 3, totalMilestones: 5, progressPct: 60, budget: 95000, colorClass: 'var(--violet-500)' },
      { id: 3, name: 'App Logística Mobile', graduateName: 'Sofía Méndez', startDate: '20/05/2026', currentMilestone: 1, totalMilestones: 3, progressPct: 33, budget: 48000, colorClass: 'var(--green-500)' }
    ]);
  }, []);

  const handleApproveMilestone = (id: number) => {
    // Aquí llamarías al endpoint: PUT /api/applications/{id}/accept
    alert(`Aprobando y liberando pago del hito ID: ${id}`);
    setPendingMilestones(prev => prev.filter(m => m.id !== id));
    setStats(prev => ({ ...prev, pendingMilestones: prev.pendingMilestones - 1 }));
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
                        <button className="btn btn-ghost btn-sm">Ver</button>
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
                <div className="project-actions">
                  <span className="badge badge-activo">Activo</span>
                  <span className="code">${project.budget.toLocaleString('es-MX')} MXN</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}