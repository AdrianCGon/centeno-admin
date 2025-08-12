import { useEffect, useState } from 'react';
import type { Route } from './+types/libros';
import { buildApiUrl, API_CONFIG } from '../config/api';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Libros - Admin' },
    { name: 'description', content: 'Listado de libros' },
  ];
}

interface Libro {
  id: string;
  categoria: string;
  titulo: string;
  autor: string;
  edicion?: string;
  precio?: number | null;
  createdAt: string;
}

export default function Libros() {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLibros = async () => {
    setIsLoading(true);
    const res = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LIBROS.BASE), {
      credentials: 'include'
    });
    const data = await res.json();
    setLibros(data.data || []);
    setIsLoading(false);
  };

  useEffect(() => { fetchLibros(); }, []);

  const filtered = libros.filter(l =>
    l.titulo.toLowerCase().includes(search.toLowerCase()) ||
    l.autor.toLowerCase().includes(search.toLowerCase()) ||
    l.categoria.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar libro?')) return;
    await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LIBROS.BY_ID(id)), { 
      method: 'DELETE',
      credentials: 'include'
    });
    fetchLibros();
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f5f5f5' }}>
      <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div className="container-fluid">
          <div className="navbar-nav ms-auto">
            <a className="nav-link" href="/" style={{ color: '#666' }}>
              <i className="fas fa-home me-1"></i>
              Dashboard
            </a>
            <a className="nav-link" href="/solicitudes" style={{ color: '#666' }}>
              <i className="fas fa-file-alt me-1"></i>
              Solicitudes
            </a>
            <a className="nav-link active" href="/libros" style={{ color: '#FD8200', fontWeight: 'bold' }}>
              <i className="fas fa-book me-1"></i>
              Libros
            </a>
            <a className="nav-link" href="/comparar-pdfs" style={{ color: '#666' }}>
              <i className="fas fa-file-pdf me-1"></i>
              Comparar PDFs
            </a>
          </div>
        </div>
      </nav>
      <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3">Libros</h1>
        <a href="/libros/nuevo" className="btn" style={{ backgroundColor: '#FD8200', color: 'white' }}>
          <i className="fas fa-plus me-1"></i>
          Nuevo Libro
        </a>
      </div>

      <div className="card border-0 mb-3" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text" style={{ backgroundColor: '#FD8200', color: 'white' }}>
                  <i className="fas fa-search"></i>
                </span>
                <input className="form-control" placeholder="Buscar por título, autor o categoría" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead style={{ backgroundColor: '#f8f9fa' }}>
              <tr>
                <th>Categoría</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Edición</th>
                <th>Precio</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-4">Cargando...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-4">Sin resultados</td></tr>
              ) : filtered.map(l => (
                <tr key={l.id}>
                  <td>{l.categoria}</td>
                  <td>{l.titulo}</td>
                  <td>{l.autor}</td>
                  <td>{l.edicion || '-'}</td>
                  <td>{l.precio != null ? `$${l.precio}` : '-'}</td>
                  <td>{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="btn-group btn-group-sm" role="group">
                      <a href={`/libros/${l.id}`} className="btn btn-outline-secondary">
                        <i className="fas fa-pen me-1"></i>
                        Editar
                      </a>
                      <button className="btn btn-outline-danger" onClick={() => handleDelete(l.id)}>
                        <i className="fas fa-trash me-1"></i>
                        Eliminar
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
  </div>
  );
}

