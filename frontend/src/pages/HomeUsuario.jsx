import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const HomeUsuario = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState([]);

  useEffect(() => {
    if (!usuario) navigate("/login");
    else obtenerMascotas();
  }, [usuario, navigate]);

  const obtenerMascotas = async () => {
    try {
      const res = await api.get(`/mascotas/${usuario._id}`);
      setMascotas(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="container mt-5 text-center">
      <h2>¡Hola, {usuario?.nombres}!</h2>
      <button className="btn btn-danger my-3" onClick={handleLogout}>Cerrar sesión</button>
      <h4>Mis Mascotas</h4>
      <ul>
        {mascotas.length > 0 ? mascotas.map(m => <li key={m._id}>{m.nombre} - {m.raza}</li>) : <li>No hay mascotas registradas</li>}
      </ul>
    </div>
  );
};

export default HomeUsuario;
