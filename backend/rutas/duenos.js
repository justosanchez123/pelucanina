const express = require('express');
const router = express.Router();
const Dueno = require('../modelos/dueno');
const Usuario = require('../modelos/usuario');
const Mascota = require('../modelos/mascota');
const autenticarToken = require('../middlewares/autorizaciones');
const verificarRol = require('../middlewares/roles');
const { body, validationResult } = require('express-validator');

// Validaciones para Admin
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

// =====================================================================
// 🟢 ZONA DE AUTOGESTIÓN (Usuario)
// =====================================================================

// 1. OBTENER MI PERFIL (Autogenerativo) 🧬
router.get('/mi-perfil', autenticarToken, async (req, res) => {
  try {
    const { id: uid, email } = req.usuario;

    // A. Buscamos si ya tiene ficha de dueño vinculada
    let dueno = await Dueno.findOne({ usuarioId: uid });

    // B. Si no tiene, buscamos por email (caso usuarios viejos o google)
    if (!dueno) {
        dueno = await Dueno.findOne({ email: email });
        
        if (dueno) {
            // Lo encontramos por email -> Lo vinculamos
            dueno.usuarioId = uid;
            await dueno.save();
        }
    }

    // C. CASO CRÍTICO: Si NO existe de ninguna forma (Usuario manual nuevo)
    // -> Lo creamos AHORA MISMO usando los datos de su Usuario base.
    if (!dueno) {
        console.log("🛠️ Creando perfil de dueño automático para:", email);
        const usuarioBase = await Usuario.findById(uid);
        
        if (usuarioBase) {
            dueno = await Dueno.create({
                usuarioId: uid,
                nombres: usuarioBase.nombres,
                apellidos: usuarioBase.apellidos || "",
                email: usuarioBase.email,
                telefono: "", // Vacío para que salte el modal
                direccion: "" // Vacío para que salte el modal
            });
        }
    }

    // Si aún así es null (muy raro), devolvemos vacío
    if (!dueno) return res.json({});

    res.json(dueno);
  } catch (error) {
    console.error('Error mi-perfil:', error);
    res.status(500).json({ mensaje: 'Error al obtener perfil' });
  }
});

// 2. ACTUALIZAR MI PERFIL
router.put('/mi-perfil', autenticarToken, async (req, res) => {
  try {
    const { telefono, direccion, dni } = req.body;
    
    // Como el GET ya se asegura de crearlo, aquí solo actualizamos por ID
    const duenoActualizado = await Dueno.findOneAndUpdate(
      { usuarioId: req.usuario.id },
      { telefono, direccion, dni },
      { new: true }
    );

    if (!duenoActualizado) {
        return res.status(404).json({ mensaje: 'Perfil no encontrado (intenta recargar)' });
    }

    res.json(duenoActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar perfil' });
  }
});


// =====================================================================
// 🔴 ZONA DE ADMINISTRACIÓN (Rutas Admin)
// =====================================================================

// Crear dueño (Manual Admin)
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

// Listar dueños
router.get(
  '/',
  autenticarToken,
  verificarRol('adminPrincipal', 'adminSecundario'),
  async (req, res) => {
    try {
      const duenosManual = await Dueno.find().lean();
      // Filtramos usuarios que NO sean admins para no ensuciar la lista
      const usuarios = await Usuario.find({ rol: 'usuario' }).lean();
      const mascotas = await Mascota.find().lean();

      const mapMascotas = mascotas.reduce((acc, m) => {
        const id = m.dueno.toString();
        (acc[id] ||= []).push(m);
        return acc;
      }, {});

      // Mapeo inteligente para evitar duplicados visuales si ya existen en Duenos
      // (Esta lógica se mantiene igual que la tuya original)
      const duenosConMascotas = duenosManual.map(d => ({
        ...d,
        mascotas: mapMascotas[d._id.toString()] || []
      }));

      // Para los usuarios que no están en la tabla de dueños (fallback visual)
      // Aunque con la lógica nueva, todos deberían terminar teniendo ficha de dueño
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
      console.error('❌ Obtener dueños:', error);
      res.status(500).json({ mensaje: 'Error interno' });
    }
  }
);

// Actualizar dueño (Admin por ID)
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

// Eliminar dueño
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