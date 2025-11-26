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

// 👉 Crear nuevo turno o bloquear horario (MODIFICADO)
router.post('/', autenticarToken, async (req, res) => {
  try {
    // 1. Obtenemos datos del body y del usuario autenticado
    let { fecha, hora, mascota, dueno, bloqueado, nombreCliente } = req.body;
    const { rol, id: usuarioId } = req.usuario;

    // 2. Validación de campos básicos
    if (!fecha || !hora) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios (fecha y hora)' });
    }

    // ==================================================================
    // 🔒 BLINDAJE DE ROLES (Seguridad Backend)
    // ==================================================================
    if (rol === 'usuario') {
      // Si es Usuario: LE IMPONEMOS SUS DATOS
      dueno = usuarioId;      // El dueño es EL MISMO, no puede asignar a otro
      bloqueado = false;      // No puede bloquear horarios
      nombreCliente = null;   // No puede poner nombres a mano
      
      // El usuario OBLIGATORIAMENTE debe mandar mascota
      if (!mascota) {
        return res.status(400).json({ mensaje: 'Debes seleccionar una mascota' });
      }
    } 
    
    // Si es Admin: Permitimos que 'dueno', 'mascota' y 'bloqueado' vengan del body
    // Pero validamos que al menos haya mascota O bloqueo
    if (rol !== 'usuario' && !mascota && !bloqueado) {
       return res.status(400).json({ mensaje: 'Debes indicar una mascota o bloquear el turno' });
    }

    // ==================================================================
    // 🛡️ CORRECCIÓN DE FECHA (Estrategia del Mediodía)
    // ==================================================================
    // Convertimos la fecha recibida y la forzamos a las 12:00 PM UTC
    // Esto evita el error de "un día antes" por la diferencia horaria
    const fechaProcesada = new Date(fecha);
    fechaProcesada.setUTCHours(12, 0, 0, 0);

    // ==================================================================
    // 🛑 VALIDACIÓN DE DISPONIBILIDAD
    // ==================================================================
    // Definimos el rango del día usando la fecha ya corregida
    const inicioDia = new Date(fechaProcesada); inicioDia.setHours(0,0,0,0);
    const finDia = new Date(fechaProcesada); finDia.setHours(23,59,59,999);

    const turnoExistente = await Turno.findOne({
      fecha: { $gte: inicioDia, $lte: finDia }, 
      hora: hora 
    });

    if (turnoExistente) {
      return res.status(409).json({ mensaje: '⚠️ Ese turno ya fue reservado.' });
    }

    // ✅ CREAR TURNO
    const nuevoTurno = new Turno({
      fecha: fechaProcesada, // Usamos la fecha corregida
      hora,
      mascota: bloqueado ? null : mascota,
      dueno: dueno, // Usamos el dueño seguro
      bloqueado: bloqueado || false,
      nombreCliente: nombreCliente || null
    });

    await nuevoTurno.save();
    res.status(201).json(nuevoTurno);

  } catch (err) {
    console.error('Error creando turno:', err);
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
