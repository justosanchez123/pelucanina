function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    const rol = req.usuario?.rol;
    console.log("🔍 verificarRol | usuario:", req.usuario, "rolesPermitidos:", rolesPermitidos);

    if (!rol) return res.status(401).json({ mensaje: 'No autenticado' });

    // adminPrincipal siempre tiene acceso
    if (rol === 'adminPrincipal') {
      console.log("✅ acceso total para adminPrincipal");
      return next();
    }

    if (rol === 'adminSecundario' && rolesPermitidos.includes('adminSecundario')) {
      console.log("✅ acceso para adminSecundario");
      return next();
    }

    if (rolesPermitidos.includes(rol)) {
      console.log("✅ acceso permitido:", rol);
      return next();
    }

    console.log("⛔ acceso denegado. Rol:", rol);
    return res.status(403).json({ mensaje: 'Acceso denegado. Rol no autorizado.' });
  };
}

module.exports = verificarRol;
