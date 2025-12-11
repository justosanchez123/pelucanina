import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import Swal from 'sweetalert2';
import "./AgendarTurno.css"; 

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

  // --- LISTA ACTUALIZADA CON 2025 y 2026 ---
  const feriadosBackend = [
    // 2025 (Finales)
    '08-12-2025', '25-12-2025',
    
    // 2026 (Feriados Inamovibles y Principales Argentina)
    '01-01-2026', // Año Nuevo
    '16-02-2026', '17-02-2026', // Carnaval
    '24-03-2026', // Memoria
    '02-04-2026', // Malvinas
    '01-05-2026', // Trabajador
    '25-05-2026', // Revolución
    '20-06-2026', // Belgrano
    '09-07-2026', // Independencia
    '17-08-2026', // San Martín
    '12-10-2026', // Diversidad
    '20-11-2026', // Soberanía
    '08-12-2026', // Inmaculada Concepción
    '25-12-2026'  // Navidad
  ];

  // Convertimos DD-MM-YYYY a YYYY-MM-DD para comparar con el input date
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
      } catch (error) { console.error(error); }
    };
    if (usuario) fetchMascotas();
  }, [usuario, location.state]);

  const handleFechaChange = (e) => {
      const fechaInput = e.target.value;
      if (!fechaInput) { setFecha(""); return; }

      // Ajustamos la zona horaria para que no detecte mal el día
      const diaSeleccionado = new Date(fechaInput + "T00:00:00");
      const esDomingo = diaSeleccionado.getDay() === 0;
      const esFeriado = feriadosBloqueados.includes(fechaInput);

      if (esDomingo) {
          Swal.fire({title:'Domingo Cerrado', text:'Descansamos los domingos.', icon:'info', background:'#1e1e1e', color:'#fff'});
          setFecha(""); return;
      }
      
      if (esFeriado) {
          Swal.fire({title:'Feriado Nacional', text:'El local permanece cerrado en días festivos.', icon:'warning', background:'#1e1e1e', color:'#fff', confirmButtonColor:'#00d4ff'});
          setFecha(""); return;
      }

      setFecha(fechaInput);
      setHora("");
  };

  useEffect(() => {
    const consultarHoras = async () => {
        if (!fecha) { setHorasDisponibles([]); return; }
        setCargandoHoras(true);
        try {
            const [yyyy, mm, dd] = fecha.split("-");
            const res = await api.get(`/turnos/disponibles?fecha=${dd}-${mm}-${yyyy}`);
            setHorasDisponibles(res.data);
        } catch (error) { console.error(error); setHorasDisponibles([]); } 
        finally { setCargandoHoras(false); }
    };
    consultarHoras();
  }, [fecha]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mascotaSeleccionada || !fecha || !hora) {
      return Swal.fire({title:'Faltan datos', icon:'warning', background:'#1e1e1e', color:'#fff'});
    }

    try {
        await api.post("/turnos", { fecha, hora, mascota: mascotaSeleccionada, dueno: usuario._id });
        await Swal.fire({
            title: '¡Turno Confirmado!', text: 'Te esperamos.', icon: 'success',
            background: '#1e1e1e', color: '#fff', confirmButtonColor: '#00d4ff'
        });
        navigate("/usuario");
    } catch (error) {
        Swal.fire({title: 'Error', text: error.response?.data?.mensaje || "Error al reservar", icon: 'error', background: '#1e1e1e', color: '#fff'});
        
        // Si el error es conflicto (409), recargamos los horarios
        if (error.response?.status === 409) {
             const [yyyy, mm, dd] = fecha.split("-");
             const res = await api.get(`/turnos/disponibles?fecha=${dd}-${mm}-${yyyy}`);
             setHorasDisponibles(res.data);
             setHora("");
        }
    }
  };

  return (
    <div className="agendar-container">
      <h2 className="agendar-title">📅 Agendar Turno</h2>

      {!usuario ? <p style={{color:"red"}}>Debes iniciar sesión.</p> : (
        <form onSubmit={handleSubmit}>
          <div>
            <label className="agendar-label">Mascota:</label>
            <select className="agendar-select" value={mascotaSeleccionada} onChange={(e) => setMascotaSeleccionada(e.target.value)} required>
              <option value="">-- Selecciona --</option>
              {mascotas.map((m) => (<option key={m._id} value={m._id}>{m.nombre} ({m.raza})</option>))}
            </select>
          </div>

          <div>
            <label className="agendar-label">Fecha:</label>
            <input 
                type="date" 
                className="agendar-input" 
                value={fecha} 
                min={new Date().toISOString().split("T")[0]} 
                onChange={handleFechaChange} 
                required 
            />
          </div>

          <div>
            <label className="agendar-label">Horario:</label>
            {cargandoHoras ? <p className="loading-text">Buscando horarios...</p> : (
                <select className="agendar-select" value={hora} onChange={(e) => setHora(e.target.value)} required disabled={!fecha || horasDisponibles.length === 0}>
                <option value="">{!fecha ? "-- Elige fecha --" : horasDisponibles.length === 0 ? "Sin cupos" : "-- Selecciona --"}</option>
                {horasDisponibles.map((h) => (<option key={h} value={h}>{h}:00 hs</option>))}
                </select>
            )}
          </div>

          <button type="submit" className="btn-confirmar-rock">Confirmar Turno</button>
        </form>
      )}
    </div>
  );
};

export default AgendarTurno;