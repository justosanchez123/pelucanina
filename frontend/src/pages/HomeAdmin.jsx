// src/pages/HomeAdmin.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const HomeAdmin = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="container mt-5 text-center">
      <h2>Panel Admin: ¡Hola, {usuario?.nombres}!</h2>
      <button className="btn btn-danger my-3" onClick={handleLogout}>
        Cerrar sesión
      </button>

      <div className="d-grid gap-2 col-6 mx-auto">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/duenos")}
        >
          Gestión de Dueños
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/mascotas")}
        >
          Gestión de Mascotas
        </button>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/turnos")}
        >
          Gestión de Turnos
        </button>
      </div>
    </div>
  );
};

export default HomeAdmin;
