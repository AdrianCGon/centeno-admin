import { useState, useEffect } from 'react';
import { ComisionService, type Comision, type CreateComisionRequest } from '../services/comision.service';
import { Navigation } from '../components/Navigation';

export function meta() {
  return [
    { title: 'Gestionar Comisiones - Admin' },
    { name: 'description', content: 'Administración de comisiones' },
  ];
}

export default function Comisiones() {
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [comisionEditando, setComisionEditando] = useState<Comision | null>(null);
  const [formData, setFormData] = useState<CreateComisionRequest>({
    periodo: '',
    actividad: '',
    modalidad: '',
    docente: '',
    horario: '',
    aula: '',
    comision: ''
  });

  // Estados para filtros y ordenamiento
  const [ordenamiento, setOrdenamiento] = useState<{ campo: string; direccion: 'asc' | 'desc' }>({
    campo: 'fechaCreacion',
    direccion: 'desc'
  });
  const [filtros, setFiltros] = useState({
    periodo: '',
    actividad: '',
    modalidad: '',
    docente: '',
    horario: '',
    aula: '',
    comision: '',
    realizada: 'todos',
    dias: [] as string[] // Nuevo filtro para días
  });

  useEffect(() => {
    fetchComisiones();
  }, []);

  const fetchComisiones = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await ComisionService.getAll();
      
      console.log('📥 Comisiones cargadas del backend:', data);
      
      // Verificar si las comisiones tienen ID
      const comisionesSinId = data.filter(c => !c.id);
      if (comisionesSinId.length > 0) {
        console.warn('⚠️ Comisiones sin ID encontradas:', comisionesSinId);
        console.warn('⚠️ Total de comisiones sin ID:', comisionesSinId.length);
      }
      
      setComisiones(data);
    } catch (err) {
      console.error('❌ Error al cargar comisiones:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar las comisiones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      setMostrarFormulario(false);
      setComisionEditando(null);
      resetForm();
      fetchComisiones();
    } catch (err) {
      alert('Error al guardar la comisión: ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      periodo: '',
      actividad: '',
      modalidad: '',
      docente: '',
      horario: '',
      aula: '',
      comision: ''
    });
  };

  const editarComision = (comision: Comision) => {
    setComisionEditando(comision);
    setFormData({
      periodo: comision.periodo,
      actividad: comision.actividad,
      modalidad: comision.modalidad,
      docente: comision.docente,
      horario: comision.horario,
      aula: comision.aula,
      comision: comision.comision
    });
    setMostrarFormulario(true);
  };

  const eliminarComision = async (id: string) => {
    if (!id) {
      console.error('❌ ID de comisión es undefined o vacío');
      setError('Error: ID de comisión no válido');
      return;
    }
    
    if (!confirm('¿Estás seguro de que quieres eliminar esta comisión?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`🗑️ Eliminando comisión ${id}`);
      
      // Por ahora solo mostrar alerta ya que la función no está implementada
      alert('Función de eliminación individual no implementada aún');
    } catch (err) {
      alert('Error al eliminar la comisión: ' + err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRealizadaChange = async (id: string, realizada: boolean) => {
    try {
      // Verificar que el ID sea válido
      if (!id) {
        console.error('❌ ID de comisión es undefined o vacío');
        setError('Error: ID de comisión no válido');
        return;
      }
      
      console.log(`🔄 Actualizando comisión ${id} a realizada: ${realizada}`);
      
      const comisionActualizada = await ComisionService.updateRealizada(id, realizada);
      
      console.log(`✅ Comisión actualizada:`, comisionActualizada);
      
      setComisiones(prev => prev.map(c => 
        c.id === id ? { ...c, realizada } : c
      ));
    } catch (err) {
      console.error('❌ Error al actualizar comisión:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar el estado de la comisión');
    }
  };

  const eliminarTodasComisiones = async () => {
    if (comisiones.length === 0) {
      alert('No hay comisiones para eliminar');
      return;
    }

    const confirmacion = confirm(
      `¿Estás seguro de que quieres eliminar TODAS las comisiones?\n\n` +
      `Se eliminarán ${comisiones.length} comisiones de forma permanente.\n\n` +
      `Esta acción NO se puede deshacer.`
    );

    if (!confirmacion) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const resultado = await ComisionService.deleteAll();
      
      alert(`✅ ${resultado.message}\nSe eliminaron ${resultado.deletedCount} comisiones.`);
      
      // Limpiar la lista de comisiones
      setComisiones([]);
      
      // Limpiar filtros
      limpiarFiltros();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar todas las comisiones');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para ordenar comisiones
  const ordenarComisiones = (campo: string) => {
    setOrdenamiento(prev => ({
      campo,
      direccion: prev.campo === campo && prev.direccion === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Función para limpiar filtros
  const limpiarFiltros = () => {
    setFiltros({
      periodo: '',
      actividad: '',
      modalidad: '',
      docente: '',
      horario: '',
      aula: '',
      comision: '',
      realizada: 'todos',
      dias: []
    });
  };

  // Función para aplicar filtros y ordenamiento
  const comisionesFiltradasYOrdenadas = () => {
    let resultado = [...comisiones];

    // Excluir automáticamente registros con aula "N/A"
    resultado = resultado.filter(c => c.aula !== 'N/A' && c.aula !== 'n/a' && c.aula !== 'N/a');

    // Excluir registros que no tengan formato de horario válido
    resultado = resultado.filter(c => {
      const horario = c.horario;
      // Verificar si el horario tiene formato válido (día + hora)
      const formatoValido = /^(Lun|Mar|Mie|Jue|Vie|Sab|Dom)\s+\d{1,2}:\d{2}/i.test(horario);
      
      if (!formatoValido) {
        console.log(`⚠️ Excluyendo registro con horario inválido: "${horario}"`);
      }
      
      return formatoValido;
    });

    // Aplicar filtros
    if (filtros.periodo) {
      resultado = resultado.filter(c => 
        c.periodo.toLowerCase().includes(filtros.periodo.toLowerCase())
      );
    }
    if (filtros.actividad) {
      resultado = resultado.filter(c => 
        c.actividad.toLowerCase().includes(filtros.actividad.toLowerCase())
      );
    }
    if (filtros.modalidad) {
      resultado = resultado.filter(c => 
        c.modalidad.toLowerCase().includes(filtros.modalidad.toLowerCase())
      );
    }
    if (filtros.docente) {
      resultado = resultado.filter(c => 
        c.docente.toLowerCase().includes(filtros.docente.toLowerCase())
      );
    }
    if (filtros.horario) {
      resultado = resultado.filter(c => 
        c.horario.toLowerCase().includes(filtros.horario.toLowerCase())
      );
    }
    if (filtros.aula) {
      resultado = resultado.filter(c => 
        c.aula.toLowerCase().includes(filtros.aula.toLowerCase())
      );
    }
    if (filtros.comision) {
      resultado = resultado.filter(c => 
        c.comision.toLowerCase().includes(filtros.comision.toLowerCase())
      );
    }
    if (filtros.realizada !== 'todos') {
      const realizada = filtros.realizada === 'true';
      resultado = resultado.filter(c => c.realizada === realizada);
    }

    // Aplicar filtros de días
    if (filtros.dias.length > 0) {
      resultado = resultado.filter(c => {
        const diaComision = c.horario.split(' ')[0];
        return filtros.dias.includes(diaComision);
      });
    }

    // Aplicar ordenamiento
    resultado.sort((a, b) => {
      let valorA: any = a[ordenamiento.campo as keyof Comision];
      let valorB: any = b[ordenamiento.campo as keyof Comision];

      // Manejar tipos de datos
      if (typeof valorA === 'string' && typeof valorB === 'string') {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      } else if (valorA instanceof Date && valorB instanceof Date) {
        valorA = valorA.getTime();
        valorB = valorB.getTime();
      } else if (typeof valorA === 'boolean' && typeof valorB === 'boolean') {
        valorA = valorA ? 1 : 0;
        valorB = valorB ? 1 : 0;
      }

      if (valorA < valorB) return ordenamiento.direccion === 'asc' ? -1 : 1;
      if (valorA > valorB) return ordenamiento.direccion === 'asc' ? 1 : -1;
      return 0;
    });

    return resultado;
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Navigation Bar */}
      <Navigation currentPage="comisiones" />

      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">
                    <i className="fas fa-users me-2 text-primary"></i>
                    Comisiones
                  </h4>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-danger"
                      onClick={eliminarTodasComisiones}
                      disabled={isLoading || comisiones.length === 0}
                      title="Eliminar todas las comisiones"
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-trash-alt me-2"></i>
                          Eliminar Todas ({comisiones.length})
                        </>
                      )}
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setMostrarFormulario(true)}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Nueva Comisión
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                  </div>
                )}

                {/* Filtros */}
                <div className="mb-4 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">
                      <i className="fas fa-filter me-2 text-primary"></i>
                      Filtros y Búsqueda
                    </h6>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={limpiarFiltros}
                    >
                      <i className="fas fa-times me-1"></i>
                      Limpiar Filtros
                    </button>
                  </div>
                  
                  <div className="row g-3">
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Período"
                        value={filtros.periodo}
                        onChange={(e) => setFiltros({...filtros, periodo: e.target.value})}
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Actividad"
                        value={filtros.actividad}
                        onChange={(e) => setFiltros({...filtros, actividad: e.target.value})}
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Modalidad"
                        value={filtros.modalidad}
                        onChange={(e) => setFiltros({...filtros, modalidad: e.target.value})}
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Docente"
                        value={filtros.docente}
                        onChange={(e) => setFiltros({...filtros, docente: e.target.value})}
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Aula"
                        value={filtros.aula}
                        onChange={(e) => setFiltros({...filtros, aula: e.target.value})}
                      />
                    </div>
                    <div className="col-md-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Comisión"
                        value={filtros.comision}
                        onChange={(e) => setFiltros({...filtros, comision: e.target.value})}
                      />
                    </div>
                    <div className="col-md-2">
                      <select
                        className="form-select form-select-sm"
                        value={filtros.realizada}
                        onChange={(e) => setFiltros({...filtros, realizada: e.target.value})}
                      >
                        <option value="todos">Todos los estados</option>
                        <option value="true">Realizadas</option>
                        <option value="false">Pendientes</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Filtro de días de la semana */}
                  <div className="row g-3 mt-2">
                    <div className="col-12">
                      <label className="form-label small text-muted mb-2">
                        <i className="fas fa-calendar-week me-1"></i>
                        Filtrar por días de la semana:
                      </label>
                      <div className="d-flex flex-wrap gap-2">
                        {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(dia => (
                          <div key={dia} className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`dia-${dia}`}
                              checked={filtros.dias.includes(dia)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFiltros(prev => ({
                                    ...prev,
                                    dias: [...prev.dias, dia]
                                  }));
                                } else {
                                  setFiltros(prev => ({
                                    ...prev,
                                    dias: prev.dias.filter(d => d !== dia)
                                  }));
                                }
                              }}
                            />
                            <label className="form-check-label small" htmlFor={`dia-${dia}`}>
                              {dia}
                            </label>
                          </div>
                        ))}
                      </div>
                      {filtros.dias.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm mt-2"
                          onClick={() => setFiltros(prev => ({ ...prev, dias: [] }))}
                        >
                          <i className="fas fa-times me-1"></i>
                          Limpiar días
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabla de comisiones agrupadas por horario */}
                <div className="table-responsive">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </div>
                  ) : (
                    // Agrupar comisiones por horario
                    (() => {
                      console.log('🚀 Iniciando agrupación de comisiones...');
                      console.log('📋 Comisiones a agrupar:', comisionesFiltradasYOrdenadas());
                      
                      const comisionesAgrupadas = comisionesFiltradasYOrdenadas().reduce((grupos, comision) => {
                        const horario = comision.horario;
                        if (!grupos[horario]) {
                          grupos[horario] = [];
                        }
                        grupos[horario].push(comision);
                        return grupos;
                      }, {} as Record<string, typeof comisiones>);

                      console.log('🔍 Comisiones agrupadas por horario:', comisionesAgrupadas);

                      // Ordenar horarios
                      const horariosOrdenados = Object.keys(comisionesAgrupadas).sort((a, b) => {
                        // Ordenar por día de la semana y luego por hora
                        const diasSemana = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
                        const diaA = a.split(' ')[0];
                        const diaB = b.split(' ')[0];
                        const indiceA = diasSemana.indexOf(diaA);
                        const indiceB = diasSemana.indexOf(diaB);
                        
                        if (indiceA !== indiceB) {
                          return indiceA - indiceB;
                        }
                        
                        // Si es el mismo día, ordenar por hora
                        const horaA = a.match(/(\d{1,2}):(\d{2})/);
                        const horaB = b.match(/(\d{1,2}):(\d{2})/);
                        if (horaA && horaB) {
                          const minutosA = parseInt(horaA[1]) * 60 + parseInt(horaA[2]);
                          const minutosB = parseInt(horaB[1]) * 60 + parseInt(horaB[2]);
                          return minutosA - minutosB;
                        }
                        return a.localeCompare(b);
                      });

                      console.log('🕐 Horarios ordenados:', horariosOrdenados);

                      if (horariosOrdenados.length === 0) {
                        return <div className="text-center py-4 text-muted">No hay comisiones para mostrar</div>;
                      }

                      return horariosOrdenados.map(horario => (
                        <div key={horario} className="mb-4">
                          <div className="card border-primary">
                            <div className="card-header bg-primary text-white">
                              <h6 className="mb-0">
                                <i className="fas fa-clock me-2"></i>
                                <strong>{horario}</strong>
                                <span className="badge bg-light text-primary ms-2">
                                  {comisionesAgrupadas[horario].length} actividad{comisionesAgrupadas[horario].length !== 1 ? 'es' : ''}
                                </span>
                              </h6>
                            </div>
                            <div className="card-body p-0">
                              <table className="table table-sm table-hover mb-0">
                                <thead className="table-light">
                                  <tr>
                                    <th>Período</th>
                                    <th>Actividad</th>
                                    <th>Aula</th>
                                    <th>Realizada</th>
                                    <th>Acciones</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {comisionesAgrupadas[horario].map((comision) => (
                                    <tr key={comision.id}>
                                      <td>{comision.periodo}</td>
                                      <td>{comision.actividad}</td>
                                      <td>{comision.aula}</td>
                                      <td>
                                        <input
                                          type="checkbox"
                                          checked={comision.realizada || false}
                                          onChange={(e) => {
                                            if (!comision.id) {
                                              console.error('❌ Comisión sin ID:', comision);
                                              setError('Error: Comisión sin ID válido');
                                              return;
                                            }
                                            handleRealizadaChange(comision.id, e.target.checked);
                                          }}
                                          className="form-check-input"
                                          title={comision.realizada ? 'Marcar como pendiente' : 'Marcar como realizada'}
                                          disabled={!comision.id}
                                        />
                                      </td>
                                      <td>
                                        <div className="btn-group btn-group-sm" role="group">
                                          <button
                                            className="btn btn-outline-primary"
                                            onClick={() => editarComision(comision)}
                                            title="Editar comisión"
                                          >
                                            <i className="fas fa-edit"></i>
                                          </button>
                                          <button
                                            className="btn btn-outline-danger"
                                            onClick={() => eliminarComision(comision.id!)}
                                            title="Eliminar comisión"
                                          >
                                            <i className="fas fa-trash"></i>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      ));
                    })()
                  )}
                </div>

                {/* Información de filtros */}
                <div className="mt-3 text-muted small">
                  Mostrando {(() => {
                    const comisionesAgrupadas = comisionesFiltradasYOrdenadas().reduce((grupos, comision) => {
                      const horario = comision.horario;
                      if (!grupos[horario]) {
                        grupos[horario] = [];
                      }
                      grupos[horario].push(comision);
                      return grupos;
                    }, {} as Record<string, typeof comisiones>);
                    return Object.keys(comisionesAgrupadas).length;
                  })()} horarios con {comisionesFiltradasYOrdenadas().length} actividades
                  {Object.values(filtros).some(f => f !== '' && f !== 'todos') && ' (filtradas)'}
                  {comisiones.filter(c => c.aula === 'N/A' || c.aula === 'n/a' || c.aula === 'N/a').length > 0 && 
                    ` • ${comisiones.filter(c => c.aula === 'N/A' || c.aula === 'n/a' || c.aula === 'N/a').length} registros con aula N/A ocultos automáticamente`
                  }
                  {comisiones.filter(c => !/^(Lun|Mar|Mie|Jue|Vie|Sab|Dom)\s+\d{1,2}:\d{2}/i.test(c.horario)).length > 0 && 
                    ` • ${comisiones.filter(c => !/^(Lun|Mar|Mie|Jue|Vie|Sab|Dom)\s+\d{1,2}:\d{2}/i.test(c.horario)).length} registros con horario inválido ocultos automáticamente`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear/editar comisión */}
      {mostrarFormulario && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-edit me-2"></i>
                  {comisionEditando ? 'Editar Comisión' : 'Nueva Comisión'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setComisionEditando(null);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
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
                      <label className="form-label">Comisión</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.comision}
                        onChange={(e) => setFormData({...formData, comision: e.target.value})}
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
                    onClick={() => {
                      setMostrarFormulario(false);
                      setComisionEditando(null);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
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
                        {comisionEditando ? 'Actualizar' : 'Guardar'}
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