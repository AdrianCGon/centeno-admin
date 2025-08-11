import { useState, useEffect } from "react";
import type { Route } from "./+types/home";
import { buildApiUrl, API_CONFIG } from "../config/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Centeno Admin - Dashboard" },
    { name: "description", content: "Panel administrativo de Centeno" },
  ];
}

interface DashboardStats {
  totalSolicitudes: number;
  solicitudesPendientes: number;
  solicitudesEnProceso: number;
  solicitudesListas: number;
  totalLibros: number;
}

interface LoginForm {
  username: string;
  password: string;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSolicitudes: 0,
    solicitudesPendientes: 0,
    solicitudesEnProceso: 0,
    solicitudesListas: 0,
    totalLibros: 0
  });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.CHECK), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data.isAuthenticated) {
          setIsAuthenticated(true);
          fetchStats();
        } else {
          setShowLoginModal(true);
        }
      } else {
        setShowLoginModal(true);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      setShowLoginModal(true);
    }
  };

  const fetchStats = async () => {
    try {
      // Obtener estadísticas de solicitudes
      const solicitudesResponse = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SOLICITUDES.BASE), {
        credentials: 'include'
      });
      
      if (solicitudesResponse.ok) {
        const solicitudes = await solicitudesResponse.json().then(data => data.data || []);
        const totalSolicitudes = solicitudes.length;
        const solicitudesPendientes = solicitudes.filter((s: any) => s.estado === 'pendiente').length;
        const solicitudesEnProceso = solicitudes.filter((s: any) => s.estado === 'en_proceso').length;
        const solicitudesListas = solicitudes.filter((s: any) => s.estado === 'listo').length;
        
        setStats(prev => ({
          ...prev,
          totalSolicitudes,
          solicitudesPendientes,
          solicitudesEnProceso,
          solicitudesListas
        }));
      }

      // Obtener estadísticas de libros
      const librosResponse = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LIBROS.BASE), {
        credentials: 'include'
      });
      
      if (librosResponse.ok) {
        const libros = await librosResponse.json().then(data => data.data || []);
        setStats(prev => ({
          ...prev,
          totalLibros: libros.length
        }));
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setShowLoginModal(false);
        fetchStats();
      } else {
        setLoginError(data.message || 'Error en el login');
      }
    } catch (error) {
      setLoginError('Error de conexión. Verifica que el backend esté funcionando.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT), {
        method: 'POST',
        credentials: 'include'
      });
      setIsAuthenticated(false);
      setShowLoginModal(true);
      setStats({
        totalSolicitudes: 0,
        solicitudesPendientes: 0,
        solicitudesEnProceso: 0,
        solicitudesListas: 0,
        totalLibros: 0
      });
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  if (loading && isAuthenticated) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="col text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container-fluid" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="row justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-header text-center py-4" style={{ backgroundColor: '#FD8200', color: 'white' }}>
                <h3 className="mb-0">
                  <i className="fas fa-shield-alt me-2"></i>
                  Centeno Admin
                </h3>
                <p className="mb-0 mt-2">Panel Administrativo</p>
              </div>
              
              <div className="card-body p-4">
                {loginError && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    {loginError}
                    <button type="button" className="btn-close" onClick={() => setLoginError("")}></button>
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      <i className="fas fa-user me-2"></i>Usuario
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                      required
                      placeholder="Ingresa tu usuario"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label">
                      <i className="fas fa-lock me-2"></i>Contraseña
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      required
                      placeholder="Ingresa tu contraseña"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn w-100"
                    style={{ backgroundColor: '#FD8200', color: 'white' }}
                  >
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Iniciar Sesión
                  </button>
                </form>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    Acceso restringido al personal autorizado
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg" style={{backgroundColor: '#FD8200'}}>
        <div className="container-fluid">
          <a className="navbar-brand text-white fw-bold" href="/">
            <i className="fas fa-shield-alt me-2"></i>
            Centeno Admin
          </a>
          <div className="navbar-nav ms-auto">
            <a className="nav-link text-white" href="/solicitudes">
              <i className="fas fa-file-alt me-1"></i>
              Solicitudes
            </a>
            <a className="nav-link text-white" href="/libros">
              <i className="fas fa-book me-1"></i>
              Libros
            </a>
            <button
              className="btn btn-outline-light ms-2"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt me-1"></i>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col-12">
            <h2 className="mb-4">
              <i className="fas fa-tachometer-alt me-2"></i>
              Dashboard
            </h2>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="display-4 text-primary mb-2">
                  <i className="fas fa-file-alt"></i>
                </div>
                <h5 className="card-title">Total Solicitudes</h5>
                <h2 className="text-primary">{stats.totalSolicitudes}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="display-4 text-warning mb-2">
                  <i className="fas fa-clock"></i>
                </div>
                <h5 className="card-title">Pendientes</h5>
                <h2 className="text-warning">{stats.solicitudesPendientes}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="display-4 text-info mb-2">
                  <i className="fas fa-cogs"></i>
                </div>
                <h5 className="card-title">En Proceso</h5>
                <h2 className="text-info">{stats.solicitudesEnProceso}</h2>
              </div>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center">
                <div className="display-4 text-success mb-2">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h5 className="card-title">Listas</h5>
                <h2 className="text-success">{stats.solicitudesListas}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header" style={{backgroundColor: '#FD8200', color: 'white'}}>
                <h5 className="mb-0">
                  <i className="fas fa-file-alt me-2"></i>
                  Gestión de Solicitudes
                </h5>
              </div>
              <div className="card-body">
                <p className="card-text">Administra las solicitudes de fotocopias, actualiza estados y agrega observaciones.</p>
                <a href="/solicitudes" className="btn" style={{backgroundColor: '#FD8200', color: 'white'}}>
                  <i className="fas fa-arrow-right me-1"></i>
                  Ver Solicitudes
                </a>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header" style={{backgroundColor: '#FD8200', color: 'white'}}>
                <h5 className="mb-0">
                  <i className="fas fa-book me-2"></i>
                  Catálogo de Libros
                </h5>
              </div>
              <div className="card-body">
                <p className="card-text">Gestiona el catálogo de libros disponibles, precios y ediciones.</p>
                <a href="/libros" className="btn" style={{backgroundColor: '#FD8200', color: 'white'}}>
                  <i className="fas fa-arrow-right me-1"></i>
                  Ver Libros
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header" style={{backgroundColor: '#FD8200', color: 'white'}}>
                <h5 className="mb-0">
                  <i className="fas fa-history me-2"></i>
                  Actividad Reciente
                </h5>
              </div>
              <div className="card-body">
                <div className="text-center text-muted">
                  <i className="fas fa-info-circle fa-2x mb-3"></i>
                  <p>Las actividades recientes se mostrarán aquí</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
