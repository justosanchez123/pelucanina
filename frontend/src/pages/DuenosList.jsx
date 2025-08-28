import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Table, Button, Modal, Form, InputGroup } from "react-bootstrap";

import { useAuth } from "../context/AuthContext";

const DuenosList = () => {
  const { usuario } = useAuth();
  const [duenos, setDuenos] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [showAgregarDueno, setShowAgregarDueno] = useState(false);
  const [nuevoDueno, setNuevoDueno] = useState({
    nombres: "",
    apellidos: "",
    dni: "",
    email: "",
    telefono: "",
    direccion: "",
  });

  const [showEditarDueno, setShowEditarDueno] = useState(false);
  const [duenoEditar, setDuenoEditar] = useState(null);

  const [showAgregarMascota, setShowAgregarMascota] = useState(false);
  const [duenoSeleccionado, setDuenoSeleccionado] = useState(null);
  const [nuevaMascota, setNuevaMascota] = useState({
    nombre: "",
    edad: "",
    raza: "",
    peso: "",
    enfermedades: "",
    observaciones: "",
  });

  // Cargar dueños y mascotas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resDuenos = await api.get("/duenos");
        const resMascotas = await api.get("/mascotas");

        setDuenos(resDuenos.data);
        setMascotas(resMascotas.data);
      } catch (error) {
        console.error("❌ Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrado
  const duenosFiltrados = duenos.filter((d) => {
    if (!d) return false;
    const nombres = d.nombres || "";
    const apellidos = d.apellidos || "";
    const dni = d.dni || "";
    return (
      nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
      apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
      dni.includes(busqueda)
    );
  });

  // Agregar dueño
  const handleAgregarDueno = async () => {
    try {
      const res = await api.post("/duenos", nuevoDueno);
      setDuenos([...duenos, res.data.dueno]);
      setShowAgregarDueno(false);
      setNuevoDueno({
        nombres: "",
        apellidos: "",
        dni: "",
        email: "",
        telefono: "",
        direccion: "",
      });
    } catch (err) {
      console.error("❌ Error al guardar dueño:", err.response?.data || err);
    }
  };

  // Editar dueño
  const handleEditarDueno = async () => {
    try {
      const res = await api.put(`/duenos/${duenoEditar._id}`, duenoEditar);
      setDuenos(
        duenos.map((d) => (d._id === duenoEditar._id ? res.data.dueno : d))
      );
      setShowEditarDueno(false);
      setDuenoEditar(null);
    } catch (err) {
      console.error("❌ Error al editar dueño:", err.response?.data || err);
    }
  };

  // Eliminar dueño
  const handleEliminarDueno = async (id) => {
    if (!window.confirm("¿Eliminar dueño?")) return;
    try {
      await api.delete(`/duenos/${id}`);
      setDuenos(duenos.filter((d) => d._id !== id));
    } catch (err) {
      console.error("❌ Error al eliminar dueño:", err.response?.data || err);
    }
  };

  // Agregar mascota a dueño o usuario
  const handleAgregarMascota = async () => {
    try {
      await api.post("/mascotas", {
        ...nuevaMascota,
        dueno: duenoSeleccionado._id,
      });
      setShowAgregarMascota(false);
      setNuevaMascota({
        nombre: "",
        edad: "",
        raza: "",
        peso: "",
        enfermedades: "",
        observaciones: "",
      });
      // Recargar mascotas
      const res = await api.get("/mascotas");
      setMascotas(res.data);
    } catch (err) {
      console.error("❌ Error al agregar mascota:", err.response?.data || err);
    }
  };

  return (
    <div className="container mt-5">
      <h2>Dueños</h2>
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Buscar por nombre, apellido o DNI"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </InputGroup>

      <Button
        className="mb-3"
        onClick={() => setShowAgregarDueno(true)}
      >
        Agregar Dueño
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>DNI</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Mascotas</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {duenosFiltrados.map((d) => (
            <tr key={d._id}>
              <td>{d.nombres}</td>
              <td>{d.apellidos}</td>
              <td>{d.dni || "-"}</td>
              <td>{d.email || "-"}</td>
              <td>{d.telefono || "-"}</td>
              <td>{d.direccion || "-"}</td>
              <td>
                {mascotas
                  .filter((m) => m.dueno === d._id)
                  .map((m) => m.nombre)
                  .join(", ")}
              </td>
              <td>
                <Button
                  size="sm"
                  variant="warning"
                  onClick={() => {
                    setDuenoEditar(d);
                    setShowEditarDueno(true);
                  }}
                >
                  Editar
                </Button>{" "}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleEliminarDueno(d._id)}
                >
                  Eliminar
                </Button>{" "}
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setDuenoSeleccionado(d);
                    setShowAgregarMascota(true);
                  }}
                >
                  Agregar Mascota
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal Agregar Dueño */}
      <Modal show={showAgregarDueno} onHide={() => setShowAgregarDueno(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Dueño</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {["nombres", "apellidos", "dni", "email", "telefono", "direccion"].map(
            (campo) => (
              <Form.Group key={campo} className="mb-2">
                <Form.Label>{campo.charAt(0).toUpperCase() + campo.slice(1)}</Form.Label>
                <Form.Control
                  type="text"
                  value={nuevoDueno[campo]}
                  onChange={(e) =>
                    setNuevoDueno({ ...nuevoDueno, [campo]: e.target.value })
                  }
                />
              </Form.Group>
            )
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAgregarDueno(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAgregarDueno}>
            Guardar Dueño
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Editar Dueño */}
      <Modal show={showEditarDueno} onHide={() => setShowEditarDueno(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Dueño</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {duenoEditar &&
            ["nombres", "apellidos", "dni", "email", "telefono", "direccion"].map(
              (campo) => (
                <Form.Group key={campo} className="mb-2">
                  <Form.Label>{campo.charAt(0).toUpperCase() + campo.slice(1)}</Form.Label>
                  <Form.Control
                    type="text"
                    value={duenoEditar[campo]}
                    onChange={(e) =>
                      setDuenoEditar({ ...duenoEditar, [campo]: e.target.value })
                    }
                  />
                </Form.Group>
              )
            )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditarDueno(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleEditarDueno}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Agregar Mascota */}
      <Modal show={showAgregarMascota} onHide={() => setShowAgregarMascota(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Agregar Mascota a {duenoSeleccionado?.nombres || ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {["nombre", "edad", "raza", "peso", "enfermedades", "observaciones"].map(
              (campo) => (
                <Form.Group className="mb-2" key={campo}>
                  <Form.Label>{campo.charAt(0).toUpperCase() + campo.slice(1)}</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevaMascota[campo]}
                    onChange={(e) =>
                      setNuevaMascota({ ...nuevaMascota, [campo]: e.target.value })
                    }
                  />
                </Form.Group>
              )
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAgregarMascota(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAgregarMascota}>
            Guardar Mascota
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DuenosList;
