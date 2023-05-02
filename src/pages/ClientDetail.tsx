import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface Client {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  // adicione aqui outras propriedades que deseja exibir
}

interface Props {
  id: string;
}

function ClientDetail() {
  const [client, setClient] = useState<Client>({
    id: 0,
    nome: '',
    cpf: '',
    email: '',
  });

  const { id } = useParams<Record<string, string>>();

  useEffect(() => {
    axios
      .get(`http://localhost:3000/clientes/${id}`)
      .then((response) => {
        setClient(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id]);

  return (
    <div>
      <h2>{client.nome}</h2>
      <p>{client.cpf}</p>
      <p>{client.email}</p>
      {/* Adicione aqui os outros campos que deseja exibir */}
    </div>
  );
}

export default ClientDetail;
