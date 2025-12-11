// src/services/uploadImage.js

// 1. REEMPLAZA ESTO CON TUS DATOS DE CLOUDINARY
const CLOUD_NAME = "dahunoyzn"; 
const UPLOAD_PRESET = "vxyi8byt"; // El que creaste en el PASO 1

const ENDPOINT = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error("No hay archivo para subir");

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  // form.append("folder", "productos_dog_roll"); // Opcional: Para organizar en carpetas

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      body: form,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Error al subir imagen a Cloudinary");
    }

    // Retornamos la URL segura (https)
    return data.secure_url;

  } catch (error) {
    console.error("Error en uploadToCloudinary:", error);
    throw error;
  }
};