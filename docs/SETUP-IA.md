# Preparar o ambiente (guia para a sua IA)

Este arquivo foi feito para ser **entregue à IA** (Antigravity com Claude Opus, ou outra) no primeiro dia. Ela segue os passos, instala o que faltar no seu Windows e confere cada etapa.

## Como usar

1. Instale o **Git** e clone o repositório (se ainda não clonou):
   ```powershell
   winget install --id Git.Git -e
   ```
   Feche e abra o terminal, e depois:
   ```powershell
   git clone https://github.com/guialmm/repsquad.git
   ```
2. Abra a pasta do projeto no Antigravity.
3. Cole este prompt no chat da IA:

```
Leia docs/SETUP-IA.md e AGENTS.md deste repositório e prepare meu computador (Windows) para desenvolver o projeto. Instale o que faltar, verifique cada passo e só diga que terminou quando o checklist final estiver todo ok. Me peça para fazer eu mesmo qualquer login (GitHub, Expo).
```

> **Logins e senhas são sempre feitos por você**, nunca pela IA. Quando a IA pedir, rode o comando de login você mesmo no terminal.

---

## Instruções para a IA

Siga na ordem. Depois de cada instalação, **feche e reabra o terminal** (para o PATH atualizar) e rode o comando de verificação. Se a ferramenta já estiver instalada na versão certa, pule a instalação.

### 1. Stack do projeto

| Ferramenta | Versão | Para quê |
|---|---|---|
| Git | qualquer recente | controle de versão |
| GitHub CLI (`gh`) | qualquer recente | PRs e issues pelo terminal |
| Node.js | LTS | app Expo |
| Python | 3.12 | API |
| uv | qualquer recente | dependências e ambiente da API |
| Docker Desktop | qualquer recente | Postgres local |
| Expo Go (no celular) | a da loja | abrir o app no celular |

Bibliotecas principais (instaladas pelos gerenciadores, não precisa instalar à parte): FastAPI, SQLAlchemy, Alembic, pydantic-settings, pytest, ruff; Expo, Expo Router, React Native, TypeScript, ESLint, openapi-typescript.

### 2. Instalar as ferramentas (PowerShell)

| Ferramenta | Instalar | Verificar |
|---|---|---|
| Git | `winget install --id Git.Git -e` | `git --version` |
| GitHub CLI | `winget install --id GitHub.cli -e` | `gh --version` |
| Node.js LTS | `winget install --id OpenJS.NodeJS.LTS -e` | `node -v` e `npm -v` |
| Python 3.12 | `winget install --id Python.Python.3.12 -e` | `python --version` (deve mostrar 3.12.x) |
| uv | `winget install --id astral-sh.uv -e` | `uv --version` |
| Docker Desktop | `winget install --id Docker.DockerDesktop -e` | abra o Docker Desktop uma vez, espere ficar "running" e rode `docker --version` e `docker compose version` |

Observações:
- O Docker Desktop pode pedir para habilitar o WSL 2 e reiniciar o computador. Peça ao usuário para aceitar e reiniciar, e continue depois.
- **Login no GitHub:** peça ao usuário para rodar `gh auth login` (GitHub.com → HTTPS → login pelo navegador). Verifique com `gh auth status`.
- **Identidade do git** (sem isso o primeiro commit falha): peça ao usuário para configurar o próprio nome e o e-mail **anônimo** do GitHub, que aparece em github.com → Settings → Emails, no formato `123456+usuario@users.noreply.github.com`. O repositório é público, então o e-mail pessoal ficaria visível para qualquer um.
  ```powershell
  git config --global user.name "Seu Nome"
  git config --global user.email "123456+usuario@users.noreply.github.com"
  ```
  Verifique com `git config --global user.email`. A IA **não** coloca o nome dela aqui (ver `AGENTS.md`).
- **No celular:** peça ao usuário para instalar o **Expo Go** (Play Store ou App Store).

### 3. Configurar o projeto

Na raiz do repositório:

1. Crie os arquivos `.env` a partir dos exemplos (nunca commite `.env`):
   ```powershell
   Copy-Item .env.example .env
   Copy-Item apps/api/.env.example apps/api/.env
   Copy-Item apps/mobile/.env.example apps/mobile/.env
   ```
