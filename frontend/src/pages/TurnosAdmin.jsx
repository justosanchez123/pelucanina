import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./TurnosAdmin.css";

const TurnosAdmin = () => {
  const { usuario } = useAuth();

  // Estados
  const [todosLosTurnos, setTodosLosTurnos] = useState([]);
  const [listaDuenos, setListaDuenos] = useState([]); 
  const [listaMascotas, setListaMascotas] = useState([]); 
  
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split("T")[0]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [turnoEnProceso, setTurnoEnProceso] = useState({ hora: "", fecha: "" });
  
  const [duenoSeleccionado, setDuenoSeleccionado] = useState("");
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState("");

  const [esBloqueo, setEsBloqueo] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState("");

  const HORARIOS_LABORALES = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17"];

  const cargarDatos = async () => {
    try {
      const [resTurnos, resDuenos, resMascotas] = await Promise.all([
        api.get("/turnos"),
        api.get("/duenos"),
        api.get("/mascotas") 
      ]);

      setTodosLosTurnos(resTurnos.data);
      const duenosData = Array.isArray(resDuenos.data) ? resDuenos.data : resDuenos.data.duenos || [];
      setListaDuenos(duenosData);
      const mascotasData = Array.isArray(resMascotas.data) ? resMascotas.data : resMascotas.data.mascotas || [];
      setListaMascotas(mascotasData);

    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const clickTurnoLibre = (hora) => {
    setTurnoEnProceso({ fecha: fechaSeleccionada, hora });
    setDuenoSeleccionado("");
    setMascotaSeleccionada("");
    setEsBloqueo(false);
    setMotivoBloqueo("");
    setModalAbierto(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (esBloqueo && !motivoBloqueo.trim()) return alert("Escribe el motivo.");
    if (!esBloqueo && (!duenoSeleccionado || !mascotaSeleccionada)) return alert("Selecciona cliente y mascota.");

    try {
      const payload = {
        fecha: turnoEnProceso.fecha + "T12:00:00",
        hora: turnoEnProceso.hora,
        bloqueado: esBloqueo,
        nombreCliente: esBloqueo ? motivoBloqueo : null,
        mascota: esBloqueo ? null : mascotaSeleccionada,
        dueno: esBloqueo ? usuario._id : duenoSeleccionado,
      };

      await api.post("/turnos", payload);
      alert(esBloqueo ? "Horario suspendido." : "Turno asignado.");
      setModalAbierto(false);
      cargarDatos(); 
    } catch (error) {
      alert(error.response?.data?.mensaje || "Error al procesar");
    }
  };

  const handleCancelarTurno = async (id) => {
    if (!window.confirm("¿Liberar este horario?")) return;
    try {
      await api.delete(`/turnos/${id}`);
      cargarDatos();
    } catch (error) {
      alert("Error al cancelar");
    }
  };

  const getTurnoEnHorario = (hora) => {
    return todosLosTurnos.find((t) => {
      const fechaTurno = t.fecha.split("T")[0];
      return fechaTurno === fechaSeleccionada && t.hora === hora;
    });
  };

  const mascotasFiltradas = listaMascotas.filter(m => {
      const idDueno = typeof m.dueno === 'object' && m.dueno !== null ? m.dueno._id : m.dueno;
      return String(idDueno) === String(duenoSeleccionado);
  });

  const turnosOrdenados = [...todosLosTurnos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  
  const obtenerMesAno = (fechaISO) => {
    const fecha = new Date(fechaISO);
    const mes = fecha.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    return mes.charAt(0).toUpperCase() + mes.slice(1);
  };

  return (
    <div className="admin-turnos-container">
      <h2 style={{ textAlign: "center", color: "#fff", marginBottom:'20px', textTransform:'uppercase', fontWeight:'800' }}>
        📅 Panel de Turnos
      </h2>

      <div className="filtros-container">
        <label style={{ fontWeight: "bold", marginRight: "10px", color:'#ccc' }}>Día:</label>
        <input
          type="date"
          className="input-fecha-admin"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
        />
      </div>

      <h3 style={{ borderBottom: "1px solid #444", paddingBottom: "10px", color:'#00d4ff' }}>
        Vista Diaria: {new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString()}
      </h3>

      <div className="grilla-turnos">
        {HORARIOS_LABORALES.map((hora) => {
          const turno = getTurnoEnHorario(hora);

          if (turno) {
            const esSuspendido = turno.bloqueado;
            return (
              <div key={hora} className={`turno-card ${esSuspendido ? 'turno-suspendido' : 'turno-ocupado'}`}>
                <div className="hora-grande">{hora}:00</div>
                {esSuspendido ? (
                    <div className="info-dueno">
                        <strong style={{color:'#ff6b6b'}}>⛔ SUSPENDIDO</strong><br/>
                        <small>"{turno.nombreCliente}"</small>
                    </div>
                ) : (
                    <div className="info-dueno">
                        <strong style={{color:'#fff'}}>{turno.mascota?.nombre || "Desconocido"}</strong><br/>
                        <small style={{color:'#ccc'}}>{turno.dueno?.nombres} {turno.dueno?.apellidos}</small>
                    </div>
                )}
              </div>
            );
          } else {
            return (
              <div key={hora} className="turno-card turno-libre" onClick={() => clickTurnoLibre(hora)}>
                <div className="hora-grande">{hora}:00</div>
                <div style={{color:'#888'}}>➕ Disponible</div>
              </div>
            );
          }
        })}
      </div>

      <h3 style={{ marginTop: "40px", borderBottom: "1px solid #444", paddingBottom: "10px", color:'#00d4ff' }}>
        📑 Historial Completo
      </h3>
      
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px", color: 'white' }}>
          <thead>
            <tr style={{ backgroundColor: "#222", color: "#00d4ff", borderBottom: '2px solid #00d4ff' }}>
              <th style={{ padding: "15px" }}>Fecha</th>
              <th style={{ padding: "15px" }}>Hora</th>
              <th style={{ padding: "15px" }}>Detalle</th>
              <th style={{ padding: "15px" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {turnosOrdenados.map((t, index) => {
              const mesActual = obtenerMesAno(t.fecha);
              const turnoAnterior = turnosOrdenados[index - 1];
              const mesAnterior = turnoAnterior ? obtenerMesAno(turnoAnterior.fecha) : null;
              const mostrarSeparador = mesActual !== mesAnterior;

              return (
                <React.Fragment key={t._id}>
                  {mostrarSeparador && (
                    <tr style={{ backgroundColor: "#333" }}>
                      <td colSpan="4" style={{ padding: "8px 15px", fontWeight: "bold", color: "#ccc", textTransform: 'uppercase', fontSize:'0.9rem' }}>
                        📅 {mesActual}
                      </td>
                    </tr>
                  )}
                  {/* FILAS OSCURAS */}
                  <tr style={{ 
                      borderBottom: "1px solid #333", 
                      textAlign: "center", 
                      backgroundColor: t.bloqueado ? '#2c1a1d' : '#1e1e1e' // Fondo oscuro rojizo o gris
                  }}>
                    <td style={{ padding: "12px" }}>{new Date(t.fecha).toLocaleDateString()}</td>
                    <td style={{ padding: "12px", fontWeight: 'bold', color:'#00d4ff' }}>{t.hora}:00</td>
                    <td style={{ padding: "12px", textAlign: 'left' }}>
                       {t.bloqueado ? (
                           <span style={{color: '#ff6b6b'}}>⛔ {t.nombreCliente || 'Suspendido'}</span>
                       ) : (
                           <span>
                             <span style={{fontWeight:'bold', color:'white'}}>{t.mascota?.nombre}</span> 
                             <span style={{color:'#888'}}> - {t.dueno?.nombres} {t.dueno?.apellidos}</span>
                           </span>
                       )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <button onClick={() => handleCancelarTurno(t._id)} style={{ background: "transparent", border: "1px solid #dc3545", color: "#dc3545", padding: "5px 15px", borderRadius: "20px", cursor: "pointer", fontSize:'0.85rem' }}>
                        Liberar
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{marginTop: 0, color:'#00d4ff'}}>Gestionar Horario</h3>
            <p className="mb-4 text-white-50">
                {new Date(turnoEnProceso.fecha + 'T00:00:00').toLocaleDateString()} a las {turnoEnProceso.hora}:00 hs
            </p>
            
            <form onSubmit={handleGuardar}>
              <div className="bloqueo-box">
                  <input type="checkbox" id="chkBloqueo" checked={esBloqueo} onChange={(e) => setEsBloqueo(e.target.checked)} />
                  <label htmlFor="chkBloqueo">Bloquear por imprevisto</label>
              </div>

              {esBloqueo ? (
                  <div className="form-group fade-in">
                      <label style={{color:'#ccc'}}>Motivo:</label>
                      <input type="text" className="form-control" placeholder="Ej: Urgencia..." value={motivoBloqueo} onChange={(e) => setMotivoBloqueo(e.target.value)} autoFocus />
                  </div>
              ) : (
                  <>
                    <div className="form-group">
                        <label style={{color:'#ccc'}}>Cliente:</label>
                        <select className="form-control" value={duenoSeleccionado} onChange={(e) => { setDuenoSeleccionado(e.target.value); setMascotaSeleccionada(""); }}>
                            <option value="">-- Seleccionar --</option>
                            {listaDuenos.map(d => (<option key={d._id} value={d._id}>{d.nombres} {d.apellidos}</option>))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label style={{color:'#ccc'}}>Mascota:</label>
                        <select className="form-control" value={mascotaSeleccionada} onChange={(e) => setMascotaSeleccionada(e.target.value)} disabled={!duenoSeleccionado}>
                            <option value="">-- Seleccionar --</option>
                            {mascotasFiltradas.map(m => (<option key={m._id} value={m._id}>{m.nombre}</option>))}
                        </select>
                    </div>
                  </>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => setModalAbierto(false)} style={{padding:'8px 15px', border:'1px solid #555', background:'transparent', color:'#ccc', borderRadius:'5px', cursor:'pointer'}}>Cancelar</button>
                <button type="submit" style={{padding:'8px 15px', border:'none', background: esBloqueo ? '#dc3545' : '#00d4ff', color: esBloqueo ? 'white' : 'black', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>
                    {esBloqueo ? "Bloquear" : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TurnosAdmin;