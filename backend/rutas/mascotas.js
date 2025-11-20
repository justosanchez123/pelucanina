const express = require('express');
const router = express.Router();
const Mascota = require('../modelos/mascota');
const Dueno = require('../modelos/dueno');
const Usuario = require('../modelos/usuario');
const autenticarToken = require('../middlewares/autorizaciones');
const verificarRol = require('../middlewares/roles');
const { body, validationResult } = require('express-validator');

// ✅ Validaciones
const validarMascota = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('edad').notEmpty().withMessage('La edad es obligatoria'),
  body('raza').notEmpty().withMessage('La raza es obligatoria'),
  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });
    next();
  }
];

// 🔧 Helper: normalizar dueño y campos
// CAMBIO: Cambiamos duenoModel por tipoDueno
function prepararDatosMascota(reqBody, rol, userId) {
  let { dueno, tipoDueno, ...datos } = reqBody;

  if (dueno && typeof dueno === 'object' && dueno._id) {
    dueno = dueno._id;
  }

  if (rol === 'usuario') {
    // Forzamos que el dueño sea el usuario autenticado
    dueno = userId;
    tipoDueno = 'Usuario'; // <--- Aquí estaba el problema
  } else {
    tipoDueno = tipoDueno || 'Dueno'; // admins siguen manejando dueños
  }

  // Rellenar campos vacíos con "Desconocido"
  const campos = ['edad', 'raza', 'peso', 'enfermedades', 'observaciones'];
  campos.forEach((campo) => {
    if (!datos[campo] || datos[campo].toString().trim() === '') {
      datos[campo] = 'Desconocido';
    }
  });

  return { dueno, tipoDueno, datos };
}

// ✅ Crear mascota
router.post(
  '/',
  autenticarToken,
  verificarRol('adminPrincipal', 'adminSecundario', 'usuario'),
  validarMascota,
  async (req, res) => {
    try {
      // CAMBIO: Desestructuramos tipoDueno
      const { dueno, tipoDueno, datos } = prepararDatosMascota(req.body, req.usuario.rol, req.usuario.id);

      // CAMBIO: Guardamos con tipoDueno
      const nueva = await Mascota.create({ ...datos, dueno, tipoDueno });
      res.status(201).json({ mensaje: 'Mascota creada', mascota: nueva });
    } catch (error) {
      console.error('❌ Crear mascota:', error);
      res.status(500).json({ mensaje: error.message || 'Error interno' });
    }
  }
);

// ✅ Listar mascotas
router.get(
  '/',
  autenticarToken,
  verificarRol('adminPrincipal', 'adminSecundario', 'usuario'),
  async (req, res) => {
    try {
      const { rol, id: userId } = req.usuario;

      let mascotas;
      if (rol === 'adminPrincipal' || rol === 'adminSecundario') {
        mascotas = await Mascota.find()
          .populate('dueno', 'nombres apellidos email')
          .lean();
      } else {
        // CAMBIO IMPORTANTE: Buscamos por tipoDueno
        mascotas = await Mascota.find({ dueno: userId, tipoDueno: 'Usuario' }) 
          .populate('dueno', 'nombres apellidos email')
          .lean();
      }

      res.json(mascotas);
    } catch (error) {
      console.error('❌ Obtener mascotas:', error);
      res.status(500).json({ mensaje: error.message || 'Error interno' });
    }
  }
);

// ✅ Actualizar mascota
router.put(
  '/:id',
  autenticarToken,
  verificarRol('adminPrincipal', 'adminSecundario', 'usuario'),
  validarMascota,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { rol, id: userId } = req.usuario;
      // CAMBIO: Usamos tipoDueno
      const { dueno, tipoDueno, datos } = prepararDatosMascota(req.body, rol, userId);

      const mascota = await Mascota.findById(id);
      if (!mascota) return res.status(404).json({ mensaje: 'Mascota no encontrada' });

      if (rol === 'usuario' && mascota.dueno.toString() !== userId.toString()) {
        return res.status(403).json({ mensaje: 'No puedes actualizar esta mascota' });
      }

      // CAMBIO: Actualizamos tipoDueno
      Object.assign(mascota, { ...datos, dueno, tipoDueno });
      await mascota.save();

      res.json({ mensaje: 'Mascota actualizada', mascota });
    } catch (error) {
      console.error('❌ Actualizar mascota:', error);
      res.status(500).json({ mensaje: error.message || 'Error interno' });
    }
  }
);

// ✅ Eliminar mascota (Este estaba bien, pero lo dejamos igual)
router.delete(
  '/:id',
  autenticarToken,
  verificarRol('adminPrincipal', 'adminSecundario', 'usuario'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { rol, id: userId } = req.usuario;

      const mascota = await Mascota.findById(id);
      if (!mascota) return res.status(404).json({ mensaje: 'Mascota no encontrada' });

      if (rol === 'usuario' && mascota.dueno.toString() !== userId.toString()) {
        return res.status(403).json({ mensaje: 'No puedes eliminar esta mascota' });
      }

      await mascota.deleteOne();
      res.json({ mensaje: 'Mascota eliminada' });
    } catch (error) {
      console.error('❌ Eliminar mascota:', error);
      res.status(500).json({ mensaje: error.message || 'Error interno' });
    }
  }
);

module.exports = router;