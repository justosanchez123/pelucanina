const jwt = require('jsonwebtoken');
const Usuario = require('../modelos/usuario');

async function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ mensaje: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    req.usuario = { id: usuario._id, email: usuario.email, rol: usuario.rol };
    next();
  } catch (err) {
    console.error('Error al verificar token:', err);
    return res.status(403).json({ mensaje: 'Token inválido o expirado' });
  }
}

module.exports = autenticarToken;
