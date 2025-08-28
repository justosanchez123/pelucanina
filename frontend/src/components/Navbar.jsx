import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { usuario, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/">Pelucanina</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ms-auto">
          {!usuario ? (
            <>
              <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
              <li className="nav-item"><Link className="nav-link" to="/registro">Registro</Link></li>
            </>
          ) : (
            <>
              <li className="nav-item"><Link className="nav-link" to={usuario.rol === "adminPrincipal" ? "/admin" : "/usuario"}>Panel</Link></li>
              <li className="nav-item"><button className="btn btn-link nav-link" onClick={logout}>Cerrar sesión</button></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
