const mongoose = require('mongoose');

const mascotaSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    edad: String,
    raza: String,
    peso: String,
    enfermedades: String,
    observaciones: String,
    dueno: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'duenoModel' },
    duenoModel: { type: String, required: true, enum: ['Dueno', 'Usuario'] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mascota', mascotaSchema, 'mascotas');
