// CTF - SQL Injection no Login
// Tecnologias: Node.js, Express, SQLite

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const db = new sqlite3.Database(':memory:');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Criar tabela e inserir dados vulneráveis
db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
    db.run("INSERT INTO users (username, password) VALUES ('admin', 'admin123')");
    db.run("INSERT INTO users (username, password) VALUES ('user', 'user123')");
    db.run("CREATE TABLE flags (id INTEGER PRIMARY KEY, flag TEXT)");
    db.run("INSERT INTO flags (flag) VALUES ('VULCOM{SQLi_Exploit_Success}')");
});

// Rota de login com SQL Injection
app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // CONSULTA SQL VULNERÁVEL 🚨

// ? marca o local onde onde parametros serão veinculados (binding
// no caso do sqlite, caractere ? é usado para marcar o lugar dos
//parametros, outros DB usam caracteres diferentes, como $1.
// consultar documentação)
const query = `SELECT * FROM users WHERE username = ? AND password = ?'`;
//const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    // .all(query [], (err, rows) =>{
        // os valores dos parametros passado sao passados no segundo argumento, entre [
        // os valores sao sanitizados antes de serem incorporados a consulta]})
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.send('Erro no servidor');
        }
        if (rows.lenght > 0) {
            console.log('CONSULTA: ', query);
            console.log('RESULTADO:', rows);
            return res.send(`Bem-vindo, ${username}! <br> Flag: VULCOM{SQLi_Exploit_Success}`);
        } else {
            return res.send('Login falhou!');
        }
    });
});

app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
