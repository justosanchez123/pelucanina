// ruta/usuarios.js
const express = require("express");
const router = express.Router();
const Usuario = require("../modelos/usuario"); // asegúrate de tener el modelo Usuario

// GET /api/usuarios -> devuelve todos los usuarios
router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, "nombres email"); // trae solo los campos necesarios
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
});

module.exports = router;
