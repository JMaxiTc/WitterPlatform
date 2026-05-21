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
  latestSubmission?: {
    repoUrl: string;
    comment: string;
    feedback: string;
  };
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
  const [myApplicationStatus, setMyApplicationStatus] = useState<string | null>(null);

  // Estados para entregar hito
  const [submittingMilestone, setSubmittingMilestone] = useState<number | null>(null);
  const [repoUrls, setRepoUrls] = useState<{ [key: number]: string }>({});
  const [comments, setComments] = useState<{ [key: number]: string }>({});

  // Estados para revisar hito (empresa)
  const [reviewingMilestone, setReviewingMilestone] = useState<number | null>(null);
  const [feedbacks, setFeedbacks] = useState<{ [key: number]: string }>({});
  
  const userRole = localStorage.getItem('role');

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
        const myApp = myAppsRes.data.find((app: any) => app.projectId === Number(id));
        if (myApp) {
          setHasApplied(true);
          setMyApplicationStatus(myApp.applicationStatus);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el proyecto.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
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
      setMyApplicationStatus('Pending');
    } catch (err: any) {
      setApplyMessage(err.response?.data?.message || 'Hubo un error al postularte.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleSubmitMilestone = async (milestoneId: number) => {
    setSubmittingMilestone(milestoneId);
    try {
      const msRepoUrl = repoUrls[milestoneId] || '';
      const msComment = comments[milestoneId] || '';
      
      await witterApi.post(`/projects/${id}/milestones/${milestoneId}/submit`, { repoUrl: msRepoUrl, comment: msComment });
      alert('Entregable subido exitosamente.');
      setRepoUrls(prev => ({ ...prev, [milestoneId]: '' }));
      setComments(prev => ({ ...prev, [milestoneId]: '' }));
      fetchProjectDetails(); // Refrescar los hitos
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al enviar entregable.');
    } finally {
      setSubmittingMilestone(null);
    }
  };

  const handleReviewMilestone = async (milestoneId: number, isApproved: boolean) => {
    setReviewingMilestone(milestoneId);
    try {
      const msFeedback = feedbacks[milestoneId] || '';
      await witterApi.post(`/projects/${id}/milestones/${milestoneId}/review`, { isApproved, feedback: msFeedback });
      alert(isApproved ? 'Hito aceptado y pago liberado.' : 'Hito rechazado.');
      setFeedbacks(prev => ({ ...prev, [milestoneId]: '' }));
      fetchProjectDetails(); // Refrescar los hitos
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al revisar hito.');
    } finally {
      setReviewingMilestone(null);
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
              <div className="ms-step" key={ms.id} style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div className="ms-dot-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className={`ms-dot ${ms.status === 'Liberado' ? 'ms-dot-success' : 'ms-dot-pending'}`} style={{
                    width: '32px', height: '32px', borderRadius: '50%', background: ms.status === 'Liberado' ? '#22c55e' : 'var(--blue-600)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                  }}>{ms.stepNumber}</div>
                  {index < project.milestones.length - 1 && <div className="ms-line" style={{ width: '2px', background: 'var(--gray-200)', flex: 1, margin: '8px 0' }}></div>}
                </div>
                <div className="ms-body" style={{ flex: 1, paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="ms-title" style={{ fontSize: '18px', fontWeight: 600, color: 'var(--blue-950)' }}>{ms.title}</div>
                      <div className="ms-desc" style={{ color: 'var(--gray-500)', marginTop: '4px' }}>{ms.description}</div>
                    </div>
                    {ms.status && (
                      <span className="badge" style={{ 
                        background: ms.status === 'Liberado' ? '#dcfce7' : ms.status === 'En revisión' ? '#fef08a' : ms.status === 'Rechazado' ? '#fee2e2' : '#f1f5f9',
                        color: ms.status === 'Liberado' ? '#166534' : ms.status === 'En revisión' ? '#854d0e' : ms.status === 'Rechazado' ? '#991b1b' : '#475569'
                      }}>
                        {ms.status}
                      </span>
                    )}
                  </div>
                  <div className="ms-amount" style={{ color: 'var(--blue-600)', marginTop: '8px', fontWeight: 700 }}>
                    ${ms.amount.toLocaleString('es-MX')} MXN
                  </div>

                  {ms.latestSubmission?.feedback && (ms.status === 'Liberado' || ms.status === 'Rechazado') && userRole === 'Graduate' && (
                    <div style={{ marginTop: '16px', background: ms.status === 'Liberado' ? '#f0fdf4' : '#fef2f2', padding: '12px', borderRadius: '8px', border: `1px solid ${ms.status === 'Liberado' ? '#bbf7d0' : '#fecaca'}` }}>
                      <div style={{ fontSize: '12px', color: ms.status === 'Liberado' ? '#166534' : '#991b1b', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase' }}>Comentario de la empresa</div>
                      <div style={{ fontSize: '14px', color: ms.status === 'Liberado' ? '#14532d' : '#7f1d1d', whiteSpace: 'pre-wrap' }}>{ms.latestSubmission.feedback}</div>
                    </div>
                  )}

                  {ms.latestSubmission && (ms.status === 'Liberado' || ms.status === 'Rechazado') && userRole === 'Company' && (
                    <div style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a', marginBottom: '8px' }}>Historial del entregable</div>
                      <div style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                         <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>ENLACE / REPOSITORIO</div>
                         <a href={ms.latestSubmission.repoUrl.startsWith('http') ? ms.latestSubmission.repoUrl : `https://${ms.latestSubmission.repoUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--blue-600)', wordBreak: 'break-all', display: 'block', marginBottom: '8px' }}>
                           {ms.latestSubmission.repoUrl}
                         </a>
                         {ms.latestSubmission.comment && (
                           <>
                             <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>COMENTARIOS DEL EGRESADO</div>
                             <div style={{ fontSize: '14px', color: '#334155', whiteSpace: 'pre-wrap' }}>{ms.latestSubmission.comment}</div>
                           </>
                         )}
                      </div>
                    </div>
                  )}

                  {userRole === 'Graduate' && myApplicationStatus === 'Accepted' && ms.status !== 'Liberado' && ms.status !== 'En revisión' && (
                    <div style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 600, fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>ENTREGABLE ACTUAL</div>
                      <input 
                        type="text" 
                        placeholder="ej. github.com/tu-usuario/tu-repo/pull/42" 
                        value={repoUrls[ms.id] || ''} 
                        onChange={e => setRepoUrls(prev => ({ ...prev, [ms.id]: e.target.value }))} 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '8px' }} 
                      />
                      <input 
                        type="text" 
                        placeholder="Comentarios adicionales (opcional)" 
                        value={comments[ms.id] || ''} 
                        onChange={e => setComments(prev => ({ ...prev, [ms.id]: e.target.value }))} 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '12px' }} 
                      />
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%', display: 'flex', justifyContent: 'center' }} 
                        onClick={() => handleSubmitMilestone(ms.id)}
                        disabled={submittingMilestone === ms.id || !repoUrls[ms.id]}
                      >
                        {submittingMilestone === ms.id ? 'Enviando...' : 'Subir entregable'}
                      </button>
                    </div>
                  )}

                  {userRole === 'Company' && ms.status === 'En revisión' && (
                    <div style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a', marginBottom: '8px' }}>Entregable en revisión</div>
                      
                      {ms.latestSubmission && (
                        <div style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                           <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>ENLACE / REPOSITORIO</div>
                           <a href={ms.latestSubmission.repoUrl.startsWith('http') ? ms.latestSubmission.repoUrl : `https://${ms.latestSubmission.repoUrl}`} target="_blank" rel="noreferrer" style={{ color: 'var(--blue-600)', wordBreak: 'break-all', display: 'block', marginBottom: '8px' }}>
                             {ms.latestSubmission.repoUrl}
                           </a>
                           {ms.latestSubmission.comment && (
                             <>
                               <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>COMENTARIOS DEL EGRESADO</div>
                               <div style={{ fontSize: '14px', color: '#334155', whiteSpace: 'pre-wrap' }}>{ms.latestSubmission.comment}</div>
                             </>
                           )}
                        </div>
                      )}

                      <input 
                        type="text" 
                        placeholder="Comentarios o feedback para el egresado (opcional)" 
                        value={feedbacks[ms.id] || ''} 
                        onChange={e => setFeedbacks(prev => ({ ...prev, [ms.id]: e.target.value }))} 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '12px' }} 
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn" 
                          style={{ flex: 1, background: '#16a34a', color: 'white', border: 'none', display: 'flex', justifyContent: 'center' }} 
                          onClick={() => handleReviewMilestone(ms.id, true)}
                          disabled={reviewingMilestone === ms.id}
                        >
                          Aceptar y Liberar Pago
                        </button>
                        <button 
                          className="btn" 
                          style={{ flex: 1, background: '#dc2626', color: 'white', border: 'none', display: 'flex', justifyContent: 'center' }} 
                          onClick={() => handleReviewMilestone(ms.id, false)}
                          disabled={reviewingMilestone === ms.id}
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  )}
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