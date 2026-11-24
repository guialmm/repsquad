# Estratégia de testes

Como o RepSquad é testado, que tipo de teste cada mudança exige e quem cuida de quê. Vale para pessoas e IAs. As regras curtas estão no `AGENTS.md`; aqui está o porquê.

## A ideia em uma frase

Muito teste rápido embaixo (unitário), uma boa camada de integração com o banco de verdade no meio e poucos testes de ponta a ponta em cima. Tudo roda no CI, e o PR não entra com teste vermelho nem com a cobertura caindo.

```
            ┌─────────────┐
            │  E2E (app)  │  poucos, lentos: o fluxo principal no Android
          ┌─┴─────────────┴─┐
          │ Contrato, carga │  semanais/sob demanda: a API aguenta e cumpre o OpenAPI
        ┌─┴─────────────────┴─┐
        │  Integração + tela  │  cada endpoint no Postgres, cada tela com lógica
      ┌─┴─────────────────────┴─┐
      │       Unitário          │  muitos, instantâneos: toda regra de negócio
      └─────────────────────────┘
```

## Os tipos de teste

A dificuldade é para quem nunca escreveu aquele tipo de teste. Com a infraestrutura pronta, todos ficam mais fáceis.

| Tipo | Onde | O que prova | Ferramenta | Dificuldade |
|---|---|---|---|---|
| **Unitário** | API e app | Uma função dá o resultado certo, sem banco nem rede | `pytest` / `jest-expo` | 🟢 fácil |
| **Propriedades** | API | Uma regra vale para **qualquer** entrada, não só os exemplos (ex.: 1RM nunca é menor que a carga; o parser nunca quebra) | `hypothesis` | 🟡 média |
| **Integração** | API | O endpoint funciona de ponta a ponta com o **Postgres de verdade**: resposta, banco, erros | `pytest` + `httpx` + Postgres | 🟡 média |
| **Migração** | API | As migrações sobem, descem e batem com os models | `alembic` no CI | 🟡 média |
| **Segurança** | API | Ninguém acessa sem login, nem vê os dados de outro usuário; sem dependência vulnerável | `pytest`, `ruff` (regras S), `pip-audit`, `npm audit` | 🟡 média |
| **Componente** | app | A tela mostra os estados certos (carregando, vazio, erro, dados) e reage ao toque | React Native Testing Library | 🟡 média |
| **Contrato** | API | A API cumpre o próprio OpenAPI e não devolve erro 500 com entrada estranha | `schemathesis` | 🔴 difícil |
| **Ponta a ponta (E2E)** | app + API | O fluxo principal funciona no Android de verdade: entrar, montar rotina, treinar, finalizar | Maestro | 🔴 difícil |
| **Offline** | app | Nenhum treino se perde sem internet | `jest-expo` + roteiro manual com modo avião | 🔴 difícil |
| **Carga** | API | A API responde rápido com vários usuários ao mesmo tempo | Locust | 🔴 difícil |
| **Smoke pós-deploy** | API | Depois do deploy, a API no Render está de pé | `curl` no CI | 🟢 fácil |
| **Manual** | app | Funciona no celular de verdade (Android e iPhone pelo Expo Go) | o "Como testar no celular" do PR | 🟢 fácil |

## O que cada PR precisa ter

É a "definição de pronto" de testes. Quem revisa confere.

**API**
- Toda regra de negócio (cálculo, parser, permissão, data) tem **teste unitário**, escrito antes do código (TDD).
- Todo endpoint novo tem **teste de integração** cobrindo, no mínimo:
  - o caminho feliz (status e corpo da resposta, e o que ficou gravado no banco);
  - entrada inválida (422);
  - sem login (401), quando o endpoint exige login;
  - **outro usuário** tentando ler, editar ou apagar o recurso (404, para não revelar que ele existe);
  - recurso inexistente ou apagado (404).
- Cálculos com muitas entradas possíveis (1RM, recordes, parser, semana do modo turma) também têm **teste de propriedades**.
- Mudou um model: a migração vem num PR próprio, e o CI prova que ela sobe, desce e bate com os models.

**App**
- Toda função de lógica (conversão kg/lb, formatação, cálculo do resumo, fila offline) tem **teste unitário**.
- Toda tela com lógica tem **teste de componente** dos estados: carregando, vazio, erro e com dados.
- O PR diz como testar no celular, e o autor testou no Expo Go.

**Sempre**
- **Bug corrigido = teste que reproduz o bug**, escrito antes da correção. O teste falha sem a correção e passa com ela.
- A **cobertura não pode cair**. O CI falha abaixo do mínimo (API: começa em 80%, meta de 85%; app: começa em 60% nas pastas de lógica, meta de 80%). O mínimo só sobe.
- Teste não depende de internet, de ordem de execução nem de horário. Datas e "agora" são fixados no teste.

## Como os testes da API usam o banco

- **Unitário:** sem banco. Se a função precisa de dados, ela recebe os dados como parâmetro.
- **Integração:** Postgres de verdade (o mesmo do `docker compose`, num banco separado `treinos_test`, ou um banco de teste no Neon). Cada teste roda dentro de uma transação desfeita no final, então um teste não suja o outro e tudo continua rápido.
- No CI, o Postgres sobe sozinho. Na sua máquina, sem Postgres, os testes de integração são **pulados com aviso** e só os unitários rodam; o CI roda todos.

Marcadores do `pytest`: `@pytest.mark.integration` para os que usam banco. `uv run pytest -m "not integration"` roda só os rápidos.

## Quando cada coisa roda

| Momento | O que roda |
|---|---|
| Cada push em PR | lint, tipos, unitários, propriedades, integração, componentes, migração, segurança estática, cobertura |
| Cada merge na `main` | tudo acima + deploy no Render + smoke pós-deploy |
| Toda semana (agendado) e antes de cada APK | contrato (Schemathesis), E2E (Maestro), auditoria de dependências |
| Sob demanda | carga (Locust), roteiro manual offline com modo avião |

## Quem cuida de quê

Cada funcionalidade traz os próprios testes: quem faz a issue escreve os testes dela, conforme a seção "Testes exigidos" da issue. As tarefas abaixo são de **infraestrutura e de testes que atravessam o projeto todo** e têm issue própria (etiqueta `teste`).

| Tarefa | Quem | Dificuldade |
|---|---|---|
| #28 Infraestrutura de testes da API (Postgres, fixtures, cobertura) | guialmm | 🔴 difícil |
| #29 Infraestrutura de testes do app (`jest-expo`, Testing Library, cobertura) | guialmm | 🟡 média |
| #30 Segurança e qualidade no CI (regras S do ruff, `pip-audit`, `npm audit`) | guialmm | 🟡 média |
| #31 Suíte de segurança da API (login e acesso entre usuários em **todos** os endpoints) | novo integrante | 🟡 média |
| #32 Testes de contrato com Schemathesis | PedroSouza347 | 🔴 difícil |
| #33 Teste de carga com Locust | novo integrante | 🔴 difícil |
| #34 Ponta a ponta com Maestro (fluxo principal no Android) | guialmm, com revisão do LGvinagre | 🔴 difícil |
