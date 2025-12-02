const express = require('express');
const router = express.Router();
const Usuario = require('../modelos/usuario');
const Dueno = require('../modelos/dueno'); // Importante para crear perfil
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');

// TU CLIENT ID DE GOOGLE
const GOOGLE_CLIENT_ID = "1025771746986-gn7qttmc9pef2i5bf8tcamuf2phnvu14.apps.googleusercontent.com"; 
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// 1. LOGIN NORMAL
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
    console.error('Error login:', error);
    res.status(500).json({ mensaje: 'Error interno' });
  }
});

// 2. LOGIN GOOGLE (NUEVO)
router.post('/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID, 
    });
    
    const { email, given_name, family_name } = ticket.getPayload();

    let usuario = await Usuario.findOne({ email });

    if (!usuario) {
        // Registro automático si no existe
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        usuario = new Usuario({
            nombres: given_name,
            apellidos: family_name || "",
            email,
            password: hashedPassword,
            rol: 'usuario', 
        });
        await usuario.save();

        // Crear perfil de Dueño automáticamente
        const nuevoDueno = new Dueno({
            nombres: given_name,
            apellidos: family_name || "",
            email,
            usuarioId: usuario._id 
        });
        await nuevoDueno.save();
    }

    const nuestroToken = jwt.sign(
        { id: usuario._id, email: usuario.email, rol: usuario.rol },
        process.env.JWT_SECRET,
        { expiresIn: '4h' }
    );

    res.json({ 
        mensaje: 'Login con Google exitoso',
        token: nuestroToken,
        usuario: {
            _id: usuario._id,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            email: usuario.email,
            rol: usuario.rol
        }
    });

  } catch (error) {
    console.error("Error Google Backend:", error);
    res.status(400).json({ mensaje: 'Error al autenticar con Google' });
  }
});

module.exports = router;