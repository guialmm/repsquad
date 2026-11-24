# Fundação do repositório — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deixar o monorepo `app-treinos` pronto para o time de três trabalhar com IAs: esqueleto da API e do app rodando, CI, regras para IAs, guia de preparação de ambiente, GitHub protegido e backlog das 6 semanas como issues.

**Architecture:** Monorepo com `apps/api` (FastAPI + SQLAlchemy + Alembic, gerenciado com `uv`) e `apps/mobile` (Expo + Expo Router + TypeScript, `npm`). O Postgres local roda via Docker Compose. A API exporta `openapi.json`, e o app gera os tipos TypeScript a partir dele. O CI roda dois jobs, `api` e `mobile`, que são os checks obrigatórios da `main`.

**Tech Stack:** Python 3.12, uv, FastAPI, SQLAlchemy 2, Alembic, pydantic-settings, pytest, ruff · Node LTS, Expo (SDK mais recente via `create-expo-app@latest`), Expo Router, TypeScript, ESLint (`expo lint`), openapi-typescript · PostgreSQL 16 (Docker) · GitHub Actions, GitHub CLI.

**Spec:** `docs/superpowers/specs/2026-11-24-app-treinos-design.md`

**Fora deste plano:** todas as funcionalidades da v1 (auth, biblioteca, rotinas, treino etc.). Elas viram issues na Task 7, e cada uma terá seu próprio plano.

## Global Constraints

- Custo zero: só planos gratuitos.
- Interface do app em português do Brasil. Código, nomes de arquivos e identificadores em inglês. Documentação em português.
- Repositório público no GitHub, na conta pessoal do Gui. O nome é provisório (`app-treinos`); confirme o nome final com o Gui antes da Task 6.
- `main` protegida: merge só via PR, 1 aprovação, checks `api` e `mobile` verdes, squash merge, branch apagada após o merge.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`, `ci:`).
- Carga sempre em kg no banco (`weight_kg`). Datas com `timestamptz`. `created_at`/`updated_at`/`deleted_at` em todas as tabelas. (Vale para as issues futuras; aqui só entra como regra no `AGENTS.md`.)
- No app, só bibliotecas compatíveis com o Expo Go.
- Segredos nunca no código: `.env` no `.gitignore`, só o `.env.example` é versionado.
- Nada de marca, ícones, textos ou telas copiados do Hevy.
- O Gui está no Windows. Os comandos documentados para o time devem funcionar no PowerShell.

## Review Focus

1. **Celular não acha a API:** no Expo Go, `localhost` aponta para o próprio celular. O app deve ler `EXPO_PUBLIC_API_URL`, e o `SETUP-IA.md` deve ensinar a usar o IP da rede local do PC. *(Task 3 e Task 5)*
2. **`.env` com segredo commitado por engano:** o `.gitignore` precisa ignorar `.env` em qualquer pasta. *(Task 1, com verificação)*
3. **Nome do check diferente do nome na regra da `main`:** se o job do CI não se chamar exatamente `api`/`mobile`, todo PR fica travado esperando um check que nunca roda. O CI também não pode usar filtro de caminho, senão o check obrigatório fica pendente para sempre. *(Task 4 e Task 6)*
4. **Fim de linha no Windows:** CRLF em scripts quebra o CI no Linux e gera diffs falsos. Use `.gitattributes` com `eol=lf`. *(Task 1, com verificação)*
5. **Porta 5432 ocupada** por um Postgres instalado no Windows: o Docker não sobe e a API não conecta. A porta do host deve vir do `.env` (`POSTGRES_PORT`, padrão `5432`), e o `SETUP-IA.md` deve explicar como trocar. *(Task 2 e Task 5)*

---

### Task 1: Inicializar o repositório

**Files:**
- Create: `.gitignore`, `.gitattributes`, `.editorconfig`
- Já existe: `docs/superpowers/specs/2026-11-24-app-treinos-design.md`, este plano

**Interfaces:**
- Produces: repo git na branch `main`, com o primeiro commit.

- [ ] **Step 1: Inicializar o git**

`app-treinos` fica dentro de `C:\Users\gui\Documents\claude`, que já é outro repositório git. Rode `git init -b main` **dentro de** `app-treinos`, para ele ser um repo independente. No repo pai, ele só aparece como pasta não rastreada; não mexa no repo pai.

Run: `git -C C:/Users/gui/Documents/claude/app-treinos rev-parse --show-toplevel`
Expected: `C:/Users/gui/Documents/claude/app-treinos`

- [ ] **Step 2: Criar `.gitignore`, `.gitattributes` e `.editorconfig`**

`.gitignore` cobre: `.env` e `.env.*` em qualquer pasta (exceto `!.env.example`), `node_modules/`, `.expo/`, `dist/`, `__pycache__/`, `.venv/`, `.pytest_cache/`, `.ruff_cache/`, `*.apk`, `.DS_Store`.
`.gitattributes`: `* text=auto eol=lf`.
`.editorconfig`: UTF-8, LF, 2 espaços (4 em `*.py`), newline final.

- [ ] **Step 3: Verificar que segredos são ignorados**

Run: `git check-ignore -v apps/api/.env .env apps/mobile/.env.local; git check-ignore .env.example || echo "example versionado"`
Expected: as três primeiras linhas mostram a regra que ignora o arquivo; a última imprime `example versionado`.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: inicializa repositório com design e plano da fundação"
```

