const mongoose = require('mongoose');
const { Schema } = mongoose;

const duenoSchema = new Schema(
  {
    nombres: { type: String, required: true },
    apellidos: { type: String, required: false }, // Google a veces no trae apellido
    dni: { type: String, default: '' },
    email: { type: String, required: true },
    telefono: { type: String, default: '' },
    direccion: { type: String, default: '' },
    
    // 🔑 CLAVE: Vincula este perfil de dueño con la cuenta de usuario (Login)
    usuarioId: { type: Schema.Types.ObjectId, ref: 'Usuario', default: null }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dueno', duenoSchema);