const Dueno = require('../modelos/Dueno');

// 📌 CREAR DUEÑO (solo desde el panel del admin)
const crearDueno = async (req, res) => {
  try {
    const { nombres, apellidos, dni, telefono, direccion, email } = req.body;

    // Evitar duplicados
    const existingDueno = await Dueno.findOne({ email });
    if (existingDueno) {
      return res.status(400).json({ message: 'Ya existe un dueño con ese email' });
    }

    const nuevoDueno = new Dueno({
      nombres,
      apellidos,
      dni,
      telefono,
      direccion,
      email,
    });

    await nuevoDueno.save();

    res.status(201).json({
      message: 'Dueño registrado correctamente',
      dueno: nuevoDueno,
    });
  } catch (error) {
    console.error('Error al crear dueño:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { crearDueno };
