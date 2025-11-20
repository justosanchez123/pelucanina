import React, { useState } from "react";
import Modal from "./Modal";

const TestModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: "2rem" }}>
      <button
        onClick={() => setIsOpen(true)}
        style={{ padding: "0.5rem 1rem", borderRadius: "5px", backgroundColor: "blue", color: "white", cursor: "pointer" }}
      >
        Abrir Modal
      </button>

      <Modal
        isOpen={isOpen}
        title="Modal de prueba"
        onClose={() => setIsOpen(false)}
        onSave={() => {
          alert("Guardado!");
          setIsOpen(false);
        }}
      >
        <p>Este es un modal de prueba</p>
      </Modal>
    </div>
  );
};

export default TestModal;
