// src/pages/Turnos.jsx
import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Turnos = () => {
  const { usuario } = useAuth();
  const [mascotas, setMascotas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [form, setForm] = useState({
    mascota: "",
    fecha: "",
    hora: "",
  });

  // 📌 Obtener mascotas del dueño
  const fetchMascotas = async () => {
    try {
      const res = await api.get(`/mascotas/dueno/${usuario._id}`);
      setMascotas(res.data);
    } catch (err) {
      console.error("❌ Error cargando mascotas:", err);
    }
  };

  // 📌 Obtener turnos del usuario
  const fetchTurnos = async () => {
    try {
      const res = await api.get(`/turnos/dueno/${usuario._id}`);
      setTurnos(res.data);
    } catch (err) {
      console.error("❌ Error cargando turnos:", err);
    }
  };

  useEffect(() => {
    if (usuario?._id) {
      fetchMascotas();
      fetchTurnos();
    }
  }, [usuario]);

  // 📌 Manejo de inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/turnos", { ...form, dueno: usuario._id });
      setForm({ mascota: "", fecha: "", hora: "" });
      fetchTurnos();
    } catch (err) {
      console.error("❌ Error agendando turno:", err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">📅 Mis Turnos</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-2">
        <select
          name="mascota"
          value={form.mascota}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        >
          <option value="">Seleccionar Mascota</option>
          {mascotas.map((m) => (
            <option key={m._id} value={m._id}>
              {m.nombre}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
        <input
          type="time"
          name="hora"
          value={form.hora}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          📌 Reservar Turno
        </button>
      </form>

      {/* Lista */}
      <div className="mt-6">
        {turnos.length === 0 ? (
          <p>No tienes turnos agendados.</p>
        ) : (
          <ul className="space-y-2">
            {turnos.map((t) => (
              <li key={t._id} className="border p-2 rounded">
                🐾 {t.mascota?.nombre} — {t.fecha} {t.hora}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Turnos;
