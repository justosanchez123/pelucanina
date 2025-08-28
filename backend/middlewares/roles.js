function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    const rol = req.usuario?.rol;
    if (!rol) return res.status(401).json({ mensaje: 'No autenticado' });
    if (!rolesPermitidos.includes(rol)) {
      return res.status(403).json({ mensaje: 'Acceso denegado. Rol no autorizado.' });
    }
    next();
  };
}

module.exports = verificarRol;
