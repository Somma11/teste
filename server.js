const express = require('express');
const fs = require('fs');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Middleware de CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Função para gerar UID aleatório
function generateUID() {
    return Math.floor(Math.random() * 1000000);
}

app.get('/check-permission', (req, res) => {
    console.log('Requisição recebida:', req.query);
    const nome = req.query.nome;
    const senha = req.query.senha;

    // Carregar a database.json
    fs.readFile('database.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler database.json:', err);
            res.status(500).send('Erro no servidor');
            return;
        }

        const database = JSON.parse(data);
        const usuario = database.users.find(user => user.nome === nome && user.senha === senha);

        if (usuario) {
            res.status(200).json({ status: 'permitido', uid: usuario.uid });
        } else {
            res.status(404).json({ status: 'não_permitido' });
        }
    });
});

app.get('/register', (req, res) => {
    console.log('Requisição de registro recebida:', req.query);
    const nome = req.query.nome;
    const senha = req.query.senha;

    // Carregar a database.json
    fs.readFile('database.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler database.json:', err);
            res.status(500).send('Erro no servidor');
            return;
        }

        const database = JSON.parse(data);
        const existingUser = database.users.find(user => user.nome === nome);

        if (existingUser) {
            res.status(400).send('Usuário já existe');
            return;
        }

        const newUser = {
            uid: generateUID(),
            nome: nome,
            senha: senha
        };

        database.users.push(newUser);

        fs.writeFile('database.json', JSON.stringify(database, null, 2), (err) => {
            if (err) {
                console.error('Erro ao escrever no database.json:', err);
                res.status(500).send('Erro no servidor');
                return;
            }
            res.status(201).json({ status: 'usuário registrado', uid: newUser.uid });
        });
    });
    app.get('/users', (req, res) => {
        fs.readFile('database.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Erro ao ler database.json:', err);
                res.status(500).send('Erro no servidor');
                return;
            }
    
            const database = JSON.parse(data);
            res.status(200).json(database.users);
        });
    });
    
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
