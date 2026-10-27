const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');

// ==============================================================================
// 🎯 DESAFIO 3: AUTH CONTROLLER (REGISTRO, LOGIN E SESSÃO)
// ==============================================================================

class AuthController {
    /**
     * POST /api/auth/register
     * 
     * Passos a implementar:
     * 1. Extrair nome, email, senha, role de req.body.
     * 2. Validar se nome, email e senha foram informados (retornar 400 se faltar).
     * 3. Validar se a senha tem pelo menos 6 caracteres (retornar 400 se menor).
     * 4. Consultar o banco via Usuario.findOne({ where: { email } }) para checar se o e-mail já existe.
     *    Se já existir, retornar 400 informando que o e-mail já está em uso.
     * 5. Criptografar a senha utilizando bcrypt.hash(senha, 10).
     * 6. Criar o usuário no banco via Usuario.create({ nome, email, senha: senhaHash, role: role || 'user' }).
     * 7. Retornar status 201 com mensagem de sucesso e os dados públicos do usuário (NUNCA retorne a senha!).
     */
    async registrar(req, res, next) {
        try {
            const { nome, email, senha, role } = req.body;

            if (!nome || !email || !senha) {
                return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios.' });
            }

            if (typeof senha !== 'string' || senha.length < 6) {
                return res.status(400).json({ erro: 'A senha deve conter no mínimo 6 caracteres.' });
            }

            if (role && !['admin', 'user'].includes(role)) {
                return res.status(400).json({ erro: "Role inválida. Escolha entre 'admin' e 'user'." });
            }

            const usuarioExistente = await Usuario.findOne({ where: { email } });
            if (usuarioExistente) {
                return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
            }

            const senhaHash = await bcrypt.hash(senha, 10);

            const usuario = await Usuario.create({
                nome,
                email,
                senha: senhaHash,
                role: role || 'user'
            });

            return res.status(201).json({
                mensagem: 'Usuário cadastrado com sucesso!',
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    role: usuario.role,
                    createdAt: usuario.createdAt
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/login
     * 
     * Passos a implementar:
     * 1. Extrair email e senha de req.body.
     * 2. Validar se email e senha foram preenchidos (retornar 400 se faltar).
     * 3. Buscar o usuário pelo e-mail com Usuario.findOne({ where: { email } }).
     *    Se não encontrar, retornar 401 'Credenciais inválidas.' (dica: não diga se o erro foi no e-mail ou na senha por segurança!).
     * 4. Comparar a senha digitada com o hash salvo no banco via bcrypt.compare(senha, usuario.senha).
     *    Se não bater, retornar 401 'Credenciais inválidas.'.
     * 5. Gerar o token JWT via jwt.sign({ id: usuario.id, email: usuario.email, role: usuario.role }, jwtSecret, { expiresIn: jwtExpiresIn }).
     * 6. Retornar status 200 com a mensagem de sucesso, o token JWT gerado e os dados públicos do usuário.
     */
    async login(req, res, next) {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
            }

            const usuario = await Usuario.findOne({ where: { email } });
            if (!usuario) {
                return res.status(401).json({ erro: 'Credenciais inválidas.' });
            }

            const senhaValida = await bcrypt.compare(senha, usuario.senha);
            if (!senhaValida) {
                return res.status(401).json({ erro: 'Credenciais inválidas.' });
            }

            const token = jwt.sign(
                { id: usuario.id, email: usuario.email, role: usuario.role },
                jwtSecret,
                { expiresIn: jwtExpiresIn }
            );

            return res.status(200).json({
                mensagem: 'Login realizado com sucesso!',
                token,
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    role: usuario.role
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/auth/me (Rota Protegida)
     * 
     * Retorna os dados do usuário logado contidos no token que o middleware `autenticar` injetou em `req.usuario`.
     */
    async me(req, res) {
        return res.status(200).json({
            mensagem: 'Sessão atual validada via Token JWT',
            usuario: req.usuario || null
        });
    }
}

module.exports = new AuthController();
