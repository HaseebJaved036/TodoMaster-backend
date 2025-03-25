const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, googleAuth } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user (protected route)
router.get('/me', auth, getCurrentUser);

// Google OAuth authentication
router.post('/google', googleAuth);


module.exports = router;