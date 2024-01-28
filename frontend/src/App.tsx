import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import AddClient from './pages/AddClient';
import ListarClient from './pages/ListarClient';
import ClientDetail from './pages/ClientDetail';
import AddProcess from './pages/AddProcess';
import ListarProcessos from './pages/ListarProcesso';
import ProcessoDetalhes from './pages/ProcessosDetalhes';
import RegistrarUsuario from './pages/RegistrarUsuario';
import Cookies from 'js-cookie';
import VisualizarDocumentos from './pages/VisualizarDocumentos';
import UploadFiles from './pages/UploadFiles';


type AuthenticatedRouteProps = {
  element: JSX.Element;
};

const AuthenticatedRoute = ({ element }: AuthenticatedRouteProps): JSX.Element => {
  const isAuthenticated = !!Cookies.get('token');
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return element;
};


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <AuthenticatedRoute element={<HomePage />} />
          }
        />
        <Route
          path="/processos/:id"
          element={
            <AuthenticatedRoute element={<ProcessoDetalhes />} />
          }
        />
        <Route
          path="/processos"
          element={
            <AuthenticatedRoute element={<ListarProcessos />} />
          }
        />
        <Route
          path="/cadastrousuario"
          element={<RegistrarUsuario />}
        />
        <Route
          path="/addprocess"
          element={
            <AuthenticatedRoute element={<AddProcess />} />
          }
        />
        <Route
          path="/listarclient"
          element={
            <AuthenticatedRoute element={<ListarClient />} />
          }
        />
        <Route
          path="/clientes/:id"
          element={
            <AuthenticatedRoute element={<ClientDetail />} />
          }
        />
        <Route
          path="/addclient"
          element={
            <AuthenticatedRoute element={<AddClient />} />
          }
        />
        <Route
          path="/processos/:id/visualizar-documentos"
          element={<AuthenticatedRoute element={<VisualizarDocumentos />} />}
        />
                <Route
          path="/processos/:id/upload"
          element={<AuthenticatedRoute element={<UploadFiles />} />}
        />
      </Routes>
    </Router>

  );
}

export default App;
