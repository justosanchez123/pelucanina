const Turno = require('../modelos/turno');
const Mascota = require('../modelos/mascota');

exports.crearTurno = async (req, res) => {
  try {
    const { fecha, duracionMin, mascotaId, notas } = req.body;
    const usuarioId = req.usuario?.id; // desde autenticarToken

    // Validar mascota y pertenencia: si el usuario es rol usuario, solo puede reservar para sus mascotas
    const mascota = await Mascota.findById(mascotaId);
    if (!mascota) return res.status(404).json({ mensaje: 'Mascota no encontrada' });

    // Si el usuario no es admin, validar que mascota.dueno === usuarioId (si tipoDueno === 'Usuario')
    if (req.usuario.rol === 'usuario') {
      if (mascota.tipoDueno !== 'Usuario' || String(mascota.dueno) !== String(usuarioId)) {
        return res.status(403).json({ mensaje: 'No permitido: la mascota no es tuya' });
      }
    }

    // (Opcional) Validación de solapamientos: evitar que la misma mascota tenga 2 turnos en la misma fecha/hora
    const fechaObj = new Date(fecha);
    const existe = await Turno.findOne({ mascota: mascotaId, fecha: fechaObj, estado: { $ne: 'cancelado' } });
    if (existe) return res.status(400).json({ mensaje: 'La mascota ya tiene un turno a esa hora' });

    const nuevo = new Turno({
      fecha: fechaObj,
      duracionMin: duracionMin || 60,
      mascota: mascotaId,
      creadoPor: usuarioId,
      notas
    });

    await nuevo.save();
    return res.status(201).json(nuevo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error servidor' });
  }
};

exports.listarTurnosUsuario = async (req, res) => {
  try {
    const userId = req.usuario?.id;
    if (!userId) return res.status(401).json({ mensaje: 'No autenticado' });

    // Buscar turnos de mascotas que pertenezcan al usuario o que el usuario haya creado
    const turnos = await Turno.find()
      .populate({
        path: 'mascota',
        match: { tipoDueno: 'Usuario', dueno: userId }
      })
      .exec();

    // Filtrar turnos cuyo populate no devolvió mascota (no son del usuario)
    const filtrados = turnos.filter(t => t.mascota != null);
    return res.json(filtrados);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error servidor' });
  }
};

exports.listarTodos = async (req, res) => {
  try {
    // admin
    const turnos = await Turno.find().populate('mascota').populate('creadoPor');
    return res.json(turnos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error servidor' });
  }
};

exports.cancelarTurno = async (req, res) => {
  try {
    const turnoId = req.params.id;
    const turno = await Turno.findById(turnoId);
    if (!turno) return res.status(404).json({ mensaje: 'Turno no encontrado' });

    // verificar permisos: admin o creador o dueño de la mascota
    const userId = req.usuario?.id;
    const mascota = await Mascota.findById(turno.mascota);
    const esDueno = mascota && mascota.tipoDueno === 'Usuario' && String(mascota.dueno) === String(userId);

    if (req.usuario.rol !== 'adminPrincipal' && String(turno.creadoPor) !== String(userId) && !esDueno) {
      return res.status(403).json({ mensaje: 'No autorizado' });
    }

    turno.estado = 'cancelado';
    await turno.save();
    return res.json({ mensaje: 'Turno cancelado', turno });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error servidor' });
  }
};
