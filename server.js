const express = require('express');
const povezava = require('./db');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Primer: pridobi vse pohode


app.get('/api/pohodi', async (req, res) => {
  try {
    const connection = await povezava();
    const [rows] = await connection.query('SELECT * FROM Pohod');
    await connection.end(); // pomembno!
    res.json(rows);
  } catch (err) {
    console.error('Napaka:', err);
    res.status(500).json({ error: 'Napaka pri pridobivanju pohodov' });
  }
});


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Start server
app.listen(PORT, () => {
  console.log(`Strežnik ... V brskalnik vtipkajte naslov http://localhost:${PORT}`);
});

module.exports = { app, povezava };

