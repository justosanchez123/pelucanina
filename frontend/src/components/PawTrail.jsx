// src/components/PawTrail.jsx
import React, { useEffect, useState } from "react";
import "./PawTrail.css";

const PawTrail = ({ cantidad = 10 }) => {
  const [paws, setPaws] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPaws((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          top: Math.random() * 80,   // % altura
          left: -10,                 // inicio fuera de pantalla
          size: 20 + Math.random() * 20, // tamaño entre 20-40px
          rotate: Math.random() * 360
        }
      ]);

      // Limitar cantidad máxima de huellas
      if (paws.length > cantidad) {
        setPaws((prev) => prev.slice(prev.length - cantidad));
      }
    }, 500);

    return () => clearInterval(interval);
  }, [paws, cantidad]);

  return (
    <div className="paw-trail-container">
      {paws.map((paw) => (
        <span
          key={paw.id}
          className="paw"
          style={{
            top: `${paw.top}vh`,
            left: `${paw.left}vw`,
            width: `${paw.size}px`,
            height: `${paw.size}px`,
            transform: `rotate(${paw.rotate}deg)`,
            animationDelay: `${Math.random() * 2}s`
          }}
        ></span>
      ))}
    </div>
  );
};

export default PawTrail;
