import { useState } from 'react';
import witterApi from '../../api/witterApi';
import { useNavigate } from 'react-router-dom';

// Catálogo de prueba para las habilidades (igual al de egresados)
const SKILLS_CATALOG = [
  { id: 1, name: 'C#' }, { id: 2, name: 'React' }, { id: 3, name: 'Python' },
  { id: 4, name: 'SQL Server' }, { id: 5, name: 'Docker' }, { id: 6, name: 'Git' }
];

interface Milestone {
  step: number;
  title: string;
  taskDescription: string;
  amount: number | '';
}

export default function NewProject() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Estado del Proyecto
  const [formData, setFormData] = useState({
    title: '',
    projectDescription: '',
    category: 'Desarrollo Backend',
    levelReq: 'Semi-senior (2-4 años)',
    budget: '' as number | '',
    startDate: '',
    duration: 1,
    workMode: 'Remoto',
    requiredSkillIds: [] as number[]
  });

  // Estado de los Hitos (Inicia con 1 por defecto)
  const [milestones, setMilestones] = useState<Milestone[]>([
    { step: 1, title: '', taskDescription: '', amount: '' }
  ]);

  // Cálculos dinámicos de presupuesto
  const budgetNum = Number(formData.budget) || 0;
  const totalAssigned = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const remainingAmt = budgetNum - totalAssigned;
  const progressPct = budgetNum > 0 ? Math.min((totalAssigned / budgetNum) * 100, 100) : 0;

  // Manejadores de eventos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skillId: number) => {
    setFormData(prev => ({
      ...prev,
      requiredSkillIds: prev.requiredSkillIds.includes(skillId)
        ? prev.requiredSkillIds.filter(id => id !== skillId)
        : [...prev.requiredSkillIds, skillId]
    }));
  };

  const handleMilestoneChange = (index: number, field: keyof Milestone, value: any) => {
    const newMilestones = [...milestones];
    newMilestones[index] = { ...newMilestones[index], [field]: value };
    setMilestones(newMilestones);
  };

  const addMilestone = () => {
    setMilestones(prev => [
      ...prev, 
      { step: prev.length + 1, title: '', taskDescription: '', amount: '' }
    ]);
  };

  const removeMilestone = (indexToRemove: number) => {
    setMilestones(prev => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      // Re-enumerar los pasos
      return filtered.map((m, idx) => ({ ...m, step: idx + 1 }));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (remainingAmt !== 0) {
      setError(`La suma de los hitos debe ser exactamente igual al presupuesto total.`);
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        budget: Number(formData.budget),
        duration: Number(formData.duration),
        milestones: milestones.map(m => ({ ...m, amount: Number(m.amount) }))
      };

      // MAGIA: No necesitamos pasar el Token aquí. 
      // El Interceptor de witterApi se encarga de inyectarlo.
      const response = await witterApi.post('/projects', payload);

      alert(response.data.message || 'Proyecto creado exitosamente.');
      navigate('/company/dashboard');

    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al publicar el proyecto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Nuevo Proyecto</div>
          <div className="page-sub">Define los detalles y los hitos de financiamiento</div>
        </div>
        <div className="topbar-actions">
          <button className="topbar-btn" onClick={() => navigate('/company/dashboard')}>Cancelar</button>
        </div>
      </div>

      <div className="content">
        <div className="alert alert-info">
          <span>ℹ</span>
          <span>Los fondos serán depositados en <strong>Escrow</strong> al publicar el proyecto. Solo se liberarán al aprobar cada hito.</span>
        </div>

        {error && (
          <div className="alert alert-warn" style={{ marginBottom: '20px' }}>
            <span>⚠</span><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ alignItems: 'start' }}>
            
            {/* COLUMNA IZQUIERDA: Info Básica */}
            <div>
              <div className="card" style={{ marginBottom: '16px' }}>
                <div className="form-section-title">Información del Proyecto</div>
                <div className="form-section">
                  <div className="form-grid">
                    <div className="form-group full">
                      <label>Título del Proyecto</label>
                      <input type="text" name="title" placeholder="Ej. Desarrollo API REST..." value={formData.title} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group full">
                      <label>Descripción</label>
                      <textarea name="projectDescription" placeholder="Describe el alcance y objetivos..." value={formData.projectDescription} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                      <label>Categoría</label>
                      <select name="category" value={formData.category} onChange={handleInputChange}>
                        <option value="Desarrollo Backend">Desarrollo Backend</option>
                        <option value="Desarrollo Frontend">Desarrollo Frontend</option>
                        <option value="Datos & BI">Datos & BI</option>
                        <option value="Mobile">Mobile</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Nivel requerido</label>
                      <select name="levelReq" value={formData.levelReq} onChange={handleInputChange}>
                        <option value="Junior (0-2 años)">Junior (0-2 años)</option>
                        <option value="Semi-senior (2-4 años)">Semi-senior (2-4 años)</option>
                        <option value="Senior (4+ años)">Senior (4+ años)</option>
                      </select>
                    </div>
                    
                    <div className="form-group full">
                      <label>Tecnologías principales</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '4px' }}>
                        {SKILLS_CATALOG.map(skill => (
                          <label key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>
                            <input type="checkbox" checked={formData.requiredSkillIds.includes(skill.id)} onChange={() => handleSkillToggle(skill.id)} />
                            {skill.name}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Presupuesto Total (MXN)</label>
                      <div className="input-prefix">
                        <span className="input-prefix-label">$</span>
                        <input type="number" name="budget" placeholder="0.00" value={formData.budget} onChange={handleInputChange} required min="1" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Duración estimada (Días)</label>
                      <input type="number" name="duration" placeholder="Ej. 30" value={formData.duration} onChange={handleInputChange} required min="1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: Hitos (Milestones) */}
            <div>
              <div className="card">
                <div className="card-header">
                  <div>
                    <div className="form-section-title" style={{ marginBottom: 0, border: 'none', padding: 0 }}>Hitos del Proyecto</div>
                    <div className="card-sub" style={{ marginTop: '4px' }}>El pago se liberará al aprobar cada hito</div>
                  </div>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addMilestone}>+ Agregar hito</button>
                </div>
                
                <div style={{ marginBottom: '14px' }}>
                  <div className="progress-label">
                    <span>Presupuesto asignado</span>
                    <span>{progressPct.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar" style={{ height: '8px' }}>
                    <div className={`progress-fill ${progressPct === 100 ? 'progress-green' : progressPct > 100 ? 'progress-amber' : 'progress-blue'}`} style={{ width: `${Math.min(progressPct, 100)}%` }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px' }}>
                    <span>Asignado: <span className="code" style={{ color: progressPct > 100 ? 'var(--red-500)' : '' }}>${totalAssigned.toLocaleString('es-MX')}</span></span>
                    <span>Restante: <span className="code">${remainingAmt.toLocaleString('es-MX')}</span></span>
                  </div>
                </div>
                 {totalAssigned > budgetNum && (
                  <div className="alert alert-warn" style={{ marginBottom: '14px', padding: '10px', fontSize: '13px' }}>
                    <span>⚠</span>
                    <span>El total de los hitos (${totalAssigned.toLocaleString('es-MX')}) supera el presupuesto del proyecto (${budgetNum.toLocaleString('es-MX')}).</span>
                  </div>
                )}

                <div className="milestone-list">
                  {milestones.map((m, index) => (
                    <div className="milestone-row" key={index}>
                      <div className="milestone-row-header">
                        <div className="milestone-num">{m.step}</div>
                        <div className="milestone-row-title">Hito {m.step}</div>
                        {milestones.length > 1 && (
                          <button type="button" className="btn btn-ghost btn-sm" style={{ color: 'var(--red-500)' }} onClick={() => removeMilestone(index)}>✕</button>
                        )}
                      </div>
                      <div className="milestone-row-grid">
                        <div className="form-group">
                          <label>Nombre</label>
                          <input type="text" placeholder="Ej. API endpoints" value={m.title} onChange={e => handleMilestoneChange(index, 'title', e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label>Descripción</label>
                          <input type="text" placeholder="Entregables esperados..." value={m.taskDescription} onChange={e => handleMilestoneChange(index, 'taskDescription', e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label>Monto (MXN)</label>
                          <div className="input-prefix">
                            <span className="input-prefix-label">$</span>
                            <input type="number" placeholder="0" value={m.amount} onChange={e => handleMilestoneChange(index, 'amount', e.target.value)} required min="1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <button type="button" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={addMilestone}>+ Agregar otro hito</button>
                </div>
              </div>
            </div>
            
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--gray-200)' }}>
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate('/company/dashboard')}>Cancelar</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading || remainingAmt !== 0}>
              {isLoading ? 'Publicando...' : 'Publicar y depositar en Escrow →'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}