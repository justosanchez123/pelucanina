import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import Swal from 'sweetalert2'; // <--- Importamos SweetAlert2

const AgendarTurno = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mascotas, setMascotas] = useState([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [cargandoHoras, setCargandoHoras] = useState(false);

  // Feriados (Misma lista que backend para feedback inmediato)
  const feriadosBackend = ['01-01-2025', '24-03-2025', '02-04-2025', '01-05-2025', '09-07-2025', '25-12-2025'];
  
  const feriadosBloqueados = feriadosBackend.map(f => {
      const [dd, mm, yyyy] = f.split('-');
      return `${yyyy}-${mm}-${dd}`;
  });

  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        const res = await api.get("/mascotas");
        const data = Array.isArray(res.data) ? res.data : res.data.mascotas || [];
        setMascotas(data);

        if (location.state?.mascotaSeleccionada) {
            setMascotaSeleccionada(location.state.mascotaSeleccionada._id);
        }
      } catch (error) {
        console.error("Error cargando mascotas", error);
      }
    };

    if (usuario) fetchMascotas();
  }, [usuario, location.state]);

  // VALIDACIÓN FECHA (Con SweetAlert)
  const handleFechaChange = (e) => {
      const fechaInput = e.target.value;
      if (!fechaInput) {
          setFecha("");
          return;
      }

      const diaSeleccionado = new Date(fechaInput + "T00:00:00");
      const esDomingo = diaSeleccionado.getDay() === 0;
      const esFeriado = feriadosBloqueados.includes(fechaInput);

      if (esDomingo) {
          Swal.fire({
            title: '¡Domingo Cerrado!',
            text: 'Lo sentimos, la peluquería descansa los domingos.',
            icon: 'info',
            background: '#1e1e1e', color: '#fff', confirmButtonColor: '#00d4ff'
          });
          setFecha("");
          return;
      }

      if (esFeriado) {
          Swal.fire({
            title: 'Es Feriado 🏖️',
            text: 'Disfruta el día, nosotros también lo haremos.',
            icon: 'info',
            background: '#1e1e1e', color: '#fff', confirmButtonColor: '#00d4ff'
          });
          setFecha("");
          return;
      }

      setFecha(fechaInput);
      setHora("");
  };

  // Consultar horas
  useEffect(() => {
    const consultarHoras = async () => {
        if (!fecha) {
            setHorasDisponibles([]);
            return;
        }

        setCargandoHoras(true);
        try {
            const [yyyy, mm, dd] = fecha.split("-");
            const fechaFormateada = `${dd}-${mm}-${yyyy}`;
            const res = await api.get(`/turnos/disponibles?fecha=${fechaFormateada}`);
            setHorasDisponibles(res.data);
        } catch (error) {
            console.error("Error buscando horarios", error);
            setHorasDisponibles([]);
        } finally {
            setCargandoHoras(false);
        }
    };

    consultarHoras();
  }, [fecha]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mascotaSeleccionada || !fecha || !hora) {
      Swal.fire({
        title: 'Faltan datos',
        text: 'Por favor completa todos los campos para reservar.',
        icon: 'warning',
        background: '#1e1e1e', color: '#fff', confirmButtonColor: '#00d4ff'
      });
      return;
    }

    try {
        const payload = {
            fecha: fecha,
            hora: hora,
            mascota: mascotaSeleccionada,
            dueno: usuario._id
        };

        await api.post("/turnos", payload);
        
        // ALERTA DE ÉXITO 🎸
        await Swal.fire({
            title: '¡Turno Confirmado!',
            text: 'Te esperamos para darle el mejor look a tu mascota.',
            icon: 'success',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#00d4ff',
            confirmButtonText: '¡Genial!'
        });

        navigate("/usuario"); // Volvemos al panel
    } catch (error) {
        // ALERTA DE ERROR
        Swal.fire({
            title: 'Ups...',
            text: error.response?.data?.mensaje || "Hubo un error al reservar el turno.",
            icon: 'error',
            background: '#1e1e1e',
            color: '#fff',
            confirmButtonColor: '#d33'
        });
        
        // Si fue conflicto de horario, recargamos las horas
        if (error.response?.status === 409) {
             const [yyyy, mm, dd] = fecha.split("-");
             const fechaFormateada = `${dd}-${mm}-${yyyy}`;
             const res = await api.get(`/turnos/disponibles?fecha=${fechaFormateada}`);
             setHorasDisponibles(res.data);
             setHora("");
        }
    }
  };

  // Estilos en línea para mantener coherencia visual sin tocar CSS global
  const containerStyle = {
      maxWidth: "500px", 
      margin: "40px auto", 
      padding: "30px", 
      boxShadow: "0 0 20px rgba(0, 212, 255, 0.2)", // Brillo azul neón
      borderRadius: "15px", 
      backgroundColor: "#1e1e1e", // Fondo oscuro card
      color: "white",
      border: "1px solid #333"
  };

  const labelStyle = {
      display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#00d4ff'
  };

  const inputStyle = {
      width: '100%', padding: '12px', borderRadius: '5px', 
      border: '1px solid #444', backgroundColor: '#2c2c2c', color: 'white',
      marginBottom: '20px'
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ textAlign: "center", color: "white", marginBottom: "30px", textTransform: "uppercase", fontWeight: "800" }}>
        📅 Agendar Turno
      </h2>

      {!usuario ? (
        <p style={{ color: "#ff4d4d", textAlign: "center" }}>Debes iniciar sesión.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          
          <div>
            <label style={labelStyle}>Mascota:</label>
            <select
              style={inputStyle}
              value={mascotaSeleccionada}
              onChange={(e) => setMascotaSeleccionada(e.target.value)}
              required
            >
              <option value="">-- Selecciona --</option>
              {mascotas.map((m) => (
                <option key={m._id} value={m._id}>{m.nombre} ({m.raza})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Fecha:</label>
            <input
              type="date"
              style={inputStyle}
              value={fecha}
              min={new Date().toISOString().split("T")[0]} 
              onChange={handleFechaChange}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Horario:</label>
            {cargandoHoras ? (
                <p style={{color: '#aaa', fontStyle:'italic'}}>Buscando horarios...</p>
            ) : (
                <select
                style={inputStyle}
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
                disabled={!fecha || horasDisponibles.length === 0}
                >
                <option value="">
                    {!fecha ? "-- Elige fecha --" : horasDisponibles.length === 0 ? "Sin cupos este día" : "-- Selecciona --"}
                </option>
                {horasDisponibles.map((h) => (
                    <option key={h} value={h}>{h}:00 hs</option>
                ))}
                </select>
            )}
          </div>

          <button
            type="submit"
            style={{ 
                width: "100%", padding: "15px", 
                backgroundColor: "#00d4ff", color: "black", 
                border: "none", borderRadius: "30px", 
                fontWeight: "800", textTransform: "uppercase",
                cursor: "pointer", marginTop: "10px",
                transition: "transform 0.2s"
            }}
            onMouseOver={(e) => e.target.style.transform = "scale(1.02)"}
            onMouseOut={(e) => e.target.style.transform = "scale(1)"}
          >
            Confirmar Turno
          </button>
        </form>
      )}
    </div>
  );
};

export default AgendarTurno;