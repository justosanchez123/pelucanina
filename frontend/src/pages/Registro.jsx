import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import paw from "../assets/paw.png"; 
import "./Login.css"; // 👈 CLAVE: Reutilizamos los estilos del Login para que se vea igual

const Registro = () => {
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    dni: "",
    direccion: "",
    telefono: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  // Generamos las huellas para la animación de fondo
  const pawPrints = Array.from({ length: 15 });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/registro", formData);
      
      await Swal.fire({
        title: '¡Bienvenido a la Banda!',
        text: 'Usuario registrado con éxito. Ahora puedes iniciar sesión.',
        icon: 'success',
        background: '#1e1e1e', 
        color: '#fff', 
        confirmButtonColor: '#00d4ff'
      });
      
      navigate("/login");
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || 'No se pudo registrar el usuario.',
        icon: 'error',
        background: '#1e1e1e', 
        color: '#fff', 
        confirmButtonColor: '#d33'
      });
    }
  };

  return (
    <div className="login-page"> {/* Fondo oscuro global */}
      
      {/* Animación de huellas de fondo */}
      {pawPrints.map((_, i) => (
        <img
          key={i}
          src={paw}
          alt="paw"
          className={`paw-icon animate-walk`}
          style={{ animationDelay: `${i * 0.8}s` }}
        />
      ))}

      <div className="login-card" style={{ maxWidth: '700px' }}>
        <h2>CREAR CUENTA</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label text-start w-100 fw-bold small text-muted">NOMBRE/S</label>
              <input
                type="text"
                name="nombres"
                className="form-control"
                value={formData.nombres}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label text-start w-100 fw-bold small text-muted">APELLIDO/S</label>
              <input
                type="text"
                name="apellidos"
                className="form-control"
                value={formData.apellidos}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
                <label className="form-label text-start w-100 fw-bold small text-muted">DNI</label>
                <input
                    type="text"
                    name="dni"
                    className="form-control"
                    value={formData.dni}
                    onChange={handleChange}
                />
            </div>
            <div className="col-md-6 mb-3">
                <label className="form-label text-start w-100 fw-bold small text-muted">TELÉFONO</label>
                <input
                    type="text"
                    name="telefono"
                    className="form-control"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label text-start w-100 fw-bold small text-muted">DIRECCIÓN</label>
            <input
              type="text"
              name="direccion"
              className="form-control"
              value={formData.direccion}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-start w-100 fw-bold small text-muted">EMAIL</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-start w-100 fw-bold small text-muted">CONTRASEÑA</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 py-2 fw-bold shadow-sm"
            style={{
                backgroundColor: '#00d4ff', 
                border: 'none', 
                color: 'black', 
                textTransform: 'uppercase'
            }}
          >
            REGISTRARSE
          </button>
        </form>

        <p className="mt-4 text-center text-muted small">
          ¿Ya tienes cuenta? <Link to="/login" style={{color:'#ffd700'}}>Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Registro;