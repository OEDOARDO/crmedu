const express = require('express');
const mysql = require('mysql');
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
  connection.query('SELECT * FROM usuarios WHERE email = ?', [email], (err, results) => {
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
          res.status(200).send({ token, id: user.id }); // Inclui o ID do usuário na resposta
        }
      });
    }
  });
});

app.post("/registrar-andamento", async (req, res) => {
  try {
    const { atividade, remeterUsuario, remeterGrupo, usuario, grupo, dataAgendamento, numeroprocesso, observacoes, id_usuario } = req.body;

    // Verifique se os campos obrigatórios foram fornecidos
    if (!atividade || (remeterUsuario === undefined && remeterGrupo === undefined)) {
      return res.status(400).json({ message: "Campos obrigatórios estão faltando ou inválidos" });
    }

    let agendamentoId = null; // Inicialize o agendamentoId como null

    // Verifique se o campo "remeterGrupo" é verdadeiro
    if (remeterGrupo) {
      // Crie um novo registro de agendamento no banco de dados
      const novoAgendamento = {
        atividade,
        grupo,
        data_agendamento: formatDate(dataAgendamento), // Formate a data no formato "dia/mês/ano"
        usuario: null,
      };

      // Insira o novo agendamento na tabela de agendamentos
      const insercaoAgendamento = await new Promise((resolve, reject) => {
        connection.query('INSERT INTO agendamentos SET ?', novoAgendamento, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      // Obtenha o ID do agendamento inserido
      agendamentoId = insercaoAgendamento.insertId;
    }

    // Crie um novo registro de anotação no banco de dados
    const novaAnotacao = {
      descricao: observacoes,
      atividade_id: atividade,
      processo_id: numeroprocesso,
      data_registro: new Date(),
      agendamento_id: agendamentoId,
      id_usuario: id_usuario,
    };

    // Insira a nova anotação na tabela de anotações
    const insercaoAnotacao = await new Promise((resolve, reject) => {
      const sql = 'INSERT INTO anotacoes (descricao, atividade_id, processo_id, data_registro, agendamento_id, id_usuario) VALUES (?, ?, ?, ?, ?, ?)';
      const values = [observacoes, atividade, numeroprocesso, new Date(), agendamentoId, id_usuario];
    
      connection.query(sql, values, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });

    // Verifique se o campo "remeterUsuario" é verdadeiro e o ID do usuário é fornecido
    if (remeterUsuario && usuario) {
      // Crie um novo registro de agendamento no banco de dados
      const novoAgendamento = {
        atividade,
        usuarioId: usuario,
        dataAgendamento,
      };

      // Insira o novo agendamento na tabela de agendamentos
      const insercaoAgendamento = await new Promise((resolve, reject) => {
        connection.query('INSERT INTO agendamentos SET ?', novoAgendamento, (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });
    }

    // Retorne uma resposta de sucesso
    res.status(200).json({ message: "Andamento registrado com sucesso" });
  } catch (error) {
    // Em caso de erro, retorne uma resposta de erro
    console.error(error);
    res.status(500).json({ message: "Erro ao registrar o andamento" });
  }
});

function formatDate(date) {
  const data = new Date(date);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = String(data.getFullYear());

  return `${ano}/${mes}/${dia}`;
}





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

app.post('/registrar-usuario', (req, res) => {
  const { nome, email, senha, equipe } = req.body;
  bcrypt.hash(senha, 10, (err, hash) => {
    if (err) {
      console.error(err);
      res.status(500).send({ error: 'Erro ao criar o usuário.' });
      return;
    }

    connection.query(
      `INSERT INTO usuarios (nome, email, senha, equipe_id) VALUES ('${nome}', '${email}', '${hash}', ${equipe})`,
      (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send({ error: 'Erro ao criar o usuário.' });
          return;
        }

        res.send({ message: 'Usuário criado com sucesso.' });
      }
    );
  });
});

app.get('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT id, nome, equipe_id, email, tipo_id
    FROM usuarios
    WHERE id = ?
  `;

  connection.query(query, [id], (error, results, fields) => {
    if (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      res.status(500).send({ error: 'Não foi possível buscar o usuário.' });
      return;
    }
    if (results.length === 0) {
      res.status(404).send({ error: `Usuário ${id} não encontrado.` });
      return;
    }

    const usuario = results[0];
    res.send(usuario);
  });
});


app.post('/processos', (req, res) => {
  const { cliente, parteContraria, numeroProcesso, tipoProcesso, estado, cidade, status } = req.body;

  // Verifica se o número do processo está definido
  const numero = numeroProcesso ? numeroProcesso : null;

  const query = `INSERT INTO processos (id_cliente, parte_contraria, numero_processo, tipo_processo, estado, comarca, data_protocolo, status) 
                 VALUES ('${cliente}', '${parteContraria}', '${numero}', '${tipoProcesso}', '${estado}', '${cidade}', CURDATE(), ${status})`;

  connection.query(query, (err, results) => {
    if (err) {
      // Trate os erros adequadamente
      console.error(err);
      res.status(500).send({ error: 'Erro ao adicionar o processo.' });
      return;
    }

    const processoId = results.insertId;
    const numeroAtualizado = numero || processoId;

    const updateQuery = `UPDATE processos SET numero_processo = '${numeroAtualizado}' WHERE id = ${processoId}`;
    connection.query(updateQuery, (updateErr, updateResults) => {
      if (updateErr) {
        // Trate os erros adequadamente
        console.error(updateErr);
        res.status(500).send({ error: 'Erro ao atualizar o número do processo.' });
        return;
      }

      res.send({ message: 'Processo adicionado com sucesso.' });
    });
  });
});

    app.get('/processos', (req, res) => {
      connection.query('SELECT * FROM processos', (err, results) => {
        if (err) {
          // Trate os erros adequadamente
          console.error(err);
          res.status(500).send({ error: 'Erro ao obter os processos.' });
          return;
        }
    
        res.send(results);
      });
    });

    app.get('/processos/:id', (req, res) => {
      const { id } = req.params;
      const query = `
        SELECT *
        FROM processos
        WHERE id = ?
      `;
    
      connection.query(query, [id], (error, results, fields) => {
        if (error) {
          console.error(`Erro ao buscar processo ${id}:`, error);
          res.status(500).send({ error: 'Não foi possível buscar o processo.' });
          return;
        }
        if (results.length === 0) {
          res.status(404).send({ error: `Processo ${id} não encontrado.` });
          return;
        }
    
        const processo = results[0];
        res.send(processo);
      });
    });

    const moment = require('moment');

app.get('/processos/:id/observacoes', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT id, descricao, atividade_id, processo_id, data_registro, agendamento_id, id_usuario
    FROM anotacoes
    WHERE processo_id = ?
  `;

  connection.query(query, [id], (error, results, fields) => {
    if (error) {
      console.error(`Erro ao buscar anotações do processo ${id}:`, error);
      res.status(500).send({ error: 'Não foi possível buscar as anotações do processo.' });
      return;
    }

    // Formatar a data e o horário no padrão brasileiro
    const formattedResults = results.map((result) => ({
      ...result,
      data_registro: moment(result.data_registro).format('DD-MM-YYYY HH:mm'),
    }));

    res.send(formattedResults);
  });
});

    app.get('/equipes', (req, res) => {
      connection.query('SELECT * FROM equipes', (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send({ error: 'Erro ao obter as equipes.' });
          return;
        }
    
        res.send(results);
      });
    });

    app.get('/equipes/:id', (req, res) => {
      const equipeId = req.params.id;
    
      connection.query('SELECT * FROM equipes WHERE id = ?', equipeId, (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send({ error: 'Erro ao obter a equipe.' });
          return;
        }
    
        if (results.length === 0) {
          res.status(404).send({ error: 'Equipe não encontrada.' });
          return;
        }
    
        const equipe = results[0];
        res.send(equipe);
      });
    });
    

    app.get('/atividades', (req, res) => {
      connection.query('SELECT * FROM atividades', (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send({ error: 'Erro ao obter as atividades.' });
          return;
        }
    
        res.send(results);
      });
    });

    app.get('/atividades/:id', (req, res) => {
      const atividadeId = req.params.id;
    
      connection.query('SELECT * FROM atividades WHERE id = ?', atividadeId, (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).send({ error: 'Erro ao obter a atividade.' });
          return;
        }
    
        if (results.length === 0) {
          res.status(404).send({ error: 'Atividade não encontrada.' });
          return;
        }
    
        const atividade = results[0];
        res.send(atividade);
      });
    });

    app.post('/adicionar-parte-contraria', (req, res) => {
      const { nome, cpf, cnpj } = req.body;
    
      // Verificar se o nome e CPF/CNPJ foram fornecidos
      if (!nome || (!cpf && !cnpj)) {
        return res.status(400).send({ message: 'Nome e CPF/CNPJ são campos obrigatórios.' });
      }
    
      let cpfValue = null;
      let cnpjValue = null;
    
      // Verificar a quantidade de caracteres para determinar se é CPF ou CNPJ
      if (cpf && cpf.length === 14) {
        cpfValue = cpf;
      } else if (cnpj && cnpj.length === 18) {
        cnpjValue = cnpj;
      } else {
        return res.status(400).send({ message: 'CPF/CNPJ inválido.' });
      }

  // Lógica para adicionar a parte contrária no banco de dados
  connection.query(
    'INSERT INTO partes_contrarias (nome, cpf, cnpj) VALUES (?, ?, ?)',
    [nome, cpf, cnpj],
    (err, results) => {
      if (err) {
        console.log('Erro ao adicionar parte contrária:', err);
        return res.status(500).send({ message: 'Erro ao adicionar parte contrária.' });
      }
      
      return res.status(200).send({ message: 'Parte contrária adicionada com sucesso.' });
    }
  );
});

