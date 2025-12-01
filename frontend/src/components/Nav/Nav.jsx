import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Nav.css"; 

const Nav = () => {
  const { usuario, logout } = useAuth();

  return (
    <nav className="nav-container">
      {/* IZQUIERDA: LOGO */}
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          {/* Asegúrate de que logo-rock.png esté en la carpeta public */}
          <img src="/logo-rock.png" alt="Dog & Roll" className="nav-logo-img" />
          <span className="nav-logo-text d-none d-md-block">Dog & Roll</span>
        </Link>
      </div>

      {/* DERECHA: BOTONES */}
      <div className="nav-right">
        {!usuario && (
          <Link to="/login" className="nav-btn login-btn">
            🎸 INICIAR SESIÓN
          </Link>
        )}
        
        {usuario && (
          <>
            <span className="nav-saludo d-none d-sm-block">
              Hola, <span style={{color: 'var(--neon-gold)'}}>{usuario.nombres}</span>
            </span>
            
            <Link 
              to={usuario.rol.includes('admin') ? '/admin' : '/usuario'} 
              className="nav-btn panel-btn"
            >
              MI CAMERINO (PANEL)
            </Link>
            
            <button className="nav-btn logout-btn" onClick={logout}>
              SALIR
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;