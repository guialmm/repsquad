# App de treinos — documento de design

- **Data:** 2026-11-24
- **Status:** rascunho para aprovação
- **Nome:** RepSquad (repositório `repsquad`)
- **Pesquisa de base:** `reports/Hevy como referência de app.md`, no workspace do Gui

## 1. Intenção e o porquê

Três amigos (dois intermediários e um iniciante em programação) querem construir juntos um aplicativo **completo e com cara de profissional**. O objetivo principal é **praticar o fluxo de trabalho de um time de verdade**: issues, uma branch por tarefa, pull requests, review e CI. O objetivo secundário é terminar com um app que os três **usem de verdade na academia**.

O app é um registrador de treinos de musculação para celular. O **Hevy**, que o Gui usa hoje, serve de inspiração: a ideia é copiar o esqueleto (modelo de dados e fluxo de registro), não a marca, a aparência nem os textos.

O projeto será feito em **vibecoding**. As IAs escrevem o código para os três: o Gui usa o Claude Code e os dois amigos usam o Antigravity com o Claude Opus. Os humanos decidem o que fazer, revisam os PRs e testam no celular.

## 2. Objetivos, não-objetivos e anti-objetivos

### Objetivos

- Um app que funcione nos celulares Android (por APK) e registre um treino inteiro na academia sem travar. O amigo de iPhone consegue desenvolver e testar pelo Expo Go.
- Repositório no GitHub com `main` protegida, PR com 1 aprovação, CI verde obrigatório e issues dividindo o trabalho.
- Regras escritas para as IAs (`AGENTS.md` e `CLAUDE.md`), para que o fluxo profissional aconteça mesmo com a IA escrevendo o código.
- Primeira versão em cerca de 6 semanas.

### Não-objetivos (fora da v1)

- Feed público, seguidores fora do grupo, descoberta de usuários.
- Apple Watch / Wear OS, widgets de tela bloqueada, integrações (Apple Health, Strava).
- Fotos e vídeos nos treinos.
- Gerador de programas e IA dentro do app.
- Cobrança, plano pago, anúncios.
- Publicação nas lojas (App Store / Google Play). No Android o uso é por APK; no iPhone, só Expo Go durante o desenvolvimento.
- Cardio completo (velocidade, intervalos). Só duração e distância simples.
- Sincronização offline completa entre dispositivos.

### Anti-objetivos (seria fracasso mesmo funcionando)

- **Perder dados de um treino em andamento**, seja porque o app fechou, o sinal caiu ou a bateria acabou.
- **Registrar uma série ser lento**, ou seja, precisar de mais de 2 ou 3 toques para repetir a carga da última vez.
- **PRs gigantes que ninguém revisa de verdade.** Isso anula o motivo do projeto.
- **Commits direto na `main`**, ou IA trabalhando na branch errada sem avisar.
- **Copiar marca, ícones, textos ou telas do Hevy.**

## 3. Restrições

- **Custo zero:** tudo em planos gratuitos (GitHub, hospedagem da API, banco).
- **Time:** dois intermediários e um iniciante, todos guiando IAs. O código precisa ser legível e convencional, porque humanos revisam os PRs, inclusive o iniciante.
- **Idioma da interface:** português do Brasil.
- **Dados de exercícios:** só fontes com licença que permita uso livre. A escolhida é a `yuhonas/free-exercise-db`, que é domínio público (Unlicense). O wger serve só como referência de modelo (dados CC-BY-SA, código AGPL), e nenhum dado nem código dele é copiado.
- **Ferramentas:** o Gui está no Windows. O GitHub CLI (`gh`) ainda não está instalado na máquina dele.
- **Celulares:** dois Android e um iPhone. Nada será pago.
  - **Android:** o app é distribuído como APK, gerado pelo EAS Build no plano grátis e instalado direto no celular.
  - **iPhone:** na v1 não há app instalado (exigiria a conta de desenvolvedor da Apple). O amigo de iPhone desenvolve e testa com o Expo Go, ligado ao servidor de desenvolvimento do próprio computador. Usar o app na academia pelo iPhone fica fora da v1.
  - **Consequência técnica:** o app só usa bibliotecas compatíveis com o Expo Go, para os três conseguirem testar tudo. Isso inclui notificações locais para o fim do descanso.
