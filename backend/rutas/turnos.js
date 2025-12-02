const express = require('express');
const router = express.Router();
const Turno = require('../modelos/turno');
const autenticarToken = require('../middlewares/autorizaciones');

// 🟨 Feriados fijos (formato DD-MM-YYYY)
const diasFeriados = [
  '01-01-2025', '24-03-2025', '02-04-2025', '01-05-2025', '09-07-2025', '25-12-2025'
];

// Helper para formatear fecha de Date a "DD-MM-YYYY"
const formatearFechaString = (dateObj) => {
    const dd = String(dateObj.getUTCDate()).padStart(2, '0');
    const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getUTCFullYear();
    return `${dd}-${mm}-${yyyy}`;
};

// Helper: Obtener fecha y hora actual de Argentina 🇦🇷
const getTiempoArgentina = () => {
    const now = new Date();
    // Convertimos la hora UTC del servidor a la hora de Buenos Aires
    const options = { timeZone: "America/Argentina/Buenos_Aires", year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false };
    const formatter = new Intl.DateTimeFormat('es-AR', options);
    
    // Obtenemos las partes
    const parts = formatter.formatToParts(now);
    const getPart = (type) => parts.find(p => p.type === type).value;
    
    const diaArg = getPart('day');
    const mesArg = getPart('month');
    const anioArg = getPart('year');
    const horaArg = parseInt(getPart('hour'), 10);

    return {
        fechaString: `${diaArg}-${mesArg}-${anioArg}`, // "02-12-2025"
        hora: horaArg // Número entero (ej: 12)
    };
};

router.get('/feriados', autenticarToken, (req, res) => {
  res.json({ feriados: diasFeriados });
});

// 🟢 1. OBTENER HORARIOS DISPONIBLES (Con regla de 3 horas)
router.get('/disponibles', autenticarToken, async (req, res) => {
  try {
    const { fecha } = req.query; // DD-MM-YYYY
    if (!fecha) return res.status(400).json({ mensaje: 'Fecha requerida' });

    // 1. Validar Feriados
    if (diasFeriados.includes(fecha)) return res.json([]);

    // 2. Validar Domingos
    const [dd, mm, yyyy] = fecha.split('-');
    const fechaBusqueda = new Date(Date.UTC(yyyy, mm - 1, dd, 12, 0, 0));
    if (fechaBusqueda.getUTCDay() === 0) return res.json([]);

    // 3. Buscar ocupados
    const turnosOcupados = await Turno.find({ 
        fecha: fechaBusqueda,
        estado: { $ne: 'cancelado' } 
    });

    const todosHorarios = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17'];
    const horasOcupadas = turnosOcupados.map(t => t.hora);
    
    // Filtro 1: Disponibilidad básica
    let disponibles = todosHorarios.filter(h => !horasOcupadas.includes(h));

    // 🛑 FILTRO 2: REGLA DE LAS 3 HORAS (Día Actual)
    const tiempoArg = getTiempoArgentina();
    
    // Si la fecha solicitada es HOY (en Argentina)
    if (fecha === tiempoArg.fechaString) {
        // Filtramos horarios que no cumplan con el margen de 3 horas
        // Ejemplo: Si son las 12, horaLimite = 15. Solo pasan las >= 15.
        const horaLimite = tiempoArg.hora + 3;
        
        disponibles = disponibles.filter(h => parseInt(h, 10) >= horaLimite);
    } 
    // Nota: Si la fecha ya pasó (ayer), técnicamente este endpoint debería devolver vacío,
    // pero el DatePicker del front ya bloquea días pasados.

    res.json(disponibles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al buscar horarios' });
  }
});

// 🟢 2. CREAR TURNO (Con validación de 3 horas)
router.post('/', autenticarToken, async (req, res) => {
  try {
    let { fecha, hora, mascota, dueno, bloqueado } = req.body;
    const { rol, id: usuarioId } = req.usuario;

    if (!fecha || !hora) return res.status(400).json({ mensaje: 'Faltan datos' });

    if (rol === 'usuario') {
      dueno = usuarioId;
      bloqueado = false;
      if (!mascota) return res.status(400).json({ mensaje: 'Selecciona una mascota' });
    } else if (rol !== 'usuario' && !mascota && !bloqueado) {
       return res.status(400).json({ mensaje: 'Faltan datos' });
    }

    // Fecha UTC Mediodía
    const fechaObj = new Date(fecha); 
    const fechaGuardar = new Date(Date.UTC(fechaObj.getUTCFullYear(), fechaObj.getUTCMonth(), fechaObj.getUTCDate(), 12, 0, 0));

    // Validaciones Fecha (Domingo/Feriado)
    if (fechaGuardar.getUTCDay() === 0) return res.status(400).json({ mensaje: 'Cerrado los domingos.' });
    const fechaString = formatearFechaString(fechaGuardar);
    if (diasFeriados.includes(fechaString)) return res.status(400).json({ mensaje: 'Es feriado.' });

    // 🛑 VALIDACIÓN DE SEGURIDAD: REGLA DE 3 HORAS (Solo para usuarios)
    // Los admins a veces necesitan agendar de urgencia, pero si quieres restringirlos también, quita el if.
    if (rol === 'usuario') {
        const tiempoArg = getTiempoArgentina();
        
        if (fechaString === tiempoArg.fechaString) {
            const horaSolicitada = parseInt(hora, 10);
            const horaActual = tiempoArg.hora;
            
            if (horaSolicitada < (horaActual + 3)) {
                return res.status(400).json({ mensaje: 'Debes reservar con al menos 3 horas de anticipación.' });
            }
        }
    }

    // Validación Disponibilidad
    const ocupado = await Turno.findOne({ 
        fecha: fechaGuardar, 
        hora: hora,
        estado: { $ne: 'cancelado' } 
    });
    
    if (ocupado) return res.status(409).json({ mensaje: 'Turno ya reservado.' });

    // Guardar
    const nuevoTurno = new Turno({
      fecha: fechaGuardar,
      hora,
      mascota: bloqueado ? null : mascota,
      dueno,
      bloqueado: bloqueado || false
    });

    await nuevoTurno.save();
    res.status(201).json(nuevoTurno);

  } catch (error) {
    console.error(error);
    if (error.code === 11000) return res.status(409).json({ mensaje: 'Turno ocupado.' });
    res.status(500).json({ mensaje: 'Error al reservar' });
  }
});

// 🟢 3. Historial Dueño
router.get('/dueno/:id', autenticarToken, async (req, res) => {
  try {
    const turnos = await Turno.find({ dueno: req.params.id })
      .populate('mascota', 'nombre raza')
      .sort({ fecha: -1 }); 
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error historial' });
  }
});

// 🟢 4. Admin Todos
router.get('/', autenticarToken, async (req, res) => {
  try {
    if (!req.usuario.rol.includes('admin')) return res.status(403).json({ mensaje: 'Acceso denegado' });

    const turnos = await Turno.find()
      .populate('dueno', 'nombres apellidos email telefono')
      .populate('mascota', 'nombre')
      .sort({ fecha: -1 });
      
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error agenda' });
  }
});

// 🟢 5. Eliminar
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    await Turno.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error eliminar' });
  }
});

module.exports = router;