app.get('/partes-contrarias', (req, res) => {
  // Lógica para obter a lista de partes contrárias do banco de dados
  connection.query('SELECT * FROM partes_contrarias', (err, results) => {
    if (err) {
      console.log('Erro ao obter partes contrárias:', err);
      return res.status(500).send({ message: 'Erro ao obter partes contrárias.' });
    }
    app.get('/partes-contrarias/:id', (req, res) => {
      const id = req.params.id;
    
      // Lógica para obter a parte contrária específica do banco de dados com base no ID
      connection.query('SELECT * FROM partes_contrarias WHERE id = ?', id, (err, results) => {
        if (err) {
          console.log('Erro ao obter parte contrária:', err);
          return res.status(500).send({ message: 'Erro ao obter parte contrária.' });
        }
    
        // Verificar se a parte contrária foi encontrada
        if (results.length === 0) {
          return res.status(404).send({ message: 'Parte contrária não encontrada.' });
        }
    
        // Mapear os resultados do banco de dados para o formato desejado (se necessário)
        const parteContraria = {
          id: results[0].id,
          nome: results[0].nome,
          cpf: results[0].cpf,
          cnpj: results[0].cnpj,
        };
    
        return res.status(200).send(parteContraria);
      });
    });
    // Mapear os resultados do banco de dados para o formato desejado (se necessário)
    const partesContrarias = results.map((row) => ({
      id: row.id,
      nome: row.nome,
      cpf: row.cpf,
      cnpj: row.cnpj,
    }));

    return res.status(200).send(partesContrarias);
  });
});

