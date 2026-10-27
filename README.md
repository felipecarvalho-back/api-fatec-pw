# 🎓 Atividade Prática: Autenticação e Autorização com JWT e Sequelize

> **Disciplina:** Desenvolvimento Web / Backend  
> **Objetivo:** Compreender os conceitos de autenticação stateless, criptografia de senhas e controle de acesso baseado em perfis (RBAC), aplicando-os na prática em uma API REST com Node.js, Express, Sequelize e JWT.  
> **Resultado esperado:** Chegar na arquitetura e funcionamento do projeto `5.1. auth-jwt`.

---

## 📖 Cenário do Desafio

Você recebeu uma API REST de gestão escolar em funcionamento, com o cadastro de **Cursos** e **Alunos** já estruturado. No entanto, qualquer pessoa na internet consegue acessar, alterar e até excluir registros escolares, pois a API não possui nenhum mecanismo de segurança!

Sua missão é blindar esta aplicação implementando:
1. Um modelo para a tabela de **Usuários**.
2. Um controlador de autenticação (**registro** com hash seguro e **login** com geração de token).
3. **Middlewares** para interceptar requisições, validar o token JWT e restringir ações por perfil (`admin` vs `user`).

---

## 🔍 Parte 1: Pesquisa Conceitual (Aquecimento)

Antes de escrever código, pesquise e responda às seguintes perguntas no seu relatório ou anotações:

1. **O que é o padrão JWT (JSON Web Token) e por que ele é chamado de "Stateless"?**
   * *Qual a diferença entre autenticação por Sessão/Cookies no servidor e autenticação por Token JWT?*
2. **Quais são as três partes que compõem um token JWT (`xxxxx.yyyyy.zzzzz`)?**
   * *O que vai no Header, no Payload e na Signature? As informações do Payload são criptografadas ou apenas codificadas em Base64?*
3. **Por que o token é enviado no cabeçalho `Authorization: Bearer <token>`?**
   * *O que significa o termo "Bearer"?*
4. **Por que nunca devemos salvar senhas em texto puro no banco de dados?**
   * *Como a biblioteca `bcrypt` atua? O que são "Salt Rounds" e como eles protegem contra ataques de Rainbow Table?*
5. **Qual a diferença entre Autenticação (*Authentication*) e Autorização (*Authorization*)?**
   * *Como o conceito de RBAC (Role-Based Access Control) se aplica neste projeto?*

---

## 🛠️ Parte 2: Desafios Práticos (Mão na Massa)

Abra o projeto e siga os arquivos marcados com comentários `// TODO:`.

```text
5.0 auth-jwt-atividade/
├── src/
│   ├── config/
│   │   ├── auth.js               # [Configuração pronta] Chave secreta e expiração
│   │   └── database.js           # [Configuração pronta] Conexão MySQL
│   ├── models/
│   │   ├── Usuario.js            # 🎯 DESAFIO 1: Modelar a tabela 'usuarios'
│   │   ├── Curso.js              # [Pronto]
│   │   ├── Aluno.js              # [Pronto]
│   │   └── index.js              # [Pronto]
│   ├── middlewares/
│   │   └── auth.middleware.js    # 🎯 DESAFIO 2: Criar autenticar() e autorizar()
│   ├── controllers/
│   │   ├── AuthController.js     # 🎯 DESAFIO 3: Criar registrar(), login() e me()
│   │   └── AlunoController.js    # [Pronto]
│   ├── routes/
│   │   ├── auth.routes.js        # 🎯 DESAFIO 4A: Rotas /register, /login e /me
│   │   ├── alunos.routes.js      # 🎯 DESAFIO 4B: Proteger rotas de alunos
│   │   └── index.js              # [Pronto]
│   └── app.js                    # [Pronto]
├── seeds.js                      # Popula banco com dados de teste
├── server.js                     # Inicialização do servidor
└── package.json
```

---

### 🎯 Desafio 1: Modelar a tabela `usuarios`
Arquivo: [`src/models/Usuario.js`](src/models/Usuario.js)

Defina o modelo Sequelize `Usuario` com as seguintes colunas e regras:
- `id`: Inteiro, auto-incremento e chave primária.
- `nome`: String de até 100 caracteres, não nulo.
- `email`: String de até 100 caracteres, não nulo, **único (`unique: true`)** e com validação de formato de e-mail (`validate: { isEmail: ... }`).
- `senha`: String de até 255 caracteres, não nulo (para suportar o hash do bcrypt).
- `role`: Tipo ENUM com os valores `'admin'` e `'user'`, com valor padrão `'user'`.
- Configurações da tabela: `tableName: 'usuarios'`, `timestamps: true` e `underscored: true`.

---

### 🎯 Desafio 2: Middlewares de Proteção
Arquivo: [`src/middlewares/auth.middleware.js`](src/middlewares/auth.middleware.js)

Implemente duas funções fundamentais:
1. **`autenticar(req, res, next)`:**
   - Lê o header `req.headers.authorization`.
   - Rejeita com **401 Unauthorized** se não for fornecido ou se o formato não for `Bearer <token>`.
   - Utiliza `jwt.verify(token, jwtSecret)` para decodificar.
   - Anexa os dados do usuário decodificado em `req.usuario` (`id`, `email`, `role`).
   - Chama `next()`.
   - Trata erros como `TokenExpiredError` (retornando mensagem específica).

