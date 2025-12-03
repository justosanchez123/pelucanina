const mongoose = require('mongoose');
const { Schema } = mongoose;

const turnoSchema = new Schema(
  {
    // Guardamos la fecha siempre a las 12:00 del mediodía para evitar lios de zona horaria
    fecha: { type: Date, required: true }, 
    // La hora va aparte como string ("09", "10", "14")
    hora: { type: String, required: true }, 
    
    mascota: { type: Schema.Types.ObjectId, ref: 'Mascota', default: null },
    dueno: { type: Schema.Types.ObjectId, ref: 'Usuario', default: null }, 
    
    // Para bloqueos del administrador
    nombreCliente: { type: String, default: null }, 
    bloqueado: { type: Boolean, default: false },
    
    estado: { 
      type: String, 
      default: 'pendiente', 
      enum: ['pendiente', 'cancelado', 'finalizado'] 
    }
  },
  { timestamps: true }
);

// 🔒 SEGURIDAD DB: Impide crear dos turnos en la misma fecha y hora
turnoSchema.index({ fecha: 1, hora: 1 }, { unique: true });

module.exports = mongoose.model('Turno', turnoSchema, 'turnos');
