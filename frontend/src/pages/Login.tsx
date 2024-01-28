import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import './Login.css';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setPassword] = useState('');
  const [sessionChecked, setSessionChecked] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://3.141.59.134:3000/login', { email, senha });
      const { token, id } = response.data;
      Cookies.set("token", token);
      Cookies.set("userId", id);  
      axios.defaults.headers.common['Authorization'] = token;
      navigate('/'); // Navegar para a rota de home usando useNavigate
    } catch (error) {
      console.error(error);
    }
  };  

  useEffect(() => {
    const token = Cookies.get('token');
    if (token && !sessionChecked) {
      axios
        .get('http://3.141.59.134:3000/verificarsessao', { headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
          console.log('Sessão autenticada');
          setSessionChecked(true); // Atualiza o estado da sessão verificada para true
          navigate('/home'); // Redireciona para a rota de home
        })
        .catch((error) => {
          console.error(error);
          navigate('/login');
        });
    }
  }, [sessionChecked, navigate]);

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Bem-vindo de volta</h1>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formBasicEmail">
            <Form.Control type="email" placeholder="Email" value={email} onChange={handleEmailChange} required />
          </Form.Group>
          <Form.Group controlId="formBasicPassword">
            <Form.Control type="password" placeholder="Senha" value={senha} onChange={handlePasswordChange} required />
          </Form.Group>
          <Button variant="primary" type="submit">
            Entrar
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Login;
