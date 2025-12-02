// backend/modelos/dueno.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const duenoSchema = new Schema(
  {
    nombres: { type: String, required: true },
    apellidos: { type: String, required: false }, // A veces Google no trae apellido
    dni: { type: String, default: '' },
    email: { type: String, required: true },
    telefono: { type: String, default: '' },
    direccion: { type: String, default: '' },
    
    // 👇 ¡ESTE ES EL CAMPO CLAVE QUE FALTABA! 👇
    usuarioId: { type: Schema.Types.ObjectId, ref: 'Usuario', default: null }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dueno', duenoSchema);