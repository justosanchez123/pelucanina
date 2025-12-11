import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "./Galeria.css"; 

const Galeria = () => {
  const [fotos, setFotos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchFotos = async () => {
      try {
        const res = await api.get("/fotos");
        setFotos(res.data);
      } catch (error) {
        console.error("Error cargando galería:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchFotos();
  }, []);

  return (
    <div className="galeria-container">
      {/* Efecto de luz de fondo */}
      <div className="spotlight"></div>

      <div className="galeria-header fade-in-down">
        {/* Título limpio sin estrellas, el estilo lo da el CSS */}
        <h2 className="galeria-title">SALÓN DE LA FAMA</h2>
        <p className="galeria-subtitle">
           Nuestras leyendas del rock
        </p>
        <div className="title-underline"></div>
      </div>
      
      <div className="galeria-grid fade-in-up">
        {cargando ? (
           <p className="text-center text-white w-100">Afinando instrumentos...</p>
        ) : fotos.length === 0 ? (
           <div className="empty-state">
             <p>El escenario está vacío por ahora. 🎸</p>
           </div>
        ) : (
           fotos.map((foto) => (
             <div key={foto._id} className="foto-card">
               <div className="foto-frame">
                 <img 
                    src={foto.url} 
                    alt={foto.titulo} 
                    className="foto-img" 
                    onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=Sin+Imagen"; }}
                 />
               </div>
               <div className="foto-info">
                  <h4 className="foto-titulo">{foto.titulo}</h4>
               </div>
             </div>
           ))
        )}
      </div>
    </div>
  );
};

export default Galeria;