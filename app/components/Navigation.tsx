import React from 'react';

interface NavigationProps {
  currentPage: string;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage }) => {
  const navItems = [
    { href: '/', icon: 'fas fa-home', label: 'Dashboard', page: 'home' },
    { href: '/solicitudes', icon: 'fas fa-file-alt', label: 'Solicitudes', page: 'solicitudes' },
    { href: '/libros', icon: 'fas fa-book', label: 'Libros', page: 'libros' },
    { href: '/comparar-excel', icon: 'fas fa-file-excel', label: 'Comparar Archivos Excel', page: 'comparar-excel' },
    { href: '/comisiones', icon: 'fas fa-users', label: 'Gestionar Comisiones', page: 'comisiones' }
  ];

  return (
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#FD8200' }}>
      <div className="container-fluid">
        <a className="navbar-brand text-white fw-bold" href="/">
          <i className="fas fa-shield-alt me-2"></i>
          Centeno Admin
        </a>
        <div className="navbar-nav ms-auto">
          {navItems.map((item) => (
            <a
              key={item.page}
              className={`nav-link ${currentPage === item.page ? 'active text-white fw-bold' : 'text-white'}`}
              href={item.href}
              style={{
                color: currentPage === item.page ? '#fff' : 'rgba(255,255,255,0.8)',
                fontWeight: currentPage === item.page ? 'bold' : 'normal'
              }}
            >
              <i className={`${item.icon} me-1`}></i>
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}; 