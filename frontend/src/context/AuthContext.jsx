import { createContext, useContext, useState, useEffect } from "react";

// ✅ Lo exportamos como named export
export const AuthContext = createContext();

// Hook para usar AuthContext
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  // Cargar sesión desde localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("usuario");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      try {
        setUsuario(JSON.parse(savedUser));
        setToken(savedToken);
      } catch {
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = (usuarioData, tokenData) => {
    setUsuario(usuarioData);
    setToken(tokenData);
    localStorage.setItem("usuario", JSON.stringify(usuarioData));
    localStorage.setItem("token", tokenData);
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
  };

  const isAuthenticated = !!usuario && !!token;

  return (
    <AuthContext.Provider
      value={{ usuario, token, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};
