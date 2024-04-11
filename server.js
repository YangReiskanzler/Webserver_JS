const express = require('express');
const mysql = require('mysql');
const https = require('https');
const fs = require('fs');
//const cors = require('cors');////CORS für Fehler in der Zugriffskontrolle
const {response} = require("express");

const app = express();
const port = 3000; // Port für HTTP-Server

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

const options = {
    cert: fs.readFileSync('SSL/server.crt'),
    key: fs.readFileSync('SSL/server.key')//absichtlicher kryptograhischer Fehler: falscher Schlüssel

};

/*const corsOptions = {
    origin: 'https://localhost:3000',// Zugriff auf Server nur von dieser URL erlauben
};*/

//app.use(cors(corsOptions));
app.get("/", (req, res) => res.sendFile(`${__dirname}/index.html`))
app.use(express.static(__dirname));
// Middleware zum parse von JSON-daten
app.use(express.json());
// Middleware zum Parsen der URL-codierten Daten
app.use(express.urlencoded({extended: true}));


// MySQL Verbindung
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'webserver',
});

// Annahme: Funktion zum Authentifizieren von Benutzern
function authenticateUser(username, password) {
    // Absichtlicher Fehler: Immer erfolgreiche Authentifizierung
    return true;
}

app.post('/register', (req, res) => {
    const { username, password } = req.body;

    const tableQuery = 'CREATE TABLE IF NOT EXISTS users (username VARCHAR(255), password VARCHAR(255))';
    // kryptographischer Fehler, weil das passwort nicht gehashed ist.

    connection.query(tableQuery, (error) => {
        if (error) {
            console.error('Error creating table:', error);
            res.status(500).send('Error creating table');
            return;
        }

        const checkQuery = 'SELECT * FROM users WHERE username = ?';
        connection.query(checkQuery, [username], (error, results) => {
            if (error) {
                console.error('Error checking user:', error);
                res.status(500).send('Error checking user');
                return;
            }

            if (results.length > 0) {
                res.status(409).send('User already exists');
                return;
            }

            const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
            connection.query(insertQuery, [username, password], (error) => {
                if (error) {
                    console.error('Error inserting data into database:', error);
                    res.status(500).send('Error inserting data into database');
                    return;
                }
            });

            res.send('User registered successfully');
        });
    });
});

/*app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (authenticateUser(username, password)) {
        // Authentifizierung erfolgreich
        res.redirect('/index.html');
    } else {
        // Authentifizierung fehlgeschlagen
        res.status(401).send('Authentication failed');
    }
});*/

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Überprüfen, ob der Benutzer existiert und das Passwort übereinstimmt
    connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (error, results) => {
        if (error) {
            console.error('Error checking user:', error);
            res.status(500).send('Internal server error');
            return;
        }

        if (results.length === 0) {
            // Benutzer existiert nicht oder Passwort stimmt nicht überein
            res.status(401).send('username or password does not exist');
            return;
        }

        // Authentifizierung erfolgreich
        res.redirect('/index.html');
    });
});


app.get('/index.html', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

/*app.post('/sensitiveOperation', (req, res) => {
    const { sensitiveData } = req.body;

    // Absichtlicher Fehler: Vernachlässigung der Sicherheitsprotokollierung
    // Protokollieren Sie nicht das sensitiveData in den Serverlogs
    console.log('Sensitive data received:', sensitiveData);

    // Führen Sie sensitive Operationen durch

    // Absichtlicher Fehler: Vernachlässigung der Sicherheitsüberwachung
    // Überwachen Sie nicht, wer auf den sensiblen Endpunkt zugreift
    // Oder überwachen Sie nicht, welche Aktionen mit den sensitiven Daten durchgeführt werden

    // Senden Sie eine Antwort
    res.send('Sensitive operation completed');
});*/

// Verbindung zur Datenbank herstellen
connection.connect((err) => {
    if (err) {
        console.log('error connecting to database: ', err);
        return;
    }
    console.log('Connected to database');
});

app.post('/saveToDB', (req, res) => {
    const {vorname, nachname, email, nachricht, zahl} = req.body;

    console.log("Got data from the form:", vorname, nachname, email, nachricht, zahl);

    const tableQuery = 'CREATE TABLE IF NOT EXISTS formular_daten (vorname VARCHAR(50), nachname VARCHAR(50), email VARCHAR(100),nachricht VARCHAR(255), zahl INT(11))';
    const insertQuery = 'INSERT INTO formular_daten (vorname,nachname, email,nachricht, zahl) VALUES (?, ?, ?, ?, ?)';//Wären die Values nicht gegeben, so könnte man SQL-Injection betreiben

    connection.query(tableQuery);
    connection.query(insertQuery, [vorname, nachname, email, nachricht, zahl], (error) => {
        if (error) {
            console.error('Error inserting data into database:', error);
            res.status(500).send('Error inserting data into database');
            return;
        }
        res.send('Data uploaded successfully');

    });

    fs.appendFile('formular_daten.txt', `${vorname},${nachname}, ${email}, ${nachricht}, ${zahl}\n`, (error) => {
        if (error) {
            console.error('Error writing to file:', error);
            return;
        }
        console.log('Data written to file');
    });
});

// HTTPS-Server erstellen
https.createServer(options, app).listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
});



