import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Modal, Button, Form } from "react-bootstrap"; // Usamos Bootstrap Modal
import Swal from "sweetalert2"; // Usamos SweetAlert
import "./TurnosAdmin.css";

const TurnosAdmin = () => {
  const { usuario } = useAuth();

  // Estados
  const [todosLosTurnos, setTodosLosTurnos] = useState([]);
  const [listaDuenos, setListaDuenos] = useState([]); 
  const [listaMascotas, setListaMascotas] = useState([]); 
  
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split("T")[0]);
  const [showModal, setShowModal] = useState(false);
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
    setShowModal(true); // Cambio a showModal
  };

  const handleGuardar = async () => {
    if (esBloqueo && !motivoBloqueo.trim()) {
        return Swal.fire({title:'Falta motivo', icon:'warning', background:'#1e1e1e', color:'#fff'});
    }
    if (!esBloqueo && (!duenoSeleccionado || !mascotaSeleccionada)) {
        return Swal.fire({title:'Faltan datos', text:'Selecciona cliente y mascota', icon:'warning', background:'#1e1e1e', color:'#fff'});
    }

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
      
      Swal.fire({
        title: esBloqueo ? "Bloqueado" : "Asignado",
        text: esBloqueo ? "Horario suspendido." : "Turno creado con éxito.",
        icon: 'success',
        background: '#1e1e1e', color: '#fff', confirmButtonColor: '#00d4ff'
      });

      setShowModal(false);
      cargarDatos(); 
    } catch (error) {
      Swal.fire({title:'Error', text: error.response?.data?.mensaje || "Error al procesar", icon:'error', background:'#1e1e1e', color:'#fff'});
    }
  };

  const handleCancelarTurno = async (id) => {
    const result = await Swal.fire({
        title: '¿Liberar horario?',
        text: "Se eliminará la reserva.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, liberar',
        background: '#1e1e1e', color: '#fff'
    });

    if (result.isConfirmed) {
        try {
            await api.delete(`/turnos/${id}`);
            cargarDatos();
            Swal.fire({title:'Liberado', icon:'success', background:'#1e1e1e', color:'#fff'});
        } catch (error) {
            Swal.fire({title:'Error', text:'No se pudo cancelar', icon:'error', background:'#1e1e1e', color:'#fff'});
        }
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
      {/* Título con Emoji Arreglado */}
      <h2 className="admin-title-page">
         <span className="emoji-calendario">📅</span> PANEL DE TURNOS
      </h2>

      <div className="filtros-container">
        <label>Día a visualizar:</label>
        <input
          type="date"
          className="input-fecha-admin"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
        />
      </div>

      <h3 className="vista-dia-title">
        Vista: {new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString()}
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

      <h3 className="historial-title">📑 Historial Completo</h3>
      
      <div className="table-responsive">
        <table className="table-rock-turnos">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Detalle</th>
              <th>Acción</th>
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
                    <tr className="separador-mes">
                      <td colSpan="4">📅 {mesActual}</td>
                    </tr>
                  )}
                  <tr>
                    <td>{new Date(t.fecha).toLocaleDateString()}</td>
                    <td style={{color:'#00d4ff', fontWeight:'bold'}}>{t.hora}:00</td>
                    <td style={{textAlign:'left'}}>
                        {t.bloqueado ? (
                           <span style={{color: '#ff6b6b'}}>⛔ {t.nombreCliente || 'Suspendido'}</span>
                        ) : (
                           <span>
                             <span style={{fontWeight:'bold', color:'white'}}>{t.mascota?.nombre}</span> 
                             <span style={{color:'#888'}}> - {t.dueno?.nombres} {t.dueno?.apellidos}</span>
                           </span>
                        )}
                    </td>
                    <td>
                      <button onClick={() => handleCancelarTurno(t._id)} className="btn-liberar">
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

      {/* MODAL CON BOOTSTRAP (Mucho más limpio) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
        <Modal.Header closeButton>
            <Modal.Title className="text-white">Gestionar Horario: {turnoEnProceso.hora}:00 hs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p className="mb-3 text-white-50">
                Fecha: {new Date(turnoEnProceso.fecha + 'T00:00:00').toLocaleDateString()}
            </p>
            <Form>
                <div className="bloqueo-box mb-3">
                    <Form.Check 
                        type="switch"
                        id="chkBloqueo"
                        label="Bloquear por imprevisto"
                        checked={esBloqueo}
                        onChange={(e) => setEsBloqueo(e.target.checked)}
                        style={{color: '#ff6b6b', fontWeight: 'bold'}}
                    />
                </div>

                {esBloqueo ? (
                    <Form.Group className="mb-3">
                        <Form.Label style={{color:'#ccc'}}>Motivo</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Ej: Urgencia personal..." 
                            value={motivoBloqueo} 
                            onChange={(e) => setMotivoBloqueo(e.target.value)} 
                            autoFocus 
                        />
                    </Form.Group>
                ) : (
                    <>
                        <Form.Group className="mb-3">
                            <Form.Label style={{color:'#ccc'}}>Cliente</Form.Label>
                            <Form.Select value={duenoSeleccionado} onChange={(e) => { setDuenoSeleccionado(e.target.value); setMascotaSeleccionada(""); }}>
                                <option value="">-- Seleccionar --</option>
                                {listaDuenos.sort((a,b)=>a.apellidos.localeCompare(b.apellidos)).map(d => (<option key={d._id} value={d._id}>{d.apellidos}, {d.nombres}</option>))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label style={{color:'#ccc'}}>Mascota</Form.Label>
                            <Form.Select value={mascotaSeleccionada} onChange={(e) => setMascotaSeleccionada(e.target.value)} disabled={!duenoSeleccionado}>
                                <option value="">-- Seleccionar --</option>
                                {mascotasFiltradas.map(m => (<option key={m._id} value={m._id}>{m.nombre}</option>))}
                            </Form.Select>
                        </Form.Group>
                    </>
                )}
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button 
                className={esBloqueo ? 'btn-danger' : 'btn-neon'} 
                onClick={handleGuardar}
                style={!esBloqueo ? {backgroundColor: '#00d4ff', border: 'none', color: 'black', fontWeight: 'bold'} : {}}
            >
                {esBloqueo ? "Bloquear Horario" : "Confirmar Turno"}
            </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TurnosAdmin;