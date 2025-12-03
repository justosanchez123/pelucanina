import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      
      {/* --- SECCIÓN PRINCIPAL (HERO) --- */}
      {/* id="galeria" sirve para el botón del Navbar */}
      <div id="galeria" className="stage-area container-fluid mt-3 mb-5">
        <div className="row align-items-center justify-content-center g-0">
          
          {/* COLUMNA IZQUIERDA (Público 1) */}
          <div className="col-lg-2 d-none d-lg-flex flex-column gap-4 side-column text-lg-end pe-4">
             <div className="img-frame tilt-left ms-auto"><img src="/perro1.jpg" alt="Fan 1" className="side-img" /></div>
             <div className="img-frame tilt-right ms-auto"><img src="/perro2.jpg" alt="Fan 2" className="side-img" /></div>
          </div>

          {/* COLUMNA CENTRAL (Protagonista - GRANDE) */}
          <div className="col-lg-8 text-center">
             <div className="main-stage-box">
                <h1 className="display-2 mb-2 title-neon">DOG <span className="text-stroke">&</span> ROLL</h1>
                <h3 className="text-light mb-0" style={{letterSpacing: '4px', fontSize:'1.3rem', fontWeight:'300'}}>PELUQUERÍA CANINA</h3>
                
                <div className="poster-container mt-3">
                  <img src="/main-rock-dog.png" alt="Perro Rockero" className="main-dog-img" />
                </div>

                <p className="lead text-light mt-3 mb-4" style={{maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem'}}>
                   Dale a tu mascota el look que se merece. Cortes con estilo, baños relajantes y trato de superestrella.
                </p>

                <button className="btn-cta" onClick={() => navigate("/agendar")}>🎫 RESERVAR TURNO</button>
             </div>
          </div>

          {/* COLUMNA DERECHA (Público 2) */}
          <div className="col-lg-2 d-none d-lg-flex flex-column gap-4 side-column text-lg-start ps-4">
             <div className="img-frame tilt-right me-auto"><img src="/perro3.jpg" alt="Fan 3" className="side-img" /></div>
             <div className="img-frame tilt-left me-auto"><img src="/perro4.jpg" alt="Fan 4" className="side-img" /></div>
          </div>

        </div>
      </div>

      {/* --- SECCIÓN SERVICIOS --- */}
      <div className="container my-5 pb-5">
        <h2 className="text-center text-light mb-5" style={{fontWeight:'900', letterSpacing:'2px', fontSize: '2.5rem'}}>SETLIST DE SERVICIOS</h2>
        <div className="row g-4">
           <div className="col-md-3"><div className="service-card"><div className="icon">🚿</div><h4>BAÑO HIT</h4><p>Shampoo premium y secado profesional.</p></div></div>
           <div className="col-md-3"><div className="service-card"><div className="icon">✂️</div><h4>CORTE PUNK</h4><p>Estilos de raza o personalizados.</p></div></div>
           <div className="col-md-3"><div className="service-card"><div className="icon">💅</div><h4>PATAS VIP</h4><p>Corte de uñas y cuidado de almohadillas.</p></div></div>
           <div className="col-md-3"><div className="service-card"><div className="icon">🎸</div><h4>FULL ALBUM</h4><p>Servicio completo + Limpieza oídos.</p></div></div>
        </div>
      </div>
    </div>
  );
};

export default Home;