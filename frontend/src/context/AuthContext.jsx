// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // CAMBIO 1: Usamos sessionStorage en lugar de localStorage
    const savedUser = sessionStorage.getItem("usuario");
    const savedToken = sessionStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        setUsuario(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (error) {
        console.error("Error parsing user data", error);
        sessionStorage.clear();
      }
    }
    setCargando(false);
  }, []);

  const login = (usuarioData, tokenData) => {
    setUsuario(usuarioData);
    setToken(tokenData);
    // CAMBIO 2: Guardamos en sessionStorage
    sessionStorage.setItem("usuario", JSON.stringify(usuarioData));
    sessionStorage.setItem("token", tokenData);
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    // CAMBIO 3: Limpiamos sessionStorage
    sessionStorage.clear();
  };

  if (cargando) {
    return <div className="text-center p-4">Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};