import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'; // Asegúrate de importar tus estilos globales

// 1. IMPORTAR GOOGLE PROVIDER
import { GoogleOAuthProvider } from '@react-oauth/google';

// 2. TU CLIENT ID (Copiado de lo que me pasaste antes)
const GOOGLE_CLIENT_ID = "1025771746986-gn7qttmc9pef2i5bf8tcamuf2phnvu14.apps.googleusercontent.com"; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. ENVOLVER LA APP */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);