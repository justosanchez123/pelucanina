import React from "react";

const Modal = ({ isOpen, onClose, children, onSave }) => {
  if (!isOpen) return null;

  const estiloOverlay = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  };

  const estiloModal = {
    backgroundColor: "#fff",
    padding: "1rem",
    borderRadius: "8px",
    minWidth: "300px",
    maxWidth: "90%",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  return (
    <div style={estiloOverlay}>
      <div style={estiloModal}>
        {children}
        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
          <button onClick={onSave}>Guardar</button>
          <button onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
