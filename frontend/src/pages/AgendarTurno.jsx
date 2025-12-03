import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import Swal from 'sweetalert2';
import "./AgendarTurno.css"; // Importamos el CSS nuevo

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
      } catch (error) { console.error(error); }
    };
    if (usuario) fetchMascotas();
  }, [usuario, location.state]);

  const handleFechaChange = (e) => {
      const fechaInput = e.target.value;
      if (!fechaInput) { setFecha(""); return; }

      const diaSeleccionado = new Date(fechaInput + "T00:00:00");
      const esDomingo = diaSeleccionado.getDay() === 0;
      const esFeriado = feriadosBloqueados.includes(fechaInput);

      if (esDomingo) {
          Swal.fire({title:'Domingo Cerrado', text:'Descansamos los domingos.', icon:'info', background:'#1e1e1e', color:'#fff'});
          setFecha(""); return;
      }
      if (esFeriado) {
          Swal.fire({title:'Feriado', text:'Día no laborable.', icon:'info', background:'#1e1e1e', color:'#fff'});
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
            <input type="date" className="agendar-input" value={fecha} min={new Date().toISOString().split("T")[0]} onChange={handleFechaChange} required />
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