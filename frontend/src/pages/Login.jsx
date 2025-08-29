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
  const [errorMsg, setErrorMsg] = useState(""); // <-- Estado para el mensaje de error
  const { login } = useAuth();
  const navigate = useNavigate();

  const pawPrints = Array.from({ length: 20 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(""); // limpiar mensaje previo

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

        if (status === 404) {
          setErrorMsg("Usuario o contraseña incorrectos");
        } else {
          setErrorMsg(`Error ${status}: ${mensaje}`);
        }
      } else if (error.request) {
        console.error("❌ No hay respuesta del servidor:", error.request);
        setErrorMsg("No se pudo conectar con el servidor");
      } else {
        console.error("❌ Error al iniciar sesión:", error.message);
        setErrorMsg("Error al procesar la solicitud");
      }
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

          {/* Mensaje de error */}
          {errorMsg && (
            <div style={{ color: "red", marginBottom: "1rem", fontWeight: "bold" }}>
              {errorMsg}
            </div>
          )}

          <button type="submit" style={{ padding: "0.5rem 1rem" }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