---

### Task 2: Esqueleto da API + Postgres local

**Files:**
- Create: `apps/api/pyproject.toml` (via `uv init`), `apps/api/app/__init__.py`, `apps/api/app/main.py`, `apps/api/app/config.py`, `apps/api/app/db.py`, `apps/api/app/export_openapi.py`, `apps/api/alembic.ini`, `apps/api/migrations/` (via `alembic init migrations`), `apps/api/tests/test_health.py`, `apps/api/openapi.json`, `apps/api/.env.example`, `docker-compose.yml`

**Interfaces:**
- Produces:
  - `GET /health` → `200 {"status": "ok"}`
  - `app.config.Settings` (pydantic-settings), com `database_url: str` (padrão `postgresql+psycopg://treinos:treinos@localhost:5432/treinos`), `jwt_secret: str` (padrão `"dev-secret-troque"`) e `cors_origins: list[str]` (padrão `["*"]`). Lê `.env`.
  - `app.db.engine` e `app.db.get_session()` (dependência FastAPI que devolve `Session`). `app.db.Base` (DeclarativeBase) para as tabelas futuras.
  - `python -m app.export_openapi` grava `apps/api/openapi.json` (JSON indentado com 2 espaços, newline final).
  - Comandos: `uv run fastapi dev app/main.py`, `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run alembic upgrade head`.

- [ ] **Step 1: Criar o projeto com uv e as dependências**

Em `apps/api`: `uv init --app --python 3.12`; depois `uv add "fastapi[standard]" sqlalchemy alembic "psycopg[binary]" pydantic-settings` e `uv add --dev pytest httpx ruff`. Configure o ruff no `pyproject.toml` com `line-length = 100` e `select = ["E","F","I","UP","B"]`. Apague o `main.py` gerado pelo `uv init` na raiz de `apps/api`.

- [ ] **Step 2: Escrever o teste que falha**

