# DevVoluntário (Partes 1 e 2)

Plataforma que conecta desenvolvedores voluntários a empresas e ONGs que precisam de tecnologia (desafio LAB365/SENAI).

- **Parte 1**: arquitetura em camadas, Prisma, JWT, Bcrypt, Zod, RBAC e base do front-end.
- **Parte 2** (esta versão): regra de limite de vagas, módulos de cargos, candidaturas e administração, as 3 telas do sistema e o seed de demonstração.

## Como rodar (4 passos)

Requisitos: Node.js 18.18+, npm e um banco PostgreSQL (local ou gratuito no Neon). Abra dois terminais.

**Terminal 1: API**

```bash
cd backend
npm install
cp .env.example .env            # no Windows (cmd): copy .env.example .env
# edite o .env: DATABASE_URL (Postgres) e JWT_SECRET (texto longo)
npx prisma migrate deploy
npm run prisma:seed
npm run dev                     # API em http://localhost:3333
```

**Terminal 2: Front-end**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev                     # App em http://localhost:5173
```

> Já tinha rodado a Parte 1? O `schema.prisma` não mudou. Para começar com o banco limpo e as novas contas, rode `npm run demo:reset` dentro de `backend/`.

### Contas criadas pelo seed

| Perfil | E-mail | Senha | Tela |
| --- | --- | --- | --- |
| ADMIN | admin@devvoluntario.com | admin123 | `/dashboard-admin` |
| EMPRESA | empresa@tech.com | empresa123 | `/dashboard-empresa` |
| TRABALHADOR | trabalhador@dev.com | dev123 | `/dashboard-trabalhador` |

O seed também cria **1 cargo** ("Desenvolvedor(a) React Júnior") com **2 vagas**. Ele é idempotente: rodar de novo não duplica contas nem cargo. Essas senhas são curtas de propósito, só para demonstração local.

## Roteiro de demonstração (2 minutos)

Use duas janelas do navegador (uma normal e uma anônima, para manter sessões separadas).

1. **Janela A**: entre como `trabalhador@dev.com`. No feed aparece o cargo com **0 / 2 vagas preenchidas**.
2. Edite o currículo (GitHub, LinkedIn, resumo) e clique em **Salvar perfil**.
3. Clique em **Candidatar-me**: a barra vai para **1 / 2**.
4. **Janela B**: entre como `empresa@tech.com`. O cargo mostra 1 / 2 e o candidato inscrito. (Use **Atualizar** para ver novas candidaturas.)
5. **Janela A**: clique em **Candidatar-me** de novo. O mesmo candidato pode se candidatar mais de uma vez (regra de demonstração). A barra chega a **2 / 2**, o cargo vira **Encerrado** e o botão muda para **Vagas Esgotadas**, desabilitado.
6. Para provar o bloqueio no back-end, mesmo sem usar o botão:

   ```bash
   # pegue um token (campo "token" da resposta)
   curl -X POST http://localhost:3333/auth/login -H "Content-Type: application/json" \
     -d '{"email":"trabalhador@dev.com","password":"dev123"}'

   # tente se candidatar ao cargo 1 já lotado
   curl -X POST http://localhost:3333/jobs/1/apply -H "Authorization: Bearer TOKEN"
   # -> 400 {"status":"error","message":"Limite de vagas atingido! Candidaturas encerradas."}
   ```
7. **Janela B**: publique um novo cargo no formulário (título, descrição, vagas) e veja-o aparecer.
8. Entre como `admin@devvoluntario.com`: nas abas **Usuários** e **Cargos**, clique em **Excluir**, confirme no diálogo e veja o item sumir.
9. Para repetir a demo do zero: `npm run demo:reset` em `backend/`.

## Regra do limite de vagas

Implementada em `backend/src/services/applicationService.js`, dentro de **uma única transação**:

1. **Trava o cargo** (UPDATE condicional em `status = 'ABERTO'`). Se ele não existe, retorna 404; se já está `ENCERRADO`, retorna **400 "Limite de vagas atingido! Candidaturas encerradas."**
2. **Conta** as candidaturas do `jobId`.
3. Se o total é **menor** que `vacancies`, **insere** a candidatura.
4. Se, com a nova candidatura, o total **atinge** `vacancies` (ex.: 2/2), o cargo muda para `ENCERRADO` automaticamente.

A trava no passo 1 impede que duas candidaturas simultâneas passem juntas pela contagem e estourem o limite. Como o modelo `Application` não tem `@@unique([jobId, candidateId])` e o service não checa duplicidade, o mesmo candidato pode enviar várias candidaturas ao mesmo cargo. A "contagem de candidaturas ativas" (`applicationsCount`) considera todas as candidaturas do cargo, já que nesta fase não existe fluxo de recusa.

## Endpoints

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| POST | `/auth/register`, `/auth/login` | Público | Cadastro (EMPRESA/TRABALHADOR) e login |
| GET | `/auth/me` | Autenticado | Usuário logado |
| PATCH | `/users/me` | Autenticado | Edita `githubUrl`, `linkedinUrl` e `bio` (string vazia limpa o campo) |
| GET | `/jobs` | Todos | Lista cargos com `applicationsCount`. Filtros: `?search=react&status=ABERTO` (busca em título e descrição) |
| POST | `/jobs` | EMPRESA | Cria cargo (`title`, `description`, `vacancies`) |
| GET | `/jobs/mine` | EMPRESA | Cargos da empresa com os candidatos inscritos |
| POST | `/jobs/:id/apply` | TRABALHADOR | Candidatura com a regra do limite de vagas |
| GET | `/applications/mine` | TRABALHADOR | Histórico das minhas candidaturas |
| GET | `/admin/users` | ADMIN | Lista todos os usuários |
| DELETE | `/admin/users/:id` | ADMIN | Remove usuário (e seus cargos e candidaturas) |
| DELETE | `/admin/jobs/:id` | ADMIN | Remove qualquer cargo (e suas candidaturas) |

Erros seguem o formato `{ "status": "error", "message": "...", "errors": [...] }`. O admin não pode excluir a própria conta (400).

## Telas (React)

| Rota | Perfil | O que tem |
| --- | --- | --- |
| `/dashboard-empresa` | EMPRESA | Formulário para publicar cargo, cards com barra "1 / 2 vagas preenchidas" e lista de candidatos de cada cargo |
| `/dashboard-trabalhador` | TRABALHADOR | Edição de currículo, feed com busca e filtro, botão **Candidatar-me** / **Vagas Esgotadas** e histórico de candidaturas |
| `/dashboard-admin` | ADMIN | Abas **Usuários** e **Cargos** com exclusão e diálogo de confirmação |

`/dashboard` encaminha cada perfil para a sua tela. Quem tenta abrir a tela de outro perfil vai para `/nao-autorizado`.

## Estrutura (novidades da Parte 2)

```
backend/
├── prisma/seed.js                        # Contas e cargo da demonstração
└── src/
    ├── routes/        jobRoutes, applicationRoutes, userRoutes, adminRoutes
    ├── controllers/   job, application, user, admin
    ├── services/      jobService, applicationService (regra do limite), userService, adminService
    ├── repositories/  jobRepository, applicationRepository, userRepository
    └── validators/    common, jobValidators, userValidators
