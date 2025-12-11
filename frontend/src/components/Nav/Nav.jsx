import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Nav.css";

const Nav = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [shrink, setShrink] = useState(false);

  // Manejo de scroll (con zona muerta para evitar parpadeo)
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;

      // Si NO está shrink y baja más de 25 → activar shrink
      if (y > 25 && !shrink) setShrink(true);

      // Si está shrink y vuelve arriba del todo → desactivar shrink
      if (y < 5 && shrink) setShrink(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [shrink]);

  // Cierre de sesión seguro
  const handleLogout = () => {
    navigate("/");
    setTimeout(() => {
      logout();
    }, 50);
  };

  return (
    <nav className={`nav-container ${shrink ? "nav-shrink" : ""}`}>
      {/* IZQUIERDA */}
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          <img src="/logo-rock.png" alt="Dog & Roll" className="nav-logo-img" />
          <span className="nav-logo-text d-none d-md-block">Dog & Roll</span>
        </Link>
      </div>

      {/* DERECHA */}
      <div className="nav-right">

        {/* Galería */}
        <button
          onClick={() => navigate("/galeria")}
          className="nav-link-galeria"
        >
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
              Hola, <span style={{ color: "#ffd700" }}>{usuario.nombres}</span>
            </span>

            <Link
              to={usuario.rol.includes("admin") ? "/admin" : "/usuario"}
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
