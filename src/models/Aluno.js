const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Aluno = sequelize.define('Aluno', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: { msg: 'Formato de e-mail inválido.' }
        }
    },
    matricula: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    cursoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'curso_id'
    }
}, {
    tableName: 'alunos',
    timestamps: true,
    underscored: true
});

module.exports = Aluno;
