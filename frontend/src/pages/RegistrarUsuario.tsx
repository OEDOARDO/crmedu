import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RegistrarUsuario = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [equipe, setEquipe] = useState('');   
  const [equipesList, setEquipesList] = useState<{ id: string; nome: string }[]>([]);

  useEffect(() => {
    const fetchEquipes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/equipes');
        setEquipesList(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchEquipes();
  }, []);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/registrar-usuario', { nome, email, senha, equipe });
      console.log(response);
      alert('Usuário criado com sucesso!');
      setNome('');
      setEmail('');
      setSenha('');
      setEquipe('');
    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro ao criar o usuário. Por favor, tente novamente.');
    }
  };

  return (
    <div>
      <h2>Adicionar Usuário</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nome">Nome:</label>
          <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div>
          <label htmlFor="email">E-mail:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="senha">Senha:</label>
          <input type="password" id="senha" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>
        <div>
          <label htmlFor="equipe">Equipe:</label>
          <select id="equipe" value={equipe} onChange={(e) => setEquipe(e.target.value)}>
            <option value="">Selecione uma equipe</option>
            {equipesList.map((equipe) => (
              <option key={equipe.id} value={equipe.id}>{equipe.nome}</option>
            ))}
          </select>
        </div>
        <button type="submit">Adicionar</button>
      </form>
    </div>
  );
};

export default RegistrarUsuario;
