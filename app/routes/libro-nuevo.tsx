import { useState } from 'react';
import type { Route } from './+types/libro-nuevo';
import { buildApiUrl, API_CONFIG } from '../config/api';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Nuevo Libro - Admin' }];
}

export default function LibroNuevo() {
  const [form, setForm] = useState({ categoria: '', titulo: '', autor: '', edicion: '', precio: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LIBROS.BASE), {
      method: 'POST',
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
          <i className="fas fa-plus me-2" style={{ color: '#FD8200' }}></i>
          Nuevo Libro
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

