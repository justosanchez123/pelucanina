import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from '@react-oauth/google'; // Importar Google
import paw from "../assets/paw.png";
import "./Login.css";
// import "./../index.css"; // (Opcional, ya se carga en main)
import api from "../api/axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false); // Estado del ojito

  const { login } = useAuth();
  const navigate = useNavigate();

  const pawPrints = Array.from({ length: 20 });

  // --- LOGIN NORMAL ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await api.post("/login", { email, password });
      const data = res.data;

      if (!data || !data.token || !data.usuario) {
        setErrorMsg("Respuesta inválida del servidor");
        return;
      }

      login(data.usuario, data.token);

      if (data.usuario.rol === "adminPrincipal") {
        navigate("/admin");
      } else {
        navigate("/usuario");
      }
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const mensaje = error.response.data?.mensaje || "Error del servidor";
        setErrorMsg(status === 404 ? "Usuario o contraseña incorrectos" : mensaje);
      } else if (error.request) {
        setErrorMsg("No se pudo conectar con el servidor");
      } else {
        setErrorMsg("Error al procesar la solicitud");
      }
    }
  };

  // --- LOGIN CON GOOGLE ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
        console.log("Google Token:", credentialResponse.credential);
        
        const res = await api.post("/login/google", { 
            token: credentialResponse.credential 
        });
        
        const data = res.data;
        
        if (data.token && data.usuario) {
            login(data.usuario, data.token);
            navigate("/usuario"); // Google siempre va al panel de usuario
        }
    } catch (error) {
        console.error("Error Google Login:", error);
        setErrorMsg("Fallo al iniciar sesión con Google");
    }
  };

  return (
    <div className="login-page">
      {/* Patitas animadas */}
      {pawPrints.map((_, i) => (
        <img
          key={i}
          src={paw}
          alt="paw"
          className={`paw-icon animate-walk ${i % 2 === 0 ? "paw-left" : "paw-right"}`}
          style={{ animationDelay: `${i * 0.8}s` }}
        />
      ))}

      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        
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
              type={mostrarPassword ? "text" : "password"} // Tipo dinámico
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: "40px" }} // Espacio para el icono
              required
            />
            {/* Botón Ojito */}
            <span 
               onClick={() => setMostrarPassword(!mostrarPassword)}
               style={{
                 position: 'absolute',
                 right: '10px',
                 top: '12px', // Ajustar según altura del input
                 cursor: 'pointer',
                 fontSize: '1.2rem',
                 filter: 'grayscale(100%)'
               }}
               title={mostrarPassword ? "Ocultar" : "Mostrar"}
            >
               {mostrarPassword ? "🚫" : "👁️"}
            </span>
          </div>

          {errorMsg && (
            <div style={{ color: "#ff4d4d", marginBottom: "1rem", fontWeight: "bold" }}>
              {errorMsg}
            </div>
          )}

          <button type="submit">
            Entrar
          </button>
        </form>

        {/* Separador Visual */}
        <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "#444" }} />
            <span style={{ padding: "0 10px", color: "#888", fontSize: "0.9rem" }}>O continúa con</span>
            <div style={{ flex: 1, height: "1px", background: "#444" }} />
        </div>

        {/* Botón de Google Centrado */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                    console.log('Login Failed');
                    setErrorMsg("Google Login Falló");
                }}
                theme="filled_blue"
                shape="pill"
                width="250px" // Ancho fijo para que se vea bien
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