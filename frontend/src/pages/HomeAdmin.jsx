import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./HomeAdmin.css"; 

const HomeAdmin = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="admin-dashboard-container">
      
      {/* CABECERA */}
      <div className="admin-header fade-in-down">
        <h6 className="admin-subtitle">PANEL DE CONTROL</h6>
        <h1 className="admin-welcome-title">
          HOLA, <span className="text-neon-blue">{usuario?.nombres || 'ADMIN'}</span>
        </h1>
        <p className="admin-instruction">¿Qué vamos a gestionar hoy?</p>
      </div>

      {/* GRILLA DE MENÚ (Ahora con 4 opciones) */}
      <div className="admin-grid-menu fade-in-up">
        
        {/* 1. DUEÑOS */}
        <div className="admin-card-btn" onClick={() => navigate("/admin/duenos")}>
          <div className="icon-large">👥</div>
          <h3>Dueños</h3>
          <p>Gestión de clientes</p>
        </div>

        {/* 2. MASCOTAS */}
        <div className="admin-card-btn" onClick={() => navigate("/admin/mascotas")}>
          <div className="icon-large">🐶</div>
          <h3>Mascotas</h3>
          <p>Gestión de fichas</p>
        </div>

        {/* 3. TURNOS */}
        <div className="admin-card-btn" onClick={() => navigate("/admin/turnos")}>
          <div className="icon-large">📅</div>
          <h3>Turnos</h3>
          <p>Gestión de agenda</p>
        </div>

        {/* 4. GALERÍA (NUEVO) */}
        <div className="admin-card-btn" onClick={() => navigate("/admin/galeria")}>
          <div className="icon-large">📸</div>
          <h3>Galería</h3>
          <p>Subir y borrar fotos</p>
        </div>

      </div>

      {/* BOTÓN SALIR */}
      <div className="logout-section mt-4">
        <button className="btn-logout-rock" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

    </div>
  );
};

export default HomeAdmin;