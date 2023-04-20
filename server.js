const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('./src/router/config');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());


const connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao banco de dados MySQL!');
});


const jwtSecret = 'seu_secreto_jwt';

app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  connection.query(`SELECT * FROM usuarios WHERE email = '${email}'`, (err, results) => {
    if (err) throw err;
    if (results.length === 0) {
      res.status(401).send({ error: 'Email ou senha incorretos.' });
    } else {
      const user = results[0];
      bcrypt.compare(senha, user.senha, (err, result) => {
        if (err) throw err;
        if (!result) {
          res.status(401).send({ error: 'Email ou senha incorretos.' });
        } else {
          const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '1h' });
          res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
          res.json({ success: true });
        }
      });
    }
  });
});

app.get('/verificarsessao', (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send({ error: 'Não autorizado.' });
  } else {
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        res.status(401).send({ error: 'Não autorizado.' });
      } else {
        const userId = decoded.id;
        connection.query(`SELECT * FROM usuarios WHERE id = '${userId}'`, (err, results) => {
          if (err) throw err;
          if (results.length === 0) {
            res.status(401).send({ error: 'Não autorizado.' });
          } else {
            const user = results[0];
            res.json({ success: true, user });
          }
        });
      }
    });
  }
});

app.post('/regadm', (req, res) => {
    const { nome, email, senha } = req.body;
    bcrypt.hash(senha, 10, (err, hash) => {
      if (err) throw err;
      connection.query(`INSERT INTO usuarios (nome, email, senha) VALUES ('${nome}', '${email}', '${hash}')`, (err, results) => {
        if (err) throw err;
        res.send({ message: 'Usuário criado com sucesso.' });
      });
    });
  });

app.post('/addcliente', (req, res) => {
    const { nome, cpf, endereco, email, whatsapp, observacoes } = req.body;
    connection.query(
      `INSERT INTO clientes (nome, cpf, endereco, email, whatsapp, observacoes) 
      VALUES ('${nome}', '${cpf}', '${endereco}', '${email}', '${whatsapp}', '${observacoes}')`, 
      (err, results) => {
        if (err) throw err;
        res.send({ message: 'Cliente cadastrado com sucesso.' });
      }
    );
  });



app.listen(3000, () => {
  console.log('Servidor iniciado na porta 3000!');
});
