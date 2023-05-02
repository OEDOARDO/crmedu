import React from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";

const Header = () => {
  return (
<Navbar className="navbar-dark bg-primary" expand="xxl" style={{ height: "80px" }}>
  <Container>
    <Navbar.Brand href="/" className="d-flex align-items-center">
      <img
        src="logo.png"
        alt="DataJuri Logo"
        height="30"
        className="d-inline-block align-top me-2"
      />
      <span className="fw-bold">Fortes Assessoria</span>
    </Navbar.Brand>
    <Nav className="me-auto d-md-none">
      <NavDropdown title="Clientes" id="basic-nav-dropdown">
        <NavDropdown.Item href="/addclient">
          Cadastrar Cliente
        </NavDropdown.Item>
        <NavDropdown.Item href="/pdf-reader">
          Listar Clientes
        </NavDropdown.Item>
      </NavDropdown>
      <NavDropdown title="Processos" id="basic-nav-dropdown">
        <NavDropdown.Item href="/register-process">
          Cadastrar Processo
        </NavDropdown.Item>
        <NavDropdown.Item href="/sheets-reader">
          Listar Processos
        </NavDropdown.Item>
      </NavDropdown>
      <Nav.Link href="/send-messages">Compromissos</Nav.Link>
    </Nav>
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="ms-auto d-none d-md-flex">
        <NavDropdown title="Clientes" id="basic-nav-dropdown">
          <NavDropdown.Item href="/addclient">
            Cadastrar Cliente
          </NavDropdown.Item>
          <NavDropdown.Item href="/listarclient">
            Listar Clientes
          </NavDropdown.Item>
        </NavDropdown>
        <NavDropdown title="Processos" id="basic-nav-dropdown">
          <NavDropdown.Item href="/register-process">
            Cadastrar Processo
          </NavDropdown.Item>
          <NavDropdown.Item href="/sheets-reader">
            Listar Processos
          </NavDropdown.Item>
        </NavDropdown>
        <Nav.Link href="/send-messages">Compromissos</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>
  );
};

export default Header;