```python
# apps/api/tests/test_health.py
from fastapi.testclient import TestClient
from app.main import app

def test_health_returns_ok():
    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

- [ ] **Step 3: Rodar e ver falhar**

Run: `uv run pytest -v`
Expected: FAIL com `ModuleNotFoundError: No module named 'app.main'`

- [ ] **Step 4: Implementar `config.py`, `db.py` e `main.py`**

`main.py` cria `app = FastAPI(title="app-treinos API")`, com CORS a partir de `settings.cors_origins` e a rota `/health`. Nada de banco é chamado no `/health`.

- [ ] **Step 5: Rodar e ver passar; lint**

Run: `uv run pytest -v; uv run ruff check .; uv run ruff format --check .`
Expected: `1 passed`, e o ruff sem erros.

- [ ] **Step 6: Alembic, Docker Compose e `.env.example`**

`alembic init migrations`. O `migrations/env.py` deve ler a URL de `Settings().database_url` e usar `Base.metadata` como `target_metadata`.
`docker-compose.yml` na raiz tem o serviço `db`: imagem `postgres:16`, usuário, senha e banco `treinos`, porta `"${POSTGRES_PORT:-5432}:5432"`, volume nomeado `pgdata` e healthcheck com `pg_isready`.
`apps/api/.env.example` traz `DATABASE_URL`, `JWT_SECRET` e `CORS_ORIGINS`, com comentários em português. Crie também um `.env.example` na raiz, com `POSTGRES_PORT=5432` e um comentário explicando que, se a porta estiver ocupada, troque para `5433` e ajuste a `DATABASE_URL`.

- [ ] **Step 7: Verificar o banco e o Alembic de ponta a ponta**

Run: `docker compose up -d db`, depois, em `apps/api`, `uv run alembic upgrade head`
Expected: o Alembic termina sem erro (ainda sem migrações). `docker compose ps` mostra `db` como `healthy`.

- [ ] **Step 8: Exportar o OpenAPI**

Run: `uv run python -m app.export_openapi`
Expected: `apps/api/openapi.json` existe e contém `"/health"`.

- [ ] **Step 9: Commit**

```bash
git add apps/api docker-compose.yml .env.example
git commit -m "feat(api): esqueleto FastAPI com /health, config, Alembic e Postgres via Docker"
```

---

### Task 3: Esqueleto do app mobile

**Files:**
- Create: `apps/mobile/` (via `npx create-expo-app@latest mobile` em `apps/`, template padrão com Expo Router e TypeScript), `apps/mobile/src/api/client.ts`, `apps/mobile/src/api/schema.d.ts` (gerado), `apps/mobile/.env.example`
- Modify: a tela inicial gerada pelo template (em `apps/mobile/app/`)

**Interfaces:**
- Consumes: `apps/api/openapi.json` (Task 2), `GET /health`
- Produces:
  - `src/api/client.ts` exporta `API_URL: string` (de `process.env.EXPO_PUBLIC_API_URL`, padrão `http://localhost:8000`) e `getHealth(): Promise<{ status: string }>`, tipado pelo `schema.d.ts`.
  - Scripts npm: `start` (`expo start`), `lint` (`expo lint`), `typecheck` (`tsc --noEmit`) e `gen:api` (`openapi-typescript ../api/openapi.json -o src/api/schema.d.ts`).

- [ ] **Step 1: Criar o app e limpar o template**

Rode `npx create-expo-app@latest mobile` dentro de `apps/`. Depois rode o script de reset do template (`npm run reset-project`, se existir), para ficar só uma tela. Configure o ESLint com `npx expo lint`.

- [ ] **Step 2: Gerar os tipos da API**

Run: `npm i -D openapi-typescript`, adicione o script `gen:api` e rode `npm run gen:api`
Expected: `src/api/schema.d.ts` contém `"/health"`.

- [ ] **Step 3: Implementar `client.ts` e a tela inicial**

A tela inicial mostra o título "App de Treinos" e a linha "API: conectada" ou "API: sem conexão (URL)", conforme o `getHealth()`. Use `fetch` puro, sem bibliotecas extras. Crie o `apps/mobile/.env.example` com `EXPO_PUBLIC_API_URL=http://SEU-IP-LOCAL:8000` e um comentário dizendo que `localhost` não funciona no celular (Review Focus 1).

- [ ] **Step 4: Verificar lint e tipos**

Run: `npm run lint; npm run typecheck`
Expected: os dois saem sem erros.

- [ ] **Step 5: Verificar de ponta a ponta no navegador**

Com a API rodando (`uv run fastapi dev app/main.py --host 0.0.0.0`), rode `npx expo start --web` e abra no navegador embutido.
Expected: a tela mostra "API: conectada". Se puder, peça ao Gui para abrir pelo Expo Go no celular dele com o IP local no `.env`, e anote o resultado.

- [ ] **Step 6: Commit**

```bash
git add apps/mobile
git commit -m "feat(mobile): esqueleto Expo com tela de status da API e tipos gerados do OpenAPI"
```

---

### Task 4: CI no GitHub Actions

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: workflow `CI`, disparado em `pull_request` e em `push` na `main`, **sem filtro de caminho** (Review Focus 3), com dois jobs cujos ids e nomes são exatamente `api` e `mobile`.

- [ ] **Step 1: Escrever o workflow**

