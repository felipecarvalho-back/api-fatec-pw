require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Usuario, Curso, Aluno } = require('./src/models');

async function seed() {
    try {
        console.log('🌱 Populando dados iniciais no banco de dados...');
        await sequelize.authenticate();
        await sequelize.sync({ force: true }); // Limpa e recria as tabelas

        // 1. Criar Cursos
        const cursoWeb = await Curso.create({
            nome: 'Desenvolvimento Web com Node.js',
            cargaHoraria: 80
        });

        const cursoBD = await Curso.create({
            nome: 'Banco de Dados Relacional e ORMs',
            cargaHoraria: 60
        });

        // 2. Criar Usuários (com senhas criptografadas via bcrypt)
        // OBS: Isto só funcionará se o aluno já tiver implementado o modelo Usuario!
        try {
            const senhaAdminHash = await bcrypt.hash('admin123', 10);
            const senhaUserHash = await bcrypt.hash('user123', 10);

            await Usuario.create({
                nome: 'Administrador Fatec',
                email: 'admin@escola.com',
                senha: senhaAdminHash,
                role: 'admin'
            });

            await Usuario.create({
                nome: 'Estudante Fatec',
                email: 'user@escola.com',
                senha: senhaUserHash,
                role: 'user'
            });

            console.log('✅ Usuários de teste criados com sucesso!');
        } catch (errUsuario) {
            console.warn('⚠️ Atenção: Não foi possível criar usuários de teste.');
            console.warn('Certifique-se de ter implementado os campos em src/models/Usuario.js.');
        }

        // 3. Criar Alunos de teste vinculados aos Cursos
        await Aluno.create({
            nome: 'Ana Silva',
            email: 'ana.silva@escola.com',
            matricula: 'MAT202601',
            cursoId: cursoWeb.id
        });

        await Aluno.create({
            nome: 'Carlos Eduardo',
            email: 'carlos.eduardo@escola.com',
            matricula: 'MAT202602',
            cursoId: cursoBD.id
        });

        console.log('✅ Seeds executados com sucesso!');
        console.log('\n🔐 Usuários padrão para teste após implementar a atividade:');
        console.log('-------------------------------------------------------');
        console.log('👑 Admin:  admin@escola.com | Senha: admin123 (Role: admin)');
        console.log('👤 Padrão: user@escola.com  | Senha: user123  (Role: user)');
        console.log('-------------------------------------------------------\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao popular dados:', error);
        process.exit(1);
    }
}

seed();
