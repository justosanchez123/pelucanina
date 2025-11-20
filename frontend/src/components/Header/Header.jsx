// src/components/Header/Header.jsx
import React from "react";
import { Link } from "react-router-dom";
import Nav from "../Nav/Nav";
import "./Header.css";

const Header = ({ usuario }) => {
  return (
    <header className="header-container">
      <div className="logo">
        <Link to="/">🏠 Home {usuario?.nombres} {usuario?.apellidos}</Link>
      </div>
      <Nav />
    </header>
  );
};

export default Header;
