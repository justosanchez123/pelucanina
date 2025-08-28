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
router.post('/', autenticarToken, verificarRol('adminPrincipal','adminSecundario'), validarDueno, async (req,res)=>{
  try{
    const { mascotas, ...datos } = req.body;
    const nuevo = await Dueno.create(datos);

    if(Array.isArray(mascotas) && mascotas.length){
      const docs = mascotas.map(m => ({ ...m, dueno: nuevo._id, duenoModel: 'Dueno' }));
      await Mascota.insertMany(docs);
    }

    res.status(201).json({ mensaje:'Dueño creado', dueno: nuevo });
  }catch(error){
    console.error('❌ Crear dueño:', error);
    res.status(500).json({ mensaje:'Error interno' });
  }
});

// Listar dueños: dueños manuales + usuarios comunes, con sus mascotas
router.get(
  '/',
  autenticarToken,
  verificarRol('adminPrincipal', 'adminSecundario'),
  async (req, res) => {
    try {
      // 1️⃣ Dueños manuales
      const duenosManual = await Dueno.find().lean();

      // 2️⃣ Mascotas de dueños manuales
      const mascotas = await Mascota.find().lean();
      const mapMascotas = mascotas.reduce((acc, m) => {
        const id = m.dueno.toString();
        (acc[id] ||= []).push(m); // guardamos el objeto completo
        return acc;
      }, {});

      const duenosConMascotas = duenosManual.map(d => ({
        ...d,
        mascotas: mapMascotas[d._id.toString()] || []
      }));

      // 3️⃣ Usuarios tipo 'usuario'
      const usuarios = await Usuario.find({ rol: 'usuario' }).lean();

      // 4️⃣ Mascotas de usuarios
      const mascotasUsuarios = mascotas.filter(m =>
        usuarios.some(u => u._id.toString() === m.dueno.toString())
      );
      const mapMascotasUsuarios = mascotasUsuarios.reduce((acc, m) => {
        const id = m.dueno.toString();
        (acc[id] ||= []).push(m);
        return acc;
      }, {});

      const usuariosComoDuenos = usuarios.map(u => ({
        _id: u._id,
        nombres: u.nombres,
        apellidos: u.apellidos,
        dni: u.dni || '',
        email: u.email,
        telefono: u.telefono || '',
        direccion: u.direccion || '',
        mascotas: mapMascotasUsuarios[u._id.toString()] || []
      }));

      // 5️⃣ Unir todo
      const resultado = [...duenosConMascotas, ...usuariosComoDuenos];

      res.json(resultado);
    } catch (error) {
      console.error('❌ Obtener dueños:', error);
      res.status(500).json({ mensaje: 'Error interno' });
    }
  }
);


// Actualizar dueño + mascotas
router.put('/:id', autenticarToken, verificarRol('adminPrincipal','adminSecundario'), validarDueno, async (req,res)=>{
  try{
    const { mascotas, ...datos } = req.body;
    const dueno = await Dueno.findByIdAndUpdate(req.params.id, datos, { new:true });
    if(!dueno) return res.status(404).json({ mensaje:'Dueño no encontrado' });

    await Mascota.deleteMany({ dueno: dueno._id, duenoModel:'Dueno' });
    if(Array.isArray(mascotas) && mascotas.length){
      const docs = mascotas.map(m => ({ ...m, dueno: dueno._id, duenoModel:'Dueno' }));
      await Mascota.insertMany(docs);
    }

    res.json({ mensaje:'Dueño actualizado', dueno });
  }catch(error){
    console.error('❌ Actualizar dueño:', error);
    res.status(500).json({ mensaje:'Error interno' });
  }
});

// Eliminar dueño + mascotas
router.delete('/:id', autenticarToken, verificarRol('adminPrincipal','adminSecundario'), async (req,res)=>{
  try{
    const dueno = await Dueno.findByIdAndDelete(req.params.id);
    if(!dueno) return res.status(404).json({ mensaje:'Dueño no encontrado' });

    await Mascota.deleteMany({ dueno: dueno._id, duenoModel:'Dueno' });
    res.json({ mensaje:'Dueño eliminado' });
  }catch(error){
    console.error('❌ Eliminar dueño:', error);
    res.status(500).json({ mensaje:'Error interno' });
  }
});

module.exports = router;
