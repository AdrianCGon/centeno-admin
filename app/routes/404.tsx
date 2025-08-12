import type { Route } from './+types/404';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Página no encontrada - Admin' }];
}

export default function NotFound() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="text-center">
        <div className="mb-4">
          <i className="fas fa-exclamation-triangle display-1" style={{ color: '#FD8200' }}></i>
        </div>
        <h1 className="h2 mb-3" style={{ color: '#333' }}>Página no encontrada</h1>
        <p className="text-muted mb-4">La página que buscas no existe o ha sido movida.</p>
        <a href="/" className="btn" style={{ backgroundColor: '#FD8200', color: 'white' }}>
          <i className="fas fa-home me-2"></i>
          Volver al Dashboard
        </a>
      </div>
    </div>
  );
} 