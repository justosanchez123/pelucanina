const express = require('express');
const router = express.Router();
const Dueno = require('../modelos/dueno');
const Usuario = require('../modelos/usuario');
const Mascota = require('../modelos/mascota');
const autenticarToken = require('../middlewares/autorizaciones');
const verificarRol = require('../middlewares/roles');
const { body, validationResult } = require('express-validator');

// Validaciones
const validarDueno = [
  body('nombres').notEmpty().withMessage('Los nombres son obligatorios'),
  body('telefono').notEmpty().withMessage('El teléfono es obligatorio'),
  body('direccion').notEmpty().withMessage('La dirección es obligatoria'),
  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });
    next();
  }
];

// Crear dueño
router.post(
  '/',
  autenticarToken,
  verificarRol('adminPrincipal', 'adminSecundario'),
  validarDueno,
  async (req, res) => {
    try {
      const { mascotas, ...datos } = req.body;
      const nuevo = await Dueno.create(datos);

      if (Array.isArray(mascotas) && mascotas.length) {
        const docs = mascotas.map(m => ({ ...m, dueno: nuevo._id, duenoModel: 'Dueno' }));
        await Mascota.insertMany(docs);
      }

      res.status(201).json({ mensaje: 'Dueño creado', dueno: nuevo });
    } catch (error) {
      console.error('❌ Crear dueño:', error);
      res.status(500).json({ mensaje: 'Error interno' });
    }
  }
);

// Listar dueños (usuarios + dueños manuales)
router.get(
  '/',
  autenticarToken,
  verificarRol('adminPrincipal', 'adminSecundario'),
  async (req, res) => {
    try {
      const duenosManual = await Dueno.find().lean();
      const usuarios = await Usuario.find({ rol: 'usuario' }).lean();
      const mascotas = await Mascota.find().lean();

      const mapMascotas = mascotas.reduce((acc, m) => {
        const id = m.dueno.toString();
        (acc[id] ||= []).push(m);
        return acc;
      }, {});

      const duenosConMascotas = duenosManual.map(d => ({
        ...d,
        mascotas: mapMascotas[d._id.toString()] || []
      }));

      const usuariosComoDuenos = usuarios.map(u => ({
        _id: u._id,
        nombres: u.nombres,
        apellidos: u.apellidos,
        dni: u.dni || '',
        email: u.email,
        telefono: u.telefono || '',
        direccion: u.direccion || '',
        mascotas: mapMascotas[u._id.toString()] || []
      }));

      res.json([...duenosConMascotas, ...usuariosComoDuenos]);
    } catch (error) {
      console.error('❌ Obtener dueños:', error);
      res.status(500).json({ mensaje: 'Error interno' });
    }
  }
);

// Actualizar dueño
router.put(
  '/:id',
  autenticarToken,
  verificarRol('adminPrincipal', 'adminSecundario'),
  validarDueno,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { mascotas, ...datos } = req.body;

      const dueno = await Dueno.findByIdAndUpdate(id, datos, { new: true });
      if (!dueno) return res.status(404).json({ mensaje: 'Dueño no encontrado' });

      // Reemplazar mascotas
      await Mascota.deleteMany({ dueno: dueno._id, duenoModel: 'Dueno' });
      if (Array.isArray(mascotas) && mascotas.length) {
        const docs = mascotas.map(m => ({ ...m, dueno: dueno._id, duenoModel: 'Dueno' }));
        await Mascota.insertMany(docs);
      }

      res.json({ mensaje: 'Dueño actualizado', dueno });
    } catch (error) {
      console.error('❌ Actualizar dueño:', error);
      res.status(500).json({ mensaje: 'Error interno' });
    }
  }
);

// Eliminar dueño o usuario + sus mascotas
router.delete(
  '/:id',
  autenticarToken,
  verificarRol('adminPrincipal', 'adminSecundario'),
  async (req, res) => {
    try {
      const { id } = req.params;
      let dueno = await Dueno.findById(id);
      let tipo = 'Dueno';

      if (!dueno) {
        dueno = await Usuario.findByIdAndDelete(id);
        tipo = 'Usuario';
      } else {
        await Dueno.findByIdAndDelete(id);
      }

      if (!dueno) return res.status(404).json({ mensaje: 'Dueño no encontrado' });

      await Mascota.deleteMany({ dueno: id, duenoModel: tipo });
      res.json({ mensaje: 'Dueño eliminado' });
    } catch (error) {
      console.error('❌ Eliminar dueño:', error);
      res.status(500).json({ mensaje: 'Error interno' });
    }
  }
);

module.exports = router;
