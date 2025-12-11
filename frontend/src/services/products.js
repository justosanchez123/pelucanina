// src/services/products.js

// 1. Importamos la instancia de Axios que ya configuraste
// Asegúrate de que la ruta sea correcta. Si products.js está en services, 
// y axios.js está en api, subimos un nivel (..) y entramos a api.
import api from "../api/axios"; 

// 2. Obtener productos (con filtro de categoría opcional)
export const getProducts = async (category) => {
  try {
    // Axios maneja los query params (?category=...) de forma limpia así:
    const params = category ? { category } : {};
    
    const response = await api.get("/products", { params });
    return response.data; // Axios devuelve la data dentro de .data
  } catch (error) {
    console.error("Error en getProducts:", error);
    // Lanzamos el error para que el componente lo capture
    throw error.response?.data || new Error("Error al obtener productos");
  }
};

// 3. Obtener un producto por ID
export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error en getProductById:", error);
    throw error.response?.data || new Error("Producto no encontrado");
  }
};

// 4. Crear producto (POST)
export const createProduct = async (productData) => {
  try {
    // Axios enviará el Token automáticamente gracias a tu interceptor
    const response = await api.post("/products", productData);
    return response.data;
  } catch (error) {
    console.error("Error en createProduct:", error);
    throw error.response?.data || new Error("Error al crear producto");
  }
};

// 5. Actualizar producto (PUT)
export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error("Error en updateProduct:", error);
    throw error.response?.data || new Error("Error al actualizar producto");
  }
};

// 6. Eliminar producto (DELETE)
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error en deleteProduct:", error);
    throw error.response?.data || new Error("Error al eliminar producto");
  }
};