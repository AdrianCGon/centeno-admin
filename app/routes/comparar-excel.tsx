import { useState, useRef, useCallback } from 'react';
import type { Route } from './+types/comparar-excel';
import { buildApiUrl, API_CONFIG } from '../config/api';
import { ComisionService, type CreateComisionRequest } from '../services/comision.service';
import { Navigation } from '../components/Navigation';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Comparar Archivos Excel - Admin' }];
}

interface Comision {
  nombre: string;
  archivo: string;
  pagina: number;
  texto: string;
  periodoLectivo?: string;
  actividad?: string;
  comision?: string;
  modalidad?: string;
  docente?: string;
  horario?: string;
  aula?: string;
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
  const [estadisticas, setEstadisticas] = useState<{
    archivo1: { total: number; nombre: string; comisiones: Comision[] };
    archivo2: { total: number; nombre: string; comisiones: Comision[] };
    coincidencias: number;
  } | null>(null);
  
  // Estados para guardar comisiones
  const [mostrarFormularioGuardar, setMostrarFormularioGuardar] = useState(false);
  const [comisionSeleccionada, setComisionSeleccionada] = useState<MatchResult | null>(null);
  const [formData, setFormData] = useState<CreateComisionRequest>({
    periodo: '',
    actividad: '',
    modalidad: '',
    docente: '',
    horario: '',
    aula: ''
  });
  
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((setter: (file: File | null) => void, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.type === 'application/vnd.ms-excel' ||
                 file.name.endsWith('.xlsx') || 
                 file.name.endsWith('.xls'))) {
      setter(file);
      setError(null);
    } else if (file) {
      setError('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
      setter(null);
    }
  }, []);

  const limpiarArchivos = useCallback(() => {
    setArchivo1(null);
    setArchivo2(null);
    setResultados([]);
    setEstadisticas(null);
    setError(null);
    setProgreso('');
    if (fileInput1Ref.current) fileInput1Ref.current.value = '';
    if (fileInput2Ref.current) fileInput2Ref.current.value = '';
  }, []);

  const procesarPDFs = useCallback(async () => {
    if (!archivo1 || !archivo2) {
      setError('Por favor selecciona ambos archivos Excel');
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

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.EXCEL.COMPARE), {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      setProgreso('Procesando archivos Excel...');
      
      const data = await response.json();
      
      if (data.success) {
        const matches = data.matches || [];
        setResultados(matches);
        
        // Extraer estadísticas de los resultados
        const archivo1Stats = {
          total: matches.filter((m: MatchResult) => m.archivo1.archivo !== 'N/A').length,
          nombre: archivo1.name,
          comisiones: data.archivo1?.comisiones || []
        };
        
        const archivo2Stats = {
          total: matches.filter((m: MatchResult) => m.archivo2.archivo !== 'N/A').length,
          nombre: archivo2.name,
          comisiones: data.archivo2?.comisiones || []
        };
        
        setEstadisticas({
          archivo1: archivo1Stats,
          archivo2: archivo2Stats,
          coincidencias: matches.length
        });
        
        setProgreso(`Procesamiento completado - ${matches.length} coincidencias encontradas`);
      } else {
        throw new Error(data.message || 'Error al procesar los archivos Excel');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setProgreso('');
    } finally {
      setIsLoading(false);
    }
  }, [archivo1, archivo2]);

  const descargarResultados = useCallback(() => {
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
  }, [resultados]);

  // Funciones para guardar comisiones
  const guardarComision = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.periodo || !formData.actividad || !formData.modalidad || 
        !formData.docente || !formData.horario || !formData.aula) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      await ComisionService.create(formData);
      alert('Comisión guardada exitosamente');
      setMostrarFormularioGuardar(false);
      setComisionSeleccionada(null);
      setFormData({
        periodo: '',
        actividad: '',
        modalidad: '',
        docente: '',
        horario: '',
        aula: ''
      });
    } catch (error) {
      alert('Error al guardar la comisión: ' + error);
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  const seleccionarComisionParaGuardar = useCallback((comision: MatchResult) => {
    setComisionSeleccionada(comision);
    setFormData({
      periodo: comision.archivo1.periodoLectivo || comision.archivo2.periodoLectivo || '',
      actividad: comision.archivo1.actividad || comision.archivo2.actividad || '',
      modalidad: comision.archivo1.modalidad || comision.archivo2.modalidad || '',
      docente: comision.archivo1.docente || comision.archivo2.docente || '',
      horario: comision.archivo1.horario || comision.archivo2.horario || '',
      aula: comision.archivo1.aula || comision.archivo2.aula || ''
    });
    setMostrarFormularioGuardar(true);
  }, []);

  const guardarTodasComisionesArchivo1 = useCallback(async () => {
    if (!resultados || resultados.length === 0) {
      alert('No hay resultados para guardar');
      return;
    }

    if (!confirm(`¿Estás seguro de que quieres guardar ${resultados.length} comisiones del archivo 1?`)) {
      return;
    }

    setIsLoading(true);
    let guardadas = 0;
    let errores = 0;

    try {
      for (const resultado of resultados) {
        try {
          // Log de debug para ver qué datos tiene el resultado
          console.log('🔍 Resultado a guardar:', resultado);
          console.log('🏫 Campo aula del resultado:', resultado.archivo1.aula);
          console.log('📋 Todos los campos del archivo1:', {
            periodoLectivo: resultado.archivo1.periodoLectivo,
            actividad: resultado.archivo1.actividad,
            modalidad: resultado.archivo1.modalidad,
            docente: resultado.archivo1.docente,
            horario: resultado.archivo1.horario,
            aula: resultado.archivo1.aula
          });

          const datosComision = {
            periodo: resultado.archivo1.periodoLectivo || '',
            actividad: resultado.archivo1.actividad || '',
            modalidad: resultado.archivo1.modalidad || '',
            docente: resultado.archivo1.docente || '',
            horario: resultado.archivo1.horario || '',
            aula: resultado.archivo1.aula || ''
          };

          // Log de debug para ver qué datos se van a enviar
          console.log('📤 Datos que se van a enviar:', datosComision);

          // Verificar cada campo individualmente
          console.log('🔍 Verificación de campos:');
          console.log('  - periodo:', datosComision.periodo ? '✅' : '❌');
          console.log('  - actividad:', datosComision.actividad ? '✅' : '❌');
          console.log('  - modalidad:', datosComision.modalidad ? '✅' : '❌');
          console.log('  - docente:', datosComision.docente ? '✅' : '❌');
          console.log('  - horario:', datosComision.horario ? '✅' : '❌');
          console.log('  - aula:', datosComision.aula ? '✅' : '❌');

          // Verificar que todos los campos requeridos estén presentes
          if (datosComision.periodo && datosComision.actividad && datosComision.modalidad && 
              datosComision.docente && datosComision.horario && datosComision.aula) {
            console.log('✅ Todos los campos están presentes, guardando comisión...');
            await ComisionService.create(datosComision);
            guardadas++;
            console.log('✅ Comisión guardada exitosamente');
          } else {
            errores++;
            console.log('❌ Comisión omitida por campos faltantes:', datosComision);
            
            // Mostrar qué campos específicos están faltando
            const camposFaltantes = [];
            if (!datosComision.periodo) camposFaltantes.push('periodo');
            if (!datosComision.actividad) camposFaltantes.push('actividad');
            if (!datosComision.modalidad) camposFaltantes.push('modalidad');
            if (!datosComision.docente) camposFaltantes.push('docente');
            if (!datosComision.horario) camposFaltantes.push('horario');
            if (!datosComision.aula) camposFaltantes.push('aula');
            
            console.log('❌ Campos faltantes:', camposFaltantes);
          }
        } catch (error) {
          errores++;
          console.error('❌ Error al guardar comisión:', error);
        }
      }

      alert(`Proceso completado:\n- Comisiones guardadas: ${guardadas}\n- Errores: ${errores}`);
      
      if (guardadas > 0) {
        // Limpiar la lista de resultados guardados
        setResultados([]);
      }
    } catch (error) {
      alert('Error general al guardar comisiones: ' + error);
    } finally {
      setIsLoading(false);
    }
  }, [resultados]);

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Navigation Bar */}
      <Navigation currentPage="comparar-excel" />

      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <h1 className="h2 mb-4" style={{ color: '#333', fontWeight: 'bold' }}>
              <i className="fas fa-file-excel me-2" style={{ color: '#FD8200' }}></i>
              Comparar Archivos Excel por Comisión
            </h1>
            <p className="text-muted mb-4">
              Carga dos archivos Excel para encontrar coincidencias por nombre de comisión
            </p>

            {/* File Upload Section */}
            <div className="card border-0 mb-4" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-upload me-2"></i>
                  Cargar Archivos Excel
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Primer Archivo Excel</label>
                    <input
                      ref={fileInput1Ref}
                      type="file"
                      className="form-control"
                      accept=".xlsx,.xls"
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
                    <label className="form-label fw-bold">Segundo Archivo Excel</label>
                    <input
                      ref={fileInput2Ref}
                      type="file"
                      className="form-control"
                      accept=".xlsx,.xls"
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
                        Comparar Archivos Excel
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

            {/* Statistics Section */}
            {estadisticas && (
              <div className="card border-0 mb-4" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">
                    <i className="fas fa-chart-bar me-2"></i>
                    Estadísticas de la Comparación
                  </h5>
                </div>
                <div className="card-body">
                  <div className="row text-center">
                    <div className="col-md-4">
                      <div className="border-end">
                        <h4 className="text-primary mb-1">{estadisticas.archivo1.total}</h4>
                        <p className="text-muted mb-0">Comisiones en {estadisticas.archivo1.nombre}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="border-end">
                        <h4 className="text-success mb-1">{estadisticas.archivo2.total}</h4>
                        <p className="text-muted mb-0">Comisiones en {estadisticas.archivo2.nombre}</p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div>
                        <h4 className="text-warning mb-1">{estadisticas.coincidencias}</h4>
                        <p className="text-muted mb-0">Coincidencias encontradas</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                    <table className="table table-hover table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>Comisión</th>
                          <th>Información del Archivo 1</th>
                          <th>Información del Archivo 2</th>
                          <th>Similitud</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resultados.map((resultado, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{resultado.comision}</strong>
                              <br />
                              <small className="text-muted">
                                Código: {resultado.archivo1.comision || resultado.archivo2.comision || 'N/A'}
                              </small>
                            </td>
                            <td>
                              <div className="small">
                                <div className="fw-bold text-primary">
                                  {resultado.archivo1.archivo === 'N/A' ? 'Sin coincidencia' : resultado.archivo1.archivo}
                                </div>
                                {resultado.archivo1.archivo !== 'N/A' && (
                                  <>
                                    <div><strong>Período:</strong> {resultado.archivo1.periodoLectivo || 'N/A'}</div>
                                    <div><strong>Actividad:</strong> {resultado.archivo1.actividad || 'N/A'}</div>
                                    <div><strong>Modalidad:</strong> {resultado.archivo1.modalidad || 'N/A'}</div>
                                    <div><strong>Docente:</strong> {resultado.archivo1.docente || 'N/A'}</div>
                                    <div><strong>Horario:</strong> {resultado.archivo1.horario || 'N/A'}</div>
                                    <div><strong>Aula:</strong> {resultado.archivo1.aula || 'N/A'}</div>
                                  </>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="small">
                                <div className="fw-bold text-success">
                                  {resultado.archivo2.archivo === 'N/A' ? 'Sin coincidencia' : resultado.archivo2.archivo}
                                </div>
                                {resultado.archivo2.archivo !== 'N/A' && (
                                  <>
                                    <div><strong>Período:</strong> {resultado.archivo2.periodoLectivo || 'N/A'}</div>
                                    <div><strong>Actividad:</strong> {resultado.archivo2.actividad || 'N/A'}</div>
                                    <div><strong>Modalidad:</strong> {resultado.archivo2.modalidad || 'N/A'}</div>
                                    <div><strong>Docente:</strong> {resultado.archivo2.docente || 'N/A'}</div>
                                    <div><strong>Horario:</strong> {resultado.archivo2.horario || 'N/A'}</div>
                                    <div><strong>Aula:</strong> {resultado.archivo2.aula || 'N/A'}</div>
                                  </>
                                )}
                              </div>
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
                            <td>
                              <div className="btn-group btn-group-sm" role="group">
                                <button 
                                  className="btn btn-outline-info" 
                                  onClick={() => alert(`Detalles de ${resultado.comision}`)}
                                  title="Ver detalles"
                                >
                                  <i className="fas fa-info-circle"></i>
                                </button>
                                <button 
                                  className="btn btn-outline-success" 
                                  onClick={() => seleccionarComisionParaGuardar(resultado)}
                                  title="Guardar comisión"
                                >
                                  <i className="fas fa-save"></i>
                                </button>
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
                    
                    {/* Botón para guardar todas las comisiones del archivo 1 */}
                    {resultados.length > 0 && (
                      <div className="mt-3">
                        <button
                          className="btn btn-success btn-lg"
                          onClick={guardarTodasComisionesArchivo1}
                          disabled={isLoading}
                          title="Guardar todas las comisiones del archivo 1"
                        >
                          {isLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              Guardando...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              Guardar Todas las Comisiones del Archivo 1 ({resultados.length})
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para guardar comisión individual */}
      {mostrarFormularioGuardar && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-save me-2"></i>
                  Guardar Comisión
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMostrarFormularioGuardar(false)}
                ></button>
              </div>
              <form onSubmit={guardarComision}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Período</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.periodo}
                        onChange={(e) => setFormData({...formData, periodo: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Actividad</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.actividad}
                        onChange={(e) => setFormData({...formData, actividad: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Modalidad</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.modalidad}
                        onChange={(e) => setFormData({...formData, modalidad: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Docente</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.docente}
                        onChange={(e) => setFormData({...formData, docente: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Horario</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.horario}
                        onChange={(e) => setFormData({...formData, horario: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Aula</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.aula}
                        onChange={(e) => setFormData({...formData, aula: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setMostrarFormularioGuardar(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Guardar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 