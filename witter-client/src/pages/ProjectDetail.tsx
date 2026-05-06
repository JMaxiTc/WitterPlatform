import { useState } from 'react';

// Interfaces basadas en la maqueta
interface MilestoneStep {
  step: number;
  title: string;
  description: string;
  amount: number;
  status: 'done' | 'active' | 'pending';
  currentDeliverable?: {
    repoUrl: string;
    commits: number;
    statusText: string;
  };
}

interface Transaction {
  id: number;
  type: 'in' | 'out' | 'vc' | 'escrow';
  description: string;
  date: string;
  amount: number | string;
}

export default function ProjectDetail() {
  const [activeTab, setActiveTab] = useState('Hitos');

  // Mock Data basada en la Sección 6 de la maqueta
  const project = {
    title: 'Sistema CRM Integrado',
    company: 'TechCorp S.A. de C.V.',
    startDate: '01/05/2026',
    totalBudget: 72000,
    status: 'Activo',
    progressPct: 50,
    completedAmount: 36000
  };

  const milestones: MilestoneStep[] = [
    {
      step: 1,
      title: 'Sprint 1 — Diseño de Base de Datos',
      description: 'Modelo entidad-relación, DDL y documentación del esquema.',
      amount: 18000,
      status: 'done'
    },
    {
      step: 2,
      title: 'Sprint 2 — API REST',
      description: 'Endpoints CRUD, autenticación JWT, documentación Swagger.',
      amount: 18000,
      status: 'active',
      currentDeliverable: {
        repoUrl: 'github.com/anatorres-dev/crm-api/pull/42',
        commits: 8,
        statusText: 'Pendiente empresa'
      }
    },
    {
      step: 3,
      title: 'Sprint 3 — Frontend React',
      description: 'Componentes UI, integración con API, pruebas unitarias.',
      amount: 18000,
      status: 'pending'
    },
    {
      step: 4,
      title: 'Sprint 4 — Deploy & QA',
      description: 'Despliegue en producción, pruebas E2E, entrega final.',
      amount: 18000,
      status: 'pending'
    }
  ];

  const transactions: Transaction[] = [
    { id: 1, type: 'in', description: 'Sprint 1 — Pago liberado', date: '01/06/2026 · 14:32 CST', amount: 18000 },
    { id: 2, type: 'out', description: 'Comisión WITTER (5%)', date: '01/06/2026 · 14:32 CST', amount: -900 },
    { id: 3, type: 'vc', description: 'Sprint 1 — Hito completado · Credencial emitida', date: '31/05/2026 · 11:15 CST', amount: 'VC emitida' },
    { id: 4, type: 'escrow', description: 'Depósito inicial en Escrow — TechCorp', date: '01/05/2026 · 09:00 CST', amount: 72000 }
  ];

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">{project.title}</div>
          <div className="page-sub">{project.company} · Inicio {project.startDate}</div>
        </div>
        <div className="topbar-actions">
          <span className="badge badge-activo">{project.status}</span>
          <span className="code" style={{ fontSize: '13px' }}>${project.totalBudget.toLocaleString('es-MX')} MXN total</span>
        </div>
      </div>

      <div className="content">
        {/* Pestañas Internas */}
        <div className="inner-tabs">
          {['Hitos', 'Entregables', 'Transacciones', 'Mensajes'].map(tab => (
            <div 
              key={tab} 
              className={`inner-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>

        {activeTab === 'Hitos' && (
          <div className="grid-2" style={{ alignItems: 'start' }}>
            
            {/* COLUMNA IZQUIERDA: Progreso de Hitos */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Progreso de Hitos</div>
                  <div className="card-sub">Hito 2 activo de 4 en total</div>
                </div>
              </div>
              
              <div className="progress-wrap" style={{ marginBottom: '20px' }}>
                <div className="progress-label">
                  <span>{project.progressPct}% completado</span>
                  <span>${project.completedAmount.toLocaleString('es-MX')} / ${project.totalBudget.toLocaleString('es-MX')} MXN</span>
                </div>
                <div className="progress-bar" style={{ height: '8px' }}>
                  <div className="progress-fill progress-blue" style={{ width: `${project.progressPct}%` }}></div>
                </div>
              </div>

              <div className="milestone-steps">
                {milestones.map((ms, index) => (
                  <div className="ms-step" key={ms.step}>
                    <div className="ms-dot-wrap">
                      <div className={`ms-dot ${ms.status === 'done' ? 'ms-dot-done' : ms.status === 'active' ? 'ms-dot-active' : 'ms-dot-pending'}`}>
                        {ms.status === 'done' ? '✓' : ms.step}
                      </div>
                      {index < milestones.length - 1 && <div className="ms-line"></div>}
                    </div>
                    <div className="ms-body">
                      <div className="ms-title" style={{ color: ms.status === 'pending' ? 'var(--gray-400)' : '' }}>
                        {ms.title} 
                        {ms.status === 'active' && <span className="badge badge-pendiente" style={{ marginLeft: '6px' }}>En revisión</span>}
                      </div>
                      <div className="ms-desc">{ms.description}</div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: ms.status === 'active' ? '10px' : '0' }}>
                        <div className="ms-amount" style={{ color: ms.status === 'pending' ? 'var(--gray-300)' : '' }}>
                          ${ms.amount.toLocaleString('es-MX')} MXN
                        </div>
                        {ms.status === 'done' && <span className="badge badge-liberado">Liberado</span>}
                      </div>

                      {/* Caja de Entregable Actual para el hito activo */}
                      {ms.status === 'active' && ms.currentDeliverable && (
                        <div className="ms-current">
                          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--blue-600)', marginBottom: '8px' }}>
                            Entregable Actual
                          </div>
                          <a href={`https://${ms.currentDeliverable.repoUrl}`} target="_blank" rel="noreferrer" className="gh-link" style={{ marginBottom: '8px', display: 'flex' }}>
                            <div className="gh-dot"></div>
                            <span>{ms.currentDeliverable.repoUrl}</span>
                            <span style={{ marginLeft: 'auto', opacity: 0.6 }}>→</span>
                          </a>
                          <div style={{ fontSize: '12px', color: 'var(--gray-400)', marginBottom: '10px' }}>
                            Pull Request abierto · {ms.currentDeliverable.commits} commits · Revisado por: {ms.currentDeliverable.statusText}
                          </div>
                          <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                            Subir nueva versión
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMNA DERECHA: Transacciones y Resumen */}
            <div>
              <div className="card" style={{ marginBottom: '16px' }}>
                <div className="card-header">
                  <div>
                    <div className="card-title">Historial de Transacciones</div>
                    <div className="card-sub">Movimientos registrados en este proyecto</div>
                  </div>
                </div>
                <div className="tx-list">
                  {transactions.map(tx => (
                    <div className="tx-item" key={tx.id}>
                      <div className={`tx-icon ${tx.type === 'in' ? 'tx-in' : tx.type === 'out' ? 'tx-out' : ''}`} style={tx.type === 'escrow' ? { background: 'var(--blue-100)', color: 'var(--blue-700)' } : {}}>
                        {tx.type === 'in' ? '↓' : tx.type === 'out' ? '⬡' : tx.type === 'escrow' ? '↑' : ''}
                      </div>
                      <div className="tx-info">
                        <div className="tx-desc">{tx.description}</div>
                        <div className="tx-date">{tx.date}</div>
                      </div>
                      {typeof tx.amount === 'number' ? (
                        <div className={`tx-amount ${tx.amount > 0 && tx.type !== 'escrow' ? 'tx-pos' : tx.amount < 0 ? 'tx-neg' : 'tx-pos'}`}>
                          {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString('es-MX')}
                        </div>
                      ) : (
                        <div className="tx-amount" style={{ fontSize: '11px', color: 'var(--violet-700)', background: 'var(--violet-100)', padding: '4px 8px', borderRadius: '20px', fontWeight: 600 }}>
                          {tx.amount}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen Financiero */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: '14px' }}>Resumen Financiero del Proyecto</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Total en Escrow</span>
                    <span className="code">${project.totalBudget.toLocaleString('es-MX')} MXN</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Pagos recibidos</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 600, color: 'var(--green-600)' }}>$18,000 MXN</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                    <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>En revisión</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 600, color: 'var(--amber-600)' }}>$18,000 MXN</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                    <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Pendiente (hitos futuros)</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 600, color: 'var(--blue-600)' }}>$36,000 MXN</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </>
  );
}