2. **`autorizar(...rolesPermitidas)`:**
   - Retorna um middleware que verifica se `req.usuario.role` está na lista `rolesPermitidas`.
   - Se estiver autorizado, chama `next()`.
   - Caso contrário, retorna **403 Forbidden** com mensagem de acesso negado.

---

### 🎯 Desafio 3: AuthController (Registro, Login e Sessão)
Arquivo: [`src/controllers/AuthController.js`](src/controllers/AuthController.js)

Implemente os seguintes métodos:
1. **`registrar(req, res, next)`:**
   - Valida se `nome`, `email` e `senha` foram enviados.
   - Valida se a senha possui no mínimo 6 caracteres.
   - Verifica se o e-mail já existe no banco (`Usuario.findOne`).
   - Gera o hash da senha com `await bcrypt.hash(senha, 10)`.
   - Grava o usuário e retorna status **201 Created** com os dados sanitizados (**NUNCA retorne o hash da senha!**).

2. **`login(req, res, next)`:**
   - Valida o preenchimento de `email` e `senha`.
   - Busca o usuário no banco pelo e-mail.
   - Valida a senha usando `await bcrypt.compare(senha, usuario.senha)`.
   - Se inválido, retorna status **401 Unauthorized** (com mensagem genérica: *"Credenciais inválidas"*).
   - Se válido, gera o token com `jwt.sign({ id, email, role }, jwtSecret, { expiresIn: '2h' })`.
   - Retorna status **200 OK** com o token e os dados do usuário.

3. **`me(req, res)`:**
   - Retorna os dados do usuário autenticado a partir de `req.usuario`.

---

### 🎯 Desafio 4: Rotas e Proteção
Arquivos: [`src/routes/auth.routes.js`](src/routes/auth.routes.js) e [`src/routes/alunos.routes.js`](src/routes/alunos.routes.js)

1. No `auth.routes.js`:
   - Conecte `POST /register` e `POST /login`.
   - Conecte `GET /me` passando antes pelo middleware `autenticar`.
2. No `alunos.routes.js`:
   - Aplique o middleware `autenticar` para proteger todas as rotas de alunos.
   - Na rota `DELETE /:id`, adicione o middleware `autorizar('admin')`, garantindo que apenas administradores consigam apagar alunos.

---

## ⚡ Como Executar e Testar

### 1. Instalar as dependências
```bash
npm install
```

### 2. Popular o banco de dados
*(Execute após implementar o Desafio 1)*
```bash
npm run seed
```

> **Usuários criados pelo seed:**
> * 👑 **Admin:** `admin@escola.com` | Senha: `admin123` *(role: admin)*
> * 👤 **Padrão:** `user@escola.com`  | Senha: `user123` *(role: user)*

### 3. Iniciar o servidor
```bash
npm run dev
```
Servidor disponível em: `http://localhost:3000`

---

## 🧪 Roteiro de Validação (Passo a Passo)

### Teste 1: Tentar listar alunos SEM token (Deve dar 401)
```bash
curl -i -X GET http://localhost:3000/api/alunos
```
*Resultado esperado:* Status **401 Unauthorized** com `{ "erro": "Token de autenticação não fornecido." }`.

---

### Teste 2: Cadastrar um novo usuário
```bash
curl -i -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome": "Maria Santos", "email": "maria@escola.com", "senha": "senhaSegura123", "role": "user"}'
```
*Resultado esperado:* Status **201 Created**.

---

### Teste 3: Fazer login com o usuário Estudante
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@escola.com", "senha": "user123"}'
```
*Copie o token gerado.*

---

### Teste 4: Consultar a rota `/me` com o Token
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```
*Resultado esperado:* Dados do usuário decodificados do token.

---

### Teste 5: Listar alunos usando o Token de Estudante
```bash
curl -X GET http://localhost:3000/api/alunos \
  -H "Authorization: Bearer TOKEN_DO_USER"
```
*Resultado esperado:* Status **200 OK** com a lista de alunos.

---

### Teste 6: Tentar EXCLUIR aluno com Token de Estudante (Deve dar 403)
```bash
curl -i -X DELETE http://localhost:3000/api/alunos/1 \
  -H "Authorization: Bearer TOKEN_DO_USER"
```
*Resultado esperado:* Status **403 Forbidden** com mensagem de permissão negada.

---

### Teste 7: Fazer login como Administrador e Excluir
```bash
# 1. Login como admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@escola.com", "senha": "admin123"}'

# 2. Exclusão com token de admin
curl -i -X DELETE http://localhost:3000/api/alunos/1 \
  -H "Authorization: Bearer TOKEN_DO_ADMIN"
```
*Resultado esperado:* Status **200 OK** com confirmação de exclusão.

---

## 📋 Checklist de Conclusão

- [x] Modelo `Usuario` criado com validações e `unique: true`.
- [x] Senhas armazenadas com hash `bcrypt` (nunca em texto puro).
- [x] Endpoint `/register` validando campos obrigatórios e e-mails duplicados.
- [x] Endpoint `/login` comparando hash com `bcrypt.compare` e assinando JWT.
- [x] Middleware `autenticar` validando cabeçalho `Bearer` e integridade do token.
- [x] Middleware `autorizar` bloqueando usuários não autorizados com **403**.
- [x] Rotas de alunos devidamente protegidas.
