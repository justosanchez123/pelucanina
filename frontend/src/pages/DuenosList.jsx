import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, InputGroup } from "react-bootstrap";
import api from "../api/axios";
import "./DuenosList.css";

const DuenosList = () => {
  const [duenos, setDuenos] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [showAgregarDueno, setShowAgregarDueno] = useState(false);
  const [showEditarDueno, setShowEditarDueno] = useState(false);
  const [showAgregarMascota, setShowAgregarMascota] = useState(false);

  const [nuevoDueno, setNuevoDueno] = useState({
    nombres: "",
    apellidos: "",
    dni: "",
    email: "",
    telefono: "",
    direccion: "",
  });
  const [duenoEditar, setDuenoEditar] = useState(null);
  const [duenoSeleccionado, setDuenoSeleccionado] = useState(null);

  const [nuevaMascota, setNuevaMascota] = useState({
    nombre: "",
    edad: "",
    raza: "",
    peso: "",
    enfermedades: "",
    observaciones: "",
  });
  const [mascotaEditar, setMascotaEditar] = useState(null);

  // Cargar dueños y mascotas
  const cargarDuenos = async () => {
    try {
      const resDuenos = await api.get("/duenos");
      setDuenos(resDuenos.data);

      const resMascotas = await api.get("/mascotas");
      setMascotas(resMascotas.data);
    } catch (error) {
      console.error("❌ Error al cargar datos: ", error);
    }
  };

  useEffect(() => {
    cargarDuenos();
  }, []);

  const duenosFiltrados = duenos.filter(
    (d) =>
      d.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
      (d.dni || "").includes(busqueda)
  );

  // ---------- Dueños ----------
  const handleAgregarDueno = async () => {
    try {
      await api.post("/duenos", nuevoDueno);
      setShowAgregarDueno(false);
      setNuevoDueno({
        nombres: "",
        apellidos: "",
        dni: "",
        email: "",
        telefono: "",
        direccion: "",
      });
      cargarDuenos();
    } catch (error) {
      console.error("❌ Error al agregar dueño: ", error);
    }
  };

  const handleEditarDueno = async () => {
    try {
      await api.put(`/duenos/${duenoEditar._id}`, duenoEditar);
      setShowEditarDueno(false);
      setDuenoEditar(null);
      cargarDuenos();
    } catch (error) {
      console.error("❌ Error al editar dueño: ", error);
    }
  };

  const handleEliminarDueno = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este dueño?")) return;
    try {
      await api.delete(`/duenos/${id}`);
      cargarDuenos();
    } catch (error) {
      console.error("❌ Error al eliminar dueño: ", error);
    }
  };

  // ---------- Mascotas ----------
  const handleGuardarMascota = async () => {
    try {
      if (mascotaEditar) {
        // Editar mascota existente
        await api.put(`/mascotas/${mascotaEditar._id}`, nuevaMascota);
      } else {
        // Agregar nueva mascota
        await api.post("/mascotas", {
          ...nuevaMascota,
          dueno: duenoSeleccionado._id,
          duenoModel: "Dueno",
        });
      }

      setShowAgregarMascota(false);
      setNuevaMascota({
        nombre: "",
        edad: "",
        raza: "",
        peso: "",
        enfermedades: "",
        observaciones: "",
      });
      setMascotaEditar(null);
      cargarDuenos();
    } catch (error) {
      console.error("❌ Error al guardar mascota: ", error);
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

      <Button className="mb-3" onClick={() => setShowAgregarDueno(true)}>
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
          {[...duenosFiltrados]
  .sort((a, b) => {
    const apellidosA = a.apellidos.toLowerCase();
    const apellidosB = b.apellidos.toLowerCase();
    if (apellidosA < apellidosB) return -1;
    if (apellidosA > apellidosB) return 1;

    const nombresA = a.nombres.toLowerCase();
    const nombresB = b.nombres.toLowerCase();
    if (nombresA < nombresB) return -1;
    if (nombresA > nombresB) return 1;
    return 0;
  })
  .map((d) => (

            <tr key={d._id}>
              <td>{d.nombres}</td>
              <td>{d.apellidos}</td>
              <td>{d.dni || "-"}</td>
              <td>{d.email || "-"}</td>
              <td>{d.telefono || "-"}</td>
              <td>{d.direccion || "-"}</td>
              <td>{d.mascotas?.map((m) => m.nombre).join(", ")}</td>
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
                    setNuevaMascota({
                      nombre: "",
                      edad: "",
                      raza: "",
                      peso: "",
                      enfermedades: "",
                      observaciones: "",
                    });
                    setMascotaEditar(null);
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
                <Form.Label>
                  {campo.charAt(0).toUpperCase() + campo.slice(1)}
                </Form.Label>
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
                  <Form.Label>
                    {campo.charAt(0).toUpperCase() + campo.slice(1)}
                  </Form.Label>
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

      {/* Modal Agregar/Editar Mascota */}
      <Modal show={showAgregarMascota} onHide={() => setShowAgregarMascota(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {mascotaEditar ? "Editar Mascota" : "Agregar Mascota"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {["nombre", "edad", "raza", "peso", "enfermedades", "observaciones"].map(
            (campo) => (
              <Form.Group key={campo} className="mb-2">
                <Form.Label>
                  {campo.charAt(0).toUpperCase() + campo.slice(1)}
                </Form.Label>
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAgregarMascota(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardarMascota}>
            {mascotaEditar ? "Guardar Cambios" : "Agregar Mascota"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DuenosList;
