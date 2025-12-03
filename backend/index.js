// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

// Configuración
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Rutas (todas en /api)
const rutas = {
  registro: require('./rutas/registro'),
  login: require('./rutas/login'),
  usuarios: require('./rutas/usuarios'),
  duenos: require('./rutas/duenos'),
  mascotas: require('./rutas/mascotas'),
  turnos: require('./rutas/turnos'),
  fotos: require('./rutas/fotos'), // 👈 NUEVO: Importamos la ruta de fotos
};

// Montaje de rutas
app.use('/api/registro', rutas.registro);
app.use('/api/login', rutas.login);
app.use('/api/usuarios', rutas.usuarios);
app.use('/api/duenos', rutas.duenos);
app.use('/api/mascotas', rutas.mascotas);
app.use('/api/turnos', rutas.turnos);
app.use('/api/fotos', rutas.fotos); // 👈 NUEVO: Habilitamos el endpoint /api/fotos

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Conexión a MongoDB y arranque del servidor
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err);
  });