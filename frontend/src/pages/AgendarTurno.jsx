import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const AgendarTurno = () => {
  const { usuario } = useAuth();
  const [mascotas, setMascotas] = useState([]);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState([]);

  // Cargar mascotas del usuario
  useEffect(() => {
    if (usuario?.mascotas) {
      setMascotas(usuario.mascotas);
    }
  }, [usuario]);

  // Simular consulta de horas disponibles
  useEffect(() => {
    if (fecha) {
      // en el futuro acá llamás al backend: GET /turnos/disponibles?fecha=...
      setHorasDisponibles([
        "09:00",
        "09:20",
        "09:40",
        "10:00",
        "10:20",
        "10:40",
        "11:00",
      ]);
    } else {
      setHorasDisponibles([]);
    }
  }, [fecha]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mascotaSeleccionada || !fecha || !hora) {
      alert("⚠️ Por favor completa todos los campos");
      return;
    }

    const turno = {
      dueno: usuario._id,
      mascota: mascotaSeleccionada,
      fecha,
      hora,
    };

    console.log("Turno agendado:", turno);
    alert("✅ Turno solicitado. Revisa la consola para ver los datos enviados.");
    // luego acá mandás POST /turnos con fetch o axios
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md rounded-2xl p-6 mt-6">
      <h2 className="text-2xl font-bold text-center mb-4">📅 Agendar Turno</h2>

      {!usuario ? (
        <p className="text-red-500 text-center">Debes iniciar sesión para agendar un turno.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selección de mascota */}
          <div>
            <label className="block font-medium mb-1">Mascota:</label>
            <select
              className="w-full border p-2 rounded"
              value={mascotaSeleccionada}
              onChange={(e) => setMascotaSeleccionada(e.target.value)}
              required
            >
              <option value="">-- Selecciona una mascota --</option>
              {mascotas.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.nombre} ({m.raza})
                </option>
              ))}
            </select>
          </div>

          {/* Selección de fecha */}
          <div>
            <label className="block font-medium mb-1">Fecha:</label>
            <input
              type="date"
              className="w-full border p-2 rounded"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </div>

          {/* Selección de hora */}
          <div>
            <label className="block font-medium mb-1">Hora:</label>
            <select
              className="w-full border p-2 rounded"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
              disabled={!fecha}
            >
              <option value="">-- Selecciona un horario --</option>
              {horasDisponibles.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Confirmar Turno
          </button>
        </form>
      )}
    </div>
  );
};

export default AgendarTurno;
