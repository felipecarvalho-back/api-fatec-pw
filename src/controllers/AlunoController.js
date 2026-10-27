const { Aluno, Curso } = require('../models');

class AlunoController {
    // GET /api/alunos (Lista todos os alunos trazendo os dados do Curso associado)
    async listar(req, res, next) {
        try {
            const alunos = await Aluno.findAll({
                include: [{
                    model: Curso,
                    as: 'curso',
                    attributes: ['id', 'nome', 'cargaHoraria']
                }],
                order: [['id', 'DESC']]
            });

            return res.status(200).json(alunos);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/alunos/:id (Busca um aluno específico)
    async buscarPorId(req, res, next) {
        try {
            const { id } = req.params;
            const aluno = await Aluno.findByPk(id, {
                include: [{
                    model: Curso,
                    as: 'curso',
                    attributes: ['id', 'nome', 'cargaHoraria']
                }]
            });

            if (!aluno) {
                return res.status(404).json({ erro: 'Aluno não encontrado.' });
            }

            return res.status(200).json(aluno);
        } catch (error) {
            next(error);
        }
    }

    // POST /api/alunos (Cadastra um novo aluno no banco)
    async criar(req, res, next) {
        try {
            const { nome, email, matricula, cursoId } = req.body;

            if (!nome || !email || !matricula || !cursoId) {
                return res.status(400).json({ erro: 'Campos nome, email, matricula e cursoId são obrigatórios.' });
            }

            const curso = await Curso.findByPk(cursoId);
            if (!curso) {
                return res.status(404).json({ erro: `Curso com ID ${cursoId} não encontrado.` });
            }

            const novoAluno = await Aluno.create({ nome, email, matricula, cursoId });

            return res.status(201).json({
                mensagem: 'Aluno cadastrado com sucesso!',
                aluno: novoAluno
            });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ erro: 'E-mail ou Matrícula já pertencem a outro aluno.' });
            }
            next(error);
        }
    }

    // PUT /api/alunos/:id (Atualiza dados de um aluno)
    async atualizar(req, res, next) {
        try {
            const { id } = req.params;
            const { nome, email, matricula, cursoId } = req.body;

            const aluno = await Aluno.findByPk(id);
            if (!aluno) {
                return res.status(404).json({ erro: 'Aluno não encontrado.' });
            }

            if (cursoId) {
                const curso = await Curso.findByPk(cursoId);
                if (!curso) {
                    return res.status(404).json({ erro: `Curso com ID ${cursoId} não encontrado.` });
                }
            }

            await aluno.update({ nome, email, matricula, cursoId });

            return res.status(200).json({
                mensagem: 'Aluno atualizado com sucesso!',
                aluno
            });
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ erro: 'E-mail ou Matrícula já pertencem a outro aluno.' });
            }
            next(error);
        }
    }

    // DELETE /api/alunos/:id (Exclui um aluno do banco)
    async excluir(req, res, next) {
        try {
            const { id } = req.params;
            const aluno = await Aluno.findByPk(id);

            if (!aluno) {
                return res.status(404).json({ erro: 'Aluno não encontrado.' });
            }

            await aluno.destroy();

            return res.status(200).json({
                mensagem: `Aluno #${id} excluído com sucesso.`
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AlunoController();
