const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('./src/router/config');
const cors = require('cors');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

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

const jwtSecret = 'secret';

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
          res.status(200).send({ token });
        }
      });
    }
  });
});

app.get('/verificarsessao', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ error: 'Não autorizado.' });
  } else {
    const token = authHeader.split(' ')[1];
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
            res.status(200).send({ user });
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
        const { nome, cpf, endereco, email, telefones, observacoes } = req.body;
      
        const { cep, rua, bairro, cidade, estado, numero } = endereco;
      
        connection.query(
          `INSERT INTO clientes (nome, cpf, endereco_cep, endereco_rua, endereco_bairro, endereco_cidade, endereco_estado, endereco_numero, email, observacoes) 
          VALUES ('${nome}', '${cpf}', '${cep}', '${rua}', '${bairro}', '${cidade}', '${estado}', '${numero}', '${email}', '${observacoes}')`, 
          (err, results) => {
            if (err) throw err;
      
            const clienteId = results.insertId;
      
            telefones.forEach(telefone => {
              connection.query(`INSERT INTO telefones (numero, cliente_id) VALUES ('${telefone}', ${clienteId})`, (err, results) => {
                if (err) throw err;
              });
            });
      
            res.send({ message: 'Cliente cadastrado com sucesso.' });
          }
        );
      });
        
      app.get('/clientes', (req, res) => {
        const query = `
          SELECT c.*, GROUP_CONCAT(t.numero SEPARATOR ', ') as telefones
          FROM clientes c
          LEFT JOIN telefones t ON c.id = t.cliente_id
          GROUP BY c.id
        `;
        
        connection.query(query, (error, results, fields) => {
          if (error) {
            console.error('Erro ao listar clientes:', error);
            res.status(500).send({ error: 'Não foi possível listar os clientes.' });
            return;
          }
          
          const clientes = results.map(cliente => ({
            id: cliente.id,
            nome: cliente.nome,
            cpf: cliente.cpf,
            endereco: {
              cep: cliente.endereco_cep,
              rua: cliente.endereco_rua,
              bairro: cliente.endereco_bairro,
              cidade: cliente.endereco_cidade,
              estado: cliente.endereco_estado,
              numero: cliente.endereco_numero,
            },
            email: cliente.email,
            observacoes: cliente.observacoes,
            telefones: cliente.telefones.split(', '),
          }));
          
          res.send(clientes);
        });
      });

      app.get('/clientes/:id', (req, res) => {
        const { id } = req.params;
        const query = `
          SELECT c.*, GROUP_CONCAT(t.numero SEPARATOR ', ') as telefones
          FROM clientes c
          LEFT JOIN telefones t ON c.id = t.cliente_id
          WHERE c.id = ?
          GROUP BY c.id
        `;
      
        connection.query(query, [id], (error, results, fields) => {
          if (error) {
            console.error(`Erro ao buscar cliente ${id}:`, error);
            res.status(500).send({ error: 'Não foi possível buscar o cliente.' });
            return;
          }
          if (results.length === 0) {
            res.status(404).send({ error: `Cliente ${id} não encontrado.` });
            return;
          }
      
          const cliente = {
            id: results[0].id,
            nome: results[0].nome,
            cpf: results[0].cpf,
            endereco: {
              cep: results[0].endereco_cep,
              rua: results[0].endereco_rua,
              bairro: results[0].endereco_bairro,
              cidade: results[0].endereco_cidade,
              estado: results[0].endereco_estado,
              numero: results[0].endereco_numero,
            },
            email: results[0].email,
            observacoes: results[0].observacoes,
            telefones: results[0].telefones.split(', '),
          };
      
          res.send(cliente);
        });
      });
      


app.listen(3000, () => {
    console.log('Servidor iniciado na porta 3000!');
  });
