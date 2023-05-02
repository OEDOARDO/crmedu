import React, { useState } from 'react';
import axios from 'axios';

const RegAdm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setsenha] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/regadm', { name, email, senha });
      console.log(response);
      alert('Usuário criado com sucesso!');
      setName('');
      setEmail('');
      setsenha('');
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
          <label htmlFor="name">Nome:</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="email">E-mail:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="senha">Senha:</label>
          <input type="senha" id="senha" value={senha} onChange={(e) => setsenha(e.target.value)} />
        </div>
        <button type="submit">Adicionar</button>
      </form>
    </div>
  );
};

export default RegAdm;