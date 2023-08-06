import { useState, useEffect } from "react";
import React from "react";
import { Form, Button, Modal } from "react-bootstrap";
import Header from "./Header";
import { Client } from "../components/interface";
import { ParteContraria } from "../components/interface";
import { TipoProcesso } from "../components/interface";
import axios from 'axios';
import { CreateFolder } from "../components/CreateFolder";




function AddProcess() {
  const [clientes, setClientes] = useState<Client[]>([]);
  const [partesContrarias, setPartesContrarias] = useState<ParteContraria[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<number[]>([1]);
  const [selectedParteContraria, setSelectedParteContraria] = useState<number[]>([1]);
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [tipoProcesso, setTipoProcesso] = useState<TipoProcesso[]>([]);
  const [estado] = useState("");
  const [estados, setEstados] = useState([]);
  const [cidades, setCidades] = useState<{ id: number; nome: string; estado: string }[]>([]);
  const [semNumeroProcesso, setSemNumeroProcesso] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [nomeParteContraria, setNomeParteContraria] = useState("");
  const [cpfCnpjParteContraria, setCpfCnpjParteContraria] = useState("");
  const [selectedTipoProcesso, setSelectedTipoProcesso] = useState("1"); // Alterado para string
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedCidade, setSelectedCidade] = useState("");


  const fetchPartesContrarias = async () => {
    try {
      const response = await fetch(partesContrariasUrl);
      const data = await response.json();
      setPartesContrarias(data);
    } catch (error) {
      console.log("Erro ao buscar as partes contrárias:", error);
    }
  };

  const fetchEstados = async () => {
    try {
      const response = await fetch(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      );
      const data = await response.json();
      setEstados(data);
    } catch (error) {
      console.log("Erro ao buscar os estados:", error);
    }
  };

  const fetchTipoProcesso = async () => {
    try {
      const response = await fetch(TipoProcessoUrl);
      const data = await response.json();
      setTipoProcesso(data);
    } catch (error) {
      console.log("Erro ao buscar os tipos de processo:", error);
    }
  };

  const clientesUrl = "http://localhost:3000/clientes";
  const partesContrariasUrl = "http://localhost:3000/partes-contrarias";
  const TipoProcessoUrl = "http://localhost:3000/tipos-de-processo";

  const fetchClientes = async () => {
    try {
      const response = await fetch(clientesUrl);
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.log("Erro ao buscar os clientes:", error);
    }
  };

  const fetchCidades = async () => {
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`
      );
      const data = await response.json();
      setCidades(data);
    } catch (error) {
      console.log("Erro ao buscar as cidades:", error);
    }
  };

  useEffect(() => {
    fetchClientes();
    fetchPartesContrarias();
    fetchTipoProcesso();
    fetchEstados();
  }, []);

  useEffect(() => {
    fetchCidades();
  }, [estado]);

  const handleClienteChange = (event) => {
    const clienteId = parseInt(event.target.value);
    setSelectedCliente([clienteId]);
  };

  const handleParteContrariaChange = (event) => {
    const parteContrariaId = parseInt(event.target.value);
    setSelectedParteContraria([parteContrariaId]);
  };

  const handleNumeroProcessoChange = (event) => {
    setNumeroProcesso(event.target.value);
  };

  const handleTipoProcessoChange = (event) => {
    setSelectedTipoProcesso(event.target.value); // Definir o estado selectedTipoProcesso
  };

  const handleCidadeChange = (event) => {
    const cidadeSelecionada = event.target.value;
    setSelectedCidade(cidadeSelecionada);
  };

  const handleEstadoChange = async (e) => {
    const estadoSelecionado = e.target.value;
    setSelectedEstado(estadoSelecionado);

    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado}/municipios`
      );
      const data = await response.json();
      setCidades(data);
    } catch (error) {
      console.log("Erro ao buscar as cidades:", error);
    }
  };

  const handleSemNumeroProcessoChange = (event) => {
    setSemNumeroProcesso(event.target.checked);
  };

  const handleCadastrarParteContraria = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };





  const [processoId, setProcessoId] = useState<number | null>(null);
  const [folderId, setFolderId] = useState<number | null>(null); // Renomear para evitar conflitos

  const handleSubmit = async (event) => {
    event.preventDefault();

    const clienteSelecionado = clientes.find((cliente) => cliente.id === selectedCliente[0]);
    const parteContrariaSelecionada = partesContrarias.find((parteContraria) => parteContraria.id === selectedParteContraria[0]);
    const nomeCliente = clienteSelecionado ? clienteSelecionado.nome : "Cliente não selecionado";
    const nomeParteContraria = parteContrariaSelecionada ? parteContrariaSelecionada.nome : "Parte contrária não selecionada";

    try {
      // Enviar a solicitação para incluir o processo no banco de dados
      const response = await axios.post("http://localhost:3000/processos", {
        cliente: selectedCliente,
        parteContraria: selectedParteContraria,
        numeroProcesso: semNumeroProcesso ? undefined : numeroProcesso,
        tipoProcesso: selectedTipoProcesso,
        estado: selectedEstado,
        cidade: selectedCidade,
        status: 1, // Status id 1 = Ativo
        googledrive: {
          FolderId: null, // Definir inicialmente como null
        },
      });

      // Obter o ID do processo retornado pela API
      const newProcessoId = response.data.id; // Atualizar o ID do processo
      console.log(newProcessoId);

      // Atualizar o estado com o novo ID do processo
      setProcessoId(newProcessoId);
      console.log(newProcessoId);

      const newFolderId = await CreateFolder(newProcessoId, nomeCliente, nomeParteContraria);


      // Atualizar a solicitação para incluir o processo no banco de dados com o ID da pasta
      await axios.put(`http://localhost:3000/processos/${newProcessoId}`, {
        cliente: selectedCliente,
        parteContraria: selectedParteContraria,
        numeroProcesso: semNumeroProcesso ? undefined : numeroProcesso,
        tipoProcesso: selectedTipoProcesso,
        estado: selectedEstado,
        cidade: selectedCidade,
        status: 1, // Status id 1 = Ativo
        googledrive: {
          FolderId: newFolderId, // Definir o ID da pasta retornado
        },
      });

      setSelectedCliente([]);
      setSelectedParteContraria([]);
      setNumeroProcesso("");
      setSelectedTipoProcesso("");
      setSelectedEstado("");
      setSelectedCidade("");
      console.log("Formulário limpo!");
    } catch (error) {
      // Lógica de tratamento de erro, se necessário
    }
  };

  const handleNomeParteContrariaChange = (event) => {
    setNomeParteContraria(event.target.value);
  };

  const handleCpfCnpjParteContrariaChange = (event) => {
    let value = event.target.value;
    // Remover caracteres não numéricos do valor
    value = value.replace(/\D/g, "");

    // Verificar se o valor corresponde a um CPF ou CNPJ e formatar adequadamente
    if (value.length <= 11) {
      // CPF
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else {
      // CNPJ
      value = value.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }

    setCpfCnpjParteContraria(value);
  };

  const handleCadastrarParteContrariaSubmit = (event) => {
    event.preventDefault();

    // Verificar se o nome e CPF/CNPJ foram fornecidos
    if (!nomeParteContraria || (!cpfCnpjParteContraria && !cpfCnpjParteContraria)) {
      return;
    }

    let cpf: string | null = null;
    let cnpj: string | null = null;

    // Verificar se foi fornecido um CPF
    if (cpfCnpjParteContraria && cpfCnpjParteContraria.length <= 14) {
      cpf = cpfCnpjParteContraria;
    } else if (cpfCnpjParteContraria && cpfCnpjParteContraria.length <= 18) {
      // Verificar se foi fornecido um CNPJ
      cnpj = cpfCnpjParteContraria;
    }

    // Enviar os dados de cadastro da parte contrária para a API
    const url = 'http://localhost:3000/adicionar-parte-contraria';
    const data = {
      nome: nomeParteContraria,
      cpf: cpf !== null ? cpf : null,
      cnpj: cnpj !== null ? cnpj : null,
    };
    console.log(data)

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result); // Você pode tratar a resposta da API conforme necessário

        // Limpar os campos após o envio
        fetchPartesContrarias(); //
        setNomeParteContraria('');
        setCpfCnpjParteContraria('');
        setShowPopup(false);
      })

      .catch((error) => {
        console.log('Erro ao cadastrar parte contrária:', error);
        // Lógica de tratamento de erro, se necessário
      });
  };

  return (
    <>
      <Header />
      <div className="container">
        <h1>Adicionar Processo</h1>
        <Form onSubmit={handleSubmit}>
          {clientes.length > 0 ? (
            <Form.Group controlId="cliente-select">
              <Form.Label>Cliente:</Form.Label>
              <Form.Control
                as="select"
                onChange={handleClienteChange}
                value={selectedCliente[0] || ""}
              >
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

          ) : (
            <p>Carregando clientes...</p>
          )}

          <Form.Group controlId="parte-contraria-select">
            <Form.Label>Parte contrária:</Form.Label>
            <Form.Control
              as="select"
              onChange={handleParteContrariaChange}
              value={selectedParteContraria[0] || ""}
            >
              {partesContrarias.map((parteContraria) => (
                <option key={parteContraria.id} value={parteContraria.id}>
                  {parteContraria.nome}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Button
            variant="primary"
            onClick={handleCadastrarParteContraria}
            className="mb-3 mt-3"
          >
            Cadastrar Parte Contrária
          </Button>
          <Form.Group controlId="numero-processo-input">
            <Form.Label>Número do processo:</Form.Label>
            <Form.Control
              type="text"
              value={numeroProcesso}
              onChange={handleNumeroProcessoChange}
              disabled={semNumeroProcesso} // Desabilita o campo quando semNumeroProcesso é true
              required={!semNumeroProcesso} // Campo obrigatório se semNumeroProcesso for false
            />
          </Form.Group>

          <Form.Group controlId="sem-numero-processo-checkbox">
            <Form.Check
              type="checkbox"
              label="Sem número de processo"
              checked={semNumeroProcesso}
              onChange={handleSemNumeroProcessoChange}
            />
          </Form.Group>

          <Form.Group controlId="tipo-processo-input">
            <Form.Label>Tipo de processo:</Form.Label>
            <Form.Control
              as="select"
              onChange={handleTipoProcessoChange}
              value={selectedTipoProcesso} // Usar selectedTipoProcesso em vez de tipoProcesso
            >
              {tipoProcesso.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.tipo}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="estado-input">
            <Form.Label>Estado:</Form.Label>
            <Form.Select value={selectedEstado} onChange={handleEstadoChange}>
              <option value="">Selecione um estado</option>
              {estados.map((estado: { sigla: string, nome: string }) => (
                <option key={estado.sigla} value={estado.sigla}>
                  {estado.nome}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group controlId="cidade-input">
            <Form.Label>Cidade:</Form.Label>
            <Form.Control as="select" value={selectedCidade} onChange={handleCidadeChange}>
              <option value="">Selecione uma cidade</option>
              {cidades.map((cidade) => (
                <option key={cidade.id} value={cidade.nome}>
                  {cidade.nome}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Button variant="primary" type="submit" className="mb-3 mt-3">
            Adicionar processo
          </Button>
        </Form>

        <Modal show={showPopup} onHide={handlePopupClose}>
          <Modal.Header closeButton>
            <Modal.Title>Cadastrar Parte Contrária</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleCadastrarParteContrariaSubmit}>
              <Form.Group controlId="nome-parte-contraria-input">
                <Form.Label>Nome/Razão Social:</Form.Label>
                <Form.Control
                  type="text"
                  value={nomeParteContraria}
                  onChange={handleNomeParteContrariaChange}
                  required
                />
              </Form.Group>

              <Form.Group controlId="cpf-cnpj-parte-contraria-input">
                <Form.Label>CPF/CNPJ:</Form.Label>
                <Form.Control
                  type="text"
                  value={cpfCnpjParteContraria}
                  onChange={handleCpfCnpjParteContrariaChange}
                  maxLength={18}
                  required
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="mb-3 mt-3">
                Cadastrar
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
}

export default AddProcess;