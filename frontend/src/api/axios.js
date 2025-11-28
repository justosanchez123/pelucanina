import axios from "axios";



const api = axios.create({

  baseURL: import.meta.env.VITE_API_URL || "https://pelucanina-1.onrender.com/api.",

  //Si quiero cargar RENDER:       http://localhost:3000/api

});



// Interceptor que lee el token **en cada request**

api.interceptors.request.use((config) => {

  const token = sessionStorage.getItem("token");

  if (token) {

    config.headers.Authorization = `Bearer ${token}`;

    console.log("🔑 Token enviado:", token);

  } else {

    console.log("❌ No se encontró token.");

  }

  return config;

});



export default api;