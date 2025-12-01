import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      
      {/* --- SECCIÓN PRINCIPAL (HERO) --- */}
      <div className="stage-area container-fluid mt-3">
        <div className="row align-items-center">
          
          {/* COLUMNA IZQUIERDA (Público 1) */}
          <div className="col-lg-2 d-none d-lg-flex flex-column gap-3 side-column">
             <div className="img-frame">
                <img src="/perro1.jpg" alt="Fan 1" className="side-img" />
             </div>
             <div className="img-frame">
                <img src="/perro2.jpg" alt="Fan 2" className="side-img" />
             </div>
          </div>

          {/* COLUMNA CENTRAL (Protagonista) */}
          <div className="col-lg-8 text-center">
             <div className="main-stage-box p-5">
                <h1 className="display-3 mb-2 title-neon">DOG <span className="text-stroke">&</span> ROLL</h1>
                <h3 className="text-light mb-4" style={{letterSpacing: '3px', fontSize:'1.2rem'}}>PELUQUERÍA CANINA</h3>
                
                <div className="poster-container">
                  <img 
                    src="/main-rock-dog.png" 
                    alt="Perro Rockero" 
                    className="main-dog-img" 
                  />
                </div>

                <p className="lead text-light mt-4" style={{maxWidth: '600px', margin: '0 auto'}}>
                   Dale a tu mascota el look que se merece. Cortes con estilo, baños relajantes y trato de superestrella.
                </p>

                <button 
                  className="btn-cta mt-4" 
                  onClick={() => navigate("/agendar")}
                >
                  🎫 RESERVAR TURNO
                </button>
             </div>
          </div>

          {/* COLUMNA DERECHA (Público 2) */}
          <div className="col-lg-2 d-none d-lg-flex flex-column gap-3 side-column">
             <div className="img-frame">
                <img src="/perro3.jpg" alt="Fan 3" className="side-img" />
             </div>
             <div className="img-frame">
                <img src="/perro4.jpg" alt="Fan 4" className="side-img" />
             </div>
          </div>

        </div>
      </div>

      {/* --- SECCIÓN SERVICIOS (El Setlist) --- */}
      <div className="container my-5 pb-5">
        <h2 className="text-center text-light mb-5">SETLIST DE SERVICIOS</h2>
        <div className="row g-4">
           {/* Card 1 */}
           <div className="col-md-3">
              <div className="service-card">
                  <div className="icon">🚿</div>
                  <h4>BAÑO HIT</h4>
                  <p>Shampoo premium y secado.</p>
              </div>
           </div>
           {/* Card 2 */}
           <div className="col-md-3">
              <div className="service-card">
                  <div className="icon">✂️</div>
                  <h4>CORTE PUNK</h4>
                  <p>Estilos de raza o personalizados.</p>
              </div>
           </div>
           {/* Card 3 */}
           <div className="col-md-3">
              <div className="service-card">
                  <div className="icon">💅</div>
                  <h4>PATAS VIP</h4>
                  <p>Corte de uñas y almohadillas.</p>
              </div>
           </div>
           {/* Card 4 */}
           <div className="col-md-3">
              <div className="service-card">
                  <div className="icon">🎸</div>
                  <h4>FULL ALBUM</h4>
                  <p>Servicio completo + Limpieza oídos.</p>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
};

export default Home;