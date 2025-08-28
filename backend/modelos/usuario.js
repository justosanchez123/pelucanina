const mongoose = require('mongoose');
const { Schema } = mongoose;

const usuarioSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nombres: String,
    apellidos: String,
    dni: String,
    direccion: String,
    telefono: String,
    rol: {
      type: String,
      enum: ['usuario', 'adminSecundario', 'adminPrincipal'],
      default: 'usuario'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Usuario', usuarioSchema, 'usuarios');