2. **IP do computador para o celular:** rode `ipconfig` e pegue o "Endereço IPv4" da rede Wi-Fi (algo como `192.168.0.15`). Em `apps/mobile/.env`, coloque:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.0.15:8000
   ```
   `localhost` **não funciona no celular**, porque lá ele aponta para o próprio celular. O celular e o computador precisam estar **na mesma rede Wi-Fi**.
3. **Porta do Postgres:** se a porta 5432 já estiver ocupada (por exemplo, por um Postgres instalado no Windows; confira com `Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue`), use `POSTGRES_PORT=5433` no `.env` da raiz e troque a porta também na `DATABASE_URL` de `apps/api/.env` (`...@localhost:5433/treinos`).

### 4. Subir tudo

1. Banco (na raiz, com o Docker Desktop aberto):
   ```powershell
   docker compose up -d db
   docker compose ps
   ```
   Espere o serviço `db` aparecer como `healthy`.
2. API (em `apps/api`):
   ```powershell
   uv sync
   uv run alembic upgrade head
   uv run fastapi dev app/main.py --host 0.0.0.0
   ```
   Verifique abrindo `http://localhost:8000/health` no navegador: deve mostrar `{"status":"ok"}`. A documentação interativa fica em `http://localhost:8000/docs`.
   Se o Windows perguntar sobre o **firewall** para o Python, peça ao usuário para permitir em **redes privadas**. Sem isso, o celular não alcança a API.
   **Atenção:** muitas redes Wi-Fi ficam marcadas como **Pública** no Windows, e aí a permissão de rede privada não vale. Confira com `Get-NetConnectionProfile` (campo `NetworkCategory`). Se estiver `Public` e for a rede de casa, peça ao usuário para trocar para Privada: Configurações → Rede e Internet → Wi-Fi → (a rede) → Tipo de perfil de rede → Privada.
3. App (em `apps/mobile`, em outro terminal):
   ```powershell
   npm install
   npx expo start
   ```
   Peça ao usuário para escanear o QR code com o Expo Go (no iPhone, pela câmera). Se o Windows perguntar sobre o firewall para o Node, permita em redes privadas.

### 5. Checklist final: ambiente pronto

Só diga que terminou quando **todos** estiverem ok, mostrando a saída de cada comando:

- [ ] `git --version`, `gh auth status`, `node -v`, `python --version`, `uv --version` e `docker --version` funcionam
- [ ] `docker compose ps` mostra `db` como `healthy`
- [ ] Em `apps/api`: `uv run pytest` passa, e `uv run ruff check .` e `uv run ruff format --check .` estão sem erros
- [ ] `uv run alembic upgrade head` roda sem erro
- [ ] `http://localhost:8000/health` responde `{"status":"ok"}`
- [ ] Em `apps/mobile`: `npm run lint` e `npm run typecheck` sem erros
- [ ] **No celular**, pelo Expo Go, a tela mostra **"API: conectada"** (confirme com o usuário)

### Depois do setup: comandos do dia a dia

A lista completa está no `AGENTS.md`. Os mais usados:

- API (`apps/api`): `uv run fastapi dev app/main.py --host 0.0.0.0`, `uv run pytest`, `uv run ruff check .`
- App (`apps/mobile`): `npx expo start`, `npm run lint`, `npm run typecheck`
- Quando a API muda: `uv run python -m app.export_openapi` (em `apps/api`) e depois `npm run gen:api` (em `apps/mobile`), para o app receber os tipos novos

### Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| Celular mostra "API: sem conexão" | IP errado no `.env`, redes diferentes ou firewall | Confira o IP com `ipconfig`, use a mesma rede Wi-Fi, libere Python/Node no firewall (rede privada) e reinicie o `npx expo start` depois de mudar o `.env` |
| `docker compose up` falha com porta em uso | Outro Postgres na 5432 | Passo 3.3 (usar 5433) |
| `alembic upgrade head` dá `password authentication failed for user "treinos"` | Um Postgres instalado no Windows está respondendo na 5432 no lugar do Docker (às vezes os dois sobem sem erro) | Passo 3.3: usar 5433 no `.env` da raiz e na `DATABASE_URL`, depois `docker compose up -d db` de novo |
| Celular continua "sem conexão" mesmo com o firewall liberado | Rede Wi-Fi marcada como Pública | `Get-NetConnectionProfile`; trocar a rede para Privada (passo 4.2) |
| `uv`, `node` ou `gh`: "comando não encontrado" logo após instalar | PATH não atualizou | Feche e abra o terminal (ou o Antigravity) |
| Expo Go não abre o projeto | Rede da faculdade ou do trabalho bloqueia | Tente `npx expo start --tunnel` |
