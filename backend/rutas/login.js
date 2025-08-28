const express = require('express');
const router = express.Router();
const Usuario = require('../modelos/usuario');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    const usuarioPlano = {
      _id: usuario._id,
      email: usuario.email,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      rol: usuario.rol
    };

    res.json({ token, usuario: usuarioPlano });
  } catch (error) {
    console.error('❌ Error login:', error);
    res.status(500).json({ mensaje: 'Error interno' });
  }
});

module.exports = router;
