// rutas/turnos.js
const express = require('express');
const router = express.Router();
const Turno = require('../modelos/turno');
const autenticarToken = require('../middlewares/autorizaciones');

// 🟢 1. Obtener horarios disponibles para una fecha (Front lo llama al cambiar el calendario)
router.get('/disponibles', autenticarToken, async (req, res) => {
  try {
    const { fecha } = req.query; // Esperamos formato DD-MM-YYYY
    if (!fecha) return res.status(400).json({ mensaje: 'Fecha requerida' });

    // Convertir DD-MM-YYYY a objeto Date
    const [dd, mm, yyyy] = fecha.split('-');
    
    // ESTRATEGIA MEDIODÍA: Creamos la fecha a las 12:00 PM UTC
    const fechaBusqueda = new Date(Date.UTC(yyyy, mm - 1, dd, 12, 0, 0));

    // Buscamos todos los turnos ocupados ese día exacto
    const turnosOcupados = await Turno.find({ fecha: fechaBusqueda });

    // Lista de horarios que trabaja la peluquería
    const todosHorarios = ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17'];
    
    // Extraemos las horas que ya tienen turno
    const horasOcupadas = turnosOcupados.map(t => t.hora);

    // Filtramos: Dejamos solo los que NO están ocupados
    const disponibles = todosHorarios.filter(h => !horasOcupadas.includes(h));

    res.json(disponibles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al buscar horarios' });
  }
});

// 🟢 2. Crear Turno (Reservar)
router.post('/', autenticarToken, async (req, res) => {
  try {
    let { fecha, hora, mascota, dueno, bloqueado } = req.body;
    const { rol, id: usuarioId } = req.usuario;

    // Validación básica
    if (!fecha || !hora) return res.status(400).json({ mensaje: 'Fecha y hora obligatorias' });

    // Si es usuario normal, forzamos que el dueño sea él mismo
    if (rol === 'usuario') {
      dueno = usuarioId;
      bloqueado = false;
    }

    // PROCESAMIENTO DE FECHA (Igual que arriba)
    // fecha viene YYYY-MM-DD del input type="date"
    const fechaObj = new Date(fecha); 
    // Forzamos a UTC 12:00 para que coincida con la búsqueda
    const fechaGuardar = new Date(Date.UTC(fechaObj.getUTCFullYear(), fechaObj.getUTCMonth(), fechaObj.getUTCDate(), 12, 0, 0));

    // VALIDACIÓN DE DISPONIBILIDAD (Doble chequeo)
    const ocupado = await Turno.findOne({ fecha: fechaGuardar, hora: hora });
    if (ocupado) {
      return res.status(409).json({ mensaje: '¡Lo sentimos! Ese horario ya fue reservado.' });
    }

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
    // Si falla el índice unique de Mongo (por si dos clickearon al mismo milisegundo)
    if (error.code === 11000) {
        return res.status(409).json({ mensaje: 'Ese horario ya está ocupado.' });
    }
    res.status(500).json({ mensaje: 'Error interno al reservar' });
  }
});

// 🟢 3. Obtener turnos de un dueño específico (Historial)
router.get('/dueno/:id', autenticarToken, async (req, res) => {
  try {
    const turnos = await Turno.find({ dueno: req.params.id })
      .populate('mascota', 'nombre raza') // Traemos datos lindos de la mascota
      .sort({ fecha: -1 }); // Ordenamos del más reciente al más viejo
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error obteniendo historial' });
  }
});

// 🟢 4. Obtener TODOS los turnos (Para el Admin)
router.get('/', autenticarToken, async (req, res) => {
  try {
    // Solo admins
    if (!req.usuario.rol.includes('admin')) {
        return res.status(403).json({ mensaje: 'Acceso denegado' });
    }

    const turnos = await Turno.find()
      .populate('dueno', 'nombres apellidos email telefono')
      .populate('mascota', 'nombre')
      .sort({ fecha: -1 });
      
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error cargando agenda' });
  }
});

// 🟢 5. Eliminar/Cancelar Turno
router.delete('/:id', autenticarToken, async (req, res) => {
  try {
    await Turno.findByIdAndDelete(req.params.id);
    res.json({ mensaje: 'Turno eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error eliminando turno' });
  }
});

module.exports = router;
