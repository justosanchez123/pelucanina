// src/pages/TurnosAdmin.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "./TurnosAdmin.css";

const TurnosAdmin = () => {
  const [todosLosTurnos, setTodosLosTurnos] = useState([]);
  const [listaDuenos, setListaDuenos] = useState([]); 
  const [listaMascotas, setListaMascotas] = useState([]); 
  
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split("T")[0]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [turnoEnProceso, setTurnoEnProceso] = useState({ hora: "", fecha: "" });
  
  const [duenoSeleccionado, setDuenoSeleccionado] = useState("");
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState("");

  const HORARIOS_LABORALES = ["08", "09", "10", "11", "12", "13", "14", "15", "16", "17"];

  // Cargar Datos
  const cargarDatos = async () => {
    try {
      const [resTurnos, resDuenos, resMascotas] = await Promise.all([
        api.get("/turnos"),
        api.get("/duenos"),
        api.get("/mascotas") 
      ]);

      setTodosLosTurnos(resTurnos.data);
      
      // Manejo robusto de arrays
      const duenosData = Array.isArray(resDuenos.data) ? resDuenos.data : resDuenos.data.duenos || [];
      setListaDuenos(duenosData);

      const mascotasData = Array.isArray(resMascotas.data) ? resMascotas.data : resMascotas.data.mascotas || [];
      setListaMascotas(mascotasData);

      console.log("✅ Datos cargados: ", { turnos: resTurnos.data.length, duenos: duenosData.length, mascotas: mascotasData.length });

    } catch (error) {
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Abrir Modal
  const clickTurnoLibre = (hora) => {
    console.log("🟢 Click en turno libre:", hora); // Debug
    setTurnoEnProceso({ fecha: fechaSeleccionada, hora });
    setDuenoSeleccionado("");
    setMascotaSeleccionada("");
    setModalAbierto(true);
  };

  // Guardar Turno
  const handleAsignarTurno = async (e) => {
    e.preventDefault();
    if (!duenoSeleccionado || !mascotaSeleccionada) {
      alert("⚠️ Por favor selecciona un dueño y una mascota");
      return;
    }

    try {
      const payload = {
        fecha: turnoEnProceso.fecha,
        hora: turnoEnProceso.hora,
        mascota: mascotaSeleccionada,
        dueno: duenoSeleccionado,
      };

      console.log("📤 Enviando reserva admin:", payload);
      await api.post("/turnos", payload);
      
      alert("✅ Turno asignado correctamente");
      setModalAbierto(false);
      cargarDatos(); 
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.mensaje || "Error al asignar turno");
    }
  };

  // Cancelar Turno
  const handleCancelarTurno = async (id) => {
    if (!window.confirm("¿Estás seguro de cancelar este turno?")) return;
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
      const idDuenoMascota = typeof m.dueno === 'object' && m.dueno !== null ? m.dueno._id : m.dueno;   
      return String(idDuenoMascota) === String(duenoSeleccionado);
  });

const turnosOrdenados = [...todosLosTurnos].sort((a, b) => {
    return new Date(b.fecha) - new Date(a.fecha);
  });

  // Helper para obtener "Mes Año" (Ej: "Noviembre 2025")
  const obtenerMesAno = (fechaISO) => {
    const fecha = new Date(fechaISO);
    // Truco para capitalizar la primera letra (noviembre -> Noviembre)
    const mes = fecha.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    return mes.charAt(0).toUpperCase() + mes.slice(1);
  };


  return (
    <div className="admin-turnos-container">
      <h2 style={{ textAlign: "center", color: "#333", marginBottom:'20px' }}>📅 Administración de Turnos</h2>

      <div className="filtros-container">
        <label style={{ fontWeight: "bold", marginRight: "10px" }}>Visualizar día:</label>
        <input
          type="date"
          className="input-fecha-admin"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
        />
      </div>

      <h3 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
        Vista Diaria: {new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString()}
      </h3>

      <div className="grilla-turnos">
        {HORARIOS_LABORALES.map((hora) => {
          const turno = getTurnoEnHorario(hora);

          if (turno) {
            return (
              <div key={hora} className="turno-card turno-ocupado">
                <div className="hora-grande">{hora}:00</div>
                <div className="info-dueno">
                  <strong>{turno.mascota?.nombre || "Desconocido"}</strong>
                  <br />
                  <small>{turno.dueno?.nombres} {turno.dueno?.apellidos}</small>
                  <br />
                  <small>📞 {turno.dueno?.telefono || "-"}</small>
                </div>
              </div>
            );
          } else {
            return (
              <div 
                key={hora} 
                className="turno-card turno-libre"
                onClick={() => clickTurnoLibre(hora)}
                title="Click para asignar turno"
              >
                <div className="hora-grande">{hora}:00</div>
                <div>➕ Asignar</div>
              </div>
            );
          }
        })}
      </div>

      {/* TABLA HISTÓRICA */}
      <h3 style={{ marginTop: "40px", borderBottom: "2px solid #eeeeee", paddingBottom: "10px" }}>
        📑 Listado Histórico
      </h3>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
          <thead>
            <tr style={{ backgroundColor: "#2c3e50", color: "white" }}>
              <th style={{ padding: "12px" }}>Fecha</th>
              <th style={{ padding: "12px" }}>Hora</th>
              {/* Nueva Columna solicitada bien explícita */}
              <th style={{ padding: "12px" }}>Cliente (Dueño)</th> 
              <th style={{ padding: "12px" }}>Mascota</th>
              <th style={{ padding: "12px" }}>Contacto</th>
              <th style={{ padding: "12px" }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {turnosOrdenados.map((t, index) => {
              const mesActual = obtenerMesAno(t.fecha);
              
              // Miramos el turno anterior para ver si cambió el mes
              const turnoAnterior = turnosOrdenados[index - 1];
              const mesAnterior = turnoAnterior ? obtenerMesAno(turnoAnterior.fecha) : null;
              
              const mostrarSeparador = mesActual !== mesAnterior;

              return (
                <React.Fragment key={t._id}>
                  {/* SEPARADOR DE MES */}
                  {mostrarSeparador && (
                    <tr style={{ backgroundColor: "#e9ecef" }}>
                      <td colSpan="6" style={{ padding: "10px 15px", fontWeight: "bold", color: "#495057", textTransform: "uppercase", letterSpacing: "1px" }}>
                        📅 {mesActual}
                      </td>
                    </tr>
                  )}

                  {/* FILA DE DATOS */}
                  <tr style={{ borderBottom: "1px solid #ddd", textAlign: "center", backgroundColor: "#49505705" }}>
                    <td style={{ padding: "10px" }}>
                      {new Date(t.fecha).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "10px", fontWeight: 'bold' }}>
                      {t.hora}:00
                    </td>
                    
                    {/* COLUMNA NOMBRE Y APELLIDO (Bien destacada) */}
                    <td style={{ padding: "10px", textAlign: 'left' }}>
                      <div style={{fontWeight: 'bold', color: '#132631ff'}}>
                        {t.dueno?.nombres} {t.dueno?.apellidos}
                      </div>
                    </td>

                    <td style={{ padding: "10px" }}>
                      {t.mascota?.nombre || <span style={{color:'#ccc'}}>- Eliminada -</span>}
                    </td>

                    {/* Columna extra para email/teléfono para no ensuciar el nombre */}
                    <td style={{ padding: "10px", fontSize: '0.85rem', color: '#130707ff' }}>
                      {t.dueno?.email} <br/>
                      {t.dueno?.telefono || ''}
                    </td>

                    <td style={{ padding: "10px" }}>
                      <button onClick={() => handleCancelarTurno(t._id)} style={{ backgroundColor: "red", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}>
                      Cancelar
                    </button>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* === MODAL === */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{marginTop: 0}}>Asignar Turno</h3>
            <p>Fecha: {new Date(turnoEnProceso.fecha + 'T00:00:00').toLocaleDateString()} a las {turnoEnProceso.hora}:00 hs</p>
            
            <form onSubmit={handleAsignarTurno}>
              <div className="form-group">
                <label>Cliente:</label>
                <select 
                    className="form-control"
                    value={duenoSeleccionado}
                    onChange={(e) => {
                        setDuenoSeleccionado(e.target.value);
                        setMascotaSeleccionada(""); 
                    }}
                    required
                >
                    <option value="">-- Seleccionar Cliente --</option>
                    {listaDuenos.map(d => (
                        <option key={d._id} value={d._id}>
                            {d.nombres} {d.apellidos} ({d.email})
                        </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Mascota:</label>
                <select 
                    className="form-control"
                    value={mascotaSeleccionada}
                    onChange={(e) => setMascotaSeleccionada(e.target.value)}
                    required
                    disabled={!duenoSeleccionado}
                >
                    <option value="">-- Seleccionar Mascota --</option>
                    {mascotasFiltradas.length > 0 ? (
                        mascotasFiltradas.map(m => (
                            <option key={m._id} value={m._id}>{m.nombre} ({m.raza})</option>
                        ))
                    ) : (
                        <option disabled>Sin mascotas registradas</option>
                    )}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setModalAbierto(false)} className="form-control" style={{width:'auto', background:'#ccc', border:'none'}}>
                    Cancelar
                </button>
                <button type="submit" className="form-control" style={{width:'auto', background:'#28a745', color:'white', border:'none'}}>
                    Confirmar
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