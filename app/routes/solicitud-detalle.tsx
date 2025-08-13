import { useState, useEffect } from "react";
import { useParams } from "react-router";
import type { Route } from "./+types/solicitud-detalle";
import { buildApiUrl, API_CONFIG, getBaseUrl } from "../config/api";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Detalle de Solicitud - Panel de Administración" },
    { name: "description", content: "Información detallada de la solicitud de fotocopias" },
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
  materialImprimir1PagesPerSheet?: number;
  materialImprimir2?: string;
  materialImprimir2Path?: string;
  materialImprimir2Size?: number;
  materialImprimir2Pages?: number;
  materialImprimir2PagesPerSheet?: number;
  materialImprimir3?: string;
  materialImprimir3Path?: string;
  materialImprimir3Size?: number;
  materialImprimir3Pages?: number;
  materialImprimir3PagesPerSheet?: number;
  comprobante?: string;
  comprobantePath?: string;
  comprobanteSize?: number;
  costoImpresion?: number;
  costoLibros?: number;
  costoTotal?: number;
  montoAbonar?: number;
  montoPagado?: number;
  librosSeleccionados?: string[];
  recibirInformacion?: boolean;
  estado?: string;
  archivosModificados?: boolean;
  observaciones?: string;
  nota?: string;
  createdAt: string;
  updatedAt: string;
}

interface AlertState {
  show: boolean;
  type: 'success' | 'danger' | 'info';
  message: string;
}

interface Libro {
  id: string;
  categoria: string;
  titulo: string;
  autor?: string;
  edicion?: string;
  precio?: number;
}

