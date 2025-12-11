import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Modal, Button, Form } from "react-bootstrap"; 
import Swal from "sweetalert2"; 
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
    setShowModal(true); 
  };

  // --- NUEVA FUNCIÓN: BLOQUEO MASIVO ---
  const handleBloquearDia = async () => {
    // 1. Pedir motivo
    const { value: motivo } = await Swal.fire({
      title: 'Bloquear Día Completo',
      text: `Se suspenderán todos los horarios libres del ${new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString()}.`,
      input: 'text',
      inputLabel: 'Motivo (Ej: Vacaciones, Reformas)',
      inputPlaceholder: 'Escribe la razón...',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: '🔒 Bloquear Todo',
      cancelButtonText: 'Cancelar',
      background: '#1e1e1e', color: '#fff',
      inputValidator: (value) => {
        if (!value) return '¡Debes escribir un motivo!';
      }
    });

    if (!motivo) return; 

    // 2. Generar bloqueos para los huecos libres
    const promesas = [];
    
    HORARIOS_LABORALES.forEach(hora => {
        // Chequeamos si ya hay algo en ese horario (para no pisar turnos reales)
        const ocupado = todosLosTurnos.find(t => {
            const fechaTurno = t.fecha.split("T")[0];
            return fechaTurno === fechaSeleccionada && t.hora === hora;
        });

        if (!ocupado) {
            promesas.push(
                api.post("/turnos", {
                    fecha: fechaSeleccionada + "T12:00:00",
                    hora: hora,
                    bloqueado: true,
                    nombreCliente: motivo, // Usamos el motivo como "nombre"
                    mascota: null,
                    dueno: usuario._id
                })
            );
        }
    });

    if (promesas.length === 0) {
        return Swal.fire({title: 'Sin cambios', text: 'El día ya estaba completo o bloqueado.', icon: 'info', background: '#1e1e1e', color: '#fff'});
    }

    // 3. Enviar todo junto
    try {
        Swal.fire({title: 'Procesando...', allowOutsideClick: false, didOpen: () => Swal.showLoading(), background: '#1e1e1e', color: '#fff'});
        await Promise.all(promesas);
        await cargarDatos();
        Swal.fire({title: '¡Día Bloqueado!', icon: 'success', background: '#1e1e1e', color: '#fff'});
    } catch (error) {
        Swal.fire({title: 'Error', text: 'Hubo un problema al bloquear.', icon: 'error', background: '#1e1e1e', color: '#fff'});
    }
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
        title: '¿Suspender turno?', 
        text: "Se eliminará la reserva actual.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, suspender', 
        cancelButtonText: 'Cancelar',       
        background: '#1e1e1e', color: '#fff'
    });

    if (result.isConfirmed) {
        try {
            await api.delete(`/turnos/${id}`);
            cargarDatos();
            Swal.fire({title:'Suspendido', icon:'success', background:'#1e1e1e', color:'#fff'});
        } catch (error) {
            Swal.fire({title:'Error', text:'No se pudo suspender', icon:'error', background:'#1e1e1e', color:'#fff'});
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
      <h2 className="admin-title-page">
         <span className="emoji-calendario">📅</span> PANEL DE TURNOS
      </h2>

      <div className="filtros-container d-flex justify-content-center align-items-center gap-3 flex-wrap">
        <div className="d-flex align-items-center">
            <label>Día a visualizar:</label>
            <input
            type="date"
            className="input-fecha-admin"
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            />
        </div>
        
        {/* BOTÓN NUEVO DE BLOQUEO MASIVO */}
        <Button 
            variant="outline-danger" 
            className="fw-bold"
            onClick={handleBloquearDia}
            style={{borderWidth: '2px'}}
        >
            🔒 Bloquear Día Completo
        </Button>
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
                        Suspender
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

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