const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Rutas
app.use('/api/registro', require('./rutas/registro'));
app.use('/api/login', require('./rutas/login'));
app.use('/api/duenos', require('./rutas/duenos'));
app.use('/api/mascotas', require('./rutas/mascotas'));
app.use('/api/turnos', require('./rutas/turnos'));

// Conexión a MongoDB y arranque
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err);
  });
