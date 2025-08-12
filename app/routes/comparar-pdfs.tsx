import { useState, useRef, useEffect } from 'react';
import type { Route } from './+types/comparar-pdfs';
import { buildApiUrl, API_CONFIG } from '../config/api';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Comparar PDFs - Admin' }];
}

interface Comision {
  nombre: string;
  archivo: string;
  pagina: number;
  texto: string;
}

interface MatchResult {
  comision: string;
  archivo1: Comision;
  archivo2: Comision;
  similitud: number;
}

export default function CompararPDFs() {
  const [archivo1, setArchivo1] = useState<File | null>(null);
  const [archivo2, setArchivo2] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resultados, setResultados] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<string>('');
  
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  // Debug: Monitorear cambios en resultados
  useEffect(() => {
    console.log('Estado resultados actualizado:', resultados);
  }, [resultados]);

  const handleFileChange = (setter: (file: File | null) => void, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setter(file);
      setError(null);
    } else if (file) {
      setError('Por favor selecciona un archivo PDF válido');
      setter(null);
    }
  };

  const limpiarArchivos = () => {
    setArchivo1(null);
    setArchivo2(null);
    setResultados([]);
    setError(null);
    setProgreso('');
    if (fileInput1Ref.current) fileInput1Ref.current.value = '';
    if (fileInput2Ref.current) fileInput2.current.value = '';
  };

  const procesarPDFs = async () => {
    if (!archivo1 || !archivo2) {
      setError('Por favor selecciona ambos archivos PDF');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgreso('Iniciando procesamiento...');

    try {
      // Crear FormData para enviar los archivos
      const formData = new FormData();
      formData.append('archivo1', archivo1);
      formData.append('archivo2', archivo2);

      setProgreso('Enviando archivos al servidor...');

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PDF.COMPARE), {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      setProgreso('Procesando PDFs...');
      
      const data = await response.json();
      console.log('Respuesta del servidor:', data); // Debug log
      
      if (data.success) {
        console.log('Matches encontrados:', data.matches); // Debug log
        console.log('Longitud de matches:', data.matches?.length); // Debug log
        setResultados(data.matches || []);
        console.log('Estado resultados después de setResultados:', data.matches || []); // Debug log
        setProgreso(`Procesamiento completado - ${data.matches?.length || 0} coincidencias encontradas`);
      } else {
        throw new Error(data.message || 'Error al procesar los PDFs');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setProgreso('');
    } finally {
      setIsLoading(false);
    }
  };

  const descargarResultados = () => {
    if (resultados.length === 0) return;

    const csvContent = [
      'Comisión,Archivo 1,Archivo 2,Página 1,Página 2,Similitud (%)',
      ...resultados.map(r => 
        `"${r.comision}","${r.archivo1.archivo}","${r.archivo2.archivo}",${r.archivo1.pagina},${r.archivo2.pagina},${r.similitud.toFixed(2)}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'comparacion_comisiones.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Navigation Bar */}
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
            <a className="nav-link" href="/solicitudes" style={{ color: '#666' }}>
              <i className="fas fa-file-alt me-1"></i>
              Solicitudes
            </a>
            <a className="nav-link" href="/libros" style={{ color: '#666' }}>
              <i className="fas fa-book me-1"></i>
              Libros
            </a>
            <a className="nav-link active" href="/comparar-pdfs" style={{ color: '#FD8200', fontWeight: 'bold' }}>
              <i className="fas fa-file-pdf me-1"></i>
              Comparar PDFs
            </a>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <h1 className="h2 mb-4" style={{ color: '#333', fontWeight: 'bold' }}>
              <i className="fas fa-file-pdf me-2" style={{ color: '#FD8200' }}></i>
              Comparar PDFs por Comisión
            </h1>
            <p className="text-muted mb-4">
              Carga dos archivos PDF para encontrar coincidencias por nombre de comisión
            </p>

            {/* File Upload Section */}
            <div className="card border-0 mb-4" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-upload me-2"></i>
                  Cargar Archivos PDF
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Primer Archivo PDF</label>
                    <input
                      ref={fileInput1Ref}
                      type="file"
                      className="form-control"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(setArchivo1, e)}
                      disabled={isLoading}
                    />
                    {archivo1 && (
                      <div className="mt-2">
                        <small className="text-success">
                          <i className="fas fa-check me-1"></i>
                          {archivo1.name} ({(archivo1.size / 1024 / 1024).toFixed(2)} MB)
                        </small>
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Segundo Archivo PDF</label>
                    <input
                      ref={fileInput2Ref}
                      type="file"
                      className="form-control"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(setArchivo2, e)}
                      disabled={isLoading}
                    />
                    {archivo2 && (
                      <div className="mt-2">
                        <small className="text-success">
                          <i className="fas fa-check me-1"></i>
                          {archivo2.name} ({(archivo2.size / 1024 / 1024).toFixed(2)} MB)
                        </small>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 d-flex gap-2">
                  <button
                    className="btn"
                    style={{ backgroundColor: '#FD8200', color: 'white' }}
                    onClick={procesarPDFs}
                    disabled={!archivo1 || !archivo2 || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-search me-2"></i>
                        Comparar PDFs
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={limpiarArchivos}
                    disabled={isLoading}
                  >
                    <i className="fas fa-times me-2"></i>
                    Limpiar
                  </button>
                </div>

                {progreso && (
                  <div className="mt-3">
                    <div className="alert alert-info mb-0">
                      <i className="fas fa-info-circle me-2"></i>
                      {progreso}
                    </div>
                  </div>
                )}

                {/* Debug: Mostrar estado actual */}
                <div className="mt-3">
                  <div className="alert alert-warning mb-0">
                    <i className="fas fa-bug me-2"></i>
                    <strong>Debug:</strong> Estado actual - Archivo1: {archivo1?.name || 'No seleccionado'}, 
                    Archivo2: {archivo2?.name || 'No seleccionado'}, 
                    Resultados: {resultados.length}, 
                    Loading: {isLoading ? 'Sí' : 'No'}
                  </div>
                </div>

                {error && (
                  <div className="mt-3">
                    <div className="alert alert-danger mb-0">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            {resultados.length > 0 && (
              <div className="card border-0" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    <i className="fas fa-list me-2"></i>
                    Resultados de la Comparación
                  </h5>
                  <button
                    className="btn btn-light btn-sm"
                    onClick={descargarResultados}
                  >
                    <i className="fas fa-download me-2"></i>
                    Exportar CSV
                  </button>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Comisión</th>
                          <th>Archivo 1</th>
                          <th>Archivo 2</th>
                          <th>Página 1</th>
                          <th>Página 2</th>
                          <th>Similitud</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultados.map((resultado, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{resultado.comision}</strong>
                            </td>
                            <td>
                              <small className="text-muted">
                                {resultado.archivo1.archivo === 'N/A' ? 'Sin coincidencia' : resultado.archivo1.archivo}
                              </small>
                            </td>
                            <td>
                              <small className="text-muted">
                                {resultado.archivo2.archivo === 'N/A' ? 'Sin coincidencia' : resultado.archivo2.archivo}
                              </small>
                            </td>
                            <td>
                              <span className={`badge ${resultado.archivo1.pagina === 0 ? 'bg-secondary' : 'bg-primary'}`}>
                                {resultado.archivo1.pagina === 0 ? 'N/A' : resultado.archivo1.pagina}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${resultado.archivo2.pagina === 0 ? 'bg-secondary' : 'bg-primary'}`}>
                                {resultado.archivo2.pagina === 0 ? 'N/A' : resultado.archivo2.pagina}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                {resultado.similitud === 0 ? (
                                  <span className="badge bg-secondary">Sin coincidencia</span>
                                ) : (
                                  <>
                                    <div className="progress me-2" style={{ width: '60px', height: '8px' }}>
                                      <div
                                        className="progress-bar"
                                        style={{
                                          width: `${resultado.similitud}%`,
                                          backgroundColor: resultado.similitud > 80 ? '#28a745' : 
                                                       resultado.similitud > 60 ? '#ffc107' : '#dc3545'
                                        }}
                                      ></div>
                                    </div>
                                    <small className="fw-bold">{resultado.similitud.toFixed(1)}%</small>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-3 text-center">
                    <p className="text-muted mb-0">
                      Se encontraron <strong>{resultados.length}</strong> coincidencias entre los archivos
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 