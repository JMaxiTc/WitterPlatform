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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para aplicar
  const [isApplying, setIsApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await witterApi.get(`/projects/${id}`);
        setProject(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar el proyecto.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) fetchProjectDetails();
  }, [id]);

  const handleApply = async () => {
    setIsApplying(true);
    setApplyMessage('');
    try {
      const response = await witterApi.post(`/projects/${id}/apply`);
      setApplyMessage(response.data.message || 'Te has postulado con éxito.');
      // Opcional: podrías recargar datos o bloquear el botón aquí
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
              {userRole === 'Graduate' && (
                 <button 
                   className="btn btn-primary" 
                   onClick={handleApply} 
                   disabled={isApplying}
                   style={{ padding: '12px 24px', fontSize: '15px' }}
                 >
                   {isApplying ? 'Enviando...' : 'Postularme a este proyecto'}
                 </button>
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
      </div>
    </>
  );
}