import React from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";

const Header = () => {
    const [t, setT] = React.useState(); 

  return (
    <Container className="mb-4">
      <Navbar bg="info" expand="xxl">
        <Container>
          <Navbar.Brand className="btn btn-warning" href="/">
            Início
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="/register-client">Cadastrar Cliente</Nav.Link>
              <Nav.Link href="/register-process">Cadastrar Processo</Nav.Link>
              <Nav.Link href="/pdf-reader">Listar Clientes</Nav.Link>
              <Nav.Link href="/sheets-reader">Listar Processos</Nav.Link>
              <Nav.Link className="btn btn-success" href="/send-messages">
                Compromissos
              </Nav.Link>
             
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </Container>
  );
};
export default Header;
