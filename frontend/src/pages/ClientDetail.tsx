import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Header from "./Header";
import 'bootstrap/dist/css/bootstrap.min.css';
import consultarCep from '../components/ConsultarCep';
import { cpfRegex, telefoneRegex, emailRegex, cepRegex } from '../components/regex';
import { Client } from '../components/interface';
import { Container } from 'react-bootstrap';



function ClientDetail() {
  const [client, setClient] = useState<Client>({
    id: 0,
    nome: '',
    cpf: '',
    endereco: {
      cep: '',
      rua: '',
      bairro: '',
      cidade: '',
      estado: '',
      numero: '',
    },
    email: '',
    observacoes: '',
    telefones: [],
  });

  const [editing, setEditing] = useState(false);
  const [consultandoCep, setConsultandoCep] = useState(false); // Novo estado
  const { id } = useParams<Record<string, string>>();


  const handleEditClick = () => {
    setEditing(true);
  };

  const updateTelefone = (index, telefone) => {
    const telefonesAtualizados = [...client.telefones];
    telefonesAtualizados[index] = telefone;
    setClient({ ...client, telefones: telefonesAtualizados });
  };

  const addTelefone = () => {
    if (client.telefones.length < 3) {
      setClient({ ...client, telefones: [...client.telefones, ""] });
    }
  };

  const handleSaveClick = () => {
    axios
      .put(`http://18.225.117.159:3000/clientes/${id}`, client)
      .then(() => {
        setEditing(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleDeleteClick = () => {
    axios
      .delete(`http://18.225.117.159:3000/clientes/${id}`)
      .then(() => {
        // redirecionar para a lista de clientes após a exclusão bem sucedida
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const handleCpfBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const cpf = event.target.value;
    const cpfFormatado = cpfRegex(cpf);
    if (!cpfFormatado) {
      // Tratar erro de CPF inválido
      return;
    }
    setClient({ ...client, cpf: cpfFormatado });
  };

  const handleTelefoneBlur = (event: React.FocusEvent<HTMLInputElement>, index: number) => {
    const telefone = event.target.value;
    const telefoneFormatado = telefoneRegex(telefone);
    if (!telefoneFormatado) {
      // Tratar erro de telefone inválido
      return;
    }
    const telefonesAtualizados = [...client.telefones];
    telefonesAtualizados[index] = telefoneFormatado;
    setClient({ ...client, telefones: telefonesAtualizados });
  };

  const handleEmailBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const email = event.target.value;
    const emailValido = emailRegex.test(email);
    if (!emailValido) {
      // Tratar erro de e-mail inválido
      return;
    }
    setClient({ ...client, email: email });
  };
  
  const handleCepBlur = async (cep: string) => {
    const cepFormatado = cepRegex(cep);
    if (!cepFormatado) {
      setConsultandoCep(false);
      return;
    }
    if (!consultandoCep) {
      setConsultandoCep(true);
      try {
        consultarCep(cepFormatado, setClient, client); // note que estamos passando cepFormatado ao invés de cep
      } catch (error) {
        console.log(error);
      } finally {
        setConsultandoCep(false);
        setClient({ ...client, endereco: { ...client.endereco, cep: cepFormatado } }); // atualiza o valor do campo com o cep formatado
      }
    }
  };

  useEffect(() => {
    axios
      .get(`http://18.225.117.159:3000/clientes/${id}`)
      .then((response) => {
        setClient(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id]);

  return (
    <><Header /><Container fluid>

      <h2>Detalhes do cliente</h2>
      <div className="row">
        <div className="col-sm-4">
          <label htmlFor="nome">Nome:</label>
          <input type="text" className="form-control" id="nome" value={client.nome} disabled={!editing} onChange={(event) => setClient({ ...client, nome: event.target.value })} />
        </div>
        <div className="col-sm-4">
          <label htmlFor="cpf">CPF:</label>
          <input type="text" className="form-control" id="cpf" value={client.cpf} disabled={!editing} onChange={(event) => setClient({ ...client, cpf: event.target.value })} onBlur={(event) => setClient({ ...client, cpf: cpfRegex(event.target.value) })} />
        </div>
        <div className="col-sm-4">
          <label htmlFor="email">E-mail:</label>
          <input type="text" className="form-control" id="email" value={client.email} disabled={!editing} onChange={(event) => setClient({ ...client, email: event.target.value })} pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" />
        </div>
        <div className="col-sm-4">
          <label htmlFor="cep">CEP:</label>
          <input type="text" className="form-control" id="cep" value={client.endereco.cep} disabled={!editing || consultandoCep} onChange={(event) => setClient({ ...client, endereco: { ...client.endereco, cep: event.target.value } })} onBlur={(event) => handleCepBlur(event.target.value)} />
          {consultandoCep && <span className="text-muted">Consultando CEP...</span>}
        </div>
        <div className="col-sm-4">
          <label htmlFor="rua">Rua:</label>
          <input type="text" className="form-control" id="rua" value={client.endereco.rua} disabled={!editing} onChange={(event) => setClient({ ...client, endereco: { ...client.endereco, rua: event.target.value } })} />
        </div>
        <div className="col-sm-4">
          <label htmlFor="bairro">Bairro:</label>
          <input type="text" className="form-control" id="bairro" value={client.endereco.bairro} disabled={!editing} onChange={(event) => setClient({ ...client, endereco: { ...client.endereco, bairro: event.target.value } })} />
        </div>
        <div className="col-sm-4">
          <label htmlFor="cidade">Cidade:</label>
          <input type="text" className="form-control" id="cidade" value={client.endereco.cidade} disabled={!editing} onChange={(event) => setClient({ ...client, endereco: { ...client.endereco, cidade: event.target.value } })} />
        </div>
        <div className="col-sm-4">
          <label htmlFor="estado">Estado:</label>
          <input type="text" className="form-control" id="estado" value={client.endereco.estado} disabled={!editing} onChange={(event) => setClient({ ...client, endereco: { ...client.endereco, estado: event.target.value } })} />
        </div>
        <div className="col-sm-4">
          <label htmlFor="numero">Número:</label>
          <input type="text" className="form-control" id="numero" value={client.endereco.numero} disabled={!editing} onChange={(event) => setClient({ ...client, endereco: { ...client.endereco, numero: event.target.value } })} />
        </div>
        <div className="col-sm-4">
          <label htmlFor="observacoes">Observações:</label>
          <textarea className="form-control" id="observacoes" value={client.observacoes} disabled={!editing} onChange={(event) => setClient({ ...client, observacoes: event.target.value })} />
        </div>
        <div className="col-sm-4">
          <label htmlFor="telefones">Telefones:</label>
          {client.telefones.map((telefone, index) => (
            <div key={index} className="mb-2">
              <input type="text" value={telefone} disabled={!editing} onChange={(event) => updateTelefone(event, index)} onBlur={(event) => handleTelefoneBlur(event, index)} className="form-control" />
            </div>
          ))}
          {client.telefones.length < 3 && editing && (
            <div>
              <button className="btn btn-primary" onClick={addTelefone}>Adicionar telefone</button>
            </div>
          )}
        </div>
      </div>
      {editing ? (
        <button className="btn btn-primary" onClick={handleSaveClick}>
          Salvar
        </button>
      ) : (
        <button className="btn btn-primary" onClick={handleEditClick}>
          Editar
        </button>
      )}
      <button className="btn btn-danger" onClick={handleDeleteClick}>
        Excluir
      </button>
    </Container></>
);
}

export default ClientDetail;