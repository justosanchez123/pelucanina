import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google'; 
import api from "../api/axios";
import Swal from 'sweetalert2';
import paw from "../assets/paw.png";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const pawPrints = Array.from({ length: 15 });

  // --- LOGIN NORMAL ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { email, password });
      const data = res.data;

      if (!data || !data.token || !data.usuario) {
        throw new Error("Respuesta inválida del servidor");
      }

      login(data.usuario, data.token);

      // Alerta de bienvenida
      const Toast = Swal.mixin({
        toast: true, position: 'top-end', showConfirmButton: false, timer: 3000,
        timerProgressBar: true, background: '#1e1e1e', color: '#fff'
      });
      Toast.fire({ icon: 'success', title: `¡Hola, ${data.usuario.nombres}!` });

      // Redirección por rol
      if (data.usuario.rol.includes("admin")) {
        navigate("/admin");
      } else {
        navigate("/usuario");
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.status === 401 ? 'Credenciales incorrectas' : 'Error en el servidor',
        icon: 'error',
        background: '#1e1e1e', color: '#fff', confirmButtonColor: '#d33'
      });
    }
  };

  // --- LOGIN GOOGLE ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
        const res = await api.post("/login/google", { 
            token: credentialResponse.credential 
        });
        
        const data = res.data;
        
        if (data.token && data.usuario) {
            login(data.usuario, data.token);
            navigate("/usuario"); 
        }
    } catch (error) {
        Swal.fire({title: 'Error Google', text: 'No se pudo iniciar sesión con Google', icon: 'error', background: '#1e1e1e', color: '#fff'});
    }
  };

  return (
    <div className="login-page">
      {/* Animación de fondo */}
      {pawPrints.map((_, i) => (
        <img key={i} src={paw} alt="paw" className={`paw-icon animate-walk`} style={{ animationDelay: `${i * 0.8}s` }} />
      ))}

      <div className="login-card">
        <h2>INICIAR SESIÓN</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "1rem", position: 'relative' }}>
            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: "40px" }}
              required
            />
            <span 
               onClick={() => setMostrarPassword(!mostrarPassword)}
               style={{ position: 'absolute', right: '10px', top: '12px', cursor: 'pointer', filter: 'grayscale(100%)' }}
               title={mostrarPassword ? "Ocultar" : "Mostrar"}
            >
               {mostrarPassword ? "🚫" : "👁️"}
            </span>
          </div>

          <button type="submit">ENTRAR</button>
        </form>

        <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#333" }} />
            <span style={{ padding: "0 10px", color: "#888", fontSize: "0.9rem" }}>O continúa con</span>
            <div style={{ flex: 1, height: "1px", background: "#333" }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.log('Login Failed')}
                theme="filled_blue"
                shape="pill"
                width="250px"
            />
        </div>

        <p style={{ marginTop: "1.5rem" }}>
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;