app.get('/tipos-de-processo', (req, res) => {
  // Lógica para obter a lista de tipos de processo do banco de dados
  connection.query('SELECT * FROM tipodeprocesso', (err, results) => {
    if (err) {
      console.log('Erro ao obter tipos de processo:', err);
      return res.status(500).send({ message: 'Erro ao obter tipos de processo.' });
    }

    // Mapear os resultados do banco de dados para o formato desejado (se necessário)
    const tiposDeProcesso = results.map((row) => ({
      id: row.id,
      tipo: row.tipo,
    }));

    return res.status(200).send(tiposDeProcesso);
  });
});

app.get('/tipos-de-processo/:id', (req, res) => {
  const tipoProcessoId = req.params.id;

  // Lógica para obter o tipo de processo específico do banco de dados usando o ID fornecido
  connection.query('SELECT * FROM tipodeprocesso WHERE id = ?', [tipoProcessoId], (err, results) => {
    if (err) {
      console.log('Erro ao obter tipo de processo:', err);
      return res.status(500).send({ message: 'Erro ao obter tipo de processo.' });
    }

    if (results.length === 0) {
      return res.status(404).send({ message: 'Tipo de processo não encontrado.' });
    }

    const tipoProcesso = results[0];
    res.send(tipoProcesso);
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
