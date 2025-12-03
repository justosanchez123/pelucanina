import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, InputGroup } from "react-bootstrap";
import api from "../api/axios";
import Swal from "sweetalert2";
import "./DuenosList.css"; 

const DuenosList = () => {
  const [duenos, setDuenos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  
  const [showAgregarDueno, setShowAgregarDueno] = useState(false);
  const [showEditarDueno, setShowEditarDueno] = useState(false);
  const [duenoEditar, setDuenoEditar] = useState(null);
  
  const [nuevoDueno, setNuevoDueno] = useState({
    nombres: "", apellidos: "", dni: "", email: "", telefono: "", direccion: "",
  });

  const cargarDuenos = async () => {
    try {
      const res = await api.get("/duenos");
      const data = Array.isArray(res.data) ? res.data : [];
      setDuenos(data);
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({title: 'Error', text: 'No se pudieron cargar los datos', icon: 'error', background: '#1e1e1e', color: '#fff'});
    }
  };

  useEffect(() => { cargarDuenos(); }, []);

  const duenosFiltrados = duenos.filter(d =>
      (d.nombres || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (d.apellidos || "").toLowerCase().includes(busqueda.toLowerCase()) ||
      (d.dni || "").includes(busqueda)
  );

  const handleAgregarDueno = async () => {
      try {
          if(!nuevoDueno.nombres || !nuevoDueno.email) return Swal.fire({title:'Faltan datos', icon:'warning', background:'#1e1e1e', color:'#fff'});
          await api.post("/duenos", nuevoDueno);
          Swal.fire({title:'¡Creado!', icon:'success', background:'#1e1e1e', color:'#fff'});
          setShowAgregarDueno(false);
          setNuevoDueno({nombres: "", apellidos: "", dni: "", email: "", telefono: "", direccion: ""});
          cargarDuenos();
      } catch (error) { Swal.fire({title:'Error', icon:'error', background:'#1e1e1e', color:'#fff'}); }
  };

  const handleEditarDueno = async () => {
      try {
          await api.put(`/duenos/${duenoEditar._id}`, duenoEditar);
          Swal.fire({title:'¡Actualizado!', icon:'success', background:'#1e1e1e', color:'#fff'});
          setShowEditarDueno(false);
          cargarDuenos();
      } catch (error) { Swal.fire({title:'Error', icon:'error', background:'#1e1e1e', color:'#fff'}); }
  };

  const handleEliminarDueno = async (id) => {
      const result = await Swal.fire({
          title: '¿Eliminar dueño?', text: "Se borrarán también sus mascotas y turnos.", icon: 'warning',
          showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Sí, eliminar', background: '#1e1e1e', color: '#fff'
      });
      if(result.isConfirmed) {
          try {
              await api.delete(`/duenos/${id}`);
              cargarDuenos();
              Swal.fire({title:'Eliminado', icon:'success', background:'#1e1e1e', color:'#fff'});
          } catch (error) { Swal.fire({title:'Error', icon:'error', background:'#1e1e1e', color:'#fff'}); }
      }
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">GESTIÓN DE DUEÑOS</h2>
      
      <div className="d-flex justify-content-between mb-4 gap-3">
          <InputGroup className="rock-input-group" style={{maxWidth: '500px'}}>
            <InputGroup.Text style={{background: '#2c2c2c', border: '1px solid #444', color:'#00d4ff'}}>🔍</InputGroup.Text>
            <Form.Control placeholder="Buscar por nombre, apellido o DNI..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          </InputGroup>
          <Button className="btn-neon" onClick={() => setShowAgregarDueno(true)}>+ Nuevo Dueño</Button>
      </div>

      <div className="table-responsive">
        <Table hover className="table-rock">
            <thead>
            <tr>
                <th>Cliente</th>
                <th>DNI</th>
                <th>Contacto</th>
                <th>Dirección</th>
                <th>Mascotas</th>
                <th>Acciones</th>
            </tr>
            </thead>
            <tbody>
            {duenosFiltrados.map((d) => (
                <tr key={d._id}>
                <td>
                    <div className="fw-bold text-white">{d.nombres} {d.apellidos}</div>
                    {/* Badge para diferenciar usuarios online vs manuales */}
                    {d.usuarioId ? <span className="badge-user">Usuario Online</span> : <span className="badge-dueno">Offline</span>}
                </td>
                <td>{d.dni || "-"}</td>
                <td>
                    <div className="small text-muted">{d.email}</div>
                    <div>{d.telefono}</div>
                </td>
                <td>{d.direccion || "-"}</td>
                <td>
                    {d.mascotas?.length > 0 ? 
                        d.mascotas.map(m => m.nombre).join(", ") : 
                        <span className="text-muted small">Sin mascotas</span>
                    }
                </td>
                <td>
                    <Button size="sm" className="btn-icon" onClick={() => { setDuenoEditar(d); setShowEditarDueno(true); }}>✏️</Button>
                    <Button size="sm" className="btn-icon danger" onClick={() => handleEliminarDueno(d._id)}>🗑️</Button>
                </td>
                </tr>
            ))}
            </tbody>
        </Table>
      </div>

      {/* --- MODAL AGREGAR --- */}
      <Modal show={showAgregarDueno} onHide={() => setShowAgregarDueno(false)} centered backdrop="static">
        <Modal.Header closeButton><Modal.Title>Agregar Cliente</Modal.Title></Modal.Header>
        <Modal.Body>
           <Form>
             <div className="row">
                 <div className="col-6 mb-3"><Form.Label>Nombres *</Form.Label><Form.Control value={nuevoDueno.nombres} onChange={(e)=>setNuevoDueno({...nuevoDueno, nombres:e.target.value})} /></div>
                 <div className="col-6 mb-3"><Form.Label>Apellidos</Form.Label><Form.Control value={nuevoDueno.apellidos} onChange={(e)=>setNuevoDueno({...nuevoDueno, apellidos:e.target.value})} /></div>
             </div>
             <Form.Group className="mb-3"><Form.Label>Email *</Form.Label><Form.Control type="email" value={nuevoDueno.email} onChange={(e)=>setNuevoDueno({...nuevoDueno, email:e.target.value})} /></Form.Group>
             <div className="row">
                 <div className="col-6 mb-3"><Form.Label>DNI</Form.Label><Form.Control value={nuevoDueno.dni} onChange={(e)=>setNuevoDueno({...nuevoDueno, dni:e.target.value})} /></div>
                 <div className="col-6 mb-3"><Form.Label>Teléfono *</Form.Label><Form.Control value={nuevoDueno.telefono} onChange={(e)=>setNuevoDueno({...nuevoDueno, telefono:e.target.value})} /></div>
             </div>
             <Form.Group className="mb-3"><Form.Label>Dirección *</Form.Label><Form.Control value={nuevoDueno.direccion} onChange={(e)=>setNuevoDueno({...nuevoDueno, direccion:e.target.value})} /></Form.Group>
           </Form>
        </Modal.Body>
        <Modal.Footer>
           <Button variant="secondary" onClick={() => setShowAgregarDueno(false)}>Cancelar</Button>
           <Button className="btn-neon" onClick={handleAgregarDueno}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL EDITAR --- */}
      <Modal show={showEditarDueno} onHide={() => setShowEditarDueno(false)} centered backdrop="static">
        <Modal.Header closeButton><Modal.Title>Editar Cliente</Modal.Title></Modal.Header>
        <Modal.Body>
           <Form>
             <div className="row">
                 <div className="col-6 mb-3"><Form.Label>Nombres</Form.Label><Form.Control value={duenoEditar?.nombres || ''} onChange={(e)=>setDuenoEditar({...duenoEditar, nombres:e.target.value})} /></div>
                 <div className="col-6 mb-3"><Form.Label>Apellidos</Form.Label><Form.Control value={duenoEditar?.apellidos || ''} onChange={(e)=>setDuenoEditar({...duenoEditar, apellidos:e.target.value})} /></div>
             </div>
             <Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={duenoEditar?.email || ''} onChange={(e)=>setDuenoEditar({...duenoEditar, email:e.target.value})} /></Form.Group>
             <div className="row">
                 <div className="col-6 mb-3"><Form.Label>DNI</Form.Label><Form.Control value={duenoEditar?.dni || ''} onChange={(e)=>setDuenoEditar({...duenoEditar, dni:e.target.value})} /></div>
                 <div className="col-6 mb-3"><Form.Label>Teléfono</Form.Label><Form.Control value={duenoEditar?.telefono || ''} onChange={(e)=>setDuenoEditar({...duenoEditar, telefono:e.target.value})} /></div>
             </div>
             <Form.Group className="mb-3"><Form.Label>Dirección</Form.Label><Form.Control value={duenoEditar?.direccion || ''} onChange={(e)=>setDuenoEditar({...duenoEditar, direccion:e.target.value})} /></Form.Group>
           </Form>
        </Modal.Body>
        <Modal.Footer>
           <Button variant="secondary" onClick={() => setShowEditarDueno(false)}>Cancelar</Button>
           <Button className="btn-neon" onClick={handleEditarDueno}>Guardar Cambios</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DuenosList;
