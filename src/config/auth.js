// ==============================================================================
// ⚙️ CONFIGURAÇÃO DE AUTENTICAÇÃO JWT
// ==============================================================================
// TODO (Aluno): Compreender a importância do segredo (secret) do JWT.
// Em ambiente de produção, este segredo NUNCA deve ficar hardcoded no código;
// ele deve vir de uma variável de ambiente (process.env.JWT_SECRET).

require('dotenv').config();

module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'chave_secreta_super_segura_fatec_2026',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h'
};
