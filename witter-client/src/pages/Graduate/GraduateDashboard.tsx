import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import witterApi from '../../api/witterApi'; // <-- Importamos nuestra API configurada

// Interfaces basadas en la estructura de tu base de datos y diseño
interface AssignedProject {
  id: number;
  projectName: string;
  companyName: string;
  currentMilestone: string;
  amount: number;
  status: 'En revisión' | 'En Escrow';
}

interface Credential {
  id: string;
  issuer: string;
  title: string;
  recipient: string;
  date: string;
  hash: string;
  gradient: string;
  sealColor: string;
  badgeColor: string;
}

export default function GraduateDashboard() {
  const [stats, setStats] = useState({ activeProjects: 2, totalEarnings: 54000, credentialsCount: 3 });
  const [assignedProjects, setAssignedProjects] = useState<AssignedProject[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  
  // NUEVO: Estado para la información real del usuario
  const [userData, setUserData] = useState({
    fullName: 'Cargando...',
    school: '',
    degree: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Petición real para obtener los datos del usuario logueado
    const fetchUserData = async () => {
      try {
        const response = await witterApi.get('/users/me');
        const data = response.data.profile;
        
        setUserData({
          fullName: `${data.firstName} ${data.lastName}`,
          school: data.school,
          degree: data.degree
        });
      } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    // 2. Datos simulados de los proyectos y credenciales (Fase 4 de nuestra hoja de ruta)
    setAssignedProjects([
      { id: 1, projectName: 'Sistema CRM Integrado', companyName: 'TechCorp', currentMilestone: 'Sprint 2 — API REST', amount: 18000, status: 'En revisión' },
      { id: 2, projectName: 'App Logística Mobile', companyName: 'TechCorp', currentMilestone: 'Diseño UX Mobile', amount: 14000, status: 'En Escrow' }
    ]);

    // ... (Mantén tu arreglo setCredentials igualito como lo tenías) ...
    setCredentials([
      { 
        id: '1', issuer: 'Tecnológico de Colima', title: 'Ingeniería Informática', 
        recipient: 'Ana Torres Ramírez', date: 'Dic 2025', hash: 'vc:witter:0x4a7f…b3c1',
        gradient: 'linear-gradient(140deg, var(--blue-950) 0%, var(--blue-800) 100%)',
        sealColor: 'var(--blue-300)', badgeColor: 'var(--green-400)'
      },
      // ... (demás credenciales)
    ]);
  }, []);

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando tu espacio de trabajo...</div>;
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Mi Dashboard</div>
          {/* NUEVO: Aquí inyectamos tus datos reales */}
          <div className="page-sub">
            {userData.fullName} {userData.school && `· ${userData.school}`} {userData.degree && `· ${userData.degree}`}
          </div>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-verificado">KYC Verificado</span>
        </div>
      </div>

      <div className="content">
        {/* Tarjetas de Estadísticas */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">◈</div>
            <div className="stat-label">Proyectos Activos</div>
            <div className="stat-value">{stats.activeProjects}</div>
            <div className="stat-change">1 con hito pendiente</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green">$</div>
            <div className="stat-label">Ingresos Acumulados</div>
            <div className="stat-value">${stats.totalEarnings.toLocaleString('es-MX')}</div>
            <div className="stat-change">↑ $18,000 este mes</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--violet-100)', color: 'var(--violet-700)' }}>⬡</div>
            <div className="stat-label">Credenciales W3C</div>
            <div className="stat-value">{stats.credentialsCount}</div>
            <div className="stat-change">Verificadas y activas</div>
          </div>
        </div>

        {/* Proyectos Asignados */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Proyectos Asignados</div>
              <div className="card-sub">Estado actual de tus proyectos y pagos</div>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Proyecto</th>
                  <th>Empresa</th>
                  <th>Hito actual</th>
                  <th>Monto hito</th>
                  <th>Estado pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {assignedProjects.map(project => (
                  <tr key={project.id}>
                    <td className="td-bold">{project.projectName}</td>
                    <td>{project.companyName}</td>
                    <td>{project.currentMilestone}</td>
                    <td><span className="code">${project.amount.toLocaleString('es-MX')} MXN</span></td>
                    <td>
                      <span className={`badge ${project.status === 'En revisión' ? 'badge-pendiente' : 'badge-escrow'}`}>
                        {project.status}
                      </span>
                    </td>
                    <td><button className="btn btn-ghost btn-sm">Ver detalle</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divider"></div>
          <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>
            Historial de pagos:
            <span className="badge badge-liberado" style={{ margin: '0 4px' }}>$18,000 liberado el 15/05</span>
            <span className="badge badge-liberado" style={{ margin: '0 4px' }}>$18,000 liberado el 01/06</span>
          </div>
        </div>

        {/* Galería de Credenciales Verificables W3C */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Galería de Credenciales Verificables W3C</div>
              <div className="card-sub">Certificados digitales emitidos en la blockchain de WITTER</div>
            </div>
            <span className="badge badge-verificado">{stats.credentialsCount} activas</span>
          </div>
          <div className="credential-grid">
            {credentials.map(cred => (
              <div className="credential-card" key={cred.id} style={{ background: cred.gradient }}>
                <div className="cred-issuer">{cred.issuer}</div>
                <div className="cred-title">{cred.title}</div>
                <div className="cred-name">{cred.recipient}</div>
                <div className="cred-date">{cred.date}</div>
                <div className="cred-footer">
                  <div className="cred-badge" style={{ color: cred.badgeColor }}>✓ {cred.id === '2' ? 'Hito Liberado' : 'Verificado W3C'}</div>
                  <div className="cred-seal" style={{ borderColor: cred.sealColor, color: cred.sealColor }}>⬡</div>
                </div>
                <div className="cred-hash">{cred.hash}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}