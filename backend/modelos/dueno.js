const mongoose = require('mongoose');

const duenoSchema = new mongoose.Schema(
  {
    nombres: String,   
    apellidos: String,
    dni: String,    
    telefono: String,
    direccion: String,
    email: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dueno', duenoSchema, 'duenos');
