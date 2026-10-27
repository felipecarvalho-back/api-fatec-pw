const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const alunosRoutes = require('./alunos.routes');

router.get('/', (req, res) => {
    res.status(200).json({
        mensagem: 'API REST - Atividade Prática de Autenticação JWT com Sequelize',
        desafio: 'Implemente Usuario, AuthController e os middlewares de proteção em auth.middleware.js',
        endpoints: {
            autenticacao: {
                registro: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                perfil: 'GET /api/auth/me (Exige Header Authorization: Bearer <token>)'
            },
            alunos: {
                listar: 'GET /api/alunos (Exige Token)',
                buscarPorId: 'GET /api/alunos/:id (Exige Token)',
                criar: 'POST /api/alunos (Exige Token)',
                atualizar: 'PUT /api/alunos/:id (Exige Token)',
                excluir: 'DELETE /api/alunos/:id (Exige Token de Admin)'
            }
        }
    });
});

router.use('/auth', authRoutes);
router.use('/alunos', alunosRoutes);

module.exports = router;
