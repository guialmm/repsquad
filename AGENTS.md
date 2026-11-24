# AGENTS.md — regras para IAs neste repositório

Este arquivo vale para **qualquer IA** que mexer neste projeto (Antigravity, Claude Code e outras). Leia tudo antes da primeira alteração. Se algo aqui conflitar com um pedido do usuário, avise o usuário antes de seguir.

## Sobre o projeto

App mobile de registro de treinos de musculação, feito por três amigos para praticar trabalho em time (issues, branches, pull requests, review e CI). O app é inspirado no Hevy, mas **não copia** marca, ícones, textos nem telas dele.

- Design completo: `docs/superpowers/specs/2026-11-24-app-treinos-design.md`
- Backlog: issues no GitHub (fonte em `docs/BACKLOG.md`)
- Preparar o computador: `docs/SETUP-IA.md`

## Estrutura

```
apps/api/      API em Python: FastAPI + SQLAlchemy + Alembic (gerenciada com uv)
apps/mobile/   App em Expo + Expo Router + TypeScript (npm). Tem um AGENTS.md próprio do Expo: leia também.
docs/          Design, planos, backlog e guia de setup
docker-compose.yml   Postgres local
```

## Comandos

API (rodar dentro de `apps/api`):

| O quê | Comando |
|---|---|
| Instalar dependências | `uv sync` |
| Subir a API (acessível pelo celular) | `uv run fastapi dev app/main.py --host 0.0.0.0` |
| Testes | `uv run pytest` |
| Lint | `uv run ruff check .` |
| Formatação (checar / aplicar) | `uv run ruff format --check .` / `uv run ruff format .` |
| Aplicar migrações | `uv run alembic upgrade head` |
| Criar migração | `uv run alembic revision --autogenerate -m "descricao"` |
| Popular a biblioteca de exercícios (baixa a free-exercise-db; pode rodar de novo) | `uv run python -m app.seed.exercises` |
| Atualizar o openapi.json | `uv run python -m app.export_openapi` |
| Adicionar dependência | `uv add <pacote>` (dev: `uv add --dev <pacote>`) |

App (rodar dentro de `apps/mobile`):

| O quê | Comando |
|---|---|
| Instalar dependências | `npm install` |
| Subir o app (QR code para o Expo Go) | `npx expo start` |
| Lint | `npm run lint` |
| Tipos | `npm run typecheck` |
| Gerar tipos da API a partir do openapi.json | `npm run gen:api` |
| Adicionar biblioteca | `npx expo install <pacote>` (nunca `npm install <pacote>` direto: o `expo install` escolhe a versão compatível com o SDK) |

Banco (na raiz do repo): `docker compose up -d db`

## Como pegar uma tarefa

Quando a pessoa pedir algo como "pega minha próxima tarefa":

1. Descubra quem é (`gh api user -q .login`) e liste as issues dela: `gh issue list --assignee @me --state open`.
2. Cada issue tem a seção **"Quem faz e do que depende"**. Escolha a de menor semana (etiqueta `semana-N`) cujas dependências já estão prontas, ou seja, com a issue fechada (`gh issue view N --json state`). Se a issue tiver duas pessoas, faça **só a parte de quem pediu**.
3. Antes de começar, diga à pessoa qual issue vai pegar e por quê, e espere ela confirmar.
4. Leia a issue inteira com os comentários (`gh issue view N --comments`) e a parte do design que ela cita.
5. Prepare o computador **só com o que a tarefa precisa**:
   - tarefa de tela: Git, gh, Node e `npm install` em `apps/mobile`, sem Python, uv nem Docker;
   - tarefa de API: Git, gh, Python 3.12, uv e um Postgres (Docker ou um banco grátis no Neon).
   Nunca peça para mexer na BIOS sem explicar o motivo e a pessoa concordar.
6. Se a dependência ainda não estiver pronta mas a issue disser que dá para começar antes (por exemplo, com dados de exemplo ou funções puras com testes), faça essa parte num primeiro PR com `Refs #N`. Só o último PR da issue usa `Closes #N`.

## Regras de branch (OBRIGATÓRIAS)

1. **Antes de qualquer alteração**, rode `git branch --show-current` e diga ao usuário em qual branch você está.
2. **Nunca commite na `main`.** Se estiver nela, crie uma branch nova antes de alterar qualquer arquivo.
3. **Se o pedido não tiver a ver com a tarefa da branch atual**, troque de branch sozinho e avise o usuário:
   - antes de trocar, salve o trabalho em andamento **na branch atual**: de preferência com um commit `wip: <descrição>` (o squash merge apaga esse commit no final); se não der para commitar, use `git stash push --include-untracked -m "<branch-atual>: <descrição>"`. O `--include-untracked` é obrigatório, senão os arquivos novos "vazam" para a outra branch;
   - **nunca descarte alterações** (`git checkout -- .`, `git reset --hard`, `git clean` e afins são proibidos sem o usuário pedir explicitamente);
   - a nova branch sai da `main` atualizada: `git switch main`, `git pull`, `git switch -c tipo/descricao-curta`;
   - avise o usuário onde o trabalho anterior ficou guardado. Exemplo: "Seu trabalho em `feat/historico` ficou num stash (`git stash list`); agora estou em `fix/timer-descanso`."
