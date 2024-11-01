const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const DATABASE_PATH = 'database.json';
const ALLOWED_USER_ID = '1273818137866801277';

const commands = [
  {
    name: 'register',
    description: 'Registrar um novo usuário',
    options: [
      {
        name: 'nome',
        type: 3, // STRING
        description: 'Nome do usuário',
        required: true
      },
      {
        name: 'senha',
        type: 3, // STRING
        description: 'Senha do usuário',
        required: true
      },
      {
        name: 'test',
        type: 5, // BOOLEAN
        description: 'Registrar como teste?',
        required: false
      }
    ]
  },
  {
    name: 'list',
    description: 'Listar todos os usuários registrados'
  }
];

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(config.token);
  
  try {
    console.log('Iniciando a atualização dos comandos de aplicação.');
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands }
    );
    console.log('Comandos de aplicação registrados com sucesso.');
  } catch (error) {
    console.error('Erro ao registrar comandos de aplicação:', error);
  }
}

client.once('ready', async () => {
  console.log(`Bot online: ${client.user.tag}`);
  await registerCommands(); // Registrar comandos ao iniciar
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  // Verificar se o usuário tem permissão para executar o comando
  if (interaction.user.id !== ALLOWED_USER_ID) {
    await interaction.reply('Você não tem permissão para usar este comando.');
    return;
  }

  if (commandName === 'register') {
    const nome = options.getString('nome');
    const senha = options.getString('senha');
    const test = options.getBoolean('test') || false;

    fs.readFile(DATABASE_PATH, 'utf8', (err, data) => {
      if (err) {
        console.error('Erro ao ler database.json:', err);
        interaction.reply('Erro ao ler a database.');
        return;
      }

      const database = JSON.parse(data);
      const existingUser = database.users.find(user => user.nome === nome);

      if (existingUser) {
        interaction.reply('Usuário já existe.');
        return;
      }

      const newUser = {
        uid: Math.floor(Math.random() * 1000000),
        nome: nome,
        senha: senha,
        ...(test && { expirationTime: Date.now() + 2 * 60 * 60 * 1000 }) // 2 horas em milissegundos
      };

      database.users.push(newUser);

      fs.writeFile(DATABASE_PATH, JSON.stringify(database, null, 2), err => {
        if (err) {
          console.error('Erro ao escrever no database.json:', err);
          interaction.reply('Erro ao registrar o usuário.');
          return;
        }
        interaction.reply(`Usuário ${nome} registrado com UID: ${newUser.uid}`);
      });
    });
  }

  if (commandName === 'list') {
    fs.readFile(DATABASE_PATH, 'utf8', (err, data) => {
      if (err) {
        console.error('Erro ao ler database.json:', err);
        interaction.reply('Erro ao ler a database.');
        return;
      }

      const database = JSON.parse(data);
      const userList = database.users.map(user => `Nome: ${user.nome}, UID: ${user.uid}, Expira: ${user.expirationTime ? new Date(user.expirationTime).toLocaleString() : 'N/A'}`).join('\n');
      interaction.reply(`Usuários cadastrados:\n${userList}`);
    });
  }
});

client.login(config.token);
