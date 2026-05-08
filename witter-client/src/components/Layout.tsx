import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { mdiMagnify } from '@mdi/js';

interface LayoutProps {
  children: ReactNode;
  role: 'Company' | 'Graduate' | 'Admin';
  userName: string;
  onLogout: () => void; // <-- 1. Le decimos a TypeScript que recibiremos esta función
}

// 2. Extraemos onLogout de las propiedades
export default function Layout({ children, role, userName, onLogout }: LayoutProps) { 
  
  // 3. Eliminamos el handleLogout interno que teníamos aquí.

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <div className="brand-icon">W</div>
            <div>
              <div className="brand-name">WITTER</div>
              <div className="brand-sub">Intermediación TI</div>
            </div>
          </div>
        </div>
        
        <div className="sidebar-role">
          {role === 'Company' ? 'Vista Empresa' : 'Vista Egresado'}
        </div>
        
        <div className="sidebar-user">
          <div className={`avatar ${role === 'Company' ? 'avatar-empresa' : 'avatar-egresado'}`}>
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="user-name">{userName}</div>
            <div className="user-role">{role === 'Company' ? 'Cuenta Empresarial' : 'Egresado'}</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="section-label">Principal</div>
          
          {/* ENLACES PARA EMPRESA */}
          {role === 'Company' && (
            <>
              <Link to="/company/dashboard" className="nav-item">
                <span className="nav-icon">▦</span><span>Dashboard</span>
              </Link>
              <Link to="/company/projects/new" className="nav-item">
                <span className="nav-icon">＋</span><span>Nuevo Proyecto</span>
              </Link>
              <Link to="/company/profile" className="nav-item">
                <span className="nav-icon">◑</span><span>Perfil / KYC</span>
              </Link>
            </>
          )}

          {/* ENLACES PARA EGRESADO */}
          {role === 'Graduate' && (
            <>
              <Link to="/graduate/dashboard" className="nav-item">
                <span className="nav-icon">▦</span><span>Dashboard</span>
              </Link>
              <Link to="/graduate/projects" className="nav-item">
                <span className="nav-icon">◈</span><span>Mis Proyectos</span>
              </Link>
              <Link to="/graduate/explore" className={`nav-item ${location.pathname.includes('/graduate/explore') ? 'active' : ''}`}>
                <span className="nav-icon">
                  {/* Usamos un SVG nativo inyectando el path de la librería */}
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d={mdiMagnify} />
                  </svg>
                </span>
                <span>Explorar Proyectos</span>
              </Link>
              <Link to="/graduate/profile" className="nav-item">
                <span className="nav-icon">◑</span><span>Perfil / KYC</span>
              </Link>
            </>
          )}

          {/* MENÚ DEL SUPERUSUARIO (ADMIN) */}
          {role === 'Admin' && (
            <>
              <Link to="/admin/dashboard" className={`nav-item ${location.pathname.includes('/admin/dashboard') ? 'active' : ''}`}>
                <span>Dashboard</span>
              </Link>
              {/* Aquí podremos agregar más vistas para el Admin en el futuro, como 'Configuración' o 'Auditoría' */}
            </>
          )}
          
          <div className="section-label">Cuenta</div>
          <button onClick={onLogout} className="nav-item" style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left' }}>
            <span className="nav-icon">⎋</span><span>Cerrar Sesión</span>
          </button>
        </nav>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="main" style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        
        {children}
        
      </main>
    </div>
  );
}