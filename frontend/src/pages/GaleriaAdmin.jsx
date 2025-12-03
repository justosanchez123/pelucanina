import React, { useState, useEffect } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import "./DuenosList.css"; // Reutilizamos el CSS del Admin

const GaleriaAdmin = () => {
  const [fotos, setFotos] = useState([]);
  const [nuevaFoto, setNuevaFoto] = useState({ titulo: "", url: "" });

  const cargarFotos = async () => {
    try {
      const res = await api.get("/fotos");
      setFotos(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { cargarFotos(); }, []);

  const handleAgregar = async (e) => {
    e.preventDefault();
    try {
      await api.post("/fotos", nuevaFoto);
      Swal.fire({ title: 'Foto agregada', icon: 'success', background: '#1e1e1e', color: '#fff' });
      setNuevaFoto({ titulo: "", url: "" });
      cargarFotos();
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'Verifica los datos', icon: 'error', background: '#1e1e1e', color: '#fff' });
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Borrar foto?")) {
       try {
         await api.delete(`/fotos/${id}`);
         cargarFotos();
       } catch (error) { alert("Error al eliminar"); }
    }
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">GESTIÓN DE GALERÍA</h2>

      {/* FORMULARIO AGREGAR */}
      <div style={{background: '#1e1e1e', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #333'}}>
         <h4 className="text-white mb-3">Subir Nueva Foto</h4>
         <form onSubmit={handleAgregar} className="row g-3">
            <div className="col-md-5">
               <input type="text" className="form-control" placeholder="Título (Ej: Bobby Rockero)" 
                  value={nuevaFoto.titulo} onChange={(e)=>setNuevaFoto({...nuevaFoto, titulo: e.target.value})} required />
            </div>
            <div className="col-md-5">
               <input type="text" className="form-control" placeholder="URL de la imagen (https://...)" 
                  value={nuevaFoto.url} onChange={(e)=>setNuevaFoto({...nuevaFoto, url: e.target.value})} required />
            </div>
            <div className="col-md-2">
               <button type="submit" className="btn-neon w-100">SUBIR</button>
            </div>
         </form>
      </div>

      {/* LISTA DE FOTOS */}
      <div className="row">
        {fotos.map(f => (
            <div key={f._id} className="col-md-3 mb-4">
                <div style={{background: '#222', padding: '10px', borderRadius: '8px', border: '1px solid #444'}}>
                    <img src={f.url} alt={f.titulo} style={{width:'100%', height:'150px', objectFit:'cover', borderRadius:'5px'}} />
                    <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="text-white fw-bold">{f.titulo}</span>
                        <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(f._id)}>🗑️</button>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default GaleriaAdmin;