import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RutasProtegidas = ({ rol }) => {
  const { usuario } = useAuth();

  // 1. Si no hay usuario logueado, mandar al Login
  if (!usuario) return <Navigate to="/login" replace />;

  // 2. Si hay usuario pero no tiene el rol correcto
  if (rol && usuario.rol !== rol) {
    
    // Redirección inteligente:
    // Si un Admin intenta entrar al panel de Usuario -> Lo mandamos al Admin
    if (usuario.rol.includes('admin') && rol === 'usuario') {
        return <Navigate to="/admin" replace />;
    }
    
    // Si un Usuario intenta entrar al panel Admin -> Lo mandamos al Usuario
    if (usuario.rol === 'usuario' && rol.includes('admin')) {
         return <Navigate to="/usuario" replace />;
    }

    // Si es otro caso raro, mostramos mensaje de error con ESTILO ROCKERO
    return (
      <div style={{
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{
            background: '#1e1e1e',
            padding: '3rem',
            borderRadius: '15px',
            border: '2px solid #ff4d4d', // Borde rojo neón
            boxShadow: '0 0 30px rgba(255, 77, 77, 0.2)',
            maxWidth: '500px'
        }}>
            <h1 style={{color: '#ff4d4d', fontWeight: '900', fontSize: '3rem', margin: 0}}>🚫</h1>
            <h2 style={{color: '#ff4d4d', fontWeight: '800', textTransform: 'uppercase', margin: '20px 0'}}>Acceso Denegado</h2>
            <p style={{color: '#ccc', fontSize: '1.1rem'}}>
                No tienes los permisos necesarios para ingresar a esta zona del camerino.
            </p>
        </div>
      </div>
    );
  }

  // 3. Si todo está bien, mostrar el contenido
  return <Outlet />;
};

export default RutasProtegidas;