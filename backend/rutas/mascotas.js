// rutas/mascotas.js
const express = require('express');
const router = express.Router();
const Mascota = require('../modelos/mascota');
const autenticarToken = require('../middlewares/autorizaciones');

// Crear Mascota
router.post('/', autenticarToken, async (req, res) => {
  try {
    // Sacamos los datos del body
    const { nombre, edad, raza, peso, enfermedades, observaciones, dueno, duenoModel } = req.body;
    const { rol, id: usuarioId } = req.usuario;

    let idFinalDueno;
    let tipoFinalDueno;

    // LÓGICA DE ASIGNACIÓN DE DUEÑO
    if (rol === 'usuario') {
      // Si soy usuario, la mascota es MÍA sí o sí
      idFinalDueno = usuarioId;
      tipoFinalDueno = 'Usuario';
    } else {
      // Si soy admin, uso el dueño que me mandaron en el formulario
      idFinalDueno = dueno;
      // Si no me mandaron modelo, asumo que es un dueño offline ('Dueno')
      tipoFinalDueno = duenoModel || 'Dueno'; 
    }

    const nuevaMascota = new Mascota({
      nombre,
      edad,
      raza,
      peso,
      enfermedades,
      observaciones,
      dueno: idFinalDueno,
      tipoDueno: tipoFinalDueno // Esto es clave para el polimorfismo
    });

    await nuevaMascota.save();
    res.status(201).json(nuevaMascota);

  } catch (error) {
    console.error('Error creando mascota:', error);
    res.status(500).json({ mensaje: 'Error al guardar la mascota' });
  }
});

// Obtener mascotas (con filtro inteligente)
router.get('/', autenticarToken, async (req, res) => {
  try {
    const { rol, id: usuarioId } = req.usuario;

    let consulta = {};

    if (rol === 'usuario') {
      // El usuario solo ve SUS mascotas
      consulta = { dueno: usuarioId, tipoDueno: 'Usuario' };
    } 
    // El admin ve TODAS (consulta vacía)

    const mascotas = await Mascota.find(consulta)
      .populate('dueno', 'nombres apellidos email'); // Trae datos del dueño para mostrar en tabla

    res.json(mascotas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error obteniendo mascotas' });
  }
});

// Obtener mascotas de un dueño específico (Para el Admin Panel)
router.get('/dueno/:id', autenticarToken, async (req, res) => {
    try {
        const mascotas = await Mascota.find({ dueno: req.params.id });
        res.json(mascotas);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error' });
    }
});

// Actualizar Mascota
router.put('/:id', autenticarToken, async (req, res) => {
    try {
        await Mascota.findByIdAndUpdate(req.params.id, req.body);
        res.json({ mensaje: 'Actualizado' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar' });
    }
});

// Eliminar Mascota
router.delete('/:id', autenticarToken, async (req, res) => {
    try {
        await Mascota.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Eliminado' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar' });
    }
});

module.exports = router;