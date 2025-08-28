// src/routes/RutasProtegidas.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RutasProtegidas = ({ rol }) => {
  const { usuario } = useAuth();

  // si no hay sesión → login
  if (!usuario) return <Navigate to="/login" replace />;

  // si hay sesión pero no tiene el rol necesario → mensaje
  if (rol && usuario.rol !== rol) {
    return (
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <h2>🚫 Acceso denegado</h2>
        <p>No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  // si todo está bien → renderiza el componente hijo
  return <Outlet />;
};

export default RutasProtegidas;
