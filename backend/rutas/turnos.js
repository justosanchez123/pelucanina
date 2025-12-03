const express = require('express');
const router = express.Router();
const Turno = require('../modelos/turno');
const autenticarToken = require('../middlewares/autorizaciones');

const diasFeriados = [
  '01-01-2025', '24-03-2025', '02-04-2025', '01-05-2025', '09-07-2025', '25-12-2025'
];

const formatearFechaString = (dateObj) => {
    const dd = String(dateObj.getUTCDate()).padStart(2, '0');
    const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getUTCFullYear();
    return `${dd}-${mm}-${yyyy}`;
};

// Cálculo seguro de hora Argentina (UTC-3)
const getTiempoArgentina = () => {
    const now = new Date();
    const offsetArgentina = -3; 
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const fechaArg = new Date(utc + (3600000 * offsetArgentina));

    const dd = String(fechaArg.getDate()).padStart(2, '0');
    const mm = String(fechaArg.getMonth() + 1).padStart(2, '0');
    const yyyy = fechaArg.getFullYear();
    const hora = fechaArg.getHours(); 

    return {
        fechaString: `${dd}-${mm}-${yyyy}`,
        hora: hora
    };
};

router.get('/feriados', autenticarToken, (req, res) => {
  res.json({ feriados: diasFeriados });
});

// 1. Disponibles
router.get('/disponibles', autenticarToken, async (req, res) => {
  try {
    const { fecha } = req.query; // DD-MM-YYYY
    if (!fecha) return res.status(400).json({ mensaje: 'Fecha requerida' });

    if (diasFeriados.includes(fecha)) return res.json([]);

    const [dd, mm, yyyy] = fecha.split('-');
    const fechaBusqueda = new Date(Date.UTC(yyyy, mm - 1, dd, 12, 0, 0));
    if (fechaBusqueda.getUTCDay() === 0) return res.json([]);

    const turnosOcupados = await Turno.find({ fecha: fechaBusqueda, estado: { $ne: 'cancelado' } });
    const todosHorarios = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17'];
    const horasOcupadas = turnosOcupados.map(t => t.hora);
    
    let disponibles = todosHorarios.filter(h => !horasOcupadas.includes(h));

    // Regla 3 horas
    const tiempoArg = getTiempoArgentina();
    if (fecha === tiempoArg.fechaString) {
        const horaLimite = tiempoArg.hora + 3;
        disponibles = disponibles.filter(h => parseInt(h, 10) >= horaLimite);
    } 

    res.json(disponibles);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al buscar horarios' });
  }
});

// 2. Crear Turno
router.post('/', autenticarToken, async (req, res) => {
  try {
    let { fecha, hora, mascota, dueno, bloqueado, nombreCliente } = req.body;
    const { rol, id: usuarioId } = req.usuario;

    if (!fecha || !hora) return res.status(400).json({ mensaje: 'Faltan datos' });

    if (rol === 'usuario') {
      dueno = usuarioId;
      bloqueado = false;
      if (!mascota) return res.status(400).json({ mensaje: 'Selecciona mascota' });
    }

    const fechaObj = new Date(fecha); 
    const fechaGuardar = new Date(Date.UTC(fechaObj.getUTCFullYear(), fechaObj.getUTCMonth(), fechaObj.getUTCDate(), 12, 0, 0));

    if (fechaGuardar.getUTCDay() === 0) return res.status(400).json({ mensaje: 'Domingo cerrado.' });
    const fechaString = formatearFechaString(fechaGuardar);
    if (diasFeriados.includes(fechaString)) return res.status(400).json({ mensaje: 'Es feriado.' });

    // Validar regla 3 horas (solo usuarios)
    if (rol === 'usuario') {
        const tiempoArg = getTiempoArgentina();
        if (fechaString === tiempoArg.fechaString) {
            if (parseInt(hora, 10) < (tiempoArg.hora + 3)) {
                return res.status(400).json({ mensaje: 'Se requiere 3hs de anticipación.' });
            }
        }
    }

    const ocupado = await Turno.findOne({ fecha: fechaGuardar, hora: hora, estado: { $ne: 'cancelado' } });
    if (ocupado) return res.status(409).json({ mensaje: 'Horario ocupado.' });

    const nuevoTurno = new Turno({
      fecha: fechaGuardar,
      hora,
      mascota: bloqueado ? null : mascota,
      dueno,
      bloqueado: bloqueado || false,
      nombreCliente: nombreCliente || null
    });

    await nuevoTurno.save();
    res.status(201).json(nuevoTurno);

  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ mensaje: 'Turno ya existe.' });
    res.status(500).json({ mensaje: 'Error al reservar' });
  }
});

// 3. Historial por dueño
router.get('/dueno/:id', autenticarToken, async (req, res) => {
  try {
    const turnos = await Turno.find({ dueno: req.params.id })
      .populate('mascota', 'nombre raza')
      .sort({ fecha: -1 }); 
    res.json(turnos);
  } catch (error) { res.status(500).json({ mensaje: 'Error historial' }); }
});

// 4. Admin Todos
router.get('/', autenticarToken, async (req, res) => {
  try {
    if (!req.usuario.rol.includes('admin')) return res.status(403).json({ mensaje: 'Acceso denegado' });
    const turnos = await Turno.find()
      .populate('dueno', 'nombres apellidos email')
      .populate('mascota', 'nombre')
      .sort({ fecha: -1 });
    res.json(turnos);
  } catch (error) { res.status(500).json({ mensaje: 'Error agenda' }); }
});

// 5. Eliminar
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    await Turno.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Eliminado' });
  } catch (error) { res.status(500).json({ mensaje: 'Error' }); }
});

module.exports = router;