const mongoose = require('mongoose');
const { Schema } = mongoose;

const turnoSchema = new Schema(
  {
    fecha: { type: Date, required: true },
    hora: { type: String, required: true }, // '09', '10', ...
    mascota: { type: Schema.Types.ObjectId, ref: 'Mascota', required: true },
    dueno: { type: Schema.Types.ObjectId, ref: 'Dueno', required: true }
  },
  { timestamps: true }
);

turnoSchema.index({ fecha: 1, hora: 1 }, { unique: true });

module.exports = mongoose.model('Turno', turnoSchema, 'turnos');
