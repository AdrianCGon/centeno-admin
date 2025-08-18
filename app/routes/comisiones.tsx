import { useState, useEffect } from 'react';
import { ComisionService, type Comision, type CreateComisionRequest } from '../services/comision.service';
import { Navigation } from '../components/Navigation';
import React from 'react'; // Added missing import for React

// Estilos CSS personalizados para evitar el hover marrón
const customStyles = `
  .custom-orange-header {
    background-color: #FD8200 !important;
  }
  .custom-orange-header:hover {
    background-color: #FD8200 !important;
  }
  .table-warning .custom-orange-header:hover {
    background-color: #FD8200 !important;
  }
`;

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
  const [vistaAgrupada, setVistaAgrupada] = useState(true); // Nuevo estado para vista agrupada
  const [formData, setFormData] = useState<CreateComisionRequest>({
    periodo: '',
    actividad: '',
    modalidad: '',
    docente: '',
    horario: '',
    aula: ''
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
    realizada: 'todos',
    diaSemana: 'todos' // Nuevo filtro por día de la semana
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
      
      // Log detallado de cada comisión para debugging
      data.forEach((comision, index) => {
        console.log(`🔍 Comisión ${index + 1}:`, {
          id: comision.id,
          actividad: comision.actividad,
          horario: comision.horario,
          docente: comision.docente,
          aula: comision.aula
        });
      });
      
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
      aula: ''
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
      aula: comision.aula
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
      console.log(`🔍 Estado actual de comisiones:`, comisiones);
      
      const comisionActualizada = await ComisionService.updateRealizada(id, realizada);
      
      console.log(`✅ Comisión actualizada del backend:`, comisionActualizada);
      
      // Actualizar estado local
      setComisiones(prev => {
        console.log(`🔄 Estado anterior:`, prev);
        const nuevoEstado = prev.map(c => {
          if (c.id === id) {
            console.log(`✅ Actualizando comisión ${id} de realizada: ${c.realizada} a ${realizada}`);
            return { ...c, realizada };
          }
          return c;
        });
        console.log(`🔄 Nuevo estado:`, nuevoEstado);
        return nuevoEstado;
      });
      
      console.log(`✅ Estado local actualizado`);
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
      realizada: 'todos',
      diaSemana: 'todos'
    });
  };

  // Función para aplicar filtros y ordenamiento
  const comisionesFiltradasYOrdenadas = () => {
    let resultado = [...comisiones];

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
    if (filtros.realizada !== 'todos') {
      const realizada = filtros.realizada === 'true';
      resultado = resultado.filter(c => c.realizada === realizada);
    }
    
    // Filtro por día de la semana
    if (filtros.diaSemana !== 'todos') {
      resultado = resultado.filter(c => {
        if (filtros.diaSemana === 'Mié') {
          // Para miércoles, buscar tanto "Mié" como "Mie"
          return c.horario.includes('Mié') || c.horario.includes('Mie');
        }
        // Buscar si el horario contiene el día seleccionado
        return c.horario.includes(filtros.diaSemana);
      });
    }
    
    // Filtro por horario específico (si se ingresa en el campo horario)
    if (filtros.horario) {
      resultado = resultado.filter(c => 
        c.horario.toLowerCase().includes(filtros.horario.toLowerCase())
      );
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

  // Función para agrupar comisiones por horario
  const comisionesAgrupadasPorHorario = () => {
    const comisionesFiltradas = comisionesFiltradasYOrdenadas();
    const grupos: { [key: string]: Comision[] } = {};

    console.log('🔍 DEBUG: Comisiones a agrupar:', comisionesFiltradas);

    comisionesFiltradas.forEach(comision => {
      // Usar el horario completo como clave de agrupación
      // Ejemplo: "Lun 07:00 a 08:30 - Jue 07:00 a 08:30"
      const horarioCompleto = comision.horario?.trim();
      
      console.log(`🔍 DEBUG: Procesando comisión "${comision.actividad}" con horario: "${horarioCompleto}"`);
      
      // Validar que el horario sea válido y no sea el nombre del docente
      if (horarioCompleto && 
          horarioCompleto !== comision.docente && 
          horarioCompleto.length > 0 &&
          (horarioCompleto.includes('Lun') || 
           horarioCompleto.includes('Mar') || 
           horarioCompleto.includes('Mié') || 
           horarioCompleto.includes('Mie') || 
           horarioCompleto.includes('Jue') || 
           horarioCompleto.includes('Vie') || 
           horarioCompleto.includes('Sáb') || 
           horarioCompleto.includes('Dom'))) {
        
        if (!grupos[horarioCompleto]) {
          grupos[horarioCompleto] = [];
          console.log(`🆕 DEBUG: Creando nuevo grupo para horario: "${horarioCompleto}"`);
        }
        grupos[horarioCompleto].push(comision);
        console.log(`✅ DEBUG: Agregando comisión "${comision.actividad}" al grupo "${horarioCompleto}"`);
      } else {
        console.log(`⚠️ DEBUG: Comisión "${comision.actividad}" con horario inválido o sin horario: "${horarioCompleto}"`);
        console.log(`⚠️ DEBUG: Docente de esta comisión: "${comision.docente}"`);
      }
    });

    console.log('🔍 DEBUG: Grupos creados:', grupos);

    // Ordenar los grupos por el primer día que aparece en el horario
    const ordenDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const gruposOrdenados: { [key: string]: Comision[] } = {};
    
    // Ordenar las claves de grupo
    const clavesOrdenadas = Object.keys(grupos).sort((a, b) => {
      // Extraer el primer día de cada horario
      const primerDiaA = extraerDiaDelHorario(a);
      const primerDiaB = extraerDiaDelHorario(b);
      
      if (primerDiaA && primerDiaB) {
        const indiceDiaA = ordenDias.indexOf(primerDiaA);
        const indiceDiaB = ordenDias.indexOf(primerDiaB);
        
        if (indiceDiaA !== indiceDiaB) {
          return indiceDiaA - indiceDiaB;
        }
      }
      
      // Si es el mismo día o no se puede determinar, ordenar alfabéticamente por horario
      return a.localeCompare(b);
    });
    
    clavesOrdenadas.forEach(clave => {
      // Ordenar las comisiones dentro de cada grupo por aula (de menor a mayor)
      const comisionesOrdenadas = grupos[clave].sort((a, b) => {
        // Extraer números de aula para comparación numérica
        const aulaA = parseInt(a.aula) || 0;
        const aulaB = parseInt(b.aula) || 0;
        
        // Si ambas son números, ordenar numéricamente
        if (!isNaN(aulaA) && !isNaN(aulaB)) {
          return aulaA - aulaB;
        }
        
        // Si una es número y otra no, la numérica va primero
        if (!isNaN(aulaA) && isNaN(aulaB)) return -1;
        if (isNaN(aulaA) && !isNaN(aulaB)) return 1;
        
        // Si ambas son texto, ordenar alfabéticamente
        return (a.aula || '').localeCompare(b.aula || '');
      });
      
      gruposOrdenados[clave] = comisionesOrdenadas;
    });

    console.log('🔍 DEBUG: Grupos ordenados:', gruposOrdenados);
    return gruposOrdenados;
  };

  // Función para extraer el día del horario
  const extraerDiaDelHorario = (horario: string): string | null => {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    for (const dia of dias) {
      if (dia === 'Mié') {
        // Para miércoles, buscar tanto "Mié" como "Mie"
        if (horario.includes('Mié') || horario.includes('Mie')) {
          return dia;
        }
      } else if (horario.includes(dia)) {
        return dia;
      }
    }
    return null;
  };

  // Función para calcular estadísticas por día
  const calcularEstadisticasPorDia = () => {
    const estadisticas: { [dia: string]: { total: number; realizadas: number; pendientes: number; porcentaje: number } } = {};
    
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    dias.forEach(dia => {
      // Buscar comisiones que contengan el día, considerando variaciones
      let comisionesDelDia: Comision[] = [];
      
      if (dia === 'Mié') {
        // Para miércoles, buscar tanto "Mié" como "Mie"
        comisionesDelDia = comisiones.filter(c => 
          c.horario.includes('Mié') || c.horario.includes('Mie')
        );
      } else {
        comisionesDelDia = comisiones.filter(c => c.horario.includes(dia));
      }
      
      const total = comisionesDelDia.length;
      const realizadas = comisionesDelDia.filter(c => c.realizada).length;
      const pendientes = total - realizadas;
      const porcentaje = total > 0 ? Math.round((realizadas / total) * 100) : 0;
      
      estadisticas[dia] = { total, realizadas, pendientes, porcentaje };
    });
    
    return estadisticas;
  };

  // Función para clasificar aulas por piso
  const clasificarAulasPorPiso = (aulas: string[]): { [piso: string]: string[] } => {
    const pisos: { [piso: string]: string[] } = {
      'PB': [],
      '1er piso': [],
      '2do piso': [],
      '3er piso': []
    };

    aulas.forEach(aula => {
      const aulaNum = parseInt(aula);
      if (!isNaN(aulaNum)) {
        if (aulaNum <= 99) {
          pisos['PB'].push(aula);
        } else if (aulaNum <= 199) {
          pisos['1er piso'].push(aula);
        } else if (aulaNum <= 299) {
          pisos['2do piso'].push(aula);
        } else if (aulaNum <= 399) {
          pisos['3er piso'].push(aula);
        }
      } else {
        // Para aulas no numéricas, ir al PB
        pisos['PB'].push(aula);
      }
    });

    // Ordenar aulas numéricamente dentro de cada piso
    Object.keys(pisos).forEach(piso => {
      pisos[piso].sort((a, b) => {
        const numA = parseInt(a) || 0;
        const numB = parseInt(b) || 0;
        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB;
        }
        return a.localeCompare(b);
      });
    });

    return pisos;
  };

  // Función para obtener el nombre completo del día
  const obtenerNombreDia = (dia: string): string => {
    const nombresDias: { [key: string]: string } = {
      'Lun': 'Lunes',
      'Mar': 'Martes',
      'Mié': 'Miércoles',
      'Jue': 'Jueves',
      'Vie': 'Viernes',
      'Sáb': 'Sábado',
      'Dom': 'Domingo'
    };
    return nombresDias[dia] || dia;
  };

  // Función para clasificar aulas por piso
  const clasificarAulaPorPiso = (aula: string): { piso: string; orden: number } => {
    const aulaNum = parseInt(aula);
    
    if (isNaN(aulaNum)) {
      // Aulas no numéricas van al final
      return { piso: 'Otros', orden: 999 };
    }
    
    if (aulaNum <= 99) {
      return { piso: 'PB', orden: 1 };
    } else if (aulaNum <= 199) {
      return { piso: '1er Piso', orden: 2 };
    } else if (aulaNum <= 299) {
      return { piso: '2do Piso', orden: 3 };
    } else if (aulaNum <= 399) {
      return { piso: '3er Piso', orden: 4 };
    } else if (aulaNum <= 499) {
      return { piso: '4to Piso', orden: 5 };
    } else {
      return { piso: '5to Piso+', orden: 6 };
    }
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Estilos CSS personalizados */}
      <style>{customStyles}</style>
      
      {/* Navigation Bar */}
      <Navigation currentPage="comisiones" />

      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header text-white" style={{ backgroundColor: '#FD8200' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">
                    <i className="fas fa-users me-2 text-white"></i>
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

                {/* Estadísticas por día */}
                <div className="mb-4 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                  <h6 className="mb-3">
                    <i className="fas fa-chart-bar me-2 text-primary"></i>
                    Estadísticas por Día
                  </h6>
                  <div className="row g-3">
                    {Object.entries(calcularEstadisticasPorDia()).map(([dia, stats]) => {
                      if (stats.total === 0) return null;
                      
                      return (
                        <div key={dia} className="col-md-3 col-sm-6">
                          <div className="card border-0 shadow-sm h-100">
                            <div className="card-body text-center p-3">
                              <h6 className="card-title text-muted mb-2">{obtenerNombreDia(dia)}</h6>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="badge bg-primary">{stats.total}</span>
                                <span className="text-muted small">Total</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="badge bg-success">{stats.realizadas}</span>
                                <span className="text-muted small">Realizadas</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="badge bg-warning">{stats.pendientes}</span>
                                <span className="text-muted small">Pendientes</span>
                              </div>
                              <div className="progress" style={{ height: '8px' }}>
                                <div 
                                  className="progress-bar bg-success" 
                                  style={{ width: `${stats.porcentaje}%` }}
                                  title={`${stats.porcentaje}% completado`}
                                ></div>
                              </div>
                              <small className="text-muted mt-1 d-block">{stats.porcentaje}% completado</small>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

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
                  
                  {/* Segunda fila de filtros */}
                  <div className="row g-3 mt-2">
                    <div className="col-md-3">
                      <select
                        className="form-select form-select-sm"
                        value={filtros.diaSemana}
                        onChange={(e) => setFiltros({...filtros, diaSemana: e.target.value})}
                      >
                        <option value="todos">Todos los días</option>
                        <option value="Lun">Lunes</option>
                        <option value="Mar">Martes</option>
                        <option value="Mié">Miércoles</option>
                        <option value="Jue">Jueves</option>
                        <option value="Vie">Viernes</option>
                        <option value="Sáb">Sábado</option>
                        <option value="Dom">Domingo</option>
                      </select>
                    </div>
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Horario específico (ej: 14:00, 15:30)"
                        value={filtros.horario}
                        onChange={(e) => setFiltros({...filtros, horario: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  {/* Segunda fila de filtros */}
                  <div className="row g-3 mt-2">
                    <div className="col-md-3">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Horario específico (ej: 14:00, 15:30)"
                        value={filtros.horario}
                        onChange={(e) => setFiltros({...filtros, horario: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Botón para alternar vista */}
                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <div>
                    <button
                      type="button"
                      className={`btn btn-sm ${vistaAgrupada ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setVistaAgrupada(true)}
                    >
                      <i className="fas fa-layer-group me-1"></i>
                      Vista Agrupada
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ms-2 ${!vistaAgrupada ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setVistaAgrupada(false)}
                    >
                      <i className="fas fa-list me-1"></i>
                      Vista Simple
                    </button>
                  </div>
                  <div className="text-muted small">
                    {vistaAgrupada ? 'Agrupadas por horario completo (días y horarios)' : 'Lista simple'}
                  </div>
                </div>

                {/* Tabla de comisiones */}
                <div className="table-responsive">
                  <table className="table table-hover table-sm">
                    <thead className="table-light">
                      <tr>
                        <th 
                          style={{ cursor: 'pointer' }}
                          onClick={() => ordenarComisiones('periodo')}
                        >
                          Período
                          {ordenamiento.campo === 'periodo' && (
                            <i className={`fas fa-sort-${ordenamiento.direccion === 'asc' ? 'up' : 'down'} ms-1`}></i>
                          )}
                        </th>
                        <th 
                          style={{ cursor: 'pointer' }}
                          onClick={() => ordenarComisiones('actividad')}
                        >
                          Actividad
                          {ordenamiento.campo === 'actividad' && (
                            <i className={`fas fa-sort-${ordenamiento.direccion === 'asc' ? 'up' : 'down'} ms-1`}></i>
                          )}
                        </th>
                        <th 
                          style={{ cursor: 'pointer' }}
                          onClick={() => ordenarComisiones('modalidad')}
                        >
                          Modalidad
                          {ordenamiento.campo === 'modalidad' && (
                            <i className={`fas fa-sort-${ordenamiento.direccion === 'asc' ? 'up' : 'down'} ms-1`}></i>
                          )}
                        </th>
                        <th 
                          style={{ cursor: 'pointer' }}
                          onClick={() => ordenarComisiones('docente')}
                        >
                          Docente
                          {ordenamiento.campo === 'docente' && (
                            <i className={`fas fa-sort-${ordenamiento.direccion === 'asc' ? 'up' : 'down'} ms-1`}></i>
                          )}
                        </th>
                        <th 
                          style={{ cursor: 'pointer' }}
                          onClick={() => ordenarComisiones('horario')}
                        >
                          Horario
                          {ordenamiento.campo === 'horario' && (
                            <i className={`fas fa-sort-${ordenamiento.direccion === 'asc' ? 'up' : 'down'} ms-1`}></i>
                          )}
                        </th>
                        <th 
                          style={{ cursor: 'pointer' }}
                          onClick={() => ordenarComisiones('aula')}
                        >
                          Aula
                          {ordenamiento.campo === 'aula' && (
                            <i className={`fas fa-sort-${ordenamiento.direccion === 'asc' ? 'up' : 'down'} ms-1`}></i>
                          )}
                        </th>
                        <th>Realizada</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={8} className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Cargando...</span>
                            </div>
                          </td>
                        </tr>
                      ) : vistaAgrupada ? (
                        // Renderizar comisiones agrupadas por horario
                        Object.entries(comisionesAgrupadasPorHorario()).length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-4 text-muted">
                              No se encontraron comisiones para agrupar
                            </td>
                          </tr>
                        ) : (
                          Object.entries(comisionesAgrupadasPorHorario()).map(([clave, comisionesDelDia]) => (
                            <React.Fragment key={clave}>
                              {/* Fila de encabezado del horario */}
                                      <tr className="table-warning">
          <td colSpan={8} className="fw-bold text-white custom-orange-header" style={{ backgroundColor: '#FD8200' }}>
            <i className="fas fa-clock me-2 text-white"></i>
            <span className="text-white">{clave}</span>
            <span className="badge bg-white" style={{ color: '#FD8200' }}>
              {comisionesDelDia.length} comisión{comisionesDelDia.length !== 1 ? 'es' : ''}
            </span>
          </td>
        </tr>
                              {/* Resumen de aulas por piso */}
                              <tr className="table-light">
                                <td colSpan={8}>
                                  {(() => {
                                    const aulas = comisionesDelDia.map(c => c.aula).filter(aula => aula && aula !== 'N/A');
                                    const aulasPorPiso = clasificarAulasPorPiso(aulas);
                                    
                                    return (
                                      <div className="p-2">
                                        {Object.entries(aulasPorPiso).map(([piso, aulasDelPiso]) => {
                                          if (aulasDelPiso.length === 0) return null;
                                          
                                          return (
                                            <div key={piso} className="mb-2">
                                              <strong className="text-primary">{piso}:</strong>
                                              <span className="ms-2">{aulasDelPiso.join(' ')}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    );
                                  })()}
                                </td>
                              </tr>
                              
                              {/* Comisiones del día */}
                              {comisionesDelDia.map((comision) => (
                                <tr key={comision.id}>
                                  <td>{comision.periodo}</td>
                                  <td>{comision.actividad}</td>
                                  <td>{comision.modalidad}</td>
                                  <td>{comision.docente}</td>
                                  <td>{comision.horario}</td>
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
                            </React.Fragment>
                          ))
                        )
                      ) : (
                        // Renderizar comisiones en lista simple
                        comisionesFiltradasYOrdenadas().length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-4 text-muted">
                              No se encontraron comisiones
                            </td>
                          </tr>
                        ) : (
                          comisionesFiltradasYOrdenadas().map((comision) => (
                            <tr key={comision.id}>
                              <td>{comision.periodo}</td>
                              <td>{comision.actividad}</td>
                              <td>{comision.modalidad}</td>
                              <td>{comision.docente}</td>
                              <td>{comision.horario}</td>
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
                          ))
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Información de filtros */}
                <div className="mt-3 text-muted small">
                  Mostrando {comisionesFiltradasYOrdenadas().length} de {comisiones.length} comisiones
                  {Object.values(filtros).some(f => f !== '' && f !== 'todos') && ' (filtradas)'}
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