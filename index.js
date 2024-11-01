const { exec } = require('child_process');

// Iniciar o server.js
const serverProcess = exec('node server.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`Erro ao iniciar server.js: ${error}`);
        return;
    }
    console.log(`Saída do server.js: ${stdout}`);
    if (stderr) {
        console.error(`Erro do server.js: ${stderr}`);
    }
});

// Iniciar o bot.js
const botProcess = exec('node bot.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`Erro ao iniciar bot.js: ${error}`);
        return;
    }
    console.log(`Saída do bot.js: ${stdout}`);
    if (stderr) {
        console.error(`Erro do bot.js: ${stderr}`);
    }
});

// Manter os processos vivos
serverProcess.on('close', (code) => {
    console.log(`server.js finalizou com o código ${code}`);
});

botProcess.on('close', (code) => {
    console.log(`bot.js finalizou com o código ${code}`);
});
