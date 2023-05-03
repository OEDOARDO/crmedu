import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import Header from "./Header";
import { telefoneRegex, cpfRegex, cepRegex } from "../components/regex";


const AddClient = () => {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    telefones: [""], 
    endereco: {
      cep: "",
      rua: "",
      bairro: "",
      cidade: "",
      estado: "",
      numero: "",
    },
    email: "",
    observacoes: "",
  });

  const handleAddTelefone = () => {
    setFormData({
      ...formData,
      telefones: [...formData.telefones, ""],
    });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post("http://localhost:3000/addcliente", formData)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    setFormData({
      nome: "",
      cpf: "",
      telefones: [""],
      endereco: {
        cep: "",
        rua: "",
        bairro: "",
        cidade: "",
        estado: "",
        numero: "",
      },
      email: "",
      observacoes: "",
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name.startsWith("telefone")) {
      const telefoneIndex = Number(name.replace("telefone", ""));
      const telefones = [...formData.telefones];
      telefones[telefoneIndex] = telefoneRegex(value)
      setFormData({
        ...formData,
        telefones,
      });

    } else if (name === "cpf") {
      const formattedCPF = cpfRegex(value);
      setFormData({ ...formData, [name]: formattedCPF });

    } else if (name === "endereco.cep") {
      const cep = cepRegex(value);
      setFormData({ ...formData, endereco: { ...formData.endereco, cep: cep } });
      if (cep.length === 9) {
        axios.get(`https://viacep.com.br/ws/${cep}/json/`).then((res) => {
          console.log(res.data);
          const { logradouro, bairro, localidade, uf } = res.data;
          setFormData({
            ...formData,
            endereco: {
              ...formData.endereco,
              cep: cep,
              rua: logradouro,
              bairro: bairro,
              cidade: localidade,
              estado: uf,
            },
          });
        });
      }
    } else if (name.startsWith("endereco.")) {
      const enderecoFieldName = name.split(".")[1];
      setFormData({
        ...formData,
        endereco: {
          ...formData.endereco,
          [enderecoFieldName]: value,
        },
      });
    } else { {
      setFormData({ ...formData, [name]: value });
    }
  }
  };

  return (
    <>
      <Header />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formNome">
                <Form.Label>Nome</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Digite o nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicCPF">
                <Form.Label>CPF</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Digite o CPF"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicTelefones">
  <Form.Label>Telefones</Form.Label>
  {formData.telefones.map((telefone, index) => (
    <div key={index}>
      <Form.Control
        type="text"
        name={`telefone${index}`}
        placeholder="Telefone com DDD"
        onChange={handleChange}
        value={telefone}
        maxLength={14}
      />
    </div>
  ))}
  <Button variant="primary" onClick={handleAddTelefone}>
    Adicionar Outros Números
  </Button>
</Form.Group>

              <Form.Group controlId="formEndereco">
<Form.Group controlId="formCEP">
<Form.Label>CEP</Form.Label>
<Form.Control type="text" placeholder="Digite o CEP" name="endereco.cep" value={formData.endereco.cep} maxLength={9} onChange={handleChange} required />
</Form.Group>
<Form.Group controlId="formRua">
<Form.Label>Rua</Form.Label>
<Form.Control type="text" placeholder="Digite a rua" name="endereco.rua" value={formData.endereco.rua} onChange={handleChange} required />
</Form.Group>
<Form.Group controlId="formBairro">
<Form.Label>Bairro</Form.Label>
<Form.Control type="text" placeholder="Digite o bairro" name="endereco.bairro" value={formData.endereco.bairro} onChange={handleChange} required />
</Form.Group>
<Form.Group controlId="formCidade">
<Form.Label>Cidade</Form.Label>
<Form.Control type="text" placeholder="Digite a cidade" name="endereco.cidade" value={formData.endereco.cidade} onChange={handleChange} required />
</Form.Group>
<Form.Group controlId="formEstado">
<Form.Label>Estado</Form.Label>
<Form.Control type="text" placeholder="Digite o estado" name="endereco.estado" value={formData.endereco.estado} onChange={handleChange} required />
</Form.Group>
<Form.Group controlId="formNumero">
<Form.Label>Número</Form.Label>
<Form.Control type="text" placeholder="Digite o número" name="endereco.numero" value={formData.endereco.numero} onChange={handleChange} required />
</Form.Group>
</Form.Group>


              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>E-mail</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Digite o e-mail"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="formObservacoes">
                <Form.Label>Observações</Form.Label>
                <Form.Control
                  as="textarea"
                  placeholder="Digite as observações"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit">
                Adicionar Cliente
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddClient;
