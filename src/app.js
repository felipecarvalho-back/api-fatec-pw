const express = require('express');
const routes = require('./routes');

const app = express();

// Middlewares globais
app.use(express.json());

// Rotas da API
app.use('/api', routes);
app.get('/', (req, res) => res.redirect('/api'));

// Rota não encontrada (404)
app.use((req, res) => {
    res.status(404).json({ erro: `Rota ${req.method} ${req.originalUrl} não encontrada.` });
});

// Middleware Centralizado de Tratamento de Erros
app.use((err, req, res, next) => {
    console.error('⚠️ [Error Handler]:', err.message);

    // Tratamento para JSON malformado enviado pelo cliente
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            erro: 'JSON malformado ou com erro de sintaxe. Verifique o corpo da requisição.'
        });
    }

    return res.status(err.status || 500).json({
        erro: err.message || 'Erro interno no servidor.'
    });
});

module.exports = app;
