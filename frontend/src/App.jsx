// src/App.jsx
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Nav/Nav";

import Home from "./pages/Home";
import HomeUsuario from "./pages/HomeUsuario";
import HomeAdmin from "./pages/HomeAdmin";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import AgendarTurno from "./pages/AgendarTurno";


import MascotasUsuario from "./pages/MascotasUsuario";
import MascotasList from "./pages/MascotasList";
import Turnos from "./pages/Turnos";
import TurnosAdmin from "./pages/TurnosAdmin";
import RutasProtegidas from "./routes/RutasProtegidas";
import DuenosList from "./pages/DuenosList";

function App() {
  const { usuario } = useAuth();

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Home público */}
        <Route path="/" element={<Home />} />

        {/* Login y Registro solo si no hay sesión */}
        <Route
          path="/login"
          element={
            !usuario ? (
              <Login />
            ) : (
              <Navigate to={usuario.rol === "adminPrincipal" ? "/admin" : "/usuario"} />
            )
          }
        />
        <Route
          path="/registro"
          element={
            !usuario ? (
              <Registro />
            ) : (
              <Navigate to={usuario.rol === "adminPrincipal" ? "/admin" : "/usuario"} />
            )
          }
        />

        {/* Panel usuario */}
        <Route path="/usuario" element={<RutasProtegidas rol="usuario" />}>
          <Route index element={<HomeUsuario />} />
          <Route path="mascotas" element={<MascotasUsuario />} />
          <Route path="turnos" element={<Turnos />} />
        </Route>

        {/* Panel admin */}
        <Route path="/admin" element={<RutasProtegidas rol="adminPrincipal" />}>
          <Route index element={<HomeAdmin />} />
          <Route path="duenos" element={<DuenosList />} />
          <Route path="mis-mascotas" element={<MascotasUsuario />} />
          <Route path="mascotas" element={<MascotasList />} />
          <Route path="turnos" element={<TurnosAdmin />} />
        </Route>

        {/* Agendar turno (requiere login) */}
        <Route
          path="/agendar"
          element={usuario ? <AgendarTurno /> : <Navigate to="/login" replace />}
        />
      </Routes>

    </Router>
  );
}

export default App;
