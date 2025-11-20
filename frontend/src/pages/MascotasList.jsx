import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, InputGroup } from "react-bootstrap";
import api from "../api/axios";
import "./DuenosList.css";

const MascotasList = () => {
  const [mascotas, setMascotas] = useState([]);
  const [duenos, setDuenos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    edad: "",
    raza: "",
    peso: "",
    enfermedades: "",
    observaciones: "",
    dueno: "",
    duenoModel: "Dueno",
  });

  const normalizarCampos = (data) => {
    const campos = ["edad", "raza", "peso", "enfermedades", "observaciones"];
    const result = { ...data };
    campos.forEach((campo) => {
      if (!result[campo] || result[campo].toString().trim() === "") {
        result[campo] = "Desconocido";
      }
    });
    return result;
  };

  const fetchMascotas = async () => {
    try {
      const res = await api.get("/mascotas");
      setMascotas(res.data);
    } catch (error) {
      console.error("❌ Error al obtener mascotas:", error);
    }
  };

  const fetchDuenos = async () => {
    try {
      const [resDuenos, resUsuarios] = await Promise.all([
        api.get("/duenos"),
        api.get("/usuarios"),
      ]);

      const allDuenos = [
        ...resDuenos.data.map((d) => ({ ...d, duenoModel: "Dueno" })),
        ...resUsuarios.data.map((u) => ({ ...u, duenoModel: "Usuario" })),
      ];

      setDuenos(allDuenos);
    } catch (error) {
      console.error("❌ Error al obtener dueños/usuarios:", error);
    }
  };

  useEffect(() => {
    fetchMascotas();
    fetchDuenos();
  }, []);

  const handleEditar = (mascota) => {
    setEditando(mascota);
    setFormData({
      nombre: mascota.nombre,
      edad: mascota.edad,
      raza: mascota.raza,
      peso: mascota.peso,
      enfermedades: mascota.enfermedades,
      observaciones: mascota.observaciones,
      dueno: mascota.dueno?._id || mascota.dueno || "",
      duenoModel: mascota.duenoModel || "Dueno",
    });
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta mascota?")) return;
    try {
      await api.delete(`/mascotas/${id}`);
      fetchMascotas();
    } catch (error) {
      console.error("❌ Error al eliminar mascota:", error);
    }
  };

  const handleGuardar = async () => {
    try {
      const datos = normalizarCampos(formData);
      const payload = {
        ...datos,
        dueno: formData.dueno,
        duenoModel: formData.duenoModel,
      };

      if (editando) {
        await api.put(`/mascotas/${editando._id}`, payload);
      } else {
        await api.post("/mascotas", payload);
      }

      setShowModal(false);
      fetchMascotas();
    } catch (error) {
      console.error("❌ Error al guardar mascota:", error);
    }
  };

  const mascotasFiltradas = mascotas.filter((m) => {
    const duenoNombre = m.dueno
      ? `${m.dueno.nombres || ""} ${m.dueno.apellidos || ""}`.toLowerCase()
      : "";
    return (
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (m.raza && m.raza.toLowerCase().includes(busqueda.toLowerCase())) ||
      duenoNombre.includes(busqueda.toLowerCase())
    );
  });

  return (
    <div className="container">
      <h2>Mascotas (Administración)</h2>

      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Buscar por nombre, raza o dueño"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </InputGroup>

      <Button
        onClick={() => {
          setEditando(null);
          setFormData({
            nombre: "",
            edad: "",
            raza: "",
            peso: "",
            enfermedades: "",
            observaciones: "",
            dueno: "",
            duenoModel: "Dueno",
          });
          setShowModal(true);
        }}
      >
        ➕ Agregar Mascota
      </Button>

      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Raza</th>
            <th>Peso</th>
            <th>Enfermedades</th>
            <th>Observaciones</th>
            <th>Dueño/Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {mascotasFiltradas.map((m) => (
            <tr key={m._id}>
              <td>{m.nombre}</td>
              <td>{m.edad}</td>
              <td>{m.raza}</td>
              <td>{m.peso}</td>
              <td>{m.enfermedades}</td>
              <td>{m.observaciones}</td>
              <td>
                {m.dueno
                  ? `${m.dueno.nombres || ""} ${m.dueno.apellidos || ""} (${m.duenoModel})`
                  : "Desconocido"}
              </td>
              <td>
                <Button size="sm" onClick={() => handleEditar(m)}>
                  ✏️
                </Button>{" "}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleEliminar(m._id)}
                >
                  🗑️
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editando ? "Editar Mascota" : "Agregar Mascota"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Edad</Form.Label>
              <Form.Control
                placeholder="Desconocido"
                value={formData.edad}
                onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Raza</Form.Label>
              <Form.Control
                placeholder="Desconocido"
                value={formData.raza}
                onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Peso</Form.Label>
              <Form.Control
                placeholder="Desconocido"
                value={formData.peso}
                onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Enfermedades</Form.Label>
              <Form.Control
                placeholder="Desconocido"
                value={formData.enfermedades}
                onChange={(e) => setFormData({ ...formData, enfermedades: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Observaciones</Form.Label>
              <Form.Control
                placeholder="Desconocido"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Dueño/Usuario</Form.Label>
              <Form.Select
                value={formData.dueno + "|" + formData.duenoModel}
                onChange={(e) => {
                  const [id, tipo] = e.target.value.split("|");
                  setFormData({ ...formData, dueno: id, duenoModel: tipo });
                }}
              >
                <option value="">Seleccionar...</option>
                {duenos.map((d) => (
                  <option key={d._id + "_" + d.duenoModel} value={d._id + "|" + d.duenoModel}>
                    {d.nombres} {d.apellidos} ({d.duenoModel})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleGuardar}>💾 Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MascotasList;