Job `api` (`ubuntu-latest`, `working-directory: apps/api`): `astral-sh/setup-uv`, `uv sync`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run pytest`. Ele também confere se o OpenAPI está atualizado: `uv run python -m app.export_openapi && git diff --exit-code openapi.json`.
Job `mobile` (`working-directory: apps/mobile`): `actions/setup-node` com `node-version: lts/*` e cache npm, `npm ci`, `npm run gen:api && git diff --exit-code src/api/schema.d.ts`, `npm run lint`, `npm run typecheck`.

- [ ] **Step 2: Validar a sintaxe localmente**

Run: `npx --yes action-validator .github/workflows/ci.yml` (se o comando não estiver disponível, valide o YAML com `python -c "import yaml,sys; yaml.safe_load(open(sys.argv[1]))" .github/workflows/ci.yml`)
Expected: sem erros. A execução real é verificada na Task 6.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: lint, tipos e testes da API e do app em todo PR"
```

---

### Task 5: Documentação para humanos e IAs

**Files:**
- Create: `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/SETUP-IA.md`, `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/tarefa.md`, `.github/ISSUE_TEMPLATE/bug.md`
- Possivelmente: arquivo de regras do Antigravity (ver Step 1)

**Interfaces:**
- Consumes: comandos das Tasks 2–4 (copie exatamente os nomes dos scripts e comandos).

- [ ] **Step 1: Confirmar onde o Antigravity lê regras**

Pesquise na documentação oficial do Google Antigravity se ele lê `AGENTS.md` na raiz. Se usar outro caminho (por exemplo, `.agent/rules/`), crie nesse caminho um arquivo curto que manda ler e seguir o `AGENTS.md`. Registre a fonte no commit.

- [ ] **Step 2: Escrever o `AGENTS.md`**

Em português, com as seções abaixo:
1. **Sobre o projeto:** 3 linhas e link para o design.
2. **Estrutura do repo.**
3. **Comandos:** todos os comandos das Tasks 2–4.
4. **Regras de branch (obrigatórias):** as regras 1–4 do design, literalmente:
   - verificar `git branch --show-current` e informar o usuário antes de alterar qualquer coisa;
   - nunca commitar na `main`;
   - se o pedido estiver fora do escopo da branch atual, trocar sozinho e avisar. Antes de trocar, salvar o trabalho com commit ou `git stash`; nunca descartar alterações; dizer onde o trabalho ficou guardado. A nova branch sai da `main` atualizada (`git switch main; git pull; git switch -c tipo/descricao`);
   - confirmar a branch antes de cada commit e de cada push.
5. **Commits e PRs:** Conventional Commits; PR com até cerca de 300 linhas; seguir o template; descrição em português simples com "o que mudou", "por quê" e "como testar no celular", para o iniciante conseguir revisar; `Closes #N` da issue.
6. **Antes de dizer que terminou:** rodar lint, tipos e testes dos lados alterados e mostrar a saída.
7. **Regras de código:** as Global Constraints de dados (kg, `timestamptz`, `created_at`/`updated_at`/`deleted_at`, exclusão lógica); testes obrigatórios para lógica do backend; migrações Alembic em PR próprio; só bibliotecas compatíveis com Expo Go; rodar `gen:api` e `export_openapi` quando a API mudar; nunca copiar marca, ícones, textos ou telas do Hevy; nunca commitar `.env`.

`CLAUDE.md` contém apenas `@AGENTS.md` e uma linha dizendo que o `AGENTS.md` é a fonte única das regras.

- [ ] **Step 3: Escrever o `docs/SETUP-IA.md`**

Siga a seção "Arquivo de preparação do ambiente" do design:
- stack e versões;
- instalação no Windows via `winget`: Git, Node LTS, Python 3.12, uv, Docker Desktop, GitHub CLI; Expo Go no celular;
- cada instalação seguida do seu comando de verificação;
- clonar, criar os `.env` a partir dos `.env.example`, achar o IP local com `ipconfig` e colocar em `EXPO_PUBLIC_API_URL`;
- trocar `POSTGRES_PORT` se a porta 5432 estiver ocupada (Review Focus 5);
- `docker compose up -d db`, `uv sync`, `alembic upgrade head`, API com `--host 0.0.0.0`, `npm install`, `npx expo start`, escanear o QR code;
- checklist final de "ambiente pronto": tela mostra "API: conectada" no celular, `pytest` passa, `npm run lint` e `npm run typecheck` passam;
- um prompt pronto para colar no Antigravity, em bloco de código:

```
Leia docs/SETUP-IA.md e AGENTS.md deste repositório e prepare meu computador (Windows) para desenvolver o projeto. Instale o que faltar, verifique cada passo e só diga que terminou quando o checklist final estiver todo ok. Me peça para fazer eu mesmo qualquer login (GitHub, Expo).
```

Logins e senhas são sempre feitos pela própria pessoa, nunca pela IA. Deixe isso explícito no arquivo.

- [ ] **Step 4: Escrever o `README.md` e os templates**

`README.md`, para humanos:
- o que é o app e quem são os três;
- link para o `SETUP-IA.md` no topo;
- resumo do fluxo de trabalho (issue → branch → PR → review → squash);
- resumo das regras de branch das IAs;
- stack;
- links para o design e o `AGENTS.md`.

`pull_request_template.md` traz as seções "O que mudou", "Por quê", "Como testar no celular", "Issue (Closes #)" e um checklist (lint/tipos/testes ok; PR pequeno; sem `.env`).
Os templates de issue são "Tarefa" (contexto, critérios de aceite, área) e "Bug" (passos, esperado, obtido, celular).

- [ ] **Step 5: Verificar consistência**

Run: `grep -n "fastapi dev\|uv run pytest\|npm run lint\|npm run typecheck\|gen:api\|export_openapi" AGENTS.md docs/SETUP-IA.md`
Expected: cada comando aparece e bate exatamente com os scripts definidos em `apps/mobile/package.json` e nas Tasks 2 e 4.

- [ ] **Step 6: Commit**

```bash
git add AGENTS.md CLAUDE.md README.md docs/SETUP-IA.md .github
git commit -m "docs: regras para IAs, guia de setup do ambiente, README e templates"
```

---

### Task 6: GitHub: repositório público e proteção da `main`

**Files:** nenhum arquivo do repo. Configuração no GitHub.

**Interfaces:**
- Consumes: jobs `api` e `mobile` (Task 4)
- Produces: repo público com `origin` configurado, `main` protegida e labels criadas.

- [ ] **Step 1: Instalar o GitHub CLI e fazer o login (o Gui faz o login)**

Run: `winget install --id GitHub.cli -e`. Depois, **o próprio Gui** roda `gh auth login` num terminal; a IA nunca digita credenciais.
Verify: `gh auth status` mostra a conta logada.

- [ ] **Step 2: Confirmar o nome do repo com o Gui e criar**

Run: `gh repo create <nome> --public --source . --remote origin --push`
Expected: `main` aparece no GitHub com todos os commits das Tasks 1–5.

- [ ] **Step 3: Ver o CI rodar verde na `main`**

Run: `gh run watch` (ou `gh run list --limit 1`)
Expected: os jobs `api` e `mobile` passam. Se falharem, corrija numa branch `fix/ci` com PR (a partir daqui a `main` fica protegida) e só siga para o próximo passo com o CI verde.

- [ ] **Step 4: Configurar merge e proteção**

Run: `gh repo edit --enable-squash-merge --enable-merge-commit=false --enable-rebase-merge=false --delete-branch-on-merge`
Crie um ruleset para a `main` via `gh api repos/{owner}/{repo}/rulesets` com:
- `pull_request`: 1 aprovação, descartar aprovações antigas a cada novo push;
- `required_status_checks`: contexts `api` e `mobile`, com `strict_required_status_checks_policy: false`;
- `non_fast_forward`;
- `deletion`;
- **sem lista de bypass**.

Verify: `gh api repos/{owner}/{repo}/rulesets` mostra o ruleset ativo. Um `git push` direto na `main` de teste deve ser rejeitado; teste com um commit vazio numa cópia temporária e não deixe esse commit no repo.

- [ ] **Step 5: Labels e colaboradores**

Crie as labels `api`, `mobile`, `iniciante`, `semana-1` a `semana-6`, `bug` e `docs`. Peça ao Gui os usuários do GitHub dos dois amigos e convide com `gh api -X PUT repos/{owner}/{repo}/collaborators/<usuario> -f permission=push`.
Verify: `gh label list` e `gh api repos/{owner}/{repo}/invitations` mostram as labels e os convites.

---

### Task 7: Backlog das 6 semanas como issues

**Files:**
- Create: `docs/BACKLOG.md` (fonte das issues, versionada)

**Interfaces:**
- Consumes: labels da Task 6
- Produces: as issues abaixo no GitHub, cada uma com contexto, critérios de aceite (copiados do design) e labels.

- [ ] **Step 1: Escrever o `docs/BACKLOG.md`**

Cada issue tem título, labels e critérios de aceite em checklist. A lista mínima, na ordem:

| # | Título | Labels | Critérios-chave (do design) |
|---|---|---|---|
| 1 | Seed da biblioteca de exercícios | api, iniciante, semana-1 | importar free-exercise-db; tabelas `exercise`, `exercise_translation`, `exercise_alias`; script idempotente |
| 2 | Tradução pt-BR dos ~150 exercícios mais comuns + sinônimos | iniciante, semana-1 | traduzido pela IA, revisado pelo iniciante; aliases para o importador de ficha |
| 3 | Autenticação e-mail/senha com JWT | api, semana-2 | cadastro, login, `/me`; testes |
| 4 | Telas de login e cadastro | mobile, semana-2 | token guardado com segurança; logout |
| 5 | Endpoints de busca e filtro de exercícios + exercício personalizado | api, iniciante, semana-2 | filtro por músculo e equipamento; personalizado sem limite |
| 6 | Tela da biblioteca de exercícios | mobile, iniciante, semana-3 | busca, filtros, criar personalizado |
| 7 | CRUD de pastas e rotinas | api, semana-2 | pastas/rotinas sem limite; `routine_exercise`/`routine_set`; `superset_id` |
| 8 | Telas de fichas e rotinas | mobile, semana-3 | criar, editar e reordenar; ficha = pasta A/B/C |
| 9 | Deploy da API no Render + Postgres no Neon | api, semana-3 | URL pública; segredos fora do código; ping ao abrir o app |
| 10 | Esqueleto do treino ao vivo (formato de dados) | mobile, api, semana-3 | PR de esqueleto acordado pelos três antes dos detalhes |
| 11 | Treino ao vivo completo | mobile, semana-4 | tipos de série, "anterior" com um toque, RPE opcional, checkmark, descanso ±15 s/pular com notificação local, superset, reordenar/trocar |
| 12 | Rascunho local, cache offline e fila de envio | mobile, semana-4 | treino sobrevive ao app fechado; começar sem internet; outbox com reenvio |
| 13 | Finalizar treino com cálculo de recordes | api, semana-4 | Epley; melhor carga por número de reps; testes |
| 14 | Histórico e detalhe do exercício com gráfico | mobile, iniciante, semana-4 | lista de treinos; gráfico de 1RM estimado |
| 15 | "Atualizar rotina?" e resumo do treino | mobile, semana-5 | diff da rotina; volume, séries e PRs |
| 16 | Estatísticas: séries por grupo muscular na semana | api, mobile, semana-5 | primário 1, secundário 0,5; histórico completo |
| 17 | Importar ficha por texto | api, iniciante, semana-5 | parser com testes; cria pasta e rotinas; casa nomes por alias |
| 18 | Modo turma | api, mobile, semana-6 | grupos com código de convite; ranking por melhor 1RM estimado; meta semanal e sequência (seg–dom, America/Sao_Paulo) |
| 19 | APK Android via EAS Build | mobile, semana-6 | build grátis; instruções de instalação no README |

- [ ] **Step 2: Commit via PR (a `main` já está protegida)**

```bash
git switch -c docs/backlog
git add docs/BACKLOG.md
git commit -m "docs: backlog das 6 semanas"
git push -u origin docs/backlog
gh pr create --fill
```

Expected: o PR abre e o CI passa. O merge espera a aprovação de um dos amigos; esse é o primeiro review real do time.

- [ ] **Step 3: Criar as issues**

Para cada item do `BACKLOG.md`, rode `gh issue create --title ... --body ... --label ...`.
Verify: `gh issue list --limit 30` mostra as 19 issues com as labels certas.
