const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
const API_BASE_URL = 'https://teste-6omt.onrender.com';
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

    try {
      const fetch = await import('node-fetch'); // Importação dinâmica
      const response = await fetch.default(`${API_BASE_URL}/register?nome=${nome}&senha=${senha}&test=${test}`);
      const data = await response.json();
      if (response.status === 201) {
        await interaction.reply(`Usuário ${nome} registrado com UID: ${data.uid}`);
      } else {
        await interaction.reply(`Erro ao registrar usuário: ${data}`);
      }
    } catch (error) {
      console.error('Erro ao registrar usuário:', error);
      await interaction.reply('Erro ao registrar usuário.');
    }
  }

  if (commandName === 'list') {
    try {
      const fetch = await import('node-fetch'); // Importação dinâmica
      const response = await fetch.default(`${API_BASE_URL}/users`);
      const data = await response.json();
      const userList = data.map(user => `Nome: ${user.nome}, UID: ${user.uid}, Expira: ${user.expirationTime ? new Date(user.expirationTime).toLocaleString() : 'N/A'}`).join('\n');
      await interaction.reply(`Usuários cadastrados:\n${userList}`);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      await interaction.reply('Erro ao listar usuários.');
    }
  }
});

client.login(config.token);