- **Repositório:** público no GitHub, numa conta pessoal do Gui, para que a proteção da `main` funcione no plano grátis. Segredos (JWT, banco, Render) ficam nos secrets do GitHub e do Render, nunca no código.

## 4. Abordagens consideradas

### Tecnologia do app mobile

| Opção | Prós | Contras |
|---|---|---|
| **React Native + Expo (escolhida)** | App nativo; usa React; Expo Go roda no celular por QR code sem Android Studio; acesso a notificações, armazenamento local e execução em segundo plano | Navegação e algumas bibliotecas diferentes do React web |
| PWA (React web instalável) | Mais simples, React web puro | Uso offline e notificações limitados (principalmente no iPhone); a academia costuma ter sinal ruim |
| React web + Capacitor | Mais recursos que a PWA | Sensação de site; configurar o empacotamento dá trabalho |

O Expo foi escolhido pelo time: eles querem um app de celular de verdade, em React, e os recursos-chave (cronômetro de descanso, treino sem internet) funcionam melhor no nativo.

### Backend

| Opção | Prós | Contras |
|---|---|---|
| Node.js + TypeScript | Uma linguagem só no projeto | O time preferiu Python |
| **Python + FastAPI (escolhida)** | Moderno e leve; gera documentação Swagger automática; tipos TS do app podem ser gerados a partir do OpenAPI | Duas linguagens no projeto |
| Python + Django REST | Admin, autenticação e ORM prontos | Mais pesado; boa parte do que oferece fica sem uso numa API que só serve o app |

O time escolheu FastAPI.

### Estratégia de branches

| Opção | Prós | Contras |
|---|---|---|
| Uma branch fixa por pessoa ou área (`api`, `mobile`) | Fácil de entender | PRs enormes, conflitos acumulados, tarefas que cruzam API e app ficam partidas |
| **Uma branch curta por tarefa a partir da `main` (escolhida)** | PRs pequenos e revisáveis, poucos conflitos, padrão de mercado | Exige o ritual `switch main → pull → switch -c` a cada tarefa (a IA faz isso) |

O Gui escolheu a branch por tarefa. A divisão por área fica nas issues, não nas branches.

## 5. Decisões tomadas

### Stack

- **App:** React Native + Expo (SDK atual), TypeScript, Expo Router para navegação, `expo-sqlite` para o rascunho local do treino.
- **API:** Python 3.12+, FastAPI, SQLAlchemy 2 (ou SQLModel), Alembic para migrações, autenticação por e-mail e senha com JWT.
- **Banco:** PostgreSQL. Local via Docker Compose; em produção, Neon (plano grátis).
- **Hospedagem da API:** Render ou Railway (plano grátis), a partir da semana 3, para usar na academia de verdade.
- **Tipos compartilhados:** cliente TypeScript gerado a partir do OpenAPI da API.

### Repositório

Monorepo:

```
app-treinos/
├── apps/
│   ├── mobile/      # Expo
│   └── api/         # FastAPI
├── docs/
│   └── superpowers/specs/   # este documento
├── .github/
│   ├── workflows/   # CI
│   ├── pull_request_template.md
│   └── ISSUE_TEMPLATE/
├── docker-compose.yml
├── AGENTS.md        # regras para IAs (Antigravity e outras)
├── CLAUDE.md        # aponta para AGENTS.md (Claude Code)
└── README.md        # para humanos
```

### Fluxo de trabalho no GitHub

- `main` protegida: merge só via PR, com 1 aprovação de outra pessoa e CI verde.
- Cada tarefa é uma issue com critérios de aceite. Cada issue vira uma branch curta: `feat/…`, `fix/…`, `docs/…`, `chore/…`.
- Commits no padrão Conventional Commits (`feat: …`, `fix: …`), merge por squash, branch apagada após o merge.
- PRs pequenos, com meta de até cerca de 300 linhas alteradas (fora arquivos gerados).
- Migrações do Alembic vão em PRs próprios.
- A tela de treino ao vivo começa por um PR de "esqueleto", para os três concordarem cedo sobre o formato dos dados.
- Rodízio de review: o iniciante também revisa PRs dos intermediários.
- **CI:** `ruff` + `pytest` na API; `eslint` + `tsc --noEmit` no app.

