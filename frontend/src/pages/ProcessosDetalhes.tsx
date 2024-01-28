import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { BsPeopleFill } from "react-icons/bs";
import { MdDescription, MdLocationOn, MdInfo } from "react-icons/md";
import "./Header.css";
import Header from "./Header";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import MostrarAndamento from "../MostrarAndamento";
import Cookies from 'js-cookie';



const ProcessoDetalhes: React.FC = () => {


  const [showRegistroAndamento, setShowRegistroAndamento] = useState(false);
  const [atividades, setAtividades] = useState<
    { equipe_id: number; id: number; nome: string }[]
  >([]);
  const [equipes, setEquipes] = useState<{ id: number; nome: string }[]>([]);
  const [processo, setProcesso] = useState<{
    id: number,
    numero_processo: number;
    tipo_processo: string;
    id_cliente: string;
    parte_contraria: string,
    estado: string;
    comarca: string;
    data_protocolo: string;
    loading: boolean;
  }>({
    id: 0,
    numero_processo: 0,
    comarca: "",
    tipo_processo: "",
    parte_contraria: "",
    id_cliente: "",
    estado: "",
    data_protocolo: "",
    loading: true,
  });


  const [nomeCliente, setNomeCliente] = useState("");
  const [cpfCnpjCliente, setCpfCnpjCliente] = useState("");
  const [nomeRequerida, setRequerida] = useState("");
  const [CpfCnpjRequerida, setCpfCnpjRequerida] = useState("");
  const [tiposDeProcesso, setTiposDeProcesso] = useState<
    { id: number; tipo: string }[] | undefined
  >([]);
  const [tipoProcesso, setTipoProcesso] = useState<string | null>(null);
  const dataProtocolo = new Date(processo?.data_protocolo ? processo.data_protocolo : "").toLocaleDateString("pt-BR");
  const { id } = useParams();
  const processoId = id ? parseInt(id) : 0;


  //Anotações
  const handleRegistrar = async () => {
    const userId = Cookies.get("userId");
    const data = {
      atividade: selectedAtividade,
      remeterUsuario: remeterUsuario,
      remeterGrupo: remeterGrupo,
      usuario: selectedUsuario,
      grupo: selectedGrupo,
      dataAgendamento: dataAgendamento,
      numeroprocesso: processo?.id,
      observacoes: observacoes,
      id_usuario: userId,
    };

    try {
      // Envie os dados para o servidor
      const response = await axios.post("http://3.141.59.134:3000/registrar-andamento", data);
      // Lide com a resposta do servidor
      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  };

  const [selectedAtividade, setSelectedAtividade] = useState("");
  const [remeterUsuario, setRemeterUsuario] = useState(false);
  const [remeterGrupo, setRemeterGrupo] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState("");
  const [selectedGrupo, setSelectedGrupo] = useState("");
  const [dataAgendamento, setAgendamento] = useState(new Date());
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    fetchAtividades();
    fetchEquipes();
    fetchProcesso();
  }, []);

  const fetchProcesso = async () => {
    try {
      const response = await axios.get(`http://3.141.59.134:3000/processos/${id}`);
      setProcesso(response.data);

      // Obtenha os dados do cliente
      const responseCliente = await axios.get(`http://3.141.59.134:3000/clientes/${response.data.id_cliente}`);
      const clienteData = responseCliente.data;
      setNomeCliente(clienteData.nome);
      setCpfCnpjCliente(clienteData.cpf);

      if (typeof response.data.tipo_processo === "string") {
        setTipoProcesso(response.data.tipo_processo);
        fetchTipoProcesso(response.data.tipo_processo); // Nova chamada para obter o nome do tipo de processo
      }

      const responseRequerida = await axios.get(
        `http://3.141.59.134:3000/partes-contrarias/${parseInt(
          response.data.parte_contraria,
          10
        )}`
      );
      const RequeridaData = responseRequerida.data;
      setRequerida(RequeridaData.nome);

      // Verifica se o campo "cpf" é nulo e preenche o CPF/CNPJ com base no campo não nulo
      if (RequeridaData.cpf) {
        setCpfCnpjRequerida(RequeridaData.cpf);
      } else if (RequeridaData.cnpj) {
        setCpfCnpjRequerida(RequeridaData.cnpj);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTipoProcesso = async (tipoProcessoId) => {
    try {
      const response = await axios.get(`http://3.141.59.134:3000/tipos-de-processo/${tipoProcessoId}`);
      // Atualize o estado com o nome do tipo de processo retornado pela API
      setTipoProcesso(response.data.tipo);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAtividades = async () => {
    try {
      const response = await axios.get("http://3.141.59.134:3000/atividades");
      setAtividades(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEquipes = async () => {
    try {
      const response = await axios.get("http://3.141.59.134:3000/equipes");
      setEquipes(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemeterUsuarioChange = (event) => {
    setRemeterUsuario(event.target.checked);
    setShowRemeterUsuario(event.target.checked);
  };

  const handleRemeterGrupoChange = (event) => {
    setRemeterGrupo(event.target.checked);
    setShowRemeterGrupo(event.target.checked);
  };

  const handleUsuarioChange = (event) => {
    setSelectedUsuario(event.target.value);
  };

  const handleGrupoChange = (event) => {
    setSelectedGrupo(event.target.value);
  };


  const handleDataAgendamentoChange = (e) => {
    const selectedDate = e.target.value; // Get the value of the selected date
    const [year, month, day] = selectedDate.split('-'); // Split the date string by hyphen
    const newDate = new Date(year, month - 1, day); // Create a new Date object (month is 0-indexed)

    setAgendamento(newDate);
  };


  const getNomeEquipe = (equipeId: number) => {
    const equipe = equipes.find((equipe) => equipe.id === equipeId);
    return equipe ? equipe.nome : '';
  };

  const handleRegistrarAndamento = () => {
    setShowRegistroAndamento(true);
  };

  const handleFecharRegistroAndamento = () => {
    setShowRegistroAndamento(false);
  };

  const handleObservacoesChange = (event) => {
    setObservacoes(event.target.value);
  };
  // Função para lidar com a alteração das checkboxes Remeter a Usuário e Remeter a Grupo
  const handleCheckboxChange = (event) => {
    const { id, checked } = event.target;

    if (id === "remeterUsuario") {
      setRemeterUsuario(checked);
    } else if (id === "remeterGrupo") {
      setRemeterGrupo(checked);
    }
  };

  const [showRemeterUsuario, setShowRemeterUsuario] = useState(false);
  const [showRemeterGrupo, setShowRemeterGrupo] = useState(false);

  return (
    <>
      <Header />
      <Container fluid>
        <div className="status-container">
          <div className="status-bar-wrapper">
            <div className="status-bar">
              <h6 className="status-text">Status do Processo: Em andamento</h6>
            </div>
          </div>
        </div>
        <h1></h1>
        <div className="mb-3 d-flex justify-content-start">
          <div>
            <Button variant="btn btn-primary" size="sm" className="me-2" onClick={handleRegistrarAndamento}>
              Registrar Andamento
            </Button>
            <Link to={`/processos/${processoId}/visualizar-documentos`} className="me-2">
            <Button variant="btn btn-success" size="sm">
              Protocolo Administrativo
            </Button>
            </Link>
            <Button variant="btn btn-primary" size="sm" className="me-2">
              Financeiro
            </Button>
            <Link to={`/processos/${processoId}/upload`} className="me-2">
            <Button variant="btn btn-primary" size="sm" className="me-2">
              Juntar Documentos
            </Button>
            </Link>
            <Link to={`/processos/${processoId}/visualizar-documentos`} className="me-2">
              <Button variant="btn btn-primary" size="sm">
                Visualizar Documentos
              </Button>
            </Link>
            <Button variant="btn btn-primary" size="sm">
              Gerar Documentos
            </Button>
          </div>
        </div>
        {showRegistroAndamento && (
          <Row>
            <Col md={12}>
              <Card className="mt-4 mb-4">
                <Card.Body>
                  <h5>Registrar Andamento</h5>
                  <hr />
                  <Container>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Atividade</Form.Label>
                          <Form.Control as="select" value={selectedAtividade} onChange={(e) => setSelectedAtividade(parseInt(e.target.value, 10).toString())}>
                            <option>Selecione uma atividade</option>
                            {atividades.map((atividade) => {
                              const equipeId = atividade.equipe_id;
                              const nomeEquipe = getNomeEquipe(equipeId);
                              return (
                                <option key={atividade.id} value={atividade.id}>
                                  {`[${nomeEquipe}] ${atividade.nome}`}
                                </option>
                              );
                            })}
                          </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="checkbox"
                            id="remeterUsuario"
                            label="Remeter a Usuário"
                            checked={remeterUsuario}
                            onChange={handleRemeterUsuarioChange}
                          />
                          <Form.Check
                            type="checkbox"
                            id="remeterGrupo"
                            label="Remeter a Grupo"
                            checked={remeterGrupo}
                            onChange={handleRemeterGrupoChange}
                          />
                        </Form.Group>
                        {/* Campos adicionais para Remeter a Usuário */}
                        <Form.Group
                          className="mb-3"
                          style={{ display: showRemeterUsuario ? "block" : "none" }}
                          id="campoUsuario"
                        >
                          <Form.Label>Remeter a Usuário</Form.Label>
                          <Form.Control as="select" value={selectedUsuario} onChange={handleUsuarioChange}>
                            <option>Selecione um usuário</option>
                            {/* Opções de usuários aqui */}
                          </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3" style={{ display: showRemeterUsuario ? 'block' : 'none' }} id="campoData">
                          <Form.Label>Data</Form.Label>
                          <Form.Control
                            type="date"
                            value={dataAgendamento.toLocaleDateString('pt-BR')}
                            onChange={handleDataAgendamentoChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        {/* Campos adicionais para Remeter a Grupo */}
                        <Form.Group
                          className="mb-3"
                          style={{ display: showRemeterGrupo ? "block" : "none" }}
                          id="campoGrupo"
                        >
                          <Form.Label>Remeter a Grupo</Form.Label>
                          <Form.Control as="select" value={selectedGrupo} onChange={handleGrupoChange}>
                            <option>Selecione um grupo</option>
                            {equipes.map((equipe) => (
                              <option key={equipe.id} value={equipe.id}>
                                {equipe.nome}
                              </option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                        <Form.Group className="mb-3" style={{ display: showRemeterGrupo ? 'block' : 'none' }} id="campoData">
                          <Form.Label>Data</Form.Label>
                          <Form.Control
                            type="date"
                            value={dataAgendamento.toISOString().split('T')[0]} // Formatando a data como uma string no formato "yyyy-mm-dd"
                            onChange={handleDataAgendamentoChange}
                          />
                        </Form.Group>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={observacoes}
                          onChange={handleObservacoesChange}
                          placeholder="Digite suas observações..."
                        />
                      </Col>
                    </Row>
                    <Row className="justify-content-end">
                      <Col md={2}>
                        <Button variant="secondary" onClick={handleFecharRegistroAndamento}>
                          Fechar
                        </Button>
                      </Col>
                      <Col md={2}>
                        <Button variant="primary" onClick={handleRegistrar}>
                          Registrar
                        </Button>
                      </Col>
                    </Row>
                  </Container>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
        <Row>
          <Col md={6}>
            <Card>
              <Card.Body>
                <h5>Informações do Processo</h5>
                <hr />
                <Row className="align-items-start">
                  <Col xs={10}>
                    <Form>
                      <Row>
                        <Col xs={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <MdInfo /> Número
                            </Form.Label>
                            <Form.Control type="text" readOnly value={processo?.numero_processo} />
                          </Form.Group>
                        </Col>
                        <Col xs={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <MdLocationOn /> Cidade
                            </Form.Label>
                            <Form.Control type="text" readOnly value={processo?.comarca} />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <MdLocationOn /> Estado
                            </Form.Label>
                            <Form.Control type="text" readOnly value={processo?.estado} />
                          </Form.Group>
                        </Col>
                        <Col xs={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <MdDescription /> Natureza
                            </Form.Label>
                            <Form.Control
                              type="text"
                              readOnly
                              value={tipoProcesso !== null ? tipoProcesso : ""}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>
                              <MdDescription /> Data de Protocolo
                            </Form.Label>
                            <Form.Control type="text" readOnly value={dataProtocolo} />
                          </Form.Group>
                        </Col>
                      </Row>
                    </Form>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card>
              <Card.Body>
                <h5>Partes Envolvidas</h5>
                <hr />
                <ul className="list-group">
                  <li className="list-group-item d-flex align-items-center">
                    <BsPeopleFill className="me-3" />
                    <div>
                      <span>Requerente: {nomeCliente}</span>
                      <br />
                      <small>CPF/CNPJ: {cpfCnpjCliente}</small>
                    </div>
                  </li>
                  <li className="list-group-item d-flex align-items-center">
                    <BsPeopleFill className="me-3" />
                    <div>
                      <span>Requerida: {nomeRequerida}</span>
                      <br />
                      <small>CPF/CNPJ: {CpfCnpjRequerida}</small>
                    </div>
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Card className="mt-4">
          <Card.Body>
            <h5>Anotações</h5>
            <MostrarAndamento processoId={processo.id} />
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default ProcessoDetalhes;