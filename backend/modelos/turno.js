const mongoose = require('mongoose');
const { Schema } = mongoose;

const turnoSchema = new Schema(
  {
    fecha: { type: Date, required: true },
    hora: { type: String, required: true },
    mascota: { type: Schema.Types.ObjectId, ref: 'Mascota', default: null },
    dueno: { type: Schema.Types.ObjectId, ref: 'Usuario', default: null }, // 🔑 usamos Usuario directamente
    nombreCliente: { type: String, default: null }, // opcional, admins
    bloqueado: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Evitar duplicados en la misma fecha+hora
turnoSchema.index({ fecha: 1, hora: 1 }, { unique: true });

module.exports = mongoose.model('Turno', turnoSchema, 'turnos');
