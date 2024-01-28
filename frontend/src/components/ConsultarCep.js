import axios from 'axios';

export default function consultarCep(cep, setClient, client) {
    axios.get(`https://viacep.com.br/ws/${cep}/json/`).then((res) => {
      console.log(res.data);
      const { logradouro, bairro, localidade, uf } = res.data;
      setClient({
        ...client,
        endereco: {
          ...client.endereco,
          cep,
          rua: logradouro,
          bairro,
          cidade: localidade,
          estado: uf,
        },
      });
    });
  }
  