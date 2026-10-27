const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ==============================================================================
// 🎯 DESAFIO 1: MODELO USUARIO
// ==============================================================================
// O aluno deve definir o modelo 'Usuario' no Sequelize com os seguintes campos:
//
// 1. id: Inteiro, chave primária, auto incremento.
// 2. nome: String de até 100 caracteres, obrigatório (allowNull: false).
// 3. email: String de até 100 caracteres, obrigatório, único (unique: true),
//    com validação de formato de e-mail (validate: { isEmail: ... }).
// 4. senha: String de até 255 caracteres, obrigatório (armazenará o hash do bcrypt).
// 5. role: ENUM com opções 'admin' e 'user', com valor padrão 'user'.
//
// Configurações da tabela:
// - tableName: 'usuarios'
// - timestamps: true
// - underscored: true
// ==============================================================================

const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'O campo nome não pode ser vazio.' }
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
            msg: 'Este e-mail já está em uso.'
        },
        validate: {
            isEmail: { msg: 'Formato de e-mail inválido.' }
        }
    },
    senha: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user'
    }
}, {
    tableName: 'usuarios',
    timestamps: true,
    underscored: true
});

module.exports = Usuario;
