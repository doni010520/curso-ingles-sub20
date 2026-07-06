# Curso de Inglês Sub-20 — Instruções para Deploy

## Visão Geral
Plataforma de ensino de inglês para atletas Sub-20 do Esporte Clube Bahia.
Stack: React + Vite + Tailwind (frontend) + Supabase (auth + banco) + Nginx (serve).
Deploy target: Easypanel no servidor `72.60.145.9`.

## Pré-requisitos
- Conta Supabase (já existe)
- Repo no GitHub (conta: `doni010520`)
- Easypanel rodando no servidor

## Passo 1 — Supabase
1. Criar novo projeto no Supabase (ou usar existente)
2. Abrir SQL Editor e executar o arquivo `supabase/migration.sql` integralmente
3. Em Authentication > Settings, desabilitar "Enable email confirmations" para acesso imediato
4. Em Authentication > URL Configuration, adicionar o domínio final como Site URL e Redirect URL
5. Anotar a **Project URL** e **anon public key** de Settings > API

## Passo 2 — Repo GitHub
1. Criar repo `curso-ingles-sub20` na conta `doni010520`
2. Subir todos os arquivos do projeto (exceto node_modules)
3. Branch: `main`

## Passo 3 — Instalar dependências e testar local (opcional)
```bash
npm install
cp .env.example .env
# Editar .env com as credenciais do Supabase
npm run dev
```

## Passo 4 — Easypanel
1. Criar novo App chamado `curso-ingles`
2. Source: GitHub → repo `doni010520/curso-ingles-sub20`, branch `main`
3. Build method: **Dockerfile**
4. Adicionar **Build Arguments**:
   - `VITE_SUPABASE_URL` = URL do projeto Supabase
   - `VITE_SUPABASE_ANON_KEY` = anon key do Supabase
5. Em Domains, configurar o domínio desejado (ex: `ingles.benitechlab.com`)
6. No Cloudflare, criar registro CNAME/A apontando para o servidor
7. Deploy

## Estrutura do Projeto
```
├── Dockerfile              # Multi-stage: Node build + Nginx serve
├── nginx.conf              # SPA routing (todas as rotas → index.html)
├── package.json
├── vite.config.js
├── tailwind.config.js      # Paleta Esporte Clube Bahia
├── postcss.config.js
├── index.html
├── .env.example
├── supabase/
│   └── migration.sql       # Schema completo + seed com 20+ vídeos curados
└── src/
    ├── main.jsx
    ├── App.jsx             # React Router (Login, Dashboard, Module, Lesson)
    ├── index.css           # Tailwind + componentes customizados
    ├── lib/
    │   ├── supabase.js     # Client Supabase
    │   ├── auth.jsx        # AuthProvider com signup/signin/signout
    │   └── api.js          # CRUD modules/lessons/progress + quiz AI generation
    └── pages/
        ├── Login.jsx       # Tela de login/cadastro
        ├── Dashboard.jsx   # Módulos com progresso
        ├── ModulePage.jsx  # Lista de aulas do módulo
        └── LessonPage.jsx  # Player YouTube + Quiz com IA
```

## Tabelas Supabase (criadas pelo migration.sql)
- `profiles` — perfil do aluno (extends auth.users)
- `modules` — módulos do curso (8 semanas)
- `lessons` — aulas com YouTube video ID (20+ vídeos curados)
- `quizzes` — quizzes cacheados gerados por IA
- `quiz_attempts` — tentativas de quiz por aluno
- `lesson_progress` — progresso por aula (completou, melhor score)

## Operações pós-deploy
- **Desbloquear módulos:** editar `is_locked` na tabela `modules` no Supabase
- **Adicionar vídeos:** inserir rows na tabela `lessons` com o `youtube_video_id`
- **Promover admin:** editar `role` para `admin` na tabela `profiles`

## Notas importantes
- Variáveis Vite são injetadas no BUILD, não no runtime. Devem ser Build Args no Easypanel.
- O quiz usa a OpenAI através da **Edge Function `quiz`** (Supabase). A key (`OPENAI_API_KEY`)
  fica só no servidor como secret — nunca no front. Modelo em `OPENAI_MODEL` (default `gpt-4o-mini`).
  Deploy: `supabase functions deploy quiz` + `supabase secrets set OPENAI_API_KEY=... OPENAI_MODEL=...`.
- Quizzes ficam cacheados na tabela `quizzes`. Botão "Novo quiz" gera versão diferente.
- RLS está habilitado em todas as tabelas. Aluno só vê seu próprio progresso.
