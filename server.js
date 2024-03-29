const express = require('express');
const mysql = require('mysql');
const https = require('https');
const fs = require('fs');
const app = express();

const port = 3000; // Port für HTTP-Server

const options = {
    key: fs.readFileSync('SSL/server.key'),
    cert: fs.readFileSync('SSL/server.crt')
};
app.get("/", (req, res) => res.sendFile(`${__dirname}/index.html`))
app.use(express.static(__dirname));
// Middleware to parse JSON-data
app.use(express.json());
// Middleware to parse the URL-encoded data
app.use(express.urlencoded({extended: true}));


// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'webserver'
});

// Connect to database
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
    const insertQuery = 'INSERT INTO formular_daten (vorname,nachname, email,nachricht, zahl) VALUES (?, ?, ?, ?, ?)';

    connection.query(tableQuery);
    connection.query(insertQuery, [vorname, nachname, email, nachricht, zahl], (error, results) => {
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

// Create HTTPS server
https.createServer(options, app).listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
});



