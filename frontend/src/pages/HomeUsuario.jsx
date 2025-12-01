import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
// ✅ Importamos componentes de Bootstrap y SweetAlert
import { Modal, Button, Form } from "react-bootstrap"; 
import Swal from 'sweetalert2';
import './HomeUsuario.css';

const HomeUsuario = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState([]);
  const [turnos, setTurnos] = useState([]);

  // Estados del Modal de Bootstrap
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [mascotaEditId, setMascotaEditId] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "", edad: "", raza: "", peso: "", enfermedades: "", observaciones: "",
  });

  // Cargar datos al iniciar
  const cargarDatos = async () => {
    if (!usuario?._id) return;
    try {
      const [resMascotas, resTurnos] = await Promise.all([
        api.get("/mascotas"),
        api.get(`/turnos/dueno/${usuario._id}`)
      ]);
      
      const listaMascotas = Array.isArray(resMascotas.data) ? resMascotas.data : resMascotas.data.mascotas || [];
      setMascotas(listaMascotas);
      setTurnos(resTurnos.data);
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
    }
  };

  useEffect(() => {
    if (usuario) cargarDatos();
  }, [usuario]);

  // Manejo del Modal (Abrir para Crear o Editar)
  const handleAbrirModal = (mascota = null) => {
    if (mascota) {
      setEditando(true);
      setMascotaEditId(mascota._id);
      setFormData({ 
        nombre: mascota.nombre, edad: mascota.edad, raza: mascota.raza,
        peso: mascota.peso || "", enfermedades: mascota.enfermedades || "", observaciones: mascota.observaciones || ""
      });
    } else {
      setEditando(false);
      setMascotaEditId(null);
      setFormData({ nombre: "", edad: "", raza: "", peso: "", enfermedades: "", observaciones: "" });
    }
    setShowModal(true);
  };

  // Guardar Mascota
  const handleGuardar = async () => {
    try {
      const payload = { ...formData, dueno: usuario._id, tipoDueno: "Usuario" };

      if (editando) {
        await api.put(`/mascotas/${mascotaEditId}`, payload);
        Swal.fire({
            title: '¡Actualizado!', 
            text: 'Datos de la mascota actualizados.', 
            icon: 'success', 
            background: '#1e1e1e', 
            color: '#fff',
            confirmButtonColor: '#00d4ff'
        });
      } else {
        await api.post("/mascotas", payload);
        Swal.fire({
            title: '¡Bienvenido!', 
            text: 'Nueva mascota agregada a la banda.', 
            icon: 'success', 
            background: '#1e1e1e', 
            color: '#fff',
            confirmButtonColor: '#00d4ff'
        });
      }

      await cargarDatos();
      setShowModal(false);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'No se pudo guardar.',
        icon: 'error',
        background: '#1e1e1e', 
        color: '#fff'
      });
    }
  };

  // Eliminar Mascota
  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Se eliminará la mascota y sus turnos pendientes.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      background: '#1e1e1e',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/mascotas/${id}`);
        await cargarDatos();
        Swal.fire({
            title: 'Eliminado', 
            icon: 'success', 
            background: '#1e1e1e', 
            color: '#fff'
        });
      } catch (error) {
        Swal.fire({title: 'Error', text: 'No se pudo eliminar.', icon: 'error', background: '#1e1e1e', color: '#fff'});
      }
    }
  };

  return (
    // ⚠️ CAMBIO AQUÍ: Quitamos la clase 'container' para evitar conflictos de fondo blanco
    <div className="user-container">
      
      {/* HEADER DEL PANEL */}
      <div className="d-flex justify-content-between align-items-center mb-5 border-bottom border-secondary pb-3">
        <div>
            <h6 className="text-secondary text-uppercase mb-1" style={{letterSpacing: '2px'}}>Panel de Control</h6>
            <h1 className="title-rock display-5">Hola, {usuario?.nombres}</h1>
        </div>
      </div>

      {/* SECCIÓN MASCOTAS */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="subtitle-rock">🐶 Mis Mascotas</h3>
        <button className="btn btn-add-neon" onClick={() => handleAbrirModal()}>
          + Agregar Mascota
        </button>
      </div>

      <div className="row mb-5">
        {mascotas.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted border border-secondary rounded" style={{background: 'rgba(255,255,255,0.05)'}}>
            <h4 className="opacity-50">No hay mascotas registradas</h4>
            <p>¡Agrega a tu primera estrella para comenzar!</p>
          </div>
        ) : (
          mascotas.map((m) => (
            <div key={m._id} className="col-md-6 col-lg-4">
                <div className="pet-card">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <div className="pet-name">{m.nombre}</div>
                            <small className="text-white-50 text-uppercase">{m.raza}</small>
                        </div>
                        <span className="fs-3">🐾</span>
                    </div>
                    
                    <div className="pet-info mb-4 small">
                        <div><strong>Edad:</strong> {m.edad} años</div>
                        <div><strong>Peso:</strong> {m.peso} kg</div>
                        <div className="text-truncate"><strong>Salud:</strong> {m.enfermedades || 'Sana'}</div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <button className="action-btn" onClick={() => handleAbrirModal(m)} title="Editar">✏️</button>
                            <button className="action-btn text-danger" onClick={() => handleEliminar(m._id)} title="Eliminar">🗑️</button>
                        </div>
                        <button 
                            className="btn-reservar-rock"
                            onClick={() => navigate('/agendar', { state: { mascotaSeleccionada: m } })}
                        >
                        📅 Turno
                        </button>
                    </div>
                </div>
            </div>
          ))
        )}
      </div>

      {/* SECCIÓN TURNOS */}
      <h3 className="subtitle-rock mb-4">📅 Turnos Agendados</h3>
      <div className="row">
        {turnos.length === 0 ? (
           <p className="text-muted fst-italic">No tienes turnos próximos.</p>
        ) : (
           turnos.map((t) => (
             <div key={t._id} className="col-md-12">
               <div className="turno-card-dark">
                 <div className="turno-header">
                   <div className="turno-date">
                     {new Date(t.fecha).toLocaleDateString()} <span className="text-white mx-2">|</span> {t.hora}:00 hs
                   </div>
                   <span className={`badge ${t.estado === 'cancelado' ? 'bg-danger' : 'bg-success'}`}>
                      {t.estado ? t.estado.toUpperCase() : 'ACTIVO'}
                   </span>
                 </div>
                 <div className="turno-body d-flex justify-content-between align-items-center">
                    <div>
                        <div className="mb-1">
                            Paciente: <strong style={{color: 'var(--neon-blue)'}}>{t.mascota?.nombre || 'Desconocido'}</strong>
                        </div>
                        <div className="small text-muted">
                            Servicio de Peluquería
                        </div>
                    </div>
                 </div>
               </div>
             </div>
           ))
        )}
      </div>

      {/* MODAL (Estilizado por el CSS rockero) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-white">{editando ? "✏️ Editar Ficha" : "🐾 Nueva Mascota"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {["nombre", "edad", "raza", "peso", "enfermedades", "observaciones"].map((campo) => (
              <Form.Group key={campo} className="mb-3">
                <Form.Label className="text-capitalize text-info">{campo}</Form.Label>
                <Form.Control
                  type={campo === 'edad' || campo === 'peso' ? 'number' : 'text'}
                  value={formData[campo]}
                  onChange={(e) => setFormData({ ...formData, [campo]: e.target.value })}
                  placeholder={`Ingrese ${campo}`}
                />
              </Form.Group>
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button style={{backgroundColor: '#00d4ff', color:'black', border:'none', fontWeight:'bold'}} onClick={handleGuardar}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default HomeUsuario;