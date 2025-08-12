import { useState, useEffect } from "react";
import type { Route } from "./+types/solicitudes";
import { buildApiUrl, API_CONFIG } from "../config/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Solicitudes de Fotocopias - Panel de Administración" },
    { name: "description", content: "Lista de todas las solicitudes de fotocopias recibidas" },
  ];
}

interface SolicitudImpresion {
  id: string;
  numeroPedido?: number;
  nombreApellido: string;
  telefono: string;
  email?: string;
  textoNecesario: string;
  materialImprimir1?: string;
  materialImprimir1Path?: string;
  materialImprimir1Size?: number;
  materialImprimir1Pages?: number;
  materialImprimir2?: string;
  materialImprimir2Path?: string;
  materialImprimir2Size?: number;
  materialImprimir2Pages?: number;
  materialImprimir3?: string;
  materialImprimir3Path?: string;
  materialImprimir3Size?: number;
  materialImprimir3Pages?: number;
  comprobantePath?: string;
  comprobanteSize?: number;
  costoTotal?: number;
  montoAbonar?: number;
  estado?: string;
  createdAt: string;
  updatedAt: string;
}

interface AlertState {
  show: boolean;
  type: 'success' | 'danger' | 'info';
  message: string;
}

export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState<SolicitudImpresion[]>([]);
  const [filteredSolicitudes, setFilteredSolicitudes] = useState<SolicitudImpresion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: 'info',
    message: ''
  });

  const fetchSolicitudes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SOLICITUDES.BASE), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const solicitudesData = data.data || [];
        setSolicitudes(solicitudesData);
        setFilteredSolicitudes(solicitudesData);
        
        setAlert({
          show: true,
          type: 'success',
          message: `Se cargaron ${solicitudesData.length} solicitudes correctamente`
        });
      } else {
        throw new Error('Error al cargar solicitudes');
      }
    } catch (error) {
      console.error('Error:', error);
      setAlert({
        show: true,
        type: 'danger',
        message: 'Error al conectar con el servidor. Verifica que el backend esté funcionando.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  useEffect(() => {
    let filtered = solicitudes.filter(solicitud =>
      solicitud.nombreApellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (solicitud.email && solicitud.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      solicitud.telefono.includes(searchTerm) ||
      solicitud.textoNecesario.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (estadoFilter) {
      filtered = filtered.filter(solicitud => solicitud.estado === estadoFilter);
    }

    setFilteredSolicitudes(filtered);
  }, [searchTerm, estadoFilter, solicitudes]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado?: string) => {
    const estados = {
      'pendiente': 'bg-warning',
      'en_proceso': 'bg-info',
      'listo': 'bg-success',
      'entregado': 'bg-success',
      'cancelado': 'bg-danger'
    };
    return estados[estado as keyof typeof estados] || 'bg-secondary';
  };

  const updateEstado = async (id: string, nuevoEstado: string) => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SOLICITUDES.UPDATE_ESTADO(id)), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        setAlert({
          show: true,
          type: 'success',
          message: 'Estado actualizado correctamente'
        });
        fetchSolicitudes(); // Recargar la lista
      } else {
        throw new Error('Error al actualizar estado');
      }
    } catch (error) {
      setAlert({
        show: true,
        type: 'danger',
        message: 'Error al actualizar el estado'
      });
    }
  };

  const handleRefresh = () => {
    fetchSolicitudes();
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Top Navigation Bar */}
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div className="container-fluid">
          <a className="navbar-brand" href="/" style={{ color: '#333', fontWeight: 'bold' }}>
            <i className="fas fa-print me-2" style={{ color: '#FD8200' }}></i>
            Centeno Admin
          </a>
          <div className="navbar-nav ms-auto">
            <a className="nav-link" href="/" style={{ color: '#666' }}>
              <i className="fas fa-home me-1"></i>
              Dashboard
            </a>

            <a className="nav-link active" href="/solicitudes" style={{ color: '#FD8200', fontWeight: 'bold' }}>
              <i className="fas fa-file-alt me-1"></i>
              Solicitudes
            </a>
            <a className="nav-link" href="/libros" style={{ color: '#666' }}>
              <i className="fas fa-book me-1"></i>
              Libros
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="h2 mb-1" style={{ color: '#333', fontWeight: 'bold' }}>
                  <i className="fas fa-file-alt me-2" style={{ color: '#FD8200' }}></i>
                  Solicitudes de Fotocopias
                </h1>
                <p className="text-muted mb-0">Gestiona todas las solicitudes de fotocopiado</p>
              </div>
              <button 
                className="btn" 
                onClick={handleRefresh}
                disabled={isLoading}
                style={{ 
                  backgroundColor: '#FD8200', 
                  borderColor: '#FD8200', 
                  color: 'white', 
                  borderRadius: '8px' 
                }}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sync-alt me-2"></i>
                    Actualizar
                  </>
                )}
              </button>
            </div>

            {/* Alert */}
            {alert.show && (
              <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
                {alert.message}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setAlert({ ...alert, show: false })}
                ></button>
              </div>
            )}

            {/* Search and Filters */}
            <div className="card border-0 mb-4" style={{ 
              backgroundColor: '#fff', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
              borderRadius: '12px' 
            }}>
              <div className="card-body p-4">
                <div className="row">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text" style={{ 
                        backgroundColor: '#FD8200', 
                        borderColor: '#FD8200', 
                        color: 'white' 
                      }}>
                        <i className="fas fa-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombre, email, teléfono o descripción..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ borderColor: '#ddd' }}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select"
                      value={estadoFilter}
                      onChange={(e) => setEstadoFilter(e.target.value)}
                      style={{ borderColor: '#ddd' }}
                    >
                      <option value="">Todos los estados</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="listo">Listo</option>
                      <option value="entregado">Entregado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <div className="d-flex justify-content-end align-items-center">
                      <span className="text-muted">
                        {filteredSolicitudes.length} de {solicitudes.length} solicitudes
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Solicitudes Table */}
            <div className="card border-0" style={{ 
              backgroundColor: '#fff', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
              borderRadius: '12px' 
            }}>
              <div className="card-header py-3" style={{ 
                backgroundColor: '#FD8200', 
                color: 'white', 
                borderRadius: '12px 12px 0 0',
                border: 'none'
              }}>
                <h6 className="m-0 font-weight-bold">
                  Lista de Solicitudes de Fotocopias
                </h6>
              </div>
              <div className="card-body p-0">
                {isLoading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: '#FD8200' }} role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-3 text-muted">Cargando solicitudes...</p>
                  </div>
                ) : filteredSolicitudes.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                    <h5 className="mt-3 text-muted">
                      {solicitudes.length === 0 ? 'No hay solicitudes' : 'No se encontraron resultados'}
                    </h5>
                    <p className="text-muted">
                      {solicitudes.length === 0 
                        ? 'Aún no se han recibido solicitudes de fotocopias.' 
                        : 'Intenta con otros términos de búsqueda.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0" style={{ marginBottom: '0' }}>
                      <thead style={{ backgroundColor: '#f8f9fa' }}>
                        <tr>
                          <th scope="col" style={{ border: 'none', padding: '15px', color: '#333', fontWeight: 'bold' }}># Pedido</th>
                          <th scope="col" style={{ border: 'none', padding: '15px', color: '#333', fontWeight: 'bold' }}>Cliente</th>
                          <th scope="col" style={{ border: 'none', padding: '15px', color: '#333', fontWeight: 'bold' }}>Descripción</th>
                          <th scope="col" style={{ border: 'none', padding: '15px', color: '#333', fontWeight: 'bold' }}>Materiales</th>
                          <th scope="col" style={{ border: 'none', padding: '15px', color: '#333', fontWeight: 'bold' }}>Costo</th>
                          <th scope="col" style={{ border: 'none', padding: '15px', color: '#333', fontWeight: 'bold' }}>Estado</th>
                          <th scope="col" style={{ border: 'none', padding: '15px', color: '#333', fontWeight: 'bold' }}>Fecha</th>
                          <th scope="col" style={{ border: 'none', padding: '15px', color: '#333', fontWeight: 'bold' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSolicitudes.map((solicitud) => (
                          <tr key={solicitud.id}>
                            <td className="text-center">
                              <div className="badge fs-6" style={{ backgroundColor: '#FD8200', color: 'white' }}>
                                #{solicitud.numeroPedido || 'N/A'}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                                     style={{ backgroundColor: '#FD8200', width: '35px', height: '35px', fontSize: '14px' }}>
                                  {solicitud.nombreApellido.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <strong>{solicitud.nombreApellido}</strong>
                                  <br />
                                  <small className="text-muted">{solicitud.telefono}</small>
                                  {solicitud.email && (
                                    <>
                                      <br />
                                      <small className="text-muted">{solicitud.email}</small>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <small>{solicitud.textoNecesario.substring(0, 100)}...</small>
                            </td>
                            <td>
                              <div>
                                {solicitud.materialImprimir1Path && (
                                  <div className="mb-1">
                                    <i className="fas fa-file-pdf text-danger me-1"></i>
                                    <small><strong>Material 1:</strong> {solicitud.materialImprimir1Path.split('/').pop()} ({solicitud.materialImprimir1Pages || 0} pág.)</small>
                                  </div>
                                )}
                                {solicitud.materialImprimir2Path && (
                                  <div className="mb-1">
                                    <i className="fas fa-file-pdf text-danger me-1"></i>
                                    <small><strong>Material 2:</strong> {solicitud.materialImprimir2Path.split('/').pop()} ({solicitud.materialImprimir2Pages || 0} pág.)</small>
                                  </div>
                                )}
                                {solicitud.materialImprimir3Path && (
                                  <div className="mb-1">
                                    <i className="fas fa-file-pdf text-danger me-1"></i>
                                    <small><strong>Material 3:</strong> {solicitud.materialImprimir3Path.split('/').pop()} ({solicitud.materialImprimir3Pages || 0} pág.)</small>
                                  </div>
                                )}
                                {!solicitud.materialImprimir1Path && !solicitud.materialImprimir2Path && !solicitud.materialImprimir3Path && (
                                  <small className="text-muted">Sin materiales</small>
                                )}
                              </div>
                            </td>
                            <td>
                              {solicitud.costoTotal ? (
                                <div>
                                  <strong>${solicitud.costoTotal}</strong>
                                  {solicitud.montoAbonar && (
                                    <>
                                      <br />
                                      <small className="text-muted">A pagar: ${solicitud.montoAbonar}</small>
                                    </>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted">Sin calcular</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${getEstadoBadge(solicitud.estado)}`}>
                                {solicitud.estado || 'pendiente'}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {formatDate(solicitud.createdAt)}
                              </small>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <a 
                                  href={`/solicitudes/${solicitud.id}`} 
                                  className="btn btn-sm btn-outline-primary"
                                  title="Ver detalles"
                                >
                                  <i className="fas fa-eye"></i>
                                </a>
                                <div className="dropdown">
                                  <button 
                                    className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                    type="button" 
                                    data-bs-toggle="dropdown"
                                    title="Cambiar estado"
                                  >
                                    <i className="fas fa-cog"></i>
                                  </button>
                                  <ul className="dropdown-menu">
                                    <li><button className="dropdown-item" onClick={() => updateEstado(solicitud.id, 'pendiente')}>Pendiente</button></li>
                                    <li><button className="dropdown-item" onClick={() => updateEstado(solicitud.id, 'en_proceso')}>En Proceso</button></li>
                                    <li><button className="dropdown-item" onClick={() => updateEstado(solicitud.id, 'listo')}>Listo</button></li>
                                    <li><button className="dropdown-item" onClick={() => updateEstado(solicitud.id, 'entregado')}>Entregado</button></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item text-danger" onClick={() => updateEstado(solicitud.id, 'cancelado')}>Cancelar</button></li>
                                  </ul>
                                </div>
                                {solicitud.telefono && (
                                  <a 
                                    href={`tel:${solicitud.telefono}`} 
                                    className="btn btn-sm btn-outline-success"
                                    title="Llamar"
                                  >
                                    <i className="fas fa-phone"></i>
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
