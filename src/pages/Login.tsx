import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button } from 'react-bootstrap';
import './Login.css';
import Cookies from 'js-cookie';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setPassword] = useState('');

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

    const handleSubmit = async (event) => {
      event.preventDefault();
      try {
        const response = await axios.post('http://localhost:3000/login', { email, senha });
        console.log(response.data); 
        const token = response.headers.authorization;
        axios.defaults.headers.common['Authorization'] = token;
        console.log(token);
        window.location.href = '/home';
      } catch (error) {
        console.error(error);
      }
    };
    

    useEffect(() => {
      const token = Cookies.get('token');
      if (token) {
        axios.get('http://localhost:3000/verificarsessao', { headers: { Authorization: `Bearer ${token}` } })
          .then(() => {
            window.location.href = '/home';
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }, []);
  
  

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
