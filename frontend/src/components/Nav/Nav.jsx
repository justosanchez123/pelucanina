// src/components/Nav/Nav.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Nav.css";

// --- NUEVA LÍNEA: Importamos la imagen ---
// NOTA: Los "../.." son para subir dos niveles desde la carpeta Nav hasta llegar a src
import logoImg from '../../assets/dog.png'; 

const Nav = () => {
  const { usuario, logout } = useAuth();

  return (
    <nav className="nav-container">
      {/* === PARTE IZQUIERDA: EL LOGO === */}
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          {/* --- CAMBIO AQUÍ: Reemplazamos el emoji 🐾 por la etiqueta <img> --- */}
          <img src={logoImg} alt="Logo Dog & Roll" className="nav-logo-img" />
          
          <span className="nav-logo-text">Dog & Roll-Peluquería Canina</span>
        </Link>
      </div>

      {/* === PARTE DERECHA: LOS BOTONES (Esto sigue igual) === */}
      <div className="nav-right">
        {!usuario && (
          <Link to="/login" className="nav-btn login-btn">Login</Link>
        )}
        {usuario && (
          <>
            <span className="nav-saludo">
              Hola, {usuario.nombres || 'Usuario'} 👋
            </span>
            <Link 
              to={usuario.rol?.startsWith('admin') ? '/admin' : '/usuario'} 
              className="nav-btn panel-btn"
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