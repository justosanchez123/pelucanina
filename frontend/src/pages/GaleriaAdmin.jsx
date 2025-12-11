import React, { useState, useEffect } from "react";
import api from "../api/axios";
import Swal from "sweetalert2";
import { Button } from "react-bootstrap"; // Importamos Button para usar estilos
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
      if (!nuevaFoto.titulo || !nuevaFoto.url) {
         return Swal.fire({title: 'Faltan datos', icon: 'warning', background: '#1e1e1e', color: '#fff'});
      }
      
      await api.post("/fotos", nuevaFoto);
      Swal.fire({ title: '¡Foto subida!', icon: 'success', background: '#1e1e1e', color: '#fff', confirmButtonColor: '#00d4ff' });
      setNuevaFoto({ titulo: "", url: "" });
      cargarFotos();
    } catch (error) {
      Swal.fire({ title: 'Error', text: 'Verifica los datos', icon: 'error', background: '#1e1e1e', color: '#fff' });
    }
  };

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
        title: '¿Borrar foto?',
        text: "Desaparecerá de la galería pública.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, borrar',
        background: '#1e1e1e', color: '#fff'
    });

    if (result.isConfirmed) {
        try {
          await api.delete(`/fotos/${id}`);
          cargarFotos();
          Swal.fire({title: 'Eliminado', icon: 'success', background: '#1e1e1e', color: '#fff'});
        } catch (error) { 
          Swal.fire({title: 'Error', icon: 'error', background: '#1e1e1e', color: '#fff'});
        }
    }
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">GESTIÓN DE GALERÍA</h2>

      {/* FORMULARIO DE SUBIDA (Estilo Card Oscura) */}
      <div style={{background: '#1e1e1e', padding: '25px', borderRadius: '12px', marginBottom: '40px', border: '1px solid #333', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'}}>
         <h4 className="text-white mb-4" style={{borderBottom:'1px solid #444', paddingBottom:'10px', color:'#00d4ff'}}>📸 Subir Nueva Foto</h4>
         
         <form onSubmit={handleAgregar} className="row g-3 align-items-end">
            <div className="col-md-5">
               <label className="text-secondary small fw-bold mb-1">TÍTULO / NOMBRE</label>
               <input type="text" className="form-control" placeholder="Ej: Bobby Rockero" 
                  value={nuevaFoto.titulo} onChange={(e)=>setNuevaFoto({...nuevaFoto, titulo: e.target.value})} />
            </div>
            <div className="col-md-5">
               <label className="text-secondary small fw-bold mb-1">URL DE LA IMAGEN</label>
               <input type="text" className="form-control" placeholder="https://..." 
                  value={nuevaFoto.url} onChange={(e)=>setNuevaFoto({...nuevaFoto, url: e.target.value})} />
            </div>
            <div className="col-md-2">
               <button type="submit" className="btn-neon w-100">SUBIR</button>
            </div>
         </form>
      </div>

      {/* GRILLA DE FOTOS EXISTENTES */}
      <div className="row">
        {fotos.length === 0 ? <p className="text-muted text-center">No hay fotos cargadas.</p> : 
          fotos.map(f => (
            <div key={f._id} className="col-md-3 mb-4">
                <div style={{background: '#2c2c2c', padding: '10px', borderRadius: '10px', border: '1px solid #444', transition: 'transform 0.2s'}}>
                    
                    {/* Marco de imagen */}
                    <div style={{width:'100%', height:'180px', overflow:'hidden', borderRadius:'5px', marginBottom:'10px', backgroundColor:'#000'}}>
                        <img 
                            src={f.url} 
                            alt={f.titulo} 
                            style={{width:'100%', height:'100%', objectFit:'cover'}} 
                            onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=Error+URL"; }}
                        />
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                        <span className="text-white fw-bold text-truncate" style={{maxWidth:'70%'}} title={f.titulo}>
                            {f.titulo}
                        </span>
                        {/* Botón de borrar estilo Admin */}
                        <Button size="sm" className="btn-icon danger" onClick={() => handleEliminar(f._id)}>
                            🗑️
                        </Button>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default GaleriaAdmin;