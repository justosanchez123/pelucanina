const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Usuario = require('../modelos/usuario');
// ❌ No necesitamos Dueno acá
// const Dueno = require('../modelos/dueno');

router.post('/', async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      dni,
      direccion,
      telefono,
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Faltan email o password' });
    }

    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(409).json({ success: false, message: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      email,
      password: hash,
      nombres,
      apellidos,
      dni,
      direccion,
      telefono,
      rol: 'usuario'
    });

    await nuevoUsuario.save();

    // ✅ No se crea ningún documento en "duenos" aquí
    res.status(201).json({ success: true, message: 'Usuario creado con éxito' });

  } catch (err) {
    console.error('❌ Error en registro:', err);
    res.status(500).json({ success: false, message: 'Error al registrar usuario' });
  }
});

module.exports = router;
