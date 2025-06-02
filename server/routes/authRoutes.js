const express = require('express');
const router = express.Router();
const { login, register, logout } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/api/login', login);
router.post('/api/register', register);
router.post('/api/logout', auth, logout);

module.exports = router;
