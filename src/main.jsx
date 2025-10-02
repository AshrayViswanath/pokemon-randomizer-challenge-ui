import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/home";
import PokemonGeneratorPage from "./pages/pokemon-generator/index.jsx";
import "./index.css";

const Root = () => (
  <BrowserRouter>
    <App>
      <nav className="nav">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/pokemon-generator">Pokémon Generator</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pokemon-generator" element={<PokemonGeneratorPage />} />
      </Routes>
    </App>
  </BrowserRouter>
);

createRoot(document.getElementById("root")).render(<Root />);
