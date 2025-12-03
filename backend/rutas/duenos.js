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
  body('nombres').notEmpty().withMessage('Nombres obligatorios'),
  body('telefono').notEmpty().withMessage('Teléfono obligatorio'),
  body('direccion').notEmpty().withMessage('Dirección obligatoria'),
  (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ errores: errores.array() });
    next();
  }
];

// --- ZONA USUARIO (AUTOGESTIÓN) ---

// 1. Obtener mi perfil (Autocreación si no existe)
router.get('/mi-perfil', autenticarToken, async (req, res) => {
  try {
    const { id: uid, email } = req.usuario;

    let dueno = await Dueno.findOne({ usuarioId: uid });

    if (!dueno) {
        // Intento recuperar por email
        dueno = await Dueno.findOne({ email: email });
        if (dueno) {
            dueno.usuarioId = uid;
            await dueno.save();
        }
    }

    if (!dueno) {
        // Crear perfil vacío si no existe
        const usuarioBase = await Usuario.findById(uid);
        if (usuarioBase) {
            dueno = await Dueno.create({
                usuarioId: uid,
                nombres: usuarioBase.nombres,
                apellidos: usuarioBase.apellidos || "",
                email: usuarioBase.email,
                telefono: "", 
                direccion: "" 
            });
        }
    }
    
    if (!dueno) return res.json({});
    res.json(dueno);
  } catch (error) {
    console.error('Error mi-perfil:', error);
    res.status(500).json({ mensaje: 'Error al obtener perfil' });
  }
});

// 2. Actualizar mi perfil
router.put('/mi-perfil', autenticarToken, async (req, res) => {
  try {
    const { telefono, direccion, dni } = req.body;
    const duenoActualizado = await Dueno.findOneAndUpdate(
      { usuarioId: req.usuario.id },
      { telefono, direccion, dni },
      { new: true }
    );
    if (!duenoActualizado) return res.status(404).json({ mensaje: 'Perfil no encontrado' });
    res.json(duenoActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar' });
  }
});

// --- ZONA ADMIN ---

// Listar todos (Optimizada y Segura)
router.get('/', autenticarToken, verificarRol('adminPrincipal', 'adminSecundario'), async (req, res) => {
    try {
      const duenosManual = await Dueno.find().lean();
      
      // 🛡️ SEGURIDAD: No traer contraseñas
      const usuarios = await Usuario.find({ rol: 'usuario' }).select('-password').lean();
      const mascotas = await Mascota.find().lean();

      // Mapear mascotas a sus dueños
      const mapMascotas = mascotas.reduce((acc, m) => {
        const id = m.dueno.toString();
        (acc[id] ||= []).push(m);
        return acc;
      }, {});

      const duenosConMascotas = duenosManual.map(d => ({
        ...d,
        mascotas: mapMascotas[d._id.toString()] || []
      }));

      // Evitar duplicados (usuarios que ya son dueños)
      const usuariosIdsEnDuenos = new Set(duenosManual.map(d => d.usuarioId?.toString()));
      const usuariosSinFicha = usuarios.filter(u => !usuariosIdsEnDuenos.has(u._id.toString()));

      const usuariosComoDuenos = usuariosSinFicha.map(u => ({
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
      console.error('❌ Error duenos:', error);
      res.status(500).json({ mensaje: 'Error interno' });
    }
});

// Crear dueño manual
router.post('/', autenticarToken, verificarRol('adminPrincipal', 'adminSecundario'), validarDueno, async (req, res) => {
    try {
      const { mascotas, ...datos } = req.body;
      const nuevo = await Dueno.create(datos);
      
      if (Array.isArray(mascotas) && mascotas.length) {
        const docs = mascotas.map(m => ({ ...m, dueno: nuevo._id, duenoModel: 'Dueno' }));
        await Mascota.insertMany(docs);
      }
      res.status(201).json({ mensaje: 'Dueño creado', dueno: nuevo });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error interno' });
    }
});

// Actualizar dueño
router.put('/:id', autenticarToken, verificarRol('adminPrincipal', 'adminSecundario'), validarDueno, async (req, res) => {
    try {
      const { id } = req.params;
      const { mascotas, ...datos } = req.body;
      const dueno = await Dueno.findByIdAndUpdate(id, datos, { new: true });
      if (!dueno) return res.status(404).json({ mensaje: 'No encontrado' });

      // Actualizar mascotas (borrar y crear)
      await Mascota.deleteMany({ dueno: dueno._id, duenoModel: 'Dueno' });
      if (Array.isArray(mascotas) && mascotas.length) {
        const docs = mascotas.map(m => ({ ...m, dueno: dueno._id, duenoModel: 'Dueno' }));
        await Mascota.insertMany(docs);
      }
      res.json({ mensaje: 'Actualizado', dueno });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error interno' });
    }
});

// Eliminar dueño
router.delete('/:id', autenticarToken, verificarRol('adminPrincipal', 'adminSecundario'), async (req, res) => {
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

      if (!dueno) return res.status(404).json({ mensaje: 'No encontrado' });
      await Mascota.deleteMany({ dueno: id, duenoModel: tipo });
      res.json({ mensaje: 'Eliminado' });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error interno' });
    }
});

module.exports = router;