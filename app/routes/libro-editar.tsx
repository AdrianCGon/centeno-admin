import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import type { Route } from './+types/libro-editar';
import { buildApiUrl, API_CONFIG } from '../config/api';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Editar Libro - Admin' }];
}

export default function LibroEditar() {
  const { id } = useParams();
  const [form, setForm] = useState({ categoria: '', titulo: '', autor: '', edicion: '', precio: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LIBROS.BY_ID(id!)), {
        credentials: 'include'
      });
      const data = await res.json();
      const l = data.data;
      setForm({ categoria: l.categoria || '', titulo: l.titulo || '', autor: l.autor || '', edicion: l.edicion || '', precio: l.precio != null ? String(l.precio) : '' });
      setIsLoading(false);
    };
    load();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LIBROS.BY_ID(id!)), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        categoria: form.categoria,
        titulo: form.titulo,
        autor: form.autor,
        edicion: form.edicion || undefined,
        precio: form.precio ? Number(form.precio) : undefined,
      })
    });
    window.location.href = '/libros';
  };

  if (isLoading) return <div className="container py-4">Cargando...</div>;

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
          </div>
        </div>
      </nav>
      <div className="container py-4">
        <h1 className="h3 mb-3" style={{ color: '#333', fontWeight: 'bold' }}>
          <i className="fas fa-pen me-2" style={{ color: '#FD8200' }}></i>
          Editar Libro
        </h1>
        <div className="card border-0" style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderRadius: '12px' }}>
          <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Categoría</label>
                <input className="form-control" name="categoria" value={form.categoria} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Título</label>
                <input className="form-control" name="titulo" value={form.titulo} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <label className="form-label">Autor</label>
                <input className="form-control" name="autor" value={form.autor} onChange={handleChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Edición</label>
                <input className="form-control" name="edicion" value={form.edicion} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Precio</label>
                <input className="form-control" name="precio" value={form.precio} onChange={handleChange} type="number" min="0" />
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <a href="/libros" className="btn btn-outline-secondary">
                <i className="fas fa-arrow-left me-1"></i>
                Cancelar
              </a>
              <button className="btn" style={{ backgroundColor: '#FD8200', color: 'white' }} disabled={isSubmitting}>
                <i className="fas fa-save me-1"></i>
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}

