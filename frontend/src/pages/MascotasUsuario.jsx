// src/pages/MascotasUsuario.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const MascotasUsuario = () => {
  const { usuario, token } = useAuth();
  const [mascotas, setMascotas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    edad: "",
    raza: "",
    peso: "",
    enfermedades: "",
    observaciones: ""
  });
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ Traer mascotas al cargar
  const fetchMascotas = async () => {
    if (!token) return;
    try {
      const res = await api.get("/mascotas", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMascotas(res.data);
    } catch (err) {
      console.error("❌ Error al obtener mascotas:", err);
      setErrorMsg("No se pudieron cargar las mascotas.");
    }
  };

  useEffect(() => {
    fetchMascotas();
  }, [token]);

  // ✅ Editar mascota
  const handleEdit = (mascota) => {
    setEditandoId(mascota._id);
    setFormData({
      nombre: mascota.nombre,
      edad: mascota.edad,
      raza: mascota.raza,
      peso: mascota.peso,
      enfermedades: mascota.enfermedades,
      observaciones: mascota.observaciones
    });
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setFormData({
      nombre: "",
      edad: "",
      raza: "",
      peso: "",
      enfermedades: "",
      observaciones: ""
    });
    setErrorMsg("");
  };

  const handleGuardar = async () => {
  try {
    if (editandoId) {
      // Editar mascota existente
      await api.put(`/mascotas/${editandoId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      // Crear nueva mascota
      await api.post(`/mascotas`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    // Refrescar lista
    fetchMascotas();
    handleCancelar(); // Limpiar formulario y modal
  } catch (err) {
    console.error("❌ Error al guardar mascota:", err);
    setErrorMsg("No se pudo guardar la mascota.");
  }
};


  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro quieres eliminar esta mascota?")) return;
    try {
      await api.delete(`/mascotas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMascotas((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      console.error("❌ Error al eliminar mascota:", err);
      setErrorMsg("No se pudo eliminar la mascota.");
    }
  };

  return (
    <div>
      <h2>Mis Mascotas</h2>
      {errorMsg && <div style={{ color: "red" }}>{errorMsg}</div>}

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Raza</th>
            <th>Peso</th>
            <th>Enfermedades</th>
            <th>Observaciones</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {mascotas.map((m) => (
            <tr key={m._id}>
              <td>
                {editandoId === m._id ? (
                  <input
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                  />
                ) : (
                  m.nombre
                )}
              </td>
              <td>
                {editandoId === m._id ? (
                  <input name="edad" value={formData.edad} onChange={handleChange} />
                ) : (
                  m.edad
                )}
              </td>
              <td>
                {editandoId === m._id ? (
                  <input name="raza" value={formData.raza} onChange={handleChange} />
                ) : (
                  m.raza
                )}
              </td>
              <td>
                {editandoId === m._id ? (
                  <input name="peso" value={formData.peso} onChange={handleChange} />
                ) : (
                  m.peso
                )}
              </td>
              <td>
                {editandoId === m._id ? (
                  <input
                    name="enfermedades"
                    value={formData.enfermedades}
                    onChange={handleChange}
                  />
                ) : (
                  m.enfermedades
                )}
              </td>
              <td>
                {editandoId === m._id ? (
                  <input
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                  />
                ) : (
                  m.observaciones
                )}
              </td>
              <td>
                {editandoId === m._id ? (
                  <>
                    <button onClick={handleGuardar}>Guardar</button>
                    <button onClick={handleCancelar}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(m)}>Editar</button>
                    <button onClick={() => handleEliminar(m._id)}>Eliminar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MascotasUsuario;