frontend/src/
├── pages/        DashboardEmpresa, DashboardTrabalhador, DashboardAdmin
└── components/   ProgressBar, StatusBadge, ConfirmDialog, ProfileEditor
```

Mudanças em relação à Parte 1: as rotas de demonstração `/rbac-demo/*` e a página `Painel` foram removidas, pois as telas reais as substituem; os repositórios passaram a aceitar um cliente de transação opcional.

## Observações

- **PostgreSQL**: o projeto usa PostgreSQL. A busca usa `mode: 'insensitive'` automaticamente quando a URL começa com `postgres`.
- **Atualização em tempo real**: não há WebSocket; a empresa usa o botão **Atualizar** para ver novas candidaturas.
- **Validado neste ambiente**: a sintaxe do back-end e a lógica do limite de vagas (com repositórios simulados: 1/2, 2/2 encerrando, 3ª tentativa com erro 400). Os pacotes não puderam ser instalados aqui (sem rede), então o fluxo completo com banco e a interface React devem ser conferidos na sua máquina com o roteiro acima.

## Deploy

1. **Banco**: crie um PostgreSQL (Neon ou Render) e copie a connection string.
2. **API (Render, Web Service)**: Root Directory `backend`; Build `npm install && npm run build`; Start `npm start`. Variáveis: `DATABASE_URL`, `JWT_SECRET` (`openssl rand -hex 32`), `NODE_ENV=production`, `CORS_ORIGIN` (URL do front, sem barra final).
3. **Front-end (Vercel/Netlify)**: Root Directory `frontend`; Build `npm run build`; Output `dist`; variável `VITE_API_URL` = URL da API (sem barra final). `vercel.json` e `public/_redirects` já tratam as rotas do React Router.
4. **Dados iniciais (opcional)**: com `DATABASE_URL` de produção no `.env` local, rode `npm run prisma:seed` em `backend/`. As senhas do seed são de demonstração; troque-as se o site for público.
