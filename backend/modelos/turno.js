// modelos/turno.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const turnoSchema = new Schema(
  {
    // Guardaremos la fecha siempre a las 12:00 del mediodía para evitar problemas de zona horaria
    fecha: { type: Date, required: true }, 
    // Guardamos la hora como string "09", "10", "14", etc.
    hora: { type: String, required: true }, 
    
    mascota: { type: Schema.Types.ObjectId, ref: 'Mascota', default: null },
    dueno: { type: Schema.Types.ObjectId, ref: 'Usuario', default: null }, 
    
    // Campos opcionales para el admin
    nombreCliente: { type: String, default: null }, 
    bloqueado: { type: Boolean, default: false }, // Para "cerrar" una hora
    
    estado: { 
      type: String, 
      default: 'pendiente', 
      enum: ['pendiente', 'cancelado', 'finalizado'] 
    }
  },
  { timestamps: true }
);

// 🔒 REGLA DE ORO: No permite duplicados de Fecha + Hora en la base de datos
// Si intentan guardar un turno el mismo día a la misma hora, Mongo lanza error.
turnoSchema.index({ fecha: 1, hora: 1 }, { unique: true });

module.exports = mongoose.model('Turno', turnoSchema, 'turnos');
