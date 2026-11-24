# RepSquad

App mobile para registrar treinos de musculação: fichas e rotinas, séries com carga e repetições, cronômetro de descanso, histórico, recordes e um modo turma para treinar junto com os amigos.

Feito por três amigos (dois intermediários e um iniciante) para aprender a trabalhar como um time de verdade: issues, branches, pull requests, code review e CI. O código é escrito com IAs (vibecoding); as pessoas decidem o que fazer, revisam e testam.

> **Primeira vez aqui?** Siga o **[guia de preparação do ambiente](docs/SETUP-IA.md)**. Ele foi feito para você entregar à sua IA (Antigravity/Claude) e ela preparar o seu computador.

## Stack

| Parte | Tecnologia |
|---|---|
| App | React Native + Expo (Expo Router, TypeScript) |
| API | Python 3.12 + FastAPI + SQLAlchemy + Alembic |
| Banco | PostgreSQL (Docker localmente; Neon em produção) |
| Hospedagem da API | Render (plano grátis) |
| Qualidade | GitHub Actions: ruff + pytest na API, ESLint + tsc no app |
| Distribuição | APK no Android; Expo Go durante o desenvolvimento |

## Como trabalhamos

1. Toda tarefa é uma **issue** no GitHub, com critérios de aceite e labels (`api`, `mobile`, `iniciante`, `semana-N`).
2. Para cada issue, crie uma **branch curta** a partir da `main` atualizada:
   ```powershell
   git switch main
   git pull
   git switch -c feat/nome-da-tarefa
   ```
3. Faça commits no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/) (`feat: ...`, `fix: ...`).
4. Abra um **PR pequeno** (até cerca de 300 linhas), preenchendo o template, com `Closes #N`.
5. **Outra pessoa revisa e aprova**. O iniciante também revisa os PRs dos outros.
6. Com o CI verde e 1 aprovação, faça o **squash merge**. A branch é apagada automaticamente.

A `main` é protegida: ninguém faz push direto nela.

## Regras para as IAs

As regras completas estão no [`AGENTS.md`](AGENTS.md), que o Antigravity e o Claude Code leem sozinhos. O resumo:

- **A IA sempre diz em qual branch está** antes de alterar qualquer coisa, e de novo antes de cada commit e push.
- **Nunca commita na `main`.**
- **Pedido fora do escopo da branch atual:** a IA salva o trabalho em andamento (commit ou stash), cria ou troca para a branch certa sozinha e **avisa** onde o trabalho anterior ficou. Ela nunca descarta alterações.
- Roda lint, tipos e testes antes de dizer que terminou, e escreve a descrição do PR em português simples.
- **A IA nunca se coloca como autora ou coautora**: nada de `Co-Authored-By: Claude`, "Generated with ..." ou assinatura de IA em commits e PRs. Os commits são de quem está usando a IA.

## Documentos

- [Design do app](docs/superpowers/specs/2026-11-24-app-treinos-design.md): o que é, escopo da v1, decisões e por quê
- [Backlog](docs/BACKLOG.md): as tarefas das 6 semanas
- [Guia de setup](docs/SETUP-IA.md)
- [Regras para IAs](AGENTS.md)

## Rodando rapidamente (para quem já tem tudo instalado)

```powershell
docker compose up -d db
cd apps/api; uv sync; uv run alembic upgrade head; uv run fastapi dev app/main.py --host 0.0.0.0
```

Em outro terminal:

```powershell
cd apps/mobile; npm install; npx expo start
```