### Regras para as IAs (`AGENTS.md`, com `CLAUDE.md` apontando para ele e resumo no README)

O conteúdo exato fica para o plano. As regras decididas são:

1. **Consciência de branch:** antes de qualquer alteração, a IA verifica a branch atual (`git branch --show-current`) e diz ao usuário qual é.
2. **Nunca commitar na `main`.** Se estiver nela, cria uma branch nova antes de alterar qualquer coisa.
3. **Pedido fora do escopo da branch atual:** a IA **troca de branch sozinha e avisa**, sem perguntar antes. Ela salva o trabalho em andamento antes da troca (commit ou `git stash`) e **nunca descarta alterações**. O aviso diz onde o trabalho anterior ficou guardado.
4. Antes de cada commit e de cada push, a IA confirma o nome da branch na resposta.
5. A IA cria commits no padrão Conventional Commits e abre PRs pequenos, seguindo o template.
6. **Vibecoding com responsabilidade:** como a IA escreve o código, ela precisa:
   - rodar lint, checagem de tipos e testes antes de dizer que terminou;
   - escrever testes para a lógica do backend (PRs, cálculo de 1RM, parser de ficha);
   - escrever a descrição do PR em português simples, explicando o que mudou, por quê e como testar no celular, de forma que o iniciante consiga revisar.
7. Comandos de rodar, testar e migrar ficam documentados no `AGENTS.md`, para qualquer IA conseguir executar o projeto.

### Arquivo de preparação do ambiente (`docs/SETUP-IA.md`)

Um arquivo pensado para ser **entregue à IA de cada amigo** (Antigravity com Opus) logo no primeiro dia, para ela preparar o computador dele. Ele traz:

- a stack completa e as versões (Node LTS, Python 3.12+, Docker Desktop, Git, GitHub CLI, Expo / EAS CLI, Expo Go no celular);
- os passos de instalação no Windows, com verificação de cada um (`node -v`, `python --version` etc.);
- clonar o repo, criar o `.env` a partir do `.env.example`, subir o Postgres no Docker, rodar migrações e seed, subir a API e o app, e abrir no celular pelo Expo Go;
- um checklist final de "ambiente pronto", que a IA confere antes de dizer que terminou;
- um prompt curto pronto para colar no Antigravity ("leia `docs/SETUP-IA.md` e `AGENTS.md` e prepare meu ambiente").

O README aponta para esse arquivo logo no topo.

### Escopo da v1 (funcionalidades)

1. **Autenticação:** cadastro e login com e-mail e senha (JWT).
2. **Biblioteca de exercícios:** seed da free-exercise-db, com nomes traduzidos para pt-BR numa tabela de tradução. Busca, filtro por grupo muscular e equipamento, e exercício personalizado sem limite.
3. **Rotinas:** CRUD de pastas e rotinas, sem limite. Uma "ficha" é uma pasta com rotinas A/B/C…
4. **Treino ao vivo:**
   - começa a partir de uma rotina ou vazio;
   - cada série tem tipo (normal, aquecimento, falha, drop), carga, repetições e RPE opcional;
   - a coluna "anterior" preenche carga e repetições da última vez com um toque;
   - checkmark para marcar a série como feita (só séries marcadas são salvas);
   - cronômetro de descanso por exercício, ajustável em ±15 s e com opção de pular, que inicia ao marcar a série;
   - superset (exercícios agrupados), reordenar e trocar exercício.
5. **Rascunho local:** o treino em andamento é salvo continuamente no celular (`expo-sqlite`), sobrevive ao app ser fechado e é enviado à API ao finalizar.
6. **Finalização:** pergunta "atualizar a rotina com o que você fez hoje?" quando houve mudança, e mostra um resumo com volume, séries e recordes batidos.
7. **Histórico e recordes:** lista de treinos e tela por exercício, com gráfico de 1RM estimado (fórmula de Epley) e melhor carga por número de repetições.
8. **Estatísticas básicas:** séries por grupo muscular na semana (músculo primário vale 1, secundário vale 0,5), com histórico completo e sem limite de tempo.
9. **Importar ficha (diferencial):** o usuário cola o texto da ficha (ex.: `A – Peito/Tríceps: Supino reto 4x8-10…`) e a API cria a pasta e as rotinas, casando os nomes com a biblioteca em pt-BR. É a tarefa indicada para o iniciante.
10. **Modo turma (diferencial):** um grupo privado (os três), com ranking por exercício, meta semanal coletiva de treinos e sequência de semanas treinando.

