import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

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

  // Lista de feriados (Misma que el backend)
  // Nota: El input date devuelve formato YYYY-MM-DD
  const feriadosBackend = ['01-01-2025', '24-03-2025', '02-04-2025', '01-05-2025', '09-07-2025', '25-12-2025'];
  
  // Convertimos los feriados de DD-MM-YYYY a YYYY-MM-DD para poder comparar fácil
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

  // VALIDACIÓN DE FECHA (Domingos y Feriados) 🛑
  const handleFechaChange = (e) => {
      const fechaInput = e.target.value;
      if (!fechaInput) {
          setFecha("");
          return;
      }

      // Creamos fecha asegurando zona horaria local (agregando T00:00:00)
      const diaSeleccionado = new Date(fechaInput + "T00:00:00");
      const esDomingo = diaSeleccionado.getDay() === 0;
      const esFeriado = feriadosBloqueados.includes(fechaInput);

      if (esDomingo) {
          alert("🚫 Lo sentimos, la peluquería permanece cerrada los domingos.");
          setFecha(""); // Borramos la fecha
          return;
      }

      if (esFeriado) {
          alert("🚫 Esa fecha corresponde a un feriado. Por favor elige otro día.");
          setFecha(""); // Borramos la fecha
          return;
      }

      // Si pasó las validaciones, guardamos la fecha
      setFecha(fechaInput);
      setHora(""); // Reseteamos la hora porque cambió el día
  };

  // Consultar horas disponibles
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
    alert("⚠️ Por favor completa todos los campos");
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
    
    alert("✅ ¡Turno reservado con éxito!");
    navigate("/usuario");

  } catch (error) {
    // MANEJO DE ERRORES ESPECÍFICO
    if (error.response?.status === 409) {
      // Si el error es 409, significa que nos ganaron de mano
      alert("🚫 " + error.response.data.mensaje);
      
      // Acción inteligente: Recargamos los horarios para que desaparezca el ocupado
      // Forzamos la actualización llamando a la API de nuevo
      const [yyyy, mm, dd] = fecha.split("-");
      const fechaFormateada = `${dd}-${mm}-${yyyy}`;
      const res = await api.get(`/turnos/disponibles?fecha=${fechaFormateada}`);
      setHorasDisponibles(res.data); 
      setHora(""); // Limpiamos la hora seleccionada que estaba mal
      
    } else {
      // Otros errores
      console.error("Error al reservar:", error.response?.data);
      alert(error.response?.data?.mensaje || "Hubo un error al reservar el turno");
    }
  }
};

  return (
    <div style={{ maxWidth: "500px", margin: "40px auto", padding: "20px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", borderRadius: "10px", backgroundColor: "white" }}>
      <h2 style={{ textAlign: "center", color: "#2f9bda", marginBottom: "20px" }}>📅 Agendar Turno</h2>

      {!usuario ? (
        <p style={{ color: "red", textAlign: "center" }}>Debes iniciar sesión.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Selección de mascota */}
          <div style={{marginBottom: '15px'}}>
            <label style={{display:'block', fontWeight:'bold'}}>Mascota:</label>
            <select
              style={{width:'100%', padding:'10px', border:'1px solid #ccc', borderRadius:'5px'}}
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

          {/* Selección de fecha */}
          <div style={{marginBottom: '15px'}}>
            <label style={{display:'block', fontWeight:'bold'}}>Fecha:</label>
            <input
              type="date"
              style={{width:'100%', padding:'10px', border:'1px solid #ccc', borderRadius:'5px'}}
              value={fecha}
              min={new Date().toISOString().split("T")[0]} 
              onChange={handleFechaChange} // <--- AQUI USAMOS LA NUEVA VALIDACIÓN
              required
            />
             <small style={{color:'#666'}}>* Lunes a Sábados (excepto feriados)</small>
          </div>

          {/* Selección de hora */}
          <div style={{marginBottom: '15px'}}>
            <label style={{display:'block', fontWeight:'bold'}}>Horario:</label>
            {cargandoHoras ? (
                <p>Buscando horarios...</p>
            ) : (
                <select
                style={{width:'100%', padding:'10px', border:'1px solid #ccc', borderRadius:'5px'}}
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
                disabled={!fecha || horasDisponibles.length === 0}
                >
                <option value="">
                    {!fecha ? "-- Elige fecha --" : horasDisponibles.length === 0 ? "Sin cupos" : "-- Selecciona --"}
                </option>
                {horasDisponibles.map((h) => (
                    <option key={h} value={h}>{h}:00 hs</option>
                ))}
                </select>
            )}
          </div>

          <button
            type="submit"
            style={{ width: "100%", padding: "12px", backgroundColor: "#2f9bda", color: "white", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}
          >
            Confirmar Turno
          </button>
        </form>
      )}
    </div>
  );
};

export default AgendarTurno;