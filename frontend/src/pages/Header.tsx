import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Container, Form, FormControl, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { FiLogOut, FiBell, FiUsers, FiFileText, FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';

const Header = () => {
  const [nomeUsuarioLogado, setNomeUsuarioLogado] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuarioLogado = async () => {
      try {
        const token = Cookies.get("token");
        const userId = Cookies.get("userId");

        axios.defaults.headers.common["Authorization"] = token;
        const response = await axios.get(`http://127.0.0.1:3001/usuarios/${userId}`);

        const { nome } = response.data;
        setNomeUsuarioLogado(nome); 
      } catch (error) {
        console.error(error);
      }
    };

    if (Cookies.get("token") && Cookies.get("userId")) {
      fetchUsuarioLogado();
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userId");
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  return (
    <header>
      <div className="header-top">
        <Container fluid>
          <div className="header-top-inner">
            <div className="logo">
              <img src={process.env.PUBLIC_URL + "/logo.png"} alt="Logo" />
              <span className="company-name">Fortes Assessoria</span>
            </div>
            <div className="search-bar">
              <Form>
                <FormControl type="text" placeholder="Pesquisar" />
              </Form>
            </div>
            <div className="user-actions">
              <span className="username">Olá, {nomeUsuarioLogado}</span>
              <Button variant="light" className="logout-button" onClick={handleLogout}>
                <FiLogOut size={18} /> Deslogar
              </Button>
              <Button variant="light" className="notification-button">
                <FiBell size={18} />
              </Button>
            </div>
          </div>
        </Container>
      </div>
      <div className="subheader">
        <Navbar bg="#00456b" variant="#00456b">
          <Container>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav>
                <NavDropdown title={<><FiUsers size={18} /> Clientes</>} id="basic-nav-dropdown">
                  <NavDropdown.Item href="/addclient">Cadastrar Cliente</NavDropdown.Item>
                  <NavDropdown.Item href="/listarclient">Listar Clientes</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title={<><FiFileText size={18} /> Processos</>} id="basic-nav-dropdown">
                  <NavDropdown.Item href="/addprocess">Cadastrar Processo</NavDropdown.Item>
                  <NavDropdown.Item href="/processos">Listar Processos</NavDropdown.Item>
                </NavDropdown>
                <Nav.Link href="/processosdetalhe"><><FiCalendar size={18} /> Compromissos</></Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </div>
    </header>
  );
};

export default Header;
