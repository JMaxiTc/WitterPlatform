import { useState, useEffect } from 'react';
import witterApi from '../api/witterApi';

// 1. Interfaces actualizadas para incluir los hitos
interface Milestone {
  id: number;
  stepNumber: number;
  title: string;
  description: string;
  amount: number;
}

interface ProjectDisplay {
  id: number;
  title: string;
  companyName: string;
  description: string;
  category: string;
  budget: number;
  durationDays: number;
  levelRequired: string;
  skills: string[];
  createdAt: string;
  milestones?: Milestone[]; // Opcional porque en la lista general no vienen, solo en el detalle
}

export default function ExploreProjects() {
  const [projects, setProjects] = useState<ProjectDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 2. Estados para el Modal
  const [selectedProject, setSelectedProject] = useState<ProjectDisplay | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await witterApi.get('/projects/open');
      setProjects(response.data);
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Función para abrir el modal y cargar los hitos
  const handleOpenDetails = async (projectId: number) => {
    setIsModalLoading(true);
    try {
      const response = await witterApi.get(`/projects/${projectId}`);
      setSelectedProject(response.data);
    } catch (error) {
      console.error("Error al cargar detalles del proyecto:", error);
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeModal = () => setSelectedProject(null);

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Explorar Proyectos</div>
          <div className="page-sub">Descubre oportunidades y postúlate a retos del mundo real</div>
        </div>
      </div>

      <div className="content">
        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Buscando proyectos disponibles...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px' }}>
            <h3 style={{ color: 'var(--blue-950)' }}>No hay proyectos disponibles en este momento</h3>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {projects.map((proj) => (
              <div key={proj.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--blue-600)', textTransform: 'uppercase' }}>
                      {proj.category}
                    </span>
                    <h3 style={{ fontSize: '18px', color: 'var(--blue-950)', marginTop: '4px', marginBottom: '4px' }}>
                      {proj.title}
                    </h3>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>🏢 {proj.companyName}</div>
                  </div>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--gray-600)', lineHeight: '1.5', flexGrow: 1, marginBottom: '20px' }}>
                  {proj.description.length > 120 ? proj.description.substring(0, 120) + '...' : proj.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                  {proj.skills.map((skill, i) => <span key={i} className="tag">{skill}</span>)}
                  <span className="tag" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>{proj.levelRequired}</span>
                </div>

                <div className="divider" style={{ margin: '0 -24px 16px -24px' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase' }}>Presupuesto</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--blue-950)' }}>
                      ${proj.budget.toLocaleString('es-MX')} MXN
                    </div>
                  </div>
                  {/* BOTÓN ACTUALIZADO PARA ABRIR EL MODAL */}
                  <button className="btn btn-primary btn-sm" onClick={() => handleOpenDetails(proj.id)}>
                    {isModalLoading ? 'Cargando...' : 'Ver Detalles'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. EL MODAL (VENTANA EMERGENTE) */}
      {selectedProject && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(10, 22, 40, 0.6)', backdropFilter: 'blur(4px)',
          zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
          <div className="card" style={{ 
            width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', 
            position: 'relative', padding: '30px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            
            {/* Botón de cerrar */}
            <button onClick={closeModal} style={{
              position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none',
              fontSize: '24px', cursor: 'pointer', color: 'var(--gray-400)'
            }}>✕</button>

            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--blue-600)', textTransform: 'uppercase' }}>{selectedProject.category}</span>
            <h2 style={{ fontSize: '24px', color: 'var(--blue-950)', marginTop: '4px', marginBottom: '8px' }}>{selectedProject.title}</h2>
            <div style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '20px' }}>
              Publicado por <strong>{selectedProject.companyName}</strong> · Duración est.: {selectedProject.durationDays} días
            </div>

            <div className="form-section-title">Descripción del Proyecto</div>
            <p style={{ fontSize: '15px', color: 'var(--gray-600)', lineHeight: '1.6', marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
              {selectedProject.description}
            </p>

            <div className="form-section-title">Hitos Financieros (Pagos en Escrow)</div>
            <div style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
              {selectedProject.milestones?.map((milestone) => (
                <div key={milestone.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--gray-200)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--blue-950)' }}>
                      Paso {milestone.stepNumber}: {milestone.title}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>{milestone.description}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--green-600)', fontSize: '16px', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                    ${milestone.amount.toLocaleString('es-MX')}
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0 0', marginTop: '4px' }}>
                <div style={{ fontWeight: 700, color: 'var(--blue-950)' }}>Presupuesto Total Protegido</div>
                <div style={{ fontWeight: 800, color: 'var(--blue-950)', fontSize: '18px' }}>
                  ${selectedProject.budget.toLocaleString('es-MX')} MXN
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '30px' }}>
              <button className="btn btn-ghost" onClick={closeModal}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => alert("¡Lógica de postulación en construcción!")}>
                Postularme ahora
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}