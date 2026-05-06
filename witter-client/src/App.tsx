import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import CompanyDashboard from './pages/CompanyDashboard';
import CompanyProfile from './pages/CompanyProfile';
import NewProject from './pages/NewProject';
import GraduateDashboard from './pages/GraduateDashboard';
import ProjectDetail from './pages/ProjectDetail';
import GraduateProfile from './pages/GraduateProfile';
import RegisterCompany from './pages/RegisterCompany';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'Company' | 'Graduate' | 'Admin' | null>(null);

  // Al cargar la app, verificamos si hay un token guardado
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') as 'Company' | 'Graduate' | 'Admin';
    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  // Función para cerrar sesión que pasaremos al Layout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <Router>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} setRole={setUserRole} /> : <Navigate to={`/${userRole?.toLowerCase()}/dashboard`} />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register /> : <Navigate to={`/${userRole?.toLowerCase()}/dashboard`} />} 
        />
        <Route 
          path="/register/company" 
          element={!isAuthenticated ? <RegisterCompany /> : <Navigate to={`/${userRole?.toLowerCase()}/dashboard`} />} 
        />

        {/* RUTAS PROTEGIDAS PARA ADMIN */}
        {isAuthenticated && userRole === 'Admin' && (
          <Route path="/admin/*" element={
            <Layout role="Admin" userName="Superusuario" onLogout={handleLogout}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
              </Routes>
            </Layout>
          } />
        )}

        {/* RUTAS PROTEGIDAS PARA EMPRESA */}
        {isAuthenticated && userRole === 'Company' && (
          <Route path="/company/*" element={
            <Layout role="Company" userName="Empresa" onLogout={handleLogout}>
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
            <Layout role="Graduate" userName="Egresado" onLogout={handleLogout}>
              <Routes>
                <Route path="dashboard" element={<GraduateDashboard />} />
                <Route path="projects/:id" element={<ProjectDetail />} />
                <Route path="profile" element={<GraduateProfile />} />
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