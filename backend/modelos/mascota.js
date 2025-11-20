const mongoose = require('mongoose');

const mascotaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  edad: Number,
  raza: String,
  peso: Number,
  enfermedades: String,
  observaciones: String,
  // dueno puede referenciar a Usuario o a Dueno según tipoDueno
  dueno: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'tipoDueno' },
  tipoDueno: { type: String, required: true, enum: ['Usuario', 'Dueno'] }
}, { timestamps: true });

module.exports = mongoose.model('Mascota', mascotaSchema, 'mascotas');
