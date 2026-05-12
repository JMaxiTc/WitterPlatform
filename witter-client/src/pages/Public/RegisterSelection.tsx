import { useNavigate } from 'react-router-dom';
import { Building2, GraduationCap } from 'lucide-react';

export default function RegisterSelection() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--blue-950)', padding: '40px 20px' }}>
      <div className="card" style={{ maxWidth: '800px', width: '100%', padding: '40px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="page-title" style={{ color: 'var(--blue-950)', fontSize: '28px', marginBottom: '10px' }}>Únete a WITTER</h1>
          <p className="page-sub" style={{ fontSize: '16px' }}>¿Cómo te gustaría registrarte hoy?</p>
        </div>

        <div style={{ display: 'flex', gap: '20px', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
          
          {/* Tarjeta de Empresa */}
          <div 
            onClick={() => navigate('/register/company')}
            style={{
              flex: '1 1 300px',
              border: '2px solid var(--gray-200)',
              borderRadius: '12px',
              padding: '30px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--blue-600)';
              e.currentTarget.style.backgroundColor = 'var(--indigo-50)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--gray-200)';
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ background: 'var(--blue-600)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white' }}>
              <Building2 size={32} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--blue-950)', marginBottom: '10px' }}>Empresa</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '14px', lineHeight: '1.5' }}>Publica proyectos, encuentra talento de impacto y gestiona hitos con seguridad en Escrow.</p>
          </div>

          {/* Tarjeta de Egresado */}
          <div 
            onClick={() => navigate('/register/graduate')}
            style={{
              flex: '1 1 300px',
              border: '2px solid var(--gray-200)',
              borderRadius: '12px',
              padding: '30px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: 'white'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--blue-600)';
              e.currentTarget.style.backgroundColor = 'var(--indigo-50)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--gray-200)';
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div style={{ background: 'var(--blue-600)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white' }}>
              <GraduationCap size={32} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--blue-950)', marginBottom: '10px' }}>Egresado</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: '14px', lineHeight: '1.5' }}>Aplica a proyectos del mundo real, construye tu reputación y expande tu red profesional.</p>
          </div>

        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/login')}>
            ← Volver al Login
          </button>
        </div>

      </div>
    </div>
  );
}