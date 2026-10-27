const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');

// ==============================================================================
// 🎯 DESAFIO 2: MIDDLEWARES DE AUTENTICAÇÃO E AUTORIZAÇÃO
// ==============================================================================

/**
 * Middleware para verificar se o usuário enviou um token JWT válido.
 * 
 * Passos a implementar:
 * 1. Obter o cabeçalho 'Authorization' da requisição (req.headers.authorization).
 * 2. Se não foi fornecido, retornar 401 com erro 'Token de autenticação não fornecido.'.
 * 3. Dividir a string por espaço. Ex: "Bearer eyJhbGci...".
 *    Validar se o esquema é 'Bearer' e se o token existe. Se não, retornar 401 'Formato de token inválido. Use: Bearer <token>'.
 * 4. Utilizar `jwt.verify(token, jwtSecret)` dentro de um bloco try/catch.
 * 5. Se for válido, anexar os dados decodificados em `req.usuario` ({ id, email, role }) e chamar `next()`.
 * 6. Se falhar (catch):
 *    - Se err.name === 'TokenExpiredError', retornar 401 'Token expirado. Por favor, faça login novamente.'.
 *    - Caso contrário, retornar 401 'Token inválido ou adulterado.'.
 */
const autenticar = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
    }

    const partes = authHeader.split(' ');
    if (partes.length !== 2 || partes[0] !== 'Bearer' || !partes[1]) {
        return res.status(401).json({ erro: 'Formato de token inválido. Use: Bearer <token>' });
    }

    const token = partes[1];

    try {
        const decodificado = jwt.verify(token, jwtSecret);
        req.usuario = {
            id: decodificado.id,
            email: decodificado.email,
            role: decodificado.role
        };
        return next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ erro: 'Token expirado. Por favor, faça login novamente.' });
        }
        return res.status(401).json({ erro: 'Token inválido ou adulterado.' });
    }
};

/**
 * Middleware para autorização baseada em papéis (RBAC - Role-Based Access Control).
 * Exemplo de uso nas rotas: autorizar('admin') ou autorizar('admin', 'gestor')
 * 
 * Passos a implementar:
 * 1. Retornar uma função middleware `(req, res, next) => { ... }`.
 * 2. Verificar se `req.usuario` existe. Se não, retornar 401 'Usuário não autenticado.'.
 * 3. Verificar se o `req.usuario.role` está incluído em `rolesPermitidas`.
 * 4. Se não tiver permissão, retornar 403 com mensagem informando que o acesso foi negado.
 * 5. Se tiver permissão, chamar `next()`.
 */
const autorizar = (...rolesPermitidas) => {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({ erro: 'Usuário não autenticado.' });
        }

        if (!rolesPermitidas.includes(req.usuario.role)) {
            return res.status(403).json({
                erro: 'Acesso negado. Você não possui a permissão necessária para esta operação.'
            });
        }

        return next();
    };
};

module.exports = {
    autenticar,
    autorizar
};
