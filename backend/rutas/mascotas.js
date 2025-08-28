const express = require('express');
const router = express.Router();
const Mascota = require('../modelos/mascota');
const autenticarToken = require('../middlewares/autorizaciones');
const verificarRol = require('../middlewares/roles');
const { body, validationResult } = require('express-validator');

// Validaciones
const validarMascota = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('dueno').notEmpty().withMessage('El dueño es obligatorio'),
  body('duenoModel').notEmpty().isIn(['Dueno', 'Usuario']).withMessage('duenoModel inválido'),
  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });
    next();
  }
];

// Crear mascota
router.post(
  '/',
  autenticarToken,
  verificarRol('adminPrincipal', 'adminSecundario'),
  validarMascota,
  async (req, res) => {
    try {
      const nueva = await Mascota.create(req.body);
      res.status(201).json({ mensaje: 'Mascota creada', mascota: nueva });
    } catch (error) {
      console.error('❌ Crear mascota:', error);
      res.status(500).json({ mensaje: 'Error interno' });
    }
  }
);

// Editar mascota
router.put(
  '/:id',
  autenticarToken,
  verificarRol('adminPrincipal', 'adminSecundario'),
  validarMascota,
  async (req, res) => {
    try {
      const mascota = await Mascota.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!mascota) return res.status(404).json({ mensaje: 'Mascota no encontrada' });
      res.json({ mensaje: 'Mascota actualizada', mascota });
    } catch (error) {
      console.error('❌ Actualizar mascota:', error);
      res.status(500).json({ mensaje: 'Error interno' });
    }
  }
);

// Eliminar mascota
router.delete(
  '/:id',
  autenticarToken,
  verificarRol('adminPrincipal', 'adminSecundario'),
  async (req, res) => {
    try {
      const mascota = await Mascota.findByIdAndDelete(req.params.id);
      if (!mascota) return res.status(404).json({ mensaje: 'Mascota no encontrada' });
      res.json({ mensaje: 'Mascota eliminada' });
    } catch (error) {
      console.error('❌ Eliminar mascota:', error);
      res.status(500).json({ mensaje: 'Error interno' });
    }
  }
);

// Listar todas las mascotas
router.get(
  '/',
  autenticarToken,
  verificarRol('adminPrincipal', 'adminSecundario'),
  async (req, res) => {
    try {
      const mascotas = await Mascota.find().lean();
      res.json(mascotas);
    } catch (error) {
      console.error('❌ Obtener mascotas:', error);
      res.status(500).json({ mensaje: 'Error interno' });
    }
  }
);

module.exports = router;
