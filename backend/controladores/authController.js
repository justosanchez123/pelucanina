const Usuario = require('../modelos/usuario');
const bcrypt = require('bcryptjs');

// 📌 REGISTRO DE USUARIO (desde el frontend del cliente)
const register = async (req, res) => {
  try {
    const { email, password, nombres, apellidos, dni, direccion, telefono } = req.body;

    // 1️⃣ Verificar si ya existe el email
    const existingUser = await Usuario.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // 2️⃣ Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Crear nuevo usuario
    const newUser = new Usuario({
      email,
      password: hashedPassword,
      nombres,
      apellidos,
      dni,
      direccion,
      telefono,
      rol: 'usuario', // Rol por defecto
    });

    await newUser.save();

    // ⚠️ No crear registro en "duenos" aquí
    // Solo el admin debe crear dueños desde su panel

    res.status(201).json({
      message: 'Usuario registrado con éxito',
      usuario: {
        _id: newUser._id,
        email: newUser.email,
        nombres: newUser.nombres,
        apellidos: newUser.apellidos,
        rol: newUser.rol,
      },
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { register };
