import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import RegAdm from './pages/RegAdm';
import AddClient from './pages/AddClient';
import ListarClient from './pages/ListarClient';
import ClientDetail from './pages/ClientDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/regadm" element={<RegAdm />} />
        <Route path="/listarclient" element={<ListarClient />} />
        <Route path="/clientes/:id" element={<ClientDetail />} />
        <Route path="/addclient" element={<AddClient />} />
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
