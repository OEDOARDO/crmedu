import React, { useEffect, useState } from "react";
import { Button, Col, Container, Form, Row, Card, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./Header";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";

interface Processo {
  id: number;
  id_cliente: string;
  parte_contraria: string;
  numero_processo?: string;
  cliente?: string;
  tipo_processo?: string | number; // Permitindo que tipo_processo seja uma string ou um número
  status?: number; // Atualizado para número
}

interface TipoProcesso {
  id: number;
  tipo: string;
}

interface Cliente {
  id: string;
  nome: string;
}

interface ParteContraria {
  id: string;
  nome: string;
}

interface ListarProcessosProps {
  data: Processo[];
  setSelected: (processo: Processo & { id: number }) => void;
}

const Processos: React.FC<ListarProcessosProps & {
  tiposDeProcesso: { [key: number]: string };
  partesContrarias: { [key: string]: string };
  
}> = ({ data, setSelected, tiposDeProcesso, partesContrarias }) => {
  const [processosComNomes, setProcessosComNomes] = useState<Processo[]>([]);
  const navigate = useNavigate();
  

  const navigateToDetalhes = (processoId: number) => {
    navigate(`/processos/${processoId}`);
  };

  useEffect(() => {
    const fetchProcessosComNomes = async () => {
      try {
        if (data.length === 0) {
          return; // Não faz nada se o array estiver vazio
        }
    
        const clienteIdsPromise = data.map(processo => processo.id_cliente);
        const parteContrariaIdsPromise = data.map(processo => parseInt(processo.parte_contraria, 10));
    
        const [clienteIds, parteContrariaIds] = await Promise.all([clienteIdsPromise, parteContrariaIdsPromise]);
    
        const response = await axios.post('http://127.0.0.1:3001/clientes/partes-contrarias', { clienteIds, parteContrariaIds });
        const { clientes, partesContrarias, tiposDeProcesso } = response.data;
    
        const tiposDeProcessoMap: { [key: number]: string } = {};
    
        tiposDeProcesso.forEach((tipo: TipoProcesso) => {
          tiposDeProcessoMap[tipo.id] = tipo.tipo;
        });

        console.log("tiposDeProcessoMap:", tiposDeProcessoMap); // Adicione este console.log para verificar tiposDeProcessoMap

        const processosAtualizados: Processo[] = data.map(processo => {
          const cliente = clientes.find(cliente => cliente.id === processo.id_cliente);
          const parteContraria = partesContrarias.find(parteContraria => parteContraria.id === parseInt(processo.parte_contraria, 10));
  
          return {
            ...processo,
            cliente: cliente ? cliente.nome : "Cliente não encontrado",
            parte_contraria: parteContraria ? parteContraria.nome : "Parte contrária não encontrada",
            tipo_processo: processo.tipo_processo ? tiposDeProcesso[processo.tipo_processo as number] : ""
          };
        });
        
      console.log("processosAtualizados:", processosAtualizados); // Adicione este console.log para verificar processosAtualizados

        setProcessosComNomes(processosAtualizados);
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchProcessosComNomes();
  }, [data, tiposDeProcesso, partesContrarias]);

  const getStatusColor = (status?: number) => {
    switch (status) {
      case 1:
        return "green";
      case 2:
        return "gray";
      case 3:
        return "red";
      case 4:
        return "orange";
      default:
        return "blue"; // Cor padrão (azul) caso o status não corresponda a nenhum dos casos acima
    }
  };

  return (
    <tbody>
      {processosComNomes.map((processo) => (
        <tr
          key={processo.id}
          onClick={() => navigateToDetalhes(processo.id)}
          style={{ cursor: "pointer" }}
        >
          <td>{processo.cliente}</td>
          <td>{processo.parte_contraria}</td>
          <td>{processo.numero_processo}</td>
          <td>
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: getStatusColor(processo.status),
                marginRight: "5px",
              }}
            ></span>
            {processo.tipo_processo ? tiposDeProcesso[processo.tipo_processo] : ""}
          </td>
        </tr>
      ))}
    </tbody>
  );
};

const ListarProcessos: React.FC = () => {
  const [data, setData] = useState<Processo[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [tiposDeProcesso, setTiposDeProcesso] = useState<{ [key: number]: string }>({});
  const [partesContrarias, setPartesContrarias] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  const handlePageClick = (selectedItem: { selected: number }) => {
    setCurrentPage(selectedItem.selected + 1); // Ajuste para indexar a página a partir de 1
  };

  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tiposDeProcessoResponse, processosResponse] = await Promise.all([
          axios.get("http://127.0.0.1:3001/tipos-de-processo"),
          axios.get(`http://127.0.0.1:3001/processos?page=${currentPage}`),
        ]);
  
        const totalCountResponse = await axios.get("http://127.0.0.1:3001/processos/count");
        const totalCount = totalCountResponse.data.count;
  
        const tiposDeProcesso = tiposDeProcessoResponse.data.reduce(
          (map: { [key: number]: string }, tipo: TipoProcesso) => {
            map[tipo.id] = tipo.tipo;
            return map;
          },
          {}
        );
        setTiposDeProcesso(tiposDeProcesso);
        console.log("tiposDeProcesso no ListarProcessos:", tiposDeProcesso);
  
        setData(processosResponse.data);
        const totalPages = Math.ceil(totalCount / 5);
        setTotalPages(totalPages);
      } catch (error) {
        console.log(error);
      }
    };
  
    fetchData();
  }, [currentPage, setTiposDeProcesso]);

  const setSelected = React.useCallback(
    (processo: Processo) => {
      navigate(`/processos/${processo.id}`);
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
                <Form.Label>Buscar Processo</Form.Label>
                <Form.Control
                  style={{ width: 300 }}
                  type="text"
                  placeholder="Digite o Cliente/Parte Contrária/Número do Processo"
                  name="search"
                />
              </Form.Group>
            </Col>
            <Col xl={6} className=" mt-2 d-flex" style={{ alignItems: "center" }}>
              <Button variant="primary" type="submit">
                Buscar
              </Button>
            </Col>
          </Row>
        </Form>

        <Card>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Parte Contrária</th>
                <th>Número do Processo</th>
                <th>Tipo de processo</th>
              </tr>
            </thead>
            <Processos data={data} setSelected={setSelected} tiposDeProcesso={tiposDeProcesso} partesContrarias={partesContrarias} />
          </Table>
        </Card>

        <div className="d-flex justify-content-center mt-3">
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
        </div>
      </Container>
    </>
  );
};

export default ListarProcessos;
