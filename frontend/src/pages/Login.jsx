// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import paw from "../assets/paw.png";
import "./Login.css";
import "./../index.css";
import api from "../api/axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const pawPrints = Array.from({ length: 20 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", { email, password });

      const data = await res.data;

      if (!data) {
        alert("Error al iniciar sesión: no hay datos");
        return;
      }

      // Guardar usuario + token en el contexto y localStorage
      login(data.usuario, data.token);

      // Redirigir según el rol
      if (data.usuario.rol === "adminPrincipal") {
        navigate("/admin");
      } else {
        navigate("/usuario");
      }
    } catch (error) {
      console.error("❌ Error al loguear:", error);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="login-page">
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
              style={{ width: "100%", padding: "0.5rem" }}
              required
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "0.5rem" }}
              required
            />
          </div>
          <button type="submit" style={{ padding: "0.5rem 1rem" }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
