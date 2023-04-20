import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import RegAdm from './pages/RegAdm';
import './App.css';

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<React.Fragment />} />
        <Route path="/login" element={<LoginPage setAuthenticated={setAuthenticated} />} />
        {authenticated ? (
          <>
            <Route path="/home" element={<HomePage />} />
            <Route path="/regadm" element={<RegAdm />} />
          </>
        ) : (
          <Route path="/*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
