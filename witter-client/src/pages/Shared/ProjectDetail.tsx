import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import witterApi from '../../api/witterApi';

interface MilestoneStep {
  id: number;
  stepNumber: number;
  title: string;
  description: string;
  amount: number;
  status?: string; // Todavía lo podemos simular o traer de BD según tu modelo
}

interface ApplicationData {
  id: number;
  graduateId: string;
  appliedAt: string;
  applicationStatus: string;
  graduateName: string;
  graduateDegree?: string;
}

interface ProjectData {
  id: number;
  title: string;
  companyName: string;
  createdAt: string;
  budget: number;
  description: string;
  status: string;
  milestones: MilestoneStep[];
  skills: string[];
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados para la API
  const [project, setProject] = useState<ProjectData | null>(null);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para aplicar
  const [isApplying, setIsApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await witterApi.get(`/projects/${id}`);
        setProject(response.data);

        // Si es empresa, obtener postulaciones
        if (localStorage.getItem('role') === 'Company') {
          const appResponse = await witterApi.get(`/projects/${id}/applications`);
          setApplications(appResponse.data);
        }

        // Si es egresado, verificar si ya aplicó a este proyecto particular
        if (localStorage.getItem('role') === 'Graduate') {
          const myAppsRes = await witterApi.get(`/projects/my-applications`);
          const alreadyApplied = myAppsRes.data.some((app: any) => app.projectId === Number(id));
          if (alreadyApplied) {
            setHasApplied(true);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar el proyecto.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) fetchProjectDetails();
  }, [id]);

  const handleUpdateApplication = async (applicationId: number, status: 'Accepted' | 'Rejected') => {
    try {
      await witterApi.put(`/projects/${id}/applications/${applicationId}/status`, { status });
      setApplications(prev => 
        prev.map(a => a.id === applicationId ? { ...a, applicationStatus: status } : a)
      );
      alert(`Postulación ${status === 'Accepted' ? 'aceptada' : 'rechazada'} exitosamente`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al actualizar la postulación.');
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    setApplyMessage('');
    try {
      const response = await witterApi.post(`/projects/${id}/apply`);
      setApplyMessage(response.data.message || 'Te has postulado con éxito.');
      setHasApplied(true);
    } catch (err: any) {
      setApplyMessage(err.response?.data?.message || 'Hubo un error al postularte.');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando proyecto...</div>;
  if (error || !project) return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <>
      <div className="content" style={{ paddingTop: '20px' }}>
        {/* Encabezado del Proyecto (Ya no sobrepuesto en la topbar) */}
        <div style={{ marginBottom: '32px' }}>
          <button className="btn" style={{ marginBottom: '24px', background: '#fff', border: '1px solid var(--gray-300)', fontSize: '13px' }} onClick={() => navigate(-1)}>
            &larr; Volver
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--blue-950)', margin: '0 0 8px 0' }}>{project.title}</h1>
              <div style={{ fontSize: '15px', color: 'var(--gray-500)' }}>
                <strong>{project.companyName}</strong> · Publicado el {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              {userRole === 'Graduate' && !hasApplied && (
                 <button 
                   className="btn btn-primary" 
                   onClick={handleApply} 
                   disabled={isApplying}
                   style={{ padding: '12px 24px', fontSize: '15px' }}
                 >
                   {isApplying ? 'Enviando...' : 'Postularme a este proyecto'}
                 </button>
              )}
              {userRole === 'Graduate' && hasApplied && (
                 <div style={{ padding: '10px 20px', fontSize: '14px', color: '#166534', background: '#dcfce7', borderRadius: '8px', fontWeight: 600 }}>
                   ✓ Ya estás postulado a este proyecto
                 </div>
              )}
              {applyMessage && <div style={{ fontSize: '13px', fontWeight: 500, color: applyMessage.includes('éxito') ? 'var(--green-600)' : 'red' }}>{applyMessage}</div>}
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ alignItems: 'start', marginBottom: '24px' }}>
          <div className="card">
             <div className="card-title" style={{ marginBottom: '16px' }}>Descripción del Proyecto</div>
             <p style={{ lineHeight: '1.6', color: 'var(--gray-600)', whiteSpace: 'pre-wrap' }}>{project.description}</p>
          </div>
          <div className="card">
             <div className="card-title" style={{ marginBottom: '16px' }}>Habilidades Requeridas</div>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
               {project.skills?.map((skill, idx) => (
                  <span key={idx} className="badge" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>{skill}</span>
               ))}
               {!project.skills?.length && <span>No especificadas</span>}
             </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Hitos Programados</div>
              <div className="card-sub">{project.milestones?.length || 0} hitos definidos por la empresa</div>
            </div>
          </div>

          <div className="milestone-steps" style={{ marginTop: '20px' }}>
            {project.milestones?.map((ms, index) => (
              <div className="ms-step" key={ms.id}>
                <div className="ms-dot-wrap">
                  <div className="ms-dot ms-dot-pending">{ms.stepNumber}</div>
                  {index < project.milestones.length - 1 && <div className="ms-line"></div>}
                </div>
                <div className="ms-body">
                  <div className="ms-title">{ms.title}</div>
                  <div className="ms-desc">{ms.description}</div>
                  <div className="ms-amount" style={{ color: 'var(--blue-600)', marginTop: '8px' }}>
                    ${ms.amount.toLocaleString('es-MX')} MXN
                  </div>
                </div>
              </div>
            ))}
            {!project.milestones?.length && <p>No hay hitos disponibles para este proyecto.</p>}
          </div>

          {/* Presupuesto Total movido abajo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--gray-200)' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gray-600)' }}>Presupuesto Total del Proyecto</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--blue-950)' }}>
              ${project.budget.toLocaleString('es-MX')} MXN
            </div>
          </div>
        </div>

        {/* Sección de Postulaciones (Solo visible para la Empresa) */}
        {userRole === 'Company' && (
          <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Postulaciones Recibidas</div>
                <div className="card-sub">{applications.length} egresados se han postulado</div>
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              {applications.length === 0 ? (
                <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Aún no hay postulaciones para este proyecto.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {applications.map(app => (
                    <div key={app.id} style={{ padding: '16px', border: '1px solid var(--gray-200)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--blue-950)' }}>{app.graduateName}</div>
                        <div style={{ fontSize: '14px', color: 'var(--gray-500)', marginTop: '4px' }}>
                          {app.graduateDegree || 'Egresado'} · Postulado el {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                        <div style={{ marginTop: '8px' }}>
                          <span className="badge" style={{ 
                            background: app.applicationStatus === 'Accepted' ? '#dcfce7' : app.applicationStatus === 'Rejected' ? '#fee2e2' : 'var(--gray-100)',
                            color: app.applicationStatus === 'Accepted' ? '#166534' : app.applicationStatus === 'Rejected' ? '#991b1b' : 'var(--gray-600)'
                          }}>
                            {app.applicationStatus === 'Pending' ? 'Pendiente' : app.applicationStatus === 'Accepted' ? 'Aceptada' : 'Rechazada'}
                          </span>
                        </div>
                      </div>
                      
                      {app.applicationStatus === 'Pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn" 
                            style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', fontSize: '13px' }}
                            onClick={() => handleUpdateApplication(app.id, 'Accepted')}
                          >
                            Aceptar
                          </button>
                          <button 
                            className="btn" 
                            style={{ background: '#dc2626', color: 'white', border: 'none', padding: '8px 16px', fontSize: '13px' }}
                            onClick={() => handleUpdateApplication(app.id, 'Rejected')}
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}