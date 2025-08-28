// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5 text-center">
      <h1 className="mb-4">🐾¡Bienvenidos a Peluquería Canina🐾 Dog And Roll!🐾</h1>
      <p className="mb-4">
        Cuidamos y mimamos a tu perro con los mejores servicios de peluquería: 
        baño, corte de pelo, corte de uñas y más.
      </p>

      <button 
        className="btn btn-success mb-3"
        onClick={() => navigate("/agendar")}
      >
        Agendar Turno
      </button>

      <hr />

      <h4>Servicios Destacados</h4>
      <ul className="list-group mt-3 mx-auto" style={{ maxWidth: "500px" }}>
        <li className="list-group-item">Baño completo con shampoo profesional</li>
        <li className="list-group-item">Corte de pelo y estilo personalizado</li>
        <li className="list-group-item">Corte de uñas y cuidado de patas</li>
        <li className="list-group-item">Limpieza de oídos y cepillado dental</li>
      </ul>

      <hr />

      <h4>¿Por qué elegirnos?</h4>
      <p>
        En nuestra peluquería canina priorizamos la comodidad y bienestar de tu mascota. 
        Contamos con profesionales especializados y un trato amoroso para cada perrito.
      </p>
    </div>
  );
}

export default Home;
