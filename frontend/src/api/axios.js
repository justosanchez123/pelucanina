import axios from "axios";

const api = axios.create({
  baseURL: "https://pelucanina-1.onrender.com/api",
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Token enviado:", token); 
  } else {
    console.log("No se encontró token.");
  }
  return config;
});

export default api;
