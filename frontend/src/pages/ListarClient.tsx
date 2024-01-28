  import React, { useEffect } from "react";
  import { Button, Col, Container, Form, Row, Card, Table } from "react-bootstrap";
  import "bootstrap/dist/css/bootstrap.min.css";
  import Header from "./Header";
  import axios from "axios";
  import ReactPaginate from "react-paginate";
  import { useNavigate } from "react-router-dom";

  interface Client {
    id: number;
    nome: string;
    cpf: string;
    email: string;
  }

  interface ListarClientProps {
    data: Client[];
    setSelected: (person: Client & { id: number }) => void;
  }



  const Clients: React.FC<ListarClientProps> = ({ data, setSelected }) => (
    <tbody>
      {data.map((client) => (
        <tr
          key={client.id}
          onClick={() => setSelected({ ...client, id: client.id })}
          style={{ cursor: "pointer" }}
        >
          <td>{client.nome}</td>
          <td>{client.cpf}</td>
        </tr>
      ))}
    </tbody>
  );

  const ListarClientes: React.FC = () => {
    const [data, setData] = React.useState<Client[]>([]);
    const [currentPage, setCurrentPage] = React.useState<number>(0);
    const navigate = useNavigate();

    const handlePageClick = (selectedItem: { selected: number }) => {
      setCurrentPage(selectedItem.selected);
    };

    const [totalPages, setTotalPages] = React.useState<number>(0);

    useEffect(() => {
      axios
      .get(`http://18.225.117.159:3000/clientes?page=${currentPage + 1}`)
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
    
    
      // Requisição separada para obter o número total de registros
      axios
        .get("http://18.225.117.159:3000/clientes/count")
        .then((response) => {
          const totalCount = response.data.count;
          const totalPages = Math.ceil(totalCount / 10); // Altere "10" para o número de itens exibidos por página
          setTotalPages(totalPages);
        })
        .catch((error) => {
          console.log(error);
        });
    }, [currentPage]);

    const setSelected = React.useCallback(
      (client: Client) => {
        navigate(`/clientes/${client.id}`);
      },
      [navigate]
    );

    return (
      <>
        <Header />
        <Container>
          <Form>
            <Row>
              <Col xl={3} className="d-flex flex-row">
                <Form.Group className="mb-4" controlId="formBasicEmail">
                  <Form.Label>Buscar Pessoa</Form.Label>
                  <Form.Control
                    style={{ width: 300 }}
                    type="text"
                    placeholder="Digite o Nome/CPF/Status"
                    name="search"
                  />
                </Form.Group>
              </Col>
              <Col
                xl={6}
                className=" mt-2 d-flex"
                style={{ alignItems: "center" }}
              >
                <Button variant="primary" type="submit">
                  Buscar
                </Button>
              </Col>
            </Row>
          </Form>

          <Card className="w-100">
            <Table striped bordered hover>
              <thead>
                <tr>
                <th style={{ width: "50%" }}>Nome</th>
                <th style={{ width: "50%" }}>CPF</th>
                </tr>
              </thead>
              <Clients data={data} setSelected={setSelected} />
            </Table>
          </Card>

          <div className="d-flex justify-content-center mt-3">
          {totalPages ? (
            <ReactPaginate
              previousLabel={"Anterior"}
              nextLabel={"Próxima"}
              pageCount={totalPages}
              marginPagesDisplayed={5}
              pageRangeDisplayed={0}
              onPageChange={handlePageClick}
              containerClassName={"pagination"}
              activeClassName={"active"}
              previousClassName={"page-item"}
              nextClassName={"page-item"}
              pageClassName={"page-item"}
              pageLinkClassName={"page-link"}
              previousLinkClassName={"page-link"}
              nextLinkClassName={"page-link"}
              breakClassName={"page-item"}
              breakLinkClassName={"page-link"}
              disabledClassName={"disabled"}
            />
            ) : (
              <span>Carregando...</span>
              )}
          </div>
        </Container>
      </>
    );
  };

  export default ListarClientes;
