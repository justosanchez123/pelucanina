const express = require('express');
const router = express.Router();
const Turno = require('../modelos/turno');
const Dueno = require('../modelos/dueno');
const Mascota = require('../modelos/mascota');
const Usuario = require('../modelos/usuario'); // 📌 Importamos Usuario para sincronizar
const autenticarToken = require('../middlewares/autorizaciones');

// 🟨 Feriados fijos (formato DD-MM-YYYY)
const diasFeriados = [
  '01-01-2025',
  '24-03-2025',
  '02-04-2025',
  '01-05-2025',
  '09-07-2025',
  '25-12-2025'
];

// 👉 Obtener lista de feriados (para bloquear en calendario del frontend)
router.get('/feriados', autenticarToken, (req, res) => {
  res.json({ feriados: diasFeriados });
});

// 🟩 Obtener todos los turnos con dueño y mascota
router.get('/', autenticarToken, async (req, res) => {
  try {
    const turnos = await Turno.find()
      .populate('dueno', 'nombre apellidos telefono')
      .populate('mascota', 'nombre');
    res.json(turnos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno al obtener turnos' });
  }
});

// 👉 Crear nuevo turno con validaciones y sincronización de dueño
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { fecha, hora, mascota, dueno, esUsuario } = req.body;

    if (!fecha || !hora || !mascota) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }

    // 🛑 Validar si ya hay un turno en ese horario
    const turnoExistente = await Turno.findOne({ fecha, hora });
    if (turnoExistente) {
      return res.status(409).json({ mensaje: 'Ya existe un turno en ese horario' });
    }

    // 🐾 Validar si la mascota ya tiene turno ese mismo día
    const turnoMascota = await Turno.findOne({ fecha, mascota });
    if (turnoMascota) {
      return res.status(409).json({ mensaje: 'La mascota ya tiene un turno ese día' });
    }

    let duenoId = dueno;

    // 📌 Si el turno lo está creando un usuario con cuenta, sincronizamos con Dueno
    if (esUsuario) {
      const usuario = await Usuario.findById(dueno);
      if (!usuario) {
        return res.status(404).json({ mensaje: 'Usuario no encontrado' });
      }

      // Buscar dueño por email
      let duenoExistente = await Dueno.findOne({ email: usuario.email });

      // Si no existe, lo creamos
      if (!duenoExistente) {
        const nuevoDueno = new Dueno({
          nombre: usuario.nombres,
          apellidos: usuario.apellidos,
          dni: usuario.dni,
          email: usuario.email,
          telefono: usuario.telefono,
          direccion: usuario.direccion
        });
        duenoExistente = await nuevoDueno.save();
      }

      duenoId = duenoExistente._id;
    }

    // ✅ Crear turno
    const nuevoTurno = new Turno({
      fecha,
      hora,
      mascota,
      dueno: duenoId
    });

    await nuevoTurno.save();
    res.status(201).json(nuevoTurno);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno al crear turno' });
  }
});

// 🟩 Actualizar turno
router.put('/:id', autenticarToken, async (req, res) => {
  try {
    const actualizado = await Turno.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!actualizado) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }
    res.json(actualizado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno al actualizar turno' });
  }
});

// 🟩 Eliminar turno
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    const eliminado = await Turno.findByIdAndDelete(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }
    res.json({ mensaje: 'Turno eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno al eliminar turno' });
  }
});

// 👉 Horarios disponibles
router.get('/disponibles', autenticarToken, async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return res.status(400).json({ mensaje: 'Fecha requerida (DD-MM-YYYY)' });
    }

    const regex = /^\d{2}-\d{2}-\d{4}$/;
    if (!regex.test(fecha)) {
      return res.status(400).json({ mensaje: 'Formato inválido. Usá DD-MM-YYYY' });
    }

    const [dd, mm, yyyy] = fecha.split('-');
    const inicio = new Date(yyyy, mm - 1, dd, 0, 0, 0);
    const fin = new Date(yyyy, mm - 1, dd, 23, 59, 59);

    const turnosDelDia = await Turno.find({
      fecha: { $gte: inicio, $lte: fin }
    });

    const horariosTomados = turnosDelDia.map(t => t.hora);

    const todosHoras = ['08','09','10','11','12','13','14','15','16','17'];
    const disponibles = todosHoras.filter(h => !horariosTomados.includes(h));

    return res.json(disponibles);
  } catch (err) {
    console.error('Error en disponibles:', err);
    return res.status(500).json([]);
  }
});

module.exports = router;
