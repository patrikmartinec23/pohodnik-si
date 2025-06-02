const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs'); // Add this for password hashing
const Pohod = require('./server/models/Pohod');
const povezava = require('./server/config/db');
const authRoutes = require('./server/routes/authRoutes');
const pohodiRoutes = require('./server/routes/pohodiRoutes.js');

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARE SETUP - MUST BE BEFORE ROUTES
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/pages')));

// ROUTES - AFTER MIDDLEWARE
app.use(authRoutes);
app.use(pohodiRoutes);

// Start server
app.listen(PORT, () => {
    console.log(
        `Strežnik ... V brskalnik vtipkajte naslov http://localhost:${PORT}`
    );
});

module.exports = { app, povezava };
