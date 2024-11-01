const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const PREFIX = '!';
const API_BASE_URL = config.url;

client.once('ready', () => {
    console.log(`Bot online: ${client.user.tag}`);
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'register') {
        const nome = args[0];
        const senha = args[1];
        const test = args[2] === 'true';

        if (!nome || !senha) {
            return message.reply('Uso correto: !register <nome> <senha> <test>');
        }

        try {
            const fetch = await import('node-fetch'); // Importação dinâmica
            const response = await fetch.default(`${API_BASE_URL}/register?nome=${nome}&senha=${senha}&test=${test}`);
            const data = await response.json();
            if (response.status === 201) {
                message.reply(`Usuário ${nome} registrado com UID: ${data.uid}`);
            } else {
                message.reply(`Erro ao registrar usuário: ${data}`);
            }
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            message.reply('Erro ao registrar usuário.');
        }
    }

    if (command === 'list') {
        try {
            const fetch = await import('node-fetch'); // Importação dinâmica
            const response = await fetch.default(`${API_BASE_URL}/users`);
            const data = await response.json();
            const userList = data.map(user => `Nome: ${user.nome}, UID: ${user.uid}, Expira: ${user.expirationTime ? new Date(user.expirationTime).toLocaleString() : 'N/A'}`).join('\n');
            message.reply(`Usuários cadastrados:\n${userList}`);
        } catch (error) {
            console.error('Erro ao listar usuários:', error);
            message.reply('Erro ao listar usuários.');
        }
    }
});

client.login(config.token);
