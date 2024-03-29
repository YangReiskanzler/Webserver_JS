const express = require('express');
const mysql = require('mysql');
const https = require('https');
const fs = require('fs');
require("express/lib/response");

const app = express();
const port = 3000;

const options = {
    key: fs.readFileSync('SSL/server.key'),
    cert: fs.readFileSync('SSL/server.crt')
};

// Middleware to parse JSON-data
app.use(express.json());
// Middleware to parse the URL-encoded data
app.use(express.urlencoded({ extended: true }));

//MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'webserver'
});

//connect to database
connection.connect((err) => {
    if (err) {
        console.log('Fehler beim Verbinden zur Datenbank: ', err);
        return;
    }
    console.log('Verbindung zur Datenbank erfolgreich');
});

// Route to save the form data to the database
app.post('/saveToDB', (req, res) => {
    const { vorname, nachname, email, nachricht, zahl } = req.body;
    const FormData = `Vorname: ${vorname}, Nachname: ${nachname}, Email: ${email}, Nachricht: ${nachricht}, Zahl: ${zahl}`;

    fs.appendFile('formular_daten.txt', FormData, (err) => {
        if (err) {
            console.error('Fehler beim Speichern der Formulardaten: ', err);
            res.status(500).send('Fehler beim Speichern der Formulardaten');
            return;
        }
        console.log('Die Formulardaten wurden erfolgreich gespeichert');
        res.status(500).send('Die Formulardaten wurden erfolgreich gespeichert');
    });

//create HTTPS server

https.createServer(options, app).listen(port, () => {
    console.log(`Server listening at https://localhost:${port}`);
});
});


