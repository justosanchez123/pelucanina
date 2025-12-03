const mongoose = require('mongoose');
const { Schema } = mongoose;

const fotoSchema = new Schema(
  {
    titulo: { type: String, required: true },
    url: { type: String, required: true }, // Aquí guardamos el link de la imagen
    fecha: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Foto', fotoSchema);