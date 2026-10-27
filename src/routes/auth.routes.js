const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { autenticar } = require('../middlewares/auth.middleware');

// ==============================================================================
// 🎯 DESAFIO 4: ROTAS DE AUTENTICAÇÃO
// ==============================================================================

// Rotas públicas (não exigem token prévio)
router.post('/register', (req, res, next) => authController.registrar(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));

// Rota protegida: deve utilizar o middleware 'autenticar' para verificar o token
router.get('/me', autenticar, (req, res) => authController.me(req, res));

module.exports = router;