export default function SolicitudDetalle() {
  const { id } = useParams();
  const [solicitud, setSolicitud] = useState<SolicitudImpresion | null>(null);
  const [books, setBooks] = useState<Libro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: 'info',
    message: ''
  });

  useEffect(() => {
    const fetchSolicitud = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SOLICITUDES.BY_ID(id)), {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setSolicitud(data.data);
        } else if (response.status === 404) {
          setAlert({
            show: true,
            type: 'danger',
            message: 'Solicitud no encontrada'
          });
        } else {
          throw new Error('Error al cargar la solicitud');
        }
      } catch (error) {
        console.error('Error:', error);
        setAlert({
          show: true,
          type: 'danger',
          message: 'Error al conectar con el servidor'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolicitud();
  }, [id]);

  // Cargar libros para mostrar nombres
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LIBROS.BASE), {
          credentials: 'include'
        });
        if (response.ok) {
          const result = await response.json();
          setBooks(result.data || []);
        }
      } catch (error) {
        console.error('Error cargando libros:', error);
      }
    };
    
    fetchBooks();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado?: string) => {
    const estados = {
      'pendiente': { class: 'bg-warning', text: 'Pendiente' },
      'en_proceso': { class: 'bg-info', text: 'En Proceso' },
      'listo': { class: 'bg-success', text: 'Listo' },
      'entregado': { class: 'bg-success', text: 'Entregado' },
      'cancelado': { class: 'bg-danger', text: 'Cancelado' }
    };
    return estados[estado as keyof typeof estados] || { class: 'bg-secondary', text: 'Sin Estado' };
  };

  const updateEstado = async (nuevoEstado: string) => {
    if (!solicitud) return;
    
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.SOLICITUDES.UPDATE_ESTADO(solicitud.id)), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        const data = await response.json();
        setSolicitud(data.data);
        setAlert({
          show: true,
          type: 'success',
          message: 'Estado actualizado correctamente'
        });
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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setAlert({
        show: true,
        type: 'success',
        message: `${field} copiado al portapapeles`
      });
      setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 2000);
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
                              <div className="spinner-border" style={{ color: '#FD8200' }} role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando detalles de la solicitud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f5f5f5' }}>
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
            <a className="nav-link" href="/solicitudes" style={{ color: '#FD8200', fontWeight: 'bold' }}>
              <i className="fas fa-file-alt me-1"></i>
              Solicitudes
            </a>
            <a className="nav-link" href="/libros" style={{ color: '#666' }}>
              <i className="fas fa-book me-1"></i>
              Libros
            </a>
            <a className="nav-link" href="/comparar-excel" style={{ color: '#666' }}>
              <i className="fas fa-file-excel me-1"></i>
              Comparar Archivos Excel
            </a>
          </div>
        </div>
      </nav>
      

      {/* Main Content */}
      <div className="container-fluid py-4">
        <div className="row">
          {/* Sidebar */}
          <div className="col-md-3 col-lg-2">
            <div className="card">
              <div className="card-header text-white" style={{ backgroundColor: '#FD8200' }}>
                <h6 className="mb-0">
                  <i className="bi bi-list me-2"></i>
                  Menú
                </h6>
              </div>
              <div className="list-group list-group-flush">
                <a href="/" className="list-group-item list-group-item-action">
                  <i className="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </a>
                <a href="/solicitudes" className="list-group-item list-group-item-action">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Solicitudes
                </a>
                <a href="#" className="list-group-item list-group-item-action disabled">
                  <i className="bi bi-gear me-2"></i>
                  Configuración
                </a>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9 col-lg-10">
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h1 className="h2">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Detalle de Solicitud
                  {solicitud && (
                    <span className="badge ms-3 fs-6" style={{ backgroundColor: '#FD8200', color: 'white' }}>
                      Pedido #{solicitud.numeroPedido || 'N/A'}
                    </span>
                  )}
                </h1>
              </div>
              <a href="/solicitudes" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i>
                Volver a la lista
              </a>
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

            {solicitud ? (
              <div className="row">
                {/* Información Principal */}
                <div className="col-lg-8 mb-4">
                  <div className="card shadow mb-4">
                    <div className="card-header text-white" style={{ backgroundColor: '#FD8200' }}>
                      <h5 className="mb-0">
                        <i className="bi bi-person-circle me-2"></i>
                        Información del Cliente
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center mb-3">
                            <div className="text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                                 style={{ backgroundColor: '#FD8200', width: '60px', height: '60px', fontSize: '24px' }}>
                              {solicitud.nombreApellido.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="mb-0">{solicitud.nombreApellido}</h3>
                              <p className="text-muted mb-0">ID: {solicitud.id}</p>
                              <span className={`badge ${getEstadoBadge(solicitud.estado).class} mt-1`}>
                                {getEstadoBadge(solicitud.estado).text}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">
                            <i className="bi bi-telephone me-1"></i>
                            Teléfono
                          </label>
                          <div className="input-group">
                            <input 
                              type="text" 
                              className="form-control" 
                              value={solicitud.telefono} 
                              readOnly 
                            />
                            <button 
                              className="btn btn-outline-secondary" 
                              type="button"
                              onClick={() => copyToClipboard(solicitud.telefono, 'Teléfono')}
                            >
                              <i className="bi bi-clipboard"></i>
                            </button>
                            <a 
                              href={`tel:${solicitud.telefono}`} 
                              className="btn btn-success"
                            >
                              <i className="bi bi-telephone"></i>
                            </a>
                          </div>
                        </div>

                        {solicitud.email && (
                          <div className="col-md-6 mb-3">
                            <label className="form-label text-muted">
                              <i className="bi bi-envelope me-1"></i>
                              Email
                            </label>
                            <div className="input-group">
                              <input 
                                type="text" 
                                className="form-control" 
                                value={solicitud.email} 
                                readOnly 
                              />
                              <button 
                                className="btn btn-outline-secondary" 
                                type="button"
                                onClick={() => copyToClipboard(solicitud.email!, 'Email')}
                              >
                                <i className="bi bi-clipboard"></i>
                              </button>
                              <a 
                                href={`mailto:${solicitud.email}`} 
                                className="btn"
                                style={{ backgroundColor: '#FD8200', borderColor: '#FD8200', color: 'white' }}
                              >
                                <i className="bi bi-envelope"></i>
                              </a>
                            </div>
                          </div>
                        )}

                        <div className="col-md-12 mb-3">
                          <label className="form-label text-muted">
                            <i className="bi bi-chat-left-text me-1"></i>
                            Descripción del Trabajo
                          </label>
                          <textarea 
                            className="form-control" 
                            rows={4}
                            value={solicitud.textoNecesario} 
                            readOnly 
                          />
                        </div>
                        
                        {/* Información Adicional */}
                        <div className="col-md-12 mb-3">
                          <label className="form-label text-muted">
                            <i className="bi bi-info-circle me-1"></i>
                            Información Adicional
                          </label>
                          <div className="d-flex align-items-center">
                            <div className="form-check me-3">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={solicitud.recibirInformacion || false}
                                disabled
                              />
                              <label className="form-check-label">
                                Recibir más información de Centeno
                              </label>
                            </div>
                            {solicitud.recibirInformacion ? (
                              <span className="badge bg-success">
                                <i className="bi bi-check-circle me-1"></i>
                                Sí
                              </span>
                            ) : (
                              <span className="badge bg-secondary">
                                <i className="bi bi-x-circle me-1"></i>
                                No
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Materiales a Imprimir */}
                  <div className="card shadow mb-4">
                    <div className="card-header bg-info text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-files me-2"></i>
                        Materiales a Imprimir
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        {[1, 2, 3].map((num) => {
                          const path = solicitud[`materialImprimir${num}Path` as keyof SolicitudImpresion] as string;
                          const pages = solicitud[`materialImprimir${num}Pages` as keyof SolicitudImpresion] as number;
                          const size = solicitud[`materialImprimir${num}Size` as keyof SolicitudImpresion] as number;
                          
                          if (!path) return null;
                          
                          const fileName = path.split('/').pop() || 'archivo.pdf';
                          const relativePath = path.replace(/^public\//, '');
                          const fileUrl = `${getBaseUrl()}/${relativePath}`;
                          
                          return (
                            <div key={num} className="col-md-4 mb-3">
                              <div className="card border">
                                <div className="card-header bg-light">
                                  <h6 className="mb-0">
                                    <i className="bi bi-file-pdf text-danger me-2"></i>
                                    Material {num}
                                  </h6>
                                </div>
                                <div className="card-body">
                                  <p><strong>Archivo:</strong> {fileName}</p>
                                  <p><strong>Páginas:</strong> {pages || 0}</p>
                                  {size && <p><strong>Tamaño:</strong> {formatFileSize(size)}</p>}
                                  <div className="d-grid gap-2">
                                    <a 
                                      href={fileUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="btn btn-outline-primary btn-sm"
                                    >
                                      <i className="bi bi-eye me-1"></i>
                                      Ver PDF
                                    </a>
                                    <a 
                                      href={fileUrl} 
                                      download={fileName}
                                      className="btn btn-outline-success btn-sm"
                                    >
                                      <i className="bi bi-download me-1"></i>
                                      Descargar
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Mostrar si no hay materiales */}
                      {!solicitud.materialImprimir1Path && !solicitud.materialImprimir2Path && !solicitud.materialImprimir3Path && (
                        <div className="text-center py-4">
                          <i className="bi bi-files display-4 text-muted"></i>
                          <p className="text-muted mt-2">No se han subido materiales para esta solicitud</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comprobante de Pago */}
                  {solicitud.comprobantePath && (
                    <div className="card shadow mb-4">
                      <div className="card-header bg-success text-white">
                        <h5 className="mb-0">
                          <i className="bi bi-receipt me-2"></i>
                          Comprobante de Pago
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row align-items-center">
                          <div className="col-md-8">
                            <p className="mb-2">
                              <strong>Archivo:</strong> {solicitud.comprobantePath.split('/').pop() || 'comprobante.pdf'}
                            </p>
                            {solicitud.comprobanteSize && (
                              <p className="mb-0">
                                <strong>Tamaño:</strong> {formatFileSize(solicitud.comprobanteSize)}
                              </p>
                            )}
                          </div>
                          <div className="col-md-4">
                            <div className="d-grid gap-2">
                              <a 
                                href={`${getBaseUrl()}/uploads/comprobantes/${solicitud.comprobantePath.split('/').pop()}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary btn-sm"
                              >
                                <i className="bi bi-eye me-1"></i>
                                Ver Comprobante
                              </a>
                              <a 
                                href={`${getBaseUrl()}/uploads/comprobantes/${solicitud.comprobantePath.split('/').pop()}`} 
                                download={solicitud.comprobantePath.split('/').pop()}
                                className="btn btn-outline-success btn-sm"
                              >
                                <i className="bi bi-download me-1"></i>
                                Descargar
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Libros Seleccionados */}
                  {solicitud.librosSeleccionados && solicitud.librosSeleccionados.length > 0 && (
                    <div className="card shadow mb-4">
                      <div className="card-header" style={{backgroundColor: '#FD8200', color: 'white'}}>
                        <h5 className="mb-0">
                          <i className="fas fa-book me-2"></i>
                          Libros Seleccionados
                        </h5>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          {solicitud.librosSeleccionados.map((bookId, index) => {
                            const libro = books.find(b => b.id === bookId);
                            return (
                              <div key={index} className="col-md-6 col-lg-4 mb-3">
                                <div className="card border">
                                  <div className="card-body">
                                    <div className="d-flex align-items-start">
                                      <i className="fas fa-book text-primary me-2 mt-1"></i>
                                      <div className="flex-grow-1">
                                        <strong className="d-block">{libro?.titulo || 'Libro no encontrado'}</strong>
                                        {libro?.autor && (
                                          <small className="text-muted d-block">Autor: {libro.autor}</small>
                                        )}
                                        {libro?.edicion && (
                                          <small className="text-muted d-block">Edición: {libro.edicion}</small>
                                        )}
                                        {libro?.precio && (
                                          <span className="badge bg-success text-white mt-1">
                                            ${libro.precio.toLocaleString()}
                                          </span>
                                        )}
                                        <small className="text-muted d-block mt-1">ID: {bookId}</small>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  
                </div>

                {/* Sidebar con acciones y costos */}
                <div className="col-lg-4 mb-4">
                  {/* Cambiar Estado */}
                  <div className="card shadow mb-4">
                    <div className="card-header bg-success text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-gear me-2"></i>
                        Gestión del Pedido
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <label className="form-label">Estado Actual:</label>
                        <div>
                          <span className={`badge ${getEstadoBadge(solicitud.estado).class} fs-6`}>
                            {getEstadoBadge(solicitud.estado).text}
                          </span>
                        </div>
                      </div>
                      <div className="d-grid gap-2">
                        <button 
                          className="btn btn-warning btn-sm"
                          onClick={() => updateEstado('pendiente')}
                          disabled={solicitud.estado === 'pendiente'}
                        >
                          Marcar como Pendiente
                        </button>
                        <button 
                          className="btn btn-info btn-sm"
                          onClick={() => updateEstado('en_proceso')}
                          disabled={solicitud.estado === 'en_proceso'}
                        >
                          Marcar En Proceso
                        </button>
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => updateEstado('listo')}
                          disabled={solicitud.estado === 'listo'}
                        >
                          Marcar como Listo
                        </button>
                        <button 
                          className="btn btn-sm"
                          style={{ backgroundColor: '#FD8200', borderColor: '#FD8200', color: 'white' }}
                          onClick={() => updateEstado('entregado')}
                          disabled={solicitud.estado === 'entregado'}
                        >
                          Marcar como Entregado
                        </button>
                        <hr />
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => updateEstado('cancelado')}
                          disabled={solicitud.estado === 'cancelado'}
                        >
                          Cancelar Solicitud
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Costos */}
                  <div className="card shadow mb-4">
                    <div className="card-header text-white" style={{ backgroundColor: '#FD8200' }}>
                      <h5 className="mb-0">
                        <i className="bi bi-calculator me-2"></i>
                        Información de Costos
                      </h5>
                    </div>
                    <div className="card-body">
                      {/* Detalle de páginas */}
                      <div className="mb-3">
                        <h6 className="text-muted">Detalle de Páginas:</h6>
                        <div className="d-flex justify-content-between mb-1">
                          <span>📄 Material 1:</span>
                          <span className="fw-bold">{solicitud.materialImprimir1Pages || 0} pág.</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                          <span>📄 Material 2:</span>
                          <span className="fw-bold">{solicitud.materialImprimir2Pages || 0} pág.</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>📄 Material 3:</span>
                          <span className="fw-bold">{solicitud.materialImprimir3Pages || 0} pág.</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between mb-2">
                          <span className="fw-bold">Total páginas:</span>
                          <span className="fw-bold" style={{ color: '#FD8200' }}>
                            {(solicitud.materialImprimir1Pages || 0) + 
                             (solicitud.materialImprimir2Pages || 0) + 
                             (solicitud.materialImprimir3Pages || 0)} páginas
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Precio por página:</span>
                          <span className="fw-bold">$40</span>
                        </div>
                      </div>

                      {/* Costos */}
                      <div className="row text-center">
                        <div className="col-6 mb-3">
                          <h4 className="text-info">${(solicitud.costoImpresion || 0).toLocaleString()}</h4>
                          <small className="text-muted">Costo Impresión</small>
                        </div>
                        <div className="col-6 mb-3">
                          <h4 className="text-warning">${(solicitud.costoLibros || 0).toLocaleString()}</h4>
                          <small className="text-muted">Costo Libros</small>
                        </div>
                        <div className="col-12 mb-3">
                          <hr />
                          <h3 className="text-success">${(solicitud.costoTotal || 0).toLocaleString()}</h3>
                          <small className="text-muted">Total a Abonar</small>
                        </div>
                        <div className="col-12">
                          <h4 className="text-info">${(solicitud.montoAbonar || 0).toLocaleString()}</h4>
                          <small className="text-muted">Transferir (50%)</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fechas */}
                  <div className="card shadow">
                    <div className="card-header bg-secondary text-white">
                      <h5 className="mb-0">
                        <i className="bi bi-calendar me-2"></i>
                        Información de Fechas
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-2">
                        <strong>Creado:</strong>
                        <br />
                        <small className="text-muted">{formatDate(solicitud.createdAt)}</small>
                      </div>
                      <div>
                        <strong>Última actualización:</strong>
                        <br />
                        <small className="text-muted">{formatDate(solicitud.updatedAt)}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
                <h3 className="mt-3">Solicitud no encontrada</h3>
                <p className="text-muted">
                  La solicitud que buscas no existe o ha sido eliminada.
                </p>
                <a href="/solicitudes" className="btn" style={{ backgroundColor: '#FD8200', borderColor: '#FD8200', color: 'white' }}>
                  <i className="bi bi-arrow-left me-2"></i>
                  Volver a la lista
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
