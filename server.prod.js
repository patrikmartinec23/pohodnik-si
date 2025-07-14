require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.render' : '.env' });

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors'); // Add CORS package
const isProduction = process.env.NODE_ENV === 'production';

console.log('Starting server with environment:', process.env.NODE_ENV);
console.log('Loading environment variables from:', process.env.NODE_ENV === 'production' ? '.env.render' : '.env');

// Import database - conditionally based on environment
const povezava = isProduction
    ? require('./server/config/db.prod').db
    : require('./server/config/db');

const authRoutes = require('./server/routes/authRoutes');
const pohodiRoutes = require('./server/routes/pohodiRoutes.js');
const drustvaRoutes = require('./server/routes/drustvaRoutes');
const profileRoutes = require('./server/routes/profileRoutes');
const statsRoutes = require('./server/routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS for production
const corsOptions = {
    origin: isProduction 
        ? ['https://pohodnik.si', 'https://www.pohodnik.si'] 
        : 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// MIDDLEWARE SETUP - MUST BE BEFORE ROUTES
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

// Static files - only serve in development
// In production, static files will be served by Vercel
if (!isProduction) {
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'public/pages')));
}

// ROUTES - AFTER MIDDLEWARE
app.use(authRoutes);
app.use(pohodiRoutes);
app.use(drustvaRoutes);
app.use(profileRoutes);
app.use(statsRoutes);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT} in ${
            isProduction ? 'production' : 'development'
        } mode`
    );
});

module.exports = { app, povezava };