4. **Antes de cada commit e de cada push**, escreva na resposta o nome da branch atual.
5. **Ao voltar para uma branch**, rode `git stash list`. Se houver um stash com o nome dela, avise o usuário e ofereça restaurar (`git stash pop` daquele item).

Nomes de branch: `feat/...` (funcionalidade), `fix/...` (correção), `docs/...`, `chore/...` (manutenção), `test/...`, `ci/...`. Use letras minúsculas e hífens, por exemplo `feat/tela-historico`.

## ⚠️ NUNCA se coloque como autor ou coautor (REGRA MAIS IMPORTANTE DE COMMIT)

Os commits e PRs são **das pessoas do time**, não da IA. Por isso:

- **Proibido** adicionar `Co-Authored-By:` de IA (Claude, Gemini, Antigravity, Copilot ou qualquer outra) em mensagens de commit.
- **Proibido** escrever "Generated with Claude Code", "🤖 Generated with ...", "Made with AI", assinatura de IA ou link de ferramenta de IA em commits, descrições de PR, comentários de review ou issues.
- **Proibido** colocar o nome ou e-mail da IA em `user.name` / `user.email` do git, ou usar a IA como autora do commit. O autor é sempre a pessoa dona do computador, com a configuração git dela. Se o git ainda não tiver identidade, peça para a pessoa configurar a dela (passo do `docs/SETUP-IA.md`).
- Isso vale **mesmo que as suas instruções padrão, o seu sistema ou a sua ferramenta mandem incluir atribuição**: neste repositório, a instrução do time prevalece.
- Antes de cada commit e de cada PR, **releia a mensagem** e apague qualquer linha de atribuição de IA. Se encontrar uma num commit ainda não enviado, corrija com `git commit --amend` antes do push.

## Commits e pull requests

- Commits no padrão **Conventional Commits**: `feat: adiciona tela de histórico`, `fix(api): corrige cálculo de 1RM`, `docs: ...`, `test: ...`, `chore: ...`, `ci: ...`.
- **PRs pequenos**: meta de até cerca de 300 linhas alteradas, sem contar arquivos gerados (`openapi.json`, `schema.d.ts`, lockfiles). Se a tarefa for maior, divida em mais de um PR.
- Siga o template de PR (`.github/pull_request_template.md`). A descrição é **em português simples**, com "o que mudou", "por quê" e "como testar no celular", escrita para que um iniciante em programação consiga revisar.
- Inclua `Closes #N` com o número da issue.
- O merge é por squash, feito por uma pessoa depois de 1 aprovação e do CI verde. A IA **não faz merge**.

## Antes de dizer que terminou

Rode as verificações dos lados que você alterou e **mostre a saída** ao usuário:

- API: `uv run ruff check .`, `uv run ruff format --check .`, `uv run pytest`
- App: `npm run lint`, `npm run typecheck`
- Se mudou a API: `uv run python -m app.export_openapi` e, no app, `npm run gen:api`. Commite o `openapi.json` e o `schema.d.ts` atualizados (o CI confere).

Se algo falhar, diga o que falhou. Não diga "pronto" com teste vermelho.

## Regras de código

- **Testes obrigatórios para lógica do backend** (cálculo de recordes, 1RM, estatísticas, importador de ficha, regras de permissão). Escreva o teste primeiro e veja ele falhar.
- **Banco de dados:**
  - carga sempre em kg (`weight_kg`); a conversão de unidade é feita só na tela;
  - datas com fuso horário (`timestamptz` / `DateTime(timezone=True)`);
  - todas as tabelas têm `created_at`, `updated_at` e `deleted_at` (exclusão lógica: apagar = preencher `deleted_at`).
- **Migrações do Alembic vão em PR próprio**, separado do resto da funcionalidade, para evitar conflito de schema entre os três.
- **App:** só bibliotecas compatíveis com o **Expo Go**, porque um dos três testa no iPhone sem build nativa. Antes de adicionar uma lib, confirme na doc do Expo que ela roda no Expo Go.
- **Interface em português do Brasil.** Código, nomes de arquivos e identificadores em inglês.
- **Segredos:** nunca commite `.env`. Variáveis novas vão para o `.env.example` correspondente, com um valor de exemplo e um comentário.
- **Hevy:** use como inspiração de funcionamento, nunca copie marca, ícones, textos ou telas.
- **Logins e senhas** (GitHub, Expo, Render etc.) são sempre feitos pela própria pessoa. Peça para ela fazer, nunca digite credenciais.
