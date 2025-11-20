const express = require('express');
const router = express.Router();
const Turno = require('../modelos/turno');
const Dueno = require('../modelos/dueno');
const Mascota = require('../modelos/mascota');
const Usuario = require('../modelos/usuario'); 
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

// 👉 Obtener lista de feriados
router.get('/feriados', autenticarToken, (req, res) => {
  res.json({ feriados: diasFeriados });
});

// 🟩 Obtener todos los turnos con dueño y mascota
router.get('/', autenticarToken, async (req, res) => {
  try {
    const turnos = await Turno.find()
      .populate('dueno', 'nombre apellidos telefono email')
      .populate('mascota', 'nombre raza');
    res.json(turnos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error interno al obtener turnos' });
  }
});

// 👉 Crear nuevo turno o bloquear horario
router.post('/', autenticarToken, async (req, res) => {
  try {
    const { fecha, hora, mascota, dueno, bloqueado, nombreCliente } = req.body;

    if (!fecha || !hora || (!mascota && !bloqueado)) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }

    // 🛑 VALIDACIÓN ROBUSTA: 
    // Buscamos si existe un turno ese día, en esa hora específica.
    // Convertimos la fecha entrante para buscar en el rango del día completo.
    const fechaBusqueda = new Date(fecha);
    
    // Definimos inicio y fin del día para evitar errores de milisegundos/zona horaria
    const inicioDia = new Date(fechaBusqueda); inicioDia.setHours(0,0,0,0);
    const finDia = new Date(fechaBusqueda); finDia.setHours(23,59,59,999);

    const turnoExistente = await Turno.findOne({
      fecha: { $gte: inicioDia, $lte: finDia }, // Busca en todo el día
      hora: hora // Y que coincida la hora exacta
    });

    if (turnoExistente) {
      // Código 409 significa "Conflicto" (Ya existe)
      return res.status(409).json({ mensaje: '⚠️ Ese turno ya fue reservado por otro cliente.' });
    }

    // ... (resto del código de creación igual) ...
    const nuevoTurno = new Turno({
      fecha: fecha, // Mongoose lo guardará bien
      hora,
      mascota: bloqueado ? null : mascota,
      dueno: dueno || req.usuario.id,
      bloqueado: bloqueado || false,
      nombreCliente: nombreCliente || null
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
    if (!actualizado) return res.status(404).json({ mensaje: 'Turno no encontrado' });
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
    if (!eliminado) return res.status(404).json({ mensaje: 'Turno no encontrado' });
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
    if (!fecha) return res.status(400).json({ mensaje: 'Fecha requerida (DD-MM-YYYY)' });

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

// Obtener turnos por dueño
router.get('/dueno/:id', autenticarToken, async (req, res) => {
  try {
    const { rol, id: userId } = req.usuario;
    const { id } = req.params;

    if (rol === 'usuario' && userId.toString() !== id.toString()) {
      return res.status(403).json({ mensaje: 'No puedes ver turnos de otro usuario' });
    }

    const turnos = await Turno.find({ dueno: id })
      .populate('mascota', 'nombre raza')
      .lean();

    res.json(turnos);
  } catch (err) {
    console.error('❌ Obtener turnos por dueño:', err);
    res.status(500).json({ mensaje: 'Error interno al obtener turnos' });
  }
});

module.exports = router;
