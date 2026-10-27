require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    try {
        console.log('🔄 Conectando ao MySQL com Sequelize...');
        await sequelize.authenticate();
        console.log('✅ Conexão com banco de dados estabelecida com sucesso!');

        // Sincroniza tabelas do banco de dados
        await sequelize.sync();
        console.log('✅ Modelos sincronizados com o banco de dados!');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
            console.log(`📖 Documentação das rotas: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Não foi possível iniciar o servidor:', error);
        process.exit(1);
    }
}

bootstrap();
