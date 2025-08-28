import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Registro = () => {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
  });
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/registro", formData);
      setMensaje("✅ Usuario registrado con éxito");
      setTimeout(() => navigate("/login"), 1500); // redirige al login
    } catch (err) {
      setMensaje("❌ Error al registrar usuario");
    }
  };

  return (
    <div className="col-md-6 offset-md-3">
      <h2>Registro</h2>
      {mensaje && <div className="alert alert-info">{mensaje}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Nombre/s</label>
          <input
            type="text"
            name="nombres"
            className="form-control"
            value={formData.nombres}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Apellido/s</label>
          <input
            type="text"
            name="nombres"
            className="form-control"
            value={formData.nombres}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Dirección</label>
          <input
            type="text"
            name="nombres"
            className="form-control"
            value={formData.nombres}
            onChange={handleChange}
            required
          />
        </div>
<div className="mb-3">
          <label>Teléfono</label>
          <input
            type="text"
            name="nombres"
            className="form-control"
            value={formData.nombres}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Registrarse</button>
      </form>
    </div>
  );
};

export default Registro;
