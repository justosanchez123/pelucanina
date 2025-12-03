import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, InputGroup } from "react-bootstrap";
import api from "../api/axios";
import Swal from "sweetalert2";
import "./DuenosList.css"; 

const MascotasList = () => {
  const [mascotas, setMascotas] = useState([]);
  const [duenos, setDuenos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: "", edad: "", raza: "", peso: "", enfermedades: "",
    observaciones: "", dueno: "", duenoModel: "Dueno",
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

  const cargarDatos = async () => {
    try {
      const [resM, resD, resU] = await Promise.all([
          api.get("/mascotas"),
          api.get("/duenos"),
          api.get("/usuarios")
      ]);
      
      setMascotas(Array.isArray(resM.data) ? resM.data : []);
      
      const allDuenos = [
        ...resD.data.map(d => ({ ...d, duenoModel: "Dueno" })),
        ...resU.data.map(u => ({ ...u, duenoModel: "Usuario" }))
      ];
      setDuenos(allDuenos);
    } catch (error) { 
        console.error(error); 
    }
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleGuardar = async () => {
    try {
      if (!formData.nombre || !formData.dueno) {
          return Swal.fire({title:'Faltan datos', text:'Nombre y Dueño son obligatorios', icon:'warning', background:'#1e1e1e', color:'#fff'});
      }

      const datos = normalizarCampos(formData);
      // Enviamos 'tipoDueno' al backend, que es lo que espera el modelo
      const payload = { ...datos, dueno: formData.dueno, tipoDueno: formData.duenoModel };

      if (editando) {
        await api.put(`/mascotas/${editando._id}`, payload);
        Swal.fire({title:'¡Actualizado!', icon:'success', background:'#1e1e1e', color:'#fff'});
      } else {
        await api.post("/mascotas", payload);
        Swal.fire({title:'¡Creado!', icon:'success', background:'#1e1e1e', color:'#fff'});
      }

      setShowModal(false);
      cargarDatos();
    } catch (error) { 
        Swal.fire({title:'Error', text:'No se pudo guardar', icon:'error', background:'#1e1e1e', color:'#fff'}); 
    }
  };

  const handleEliminar = async (id) => {
    const r = await Swal.fire({
        title:'¿Eliminar?', text:'Se borrará la ficha.', icon:'warning', 
        showCancelButton:true, confirmButtonColor:'#d33', confirmButtonText:'Sí', background:'#1e1e1e', color:'#fff'
    });
    
    if(r.isConfirmed) {
        try {
            await api.delete(`/mascotas/${id}`);
            cargarDatos();
            Swal.fire({title:'Eliminado', icon:'success', background:'#1e1e1e', color:'#fff'});
        } catch (error) {
            Swal.fire({title:'Error', icon:'error', background:'#1e1e1e', color:'#fff'});
        }
    }
  };

  const handleAbrir = (m = null) => {
      if(m) { 
          setEditando(m); 
          setFormData({ 
              nombre: m.nombre, edad: m.edad, raza: m.raza, peso: m.peso, 
              enfermedades: m.enfermedades, observaciones: m.observaciones, 
              // Aquí corregimos para leer 'tipoDueno' de la mascota que viene de la BD
              dueno: m.dueno?._id || m.dueno, duenoModel: m.tipoDueno || "Dueno" 
          }); 
      } else { 
          setEditando(null); 
          setFormData({ 
              nombre: "", edad: "", raza: "", peso: "", 
              enfermedades: "", observaciones: "", dueno: "", duenoModel: "Dueno" 
          }); 
      }
      setShowModal(true);
  };

  const filtradas = mascotas.filter(m => 
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
      m.raza.toLowerCase().includes(busqueda.toLowerCase()) ||
      (m.dueno?.nombres || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="admin-container">
      <h2 className="admin-title">GESTIÓN DE MASCOTAS</h2>
      
      <div className="d-flex justify-content-between mb-4 gap-3">
          <InputGroup className="rock-input-group" style={{maxWidth: '500px'}}>
            <InputGroup.Text style={{background: '#2c2c2c', border: '1px solid #444', color:'#00d4ff'}}>🔍</InputGroup.Text>
            <Form.Control placeholder="Buscar por nombre, raza o dueño..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </InputGroup>
          
          <Button className="btn-neon" onClick={() => handleAbrir()}>+ Nueva Mascota</Button>
      </div>

      <div className="table-responsive">
        <Table hover className="table-rock">
            <thead>
                <tr><th>Mascota</th><th>Raza / Edad</th><th>Salud</th><th>Dueño</th><th>Acciones</th></tr>
            </thead>
            <tbody>
                {filtradas.length > 0 ? (
                    filtradas.map(m => (
                        <tr key={m._id}>
                            <td><div className="fw-bold text-white fs-5">{m.nombre}</div></td>
                            <td><div>{m.raza}</div><div className="small text-muted">{m.edad} años</div></td>
                            <td>{m.enfermedades}</td>
                            <td>
                                <div>{m.dueno?.nombres} {m.dueno?.apellidos}</div>
                                {/* CAMBIO CLAVE AQUÍ: Usamos m.tipoDueno */}
                                {m.tipoDueno && (
                                    <span className={m.tipoDueno === 'Usuario' ? 'badge-user' : 'badge-dueno'}>
                                        {m.tipoDueno}
                                    </span>
                                )}
                            </td>
                            <td>
                                <Button size="sm" className="btn-icon" onClick={() => handleAbrir(m)}>✏️</Button>
                                <Button size="sm" className="btn-icon danger" onClick={() => handleEliminar(m._id)}>🗑️</Button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan="5" className="text-center py-4 text-muted">No se encontraron mascotas</td></tr>
                )}
            </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
        <Modal.Header closeButton><Modal.Title>{editando ? "Editar Ficha" : "Registrar Mascota"}</Modal.Title></Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Dueño *</Form.Label>
                    <Form.Select value={formData.dueno + "|" + formData.duenoModel} onChange={(e) => { const [id, tipo] = e.target.value.split("|"); setFormData({ ...formData, dueno: id, duenoModel: tipo }); }}>
                        <option value="">-- Seleccionar --</option>
                        {duenos.map(d => <option key={d._id + d.duenoModel} value={d._id + "|" + d.duenoModel}>{d.nombres} {d.apellidos} ({d.email})</option>)}
                    </Form.Select>
                </Form.Group>
                <div className="row">
                    <div className="col-6 mb-3"><Form.Label>Nombre *</Form.Label><Form.Control value={formData.nombre} onChange={(e)=>setFormData({...formData, nombre:e.target.value})} /></div>
                    <div className="col-6 mb-3"><Form.Label>Raza</Form.Label><Form.Control value={formData.raza} onChange={(e)=>setFormData({...formData, raza:e.target.value})} /></div>
                </div>
                <div className="row">
                    <div className="col-6 mb-3"><Form.Label>Edad</Form.Label><Form.Control value={formData.edad} onChange={(e)=>setFormData({...formData, edad:e.target.value})} /></div>
                    <div className="col-6 mb-3"><Form.Label>Peso</Form.Label><Form.Control value={formData.peso} onChange={(e)=>setFormData({...formData, peso:e.target.value})} /></div>
                </div>
                <Form.Group className="mb-3"><Form.Label>Enfermedades</Form.Label><Form.Control value={formData.enfermedades} onChange={(e)=>setFormData({...formData, enfermedades:e.target.value})} /></Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button className="btn-neon" onClick={handleGuardar}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MascotasList;