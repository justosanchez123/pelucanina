import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Nav.css";

const Nav = () => {
  const { usuario, logout } = useAuth();

  return (
    <nav className="nav-container">
      {/* Izquierda: Logo */}
      <div className="nav-left">
        <Link to="/" className="logo">🐾 Dog & Roll</Link>
      </div>

      {/* Derecha: Botones dinámicos */}
      <div className="nav-right">
        
        {/* Si NO hay usuario, mostramos Login */}
        {!usuario && (
          <Link to="/login" className="nav-btn">Login</Link>
        )}

        {/* Si SÍ hay usuario, mostramos Panel y Logout */}
        {usuario && (
          <>
            <span style={{ marginRight: '10px', color: 'white' }}>
              Hola, {usuario.nombre || 'Usuario'} 👋
            </span>
            
            {/* Botón para volver al panel según rol */}
            <Link 
              to={usuario.rol === 'adminPrincipal' ? '/admin' : '/usuario'} 
              className="nav-btn"
              style={{ marginRight: '10px', backgroundColor: '#4a4a4a' }}
            >
              Mi Panel
            </Link>

            <button className="nav-btn logout-btn" onClick={logout}>
              Salir
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Nav;