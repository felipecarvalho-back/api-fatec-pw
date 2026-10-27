const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Curso = require('./Curso');
const Aluno = require('./Aluno');

// Definição das Associações (1 Curso possui muitos Alunos)
Curso.hasMany(Aluno, { foreignKey: 'curso_id', as: 'alunos' });
Aluno.belongsTo(Curso, { foreignKey: 'curso_id', as: 'curso' });

module.exports = {
    sequelize,
    Usuario,
    Curso,
    Aluno
};
