import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Nav.css"; 

const Nav = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  // Lógica de cierre de sesión segura
  const handleLogout = () => {
    navigate("/"); // 1. Ir al Home
    setTimeout(() => {
        logout(); // 2. Borrar sesión después de navegar
    }, 50);
  };

  return (
    <nav className="nav-container">
      {/* IZQUIERDA: LOGO */}
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          <img src="/logo-rock.png" alt="Dog & Roll" className="nav-logo-img" />
          <span className="nav-logo-text d-none d-md-block">Dog & Roll</span>
        </Link>
      </div>

      {/* DERECHA: BOTONES */}
      <div className="nav-right">
        
        {/* Botón Galería (Navega a la página pública de fotos) */}
        <button onClick={() => navigate("/galeria")} className="nav-link-galeria">
           📷 GALERÍA
        </button>

        {!usuario && (
          <Link to="/login" className="nav-btn login-btn">
            🎸 INICIAR SESIÓN
          </Link>
        )}
        
        {usuario && (
          <>
            <span className="nav-saludo d-none d-lg-block">
              Hola, <span style={{color: '#ffd700'}}>{usuario.nombres}</span>
            </span>
            
            <Link 
              to={usuario.rol.includes('admin') ? '/admin' : '/usuario'} 
              className="nav-btn panel-btn"
            >
              MI CAMERINO
            </Link>
            
            <button className="nav-btn logout-btn" onClick={handleLogout}>
              SALIR
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;