### Modelo de dados (base)

Tabelas: `user`, `exercise`, `exercise_translation`, `routine_folder`, `routine`, `routine_exercise`, `routine_set`, `workout`, `workout_exercise`, `workout_set`, `personal_record`, além das tabelas do modo turma (`group`, `group_member`).

Regras:

- Carga guardada sempre em kg (`weight_kg`); a conversão de unidade é feita só na tela.
- `created_at`, `updated_at` e `deleted_at` (exclusão lógica) em todas as tabelas.
- Datas com fuso horário (`timestamptz`).
- `load_mode` (total ou por lado) no exercício do treino, para halteres.
- Superset representado por `superset_id` em cada exercício da rotina ou do treino.
- Rotina e treino têm a mesma forma (exercício → séries). O treino guarda `routine_id` quando veio de uma rotina.

### Divisão sugerida do time

| Semanas | Intermediário 1 (backend) | Intermediário 2 (mobile) | Iniciante |
|---|---|---|---|
| 1 | Monorepo, Docker Compose, FastAPI + Alembic, CI | Expo + navegação + cliente de API tipado | Script de seed da free-exercise-db e tradução pt-BR |
| 2–3 | Auth, CRUD de rotinas e pastas, testes | Telas de rotinas e biblioteca | Busca e filtro de exercícios (tela e endpoint) |
| 3–4 | Finalizar treino com cálculo de PR; deploy da API | Tela de treino ao vivo (série, cronômetro, rascunho local) | Histórico e detalhe do exercício |
| 5–6 | Estatísticas e modo turma | Atualizar rotina, resumo, gráficos | Parser de importar ficha (com testes) |

Quem faz o quê é decidido pelo time. A tabela é um ponto de partida.

### Decisões do Claude após a revisão (o Gui pode corrigir)

- **Treino sem internet:** dá para começar e terminar um treino sem sinal. O app guarda no celular as rotinas, a biblioteca de exercícios e os valores "anterior" da última sincronização. Ao finalizar, o treino vai para uma fila local (outbox), que é reenviada automaticamente quando houver conexão. O resumo de volume e séries é calculado no próprio celular. Os recordes aparecem quando o servidor confirmar o envio.
- **Servidor dormindo:** o plano grátis do Render "dorme" e leva cerca de 1 minuto para acordar. Com o cache acima, isso não trava o treino. Além disso, o app faz um ping na API ao abrir para acordá-la. A hospedagem fica no Render (o Railway não tem mais plano grátis de verdade).
- **Modo turma:** grupos simples com código de convite (criar, entrar, sair). O ranking por exercício compara o melhor 1RM estimado. A semana vai de segunda a domingo, no fuso America/Sao_Paulo.
- **Nomes em pt-BR:** traduzidos pela IA e revisados pelo iniciante, começando pelos cerca de 150 exercícios mais comuns em academia brasileira. Uma tabela `exercise_alias` guarda sinônimos ("supino reto", "supino reto com barra", "supino") para o importador de ficha encontrar o exercício.
- **O que o plano produz:** primeiro a fundação, feita pelo Gui com o Claude Code: monorepo, CI, `AGENTS.md`, `CLAUDE.md`, README, templates e proteção da `main`. Depois, o backlog das 6 semanas como issues no GitHub, com critérios de aceite e marcadas por área (`api`, `mobile`, `iniciante`), para o time distribuir.

## 6. O que fica para quem for construir

- Biblioteca de componentes e estilo visual do app (desde que não imite o Hevy).
- Biblioteca de gráficos, de estado e de formulários no app.
- Estrutura interna de pastas dentro de `apps/api` e `apps/mobile`.
- Formato exato dos endpoints, seguindo REST convencional.
- Detalhes do parser de ficha (formatos aceitos além do exemplo), desde que tenha testes.
- Escolha final entre Render e Railway.
- Texto exato do `AGENTS.md`, README e templates, desde que cubram as regras da seção 5.
