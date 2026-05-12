import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';

// RUTAS PUBLICAS
import Login from './pages/Public/Login';
import RegisterSelection from './pages/Public/RegisterSelection';
import RegisterGraduate from './pages/Public/RegisterGraduate';
import RegisterCompany from './pages/Public/RegisterCompany';

// RUTAS EMPRESA
import CompanyDashboard from './pages/Company/CompanyDashboard';
import CompanyProfile from './pages/Company/CompanyProfile';
import NewProject from './pages/Company/NewProject';
// RUTAS EGRESADO
import GraduateDashboard from './pages/Graduate/GraduateDashboard';
import GraduateProfile from './pages/Graduate/GraduateProfile';
import ExploreProjects from './pages/Graduate/ExploreProjects';

// RUTAS COMPARTIDAS
import ProjectDetail from './pages/Shared/ProjectDetail';

// RUTAS ADMIN
import AdminDashboard from './pages/Admin/AdminDashboard';


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'Company' | 'Graduate' | 'Admin' | null>(null);
  const [userName, setUserName] = useState<string>(''); 

  // Al cargar la app, verificamos si hay un token guardado
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') as 'Company' | 'Graduate' | 'Admin';
    // Recuperamos el nombre del usuario para mostrarlo
    const name = localStorage.getItem('userName') || (role === 'Company' ? 'Empresa' : 'Egresado');
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
      setUserName(name);
    }
  }, []);

  // Función para cerrar sesión que pasaremos al Layout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName('');
  };

  return (
    <Router>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} setRole={setUserRole} setName={setUserName} /> : <Navigate to={`/${userRole?.toLowerCase()}/dashboard`} />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <RegisterSelection /> : <Navigate to={`/${userRole?.toLowerCase()}/dashboard`} />} 
        />
        <Route 
          path="/register/graduate" 
          element={!isAuthenticated ? <RegisterGraduate /> : <Navigate to={`/${userRole?.toLowerCase()}/dashboard`} />} 
        />
        <Route 
          path="/register/company" 
          element={!isAuthenticated ? <RegisterCompany /> : <Navigate to={`/${userRole?.toLowerCase()}/dashboard`} />} 
        />

        {/* RUTAS PROTEGIDAS PARA ADMIN */}
        {isAuthenticated && userRole === 'Admin' && (
          <Route path="/admin/*" element={
            <Layout role="Admin" userName={userName} onLogout={handleLogout}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
              </Routes>
            </Layout>
          } />
        )}

        {/* RUTAS PROTEGIDAS PARA EMPRESA */}
        {isAuthenticated && userRole === 'Company' && (
          <Route path="/company/*" element={
            <Layout role="Company" userName={userName} onLogout={handleLogout}>
              <Routes>
                <Route path="dashboard" element={<CompanyDashboard />} />
                <Route path="profile" element={<CompanyProfile />} />
                <Route path="projects/new" element={<NewProject />} />
              </Routes>
            </Layout>
          } />
        )}

        {/* RUTAS PROTEGIDAS PARA EGRESADO */}
        {isAuthenticated && userRole === 'Graduate' && (
          <Route path="/graduate/*" element={
            <Layout role="Graduate" userName={userName} onLogout={handleLogout}>
              <Routes>
                <Route path="dashboard" element={<GraduateDashboard />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="profile" element={<GraduateProfile />} />
                <Route path="explore" element={<ExploreProjects />} />
              </Routes>
            </Layout>
          } />
        )}

        {/* REDIRECCIÓN POR DEFECTO */}
        <Route path="*" element={<Navigate to={isAuthenticated ? `/${userRole?.toLowerCase()}/dashboard` : "/login"} />} />
      </Routes>
    </Router>
  );
}