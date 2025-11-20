const Mascota = require('../modelos/mascota');
const Usuario = require('../modelos/usuario');
const Dueno = require('../modelos/dueno');

exports.crearMascota = async (req, res) => {
  try {
    const { nombre, edad, raza, peso, enfermedades, observaciones, duenoId, tipoDueno } = req.body;
    // tipoDueno debe ser "Usuario" o "Dueno"
    if (!['Usuario','Dueno'].includes(tipoDueno)) return res.status(400).json({ mensaje: 'tipoDueno inválido' });

    // Validar existencia del dueno
    if (tipoDueno === 'Usuario') {
      const u = await Usuario.findById(duenoId);
      if (!u) return res.status(404).json({ mensaje: 'Usuario (dueño) no encontrado' });
    } else {
      const d = await Dueno.findById(duenoId);
      if (!d) return res.status(404).json({ mensaje: 'Dueno externo no encontrado' });
    }

    const m = new Mascota({
      nombre, edad, raza, peso, enfermedades, observaciones,
      dueno: duenoId,
      tipoDueno
    });

    await m.save();
    return res.status(201).json(m);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error servidor' });
  }
};

exports.listarPorUsuario = async (req, res) => {
  try {
    // si viene usuario autenticado, listar sus mascotas (tipoDueno Usuario)
    const userId = req.usuario?.id;
    if (!userId) return res.status(401).json({ mensaje: 'No autenticado' });

    const mascotas = await Mascota.find({ tipoDueno: 'Usuario', dueno: userId });
    return res.json(mascotas);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensaje: 'Error servidor' });
  }
};
