import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import witterApi from '../../api/witterApi';

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
  milestones?: Milestone[];
}

export default function ExploreProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
                  {/* Navegar a la página completa de Detalles del Proyecto */}
                  <button className="btn btn-primary btn-sm" onClick={() => navigate(`/graduate/projects/${proj.id}`)}>
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}