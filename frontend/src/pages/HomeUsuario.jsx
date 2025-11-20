// src/pages/HomeUsuario.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Importamos useNavigate
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";
import './HomeUsuario.css';

const HomeUsuario = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState([]);
  const [turnos, setTurnos] = useState([]); // <--- Aquí se guardan

  // Estados para Modal y Formulario Mascota
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [mascotaEdit, setMascotaEdit] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    edad: "",
    raza: "",
    peso: "",
    enfermedades: "",
    observaciones: "",
  });

  // Estado visual de turnos (solo lectura por ahora)
  //const [turnos, setTurnos] = useState([]);


  // Función para cargar MASCOTAS
  const cargarMascotas = async () => {
    if (!usuario?._id) return;
    try {
      const res = await api.get("/mascotas");
      const data = Array.isArray(res.data) ? res.data : res.data.mascotas || [];
      setMascotas(data);
    } catch (error) {
      console.error("❌ Error al cargar mascotas:", error);
    }
  };

  // NUEVA FUNCIÓN: Cargar TURNOS 📅
  const cargarTurnos = async () => {
    if (!usuario?._id) return;
    try {
      // Llamamos al endpoint que te mostré del backend
      const res = await api.get(`/turnos/dueno/${usuario._id}`);
      setTurnos(res.data);
    } catch (error) {
      console.error("❌ Error al cargar turnos:", error);
    }
  };

  useEffect(() => {
    if (usuario) {
      cargarMascotas();
      cargarTurnos(); // <--- ¡Ahora sí los llamamos!
    }
  }, [usuario]);

  const abrirModal = (mascota = null) => {
    if (mascota) {
      setEditando(true);
      setFormData({ ...mascota });
      setMascotaEdit(mascota);
    } else {
      setEditando(false);
      setFormData({
        nombre: "", edad: "", raza: "", peso: "", enfermedades: "", observaciones: "",
      });
      setMascotaEdit(null);
    }
    setShowModal(true);
  };

  const cerrarModal = () => setShowModal(false);

  // src/pages/HomeUsuario.jsx

  const handleGuardar = async () => {
    try {
      // AGREGAMOS 'tipoDueno' AL PAYLOAD
      // Asumimos que el modelo en tu backend se llama "Usuario"
      const payload = {
        ...formData,
        dueno: usuario._id,
        tipoDueno: "Usuario" // <--- ¡ESTA ES LA CLAVE QUE FALTABA! 🔑
      };

      console.log("📤 Enviando mascota:", payload);

      if (editando && mascotaEdit?._id) {
        await api.put(`/mascotas/${mascotaEdit._id}`, payload);
      } else {
        await api.post("/mascotas", payload);
      }

      await cargarMascotas();
      cerrarModal();
    } catch (error) {
      console.error("❌ Error al guardar mascota:", error.response?.data || error);
      // Mejoramos el alert para que veas el error si vuelve a pasar
      alert(`Error: ${error.response?.data?.message || "No se pudo guardar"}`);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Deseas eliminar esta mascota?")) return;
    try {
      await api.delete(`/mascotas/${id}`);
      await cargarMascotas();
    } catch (error) {
      console.error("❌ Error:", error);
      alert("No se pudo eliminar");
    }
  };

  // Función para ir a reservar turno para una mascota específica
  const irAReservar = (mascota) => {
    // Navegamos a la pagina de agendar y le pasamos la mascota como "state"
    // para que el formulario ya sepa a quién vamos a bañar
    navigate('/agendar', { state: { mascotaSeleccionada: mascota } });
  };

  return (
    <div className="user-container">

      {/* HEADER */}
      <div className="user-header">
        <h2>🏠 Panel de {usuario?.nombres || 'Usuario'}</h2>
      </div>

      {/* SECCIÓN MIS MASCOTAS */}
      <div className="user-mascotas-section">
        <h3 className="user-title-mascotas">🐶 Mis Mascotas</h3>
        <button className="user-btn-add" onClick={() => abrirModal()}>
          + Agregar Mascota
        </button>
      </div>

      {/* CARDS */}
      <div className="user-cards-grid">
        {mascotas.length === 0 ? (
          <p>No tienes mascotas registradas. ¡Agrega una para comenzar!</p>
        ) : (
          mascotas.map((m) => (


            <div key={m._id} className="user-card">
              {/* Título con icono */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{m.nombre}</h3>
                <span style={{ fontSize: '1.2rem' }}>🐾</span>
              </div>

              {/* Cuerpo de la tarjeta: Agregamos Peso y Enfermedades */}
              <div style={{ fontSize: '0.9rem', flexGrow: 1 }}>
                <p style={{ margin: '5px 0' }}><strong>Raza:</strong> {m.raza}</p>
                <p style={{ margin: '5px 0' }}><strong>Edad:</strong> {m.edad}</p>
                {/* AQUI AGREGAMOS LOS NUEVOS CAMPOS */}
                <p style={{ margin: '5px 0' }}><strong>Peso:</strong> {m.peso ? `${m.peso} kg` : '-'}</p>
                <p style={{ margin: '5px 0' }}><strong>Salud:</strong> {m.enfermedades || 'Sana'}</p>

                {m.observaciones && (
                  <p style={{ margin: '5px 0', fontStyle: 'italic', opacity: 0.9 }}>"{m.observaciones}"</p>
                )}
              </div>

              {/* Botones de Acción (Ahora usarán el CSS nuevo más chico) */}
              <div className="user-card-actions" style={{ marginTop: '15px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button className="user-btn-edit" onClick={() => abrirModal(m)} title="Editar">✏️</button>
                  <button className="user-btn-delete" onClick={() => handleEliminar(m._id)} title="Eliminar">🗑️</button>
                </div>

                <button
                  className="user-btn-reservar"
                  onClick={() => irAReservar(m)}
                >
                  📅 Reservar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TURNOS */}
      <div className="user-turnos-section">
        <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>📅 Mis Turnos Agendados</h3>

        {turnos.length === 0 ? (
          <p style={{ color: '#888', fontStyle: 'italic' }}>No tienes turnos pendientes.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {turnos.map((t) => (
              <li key={t._id} style={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}>
                <div>
                  {/* Formateamos la fecha para que se vea linda */}
                  <div style={{ fontWeight: 'bold', color: '#2f9bda', fontSize: '1.1rem' }}>
                    {new Date(t.fecha).toLocaleDateString()} — {t.hora}:00 hs
                  </div>
                  <div style={{ color: '#555' }}>
                    Mascota: <strong>{t.mascota?.nombre || 'Mascota eliminada'}</strong>
                  </div>
                </div>

                {/* Botón Cancelar (Opcional, si quieres implementarlo luego) */}
                <button
                  style={{ color: 'red', background: 'none', border: '1px solid red', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer' }}
                  onClick={() => alert("Funcionalidad de cancelar pendiente de conectar")}
                >
                  Cancelar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* MODAL SOLO MASCOTAS */}
      <Modal
        isOpen={showModal}
        title={editando ? "Editar Mascota" : "Nueva Mascota"}
        onClose={cerrarModal}
        onSave={handleGuardar}
      >
        {["nombre", "edad", "raza", "peso", "enfermedades", "observaciones"].map((campo) => (
          <div key={campo} style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'capitalize' }}>{campo}</label>
            <input
              placeholder={`Ingresa ${campo}`}
              value={formData[campo] || ""}
              onChange={(e) => setFormData({ ...formData, [campo]: e.target.value })}
              style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
          </div>
        ))}
      </Modal>
    </div>
  );
};

export default HomeUsuario;