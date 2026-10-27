const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/AlunoController');
const { autenticar, autorizar } = require('../middlewares/auth.middleware');

// ==============================================================================
// 🎯 DESAFIO 5: PROTEÇÃO DAS ROTAS COM MIDDLEWARES
// ==============================================================================
// 1. Todas as rotas de alunos devem exigir que o usuário esteja autenticado com JWT.
//    Dica: Você pode aplicar o middleware 'autenticar' em todas as rotas usando `router.use(autenticar)`.
// 
// 2. A rota DELETE /:id deve ser restrita apenas a usuários administradores.
//    Dica: Aplique o middleware `autorizar('admin')` antes da chamada do controller.
// ==============================================================================

// Proteção de todas as rotas de alunos com o middleware de autenticação:
router.use(autenticar);

// Rotas liberadas para qualquer usuário autenticado (role 'user' ou 'admin')
router.get('/', (req, res, next) => alunoController.listar(req, res, next));
router.get('/:id', (req, res, next) => alunoController.buscarPorId(req, res, next));
router.post('/', (req, res, next) => alunoController.criar(req, res, next));
router.put('/:id', (req, res, next) => alunoController.atualizar(req, res, next));

// Rota restrita: apenas administradores (role 'admin') podem excluir
router.delete('/:id', autorizar('admin'), (req, res, next) => alunoController.excluir(req, res, next));

module.exports = router;
