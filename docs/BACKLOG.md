# Backlog da v1 (6 semanas)

Fonte das issues do GitHub. Cada seção abaixo virou uma issue. Se mudar algo aqui, atualize a issue também (ou o contrário).

Como pegar uma tarefa: escolha uma issue aberta, atribua a você, crie a branch (`feat/...`) a partir da `main` atualizada e abra o PR com `Closes #N`. Detalhes no [README](../README.md) e no [AGENTS.md](../AGENTS.md). As decisões de produto estão no [design](superpowers/specs/2026-11-24-app-treinos-design.md).

A divisão sugerida (que o time pode mudar): **api** para o intermediário de backend, **mobile** para o intermediário de mobile, **iniciante** para o iniciante.

---

## 1. Seed da biblioteca de exercícios
Labels: api, iniciante, semana-1

Importar a base aberta [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (domínio público) para o banco.

- [ ] Tabelas `exercise`, `exercise_translation` e `exercise_alias` (com `created_at`, `updated_at`, `deleted_at`), numa migração Alembic em PR próprio
- [ ] Script de seed que importa os ~870 exercícios com músculos primários/secundários, equipamento e imagens
- [ ] Rodar o seed duas vezes não duplica nada (idempotente)
- [ ] Teste do seed com uma amostra pequena da base
- [ ] Como rodar o seed documentado no `AGENTS.md`

## 2. Tradução pt-BR dos exercícios mais comuns + sinônimos
Labels: iniciante, semana-1

- [ ] Nomes em pt-BR (traduzidos pela IA e revisados por você) dos ~150 exercícios mais comuns em academia brasileira, em `exercise_translation`
- [ ] Sinônimos em `exercise_alias` (ex.: "supino", "supino reto", "supino reto com barra"), pensando no importador de ficha (#17)
- [ ] Os dados ficam num arquivo versionado (CSV ou JSON) carregado pelo seed

## 3. Autenticação com e-mail e senha (JWT)
Labels: api, semana-2

- [ ] Tabela `user` (migração em PR próprio)
- [ ] `POST /auth/register`, `POST /auth/login` (devolve JWT), `GET /me`
- [ ] Senha com hash (nunca em texto puro)
- [ ] A API não sobe em produção se `JWT_SECRET` estiver com o valor padrão
- [ ] Testes: cadastro, login certo, senha errada, e-mail repetido, `/me` sem token

## 4. Telas de login e cadastro
Labels: mobile, semana-2

- [ ] Telas de cadastro e login, com mensagens de erro em português
- [ ] Token guardado com segurança (`expo-secure-store`) e enviado nas chamadas
- [ ] Usuário logado vai direto para o app; botão de sair

## 5. Busca e filtro de exercícios + exercício personalizado (API)
Labels: api, iniciante, semana-2

- [ ] `GET /exercises` com busca por nome (pt-BR e sinônimos), filtro por grupo muscular e por equipamento, com paginação
- [ ] `POST /exercises` cria exercício personalizado do usuário, sem limite de quantidade
- [ ] Testes de busca, filtros e criação

## 6. Tela da biblioteca de exercícios
Labels: mobile, iniciante, semana-3

- [ ] Lista com busca e filtros (grupo muscular, equipamento)
- [ ] Detalhe do exercício (imagem, músculos)
- [ ] Criar exercício personalizado

## 7. CRUD de pastas e rotinas (API)
Labels: api, semana-2

- [ ] Tabelas `routine_folder`, `routine`, `routine_exercise` e `routine_set` (migração em PR próprio)
- [ ] Criar, editar, reordenar e apagar (exclusão lógica) pastas e rotinas, sem limite
- [ ] Superset representado por `superset_id` no exercício da rotina
- [ ] Testes, incluindo um usuário sem acesso às rotinas de outro

## 8. Telas de fichas e rotinas
Labels: mobile, semana-3

- [ ] Lista de fichas (pastas) com as rotinas A/B/C…
- [ ] Criar, editar e reordenar rotinas; adicionar exercícios da biblioteca; definir séries-alvo
- [ ] Agrupar exercícios em superset

## 9. Deploy da API no Render + Postgres no Neon
Labels: api, semana-3

- [ ] API publicada no Render (plano grátis) com banco no Neon (plano grátis)
- [ ] Segredos só nas variáveis de ambiente do Render, nunca no código
- [ ] Migrações rodam no deploy
- [ ] O app chama `/health` ao abrir, para "acordar" a API dormindo
- [ ] Como fazer o deploy documentado no README

## 10. Esqueleto do treino ao vivo (formato dos dados)
Labels: api, mobile, semana-3

PR pequeno para os três concordarem no formato **antes** dos detalhes.

- [ ] Tabelas `workout`, `workout_exercise` e `workout_set` (migração em PR próprio), com `routine_id` opcional, `weight_kg`, `load_mode` (total ou por lado) e `start_time` com fuso horário
- [ ] Formato do JSON de "finalizar treino" definido no OpenAPI
- [ ] Tela mínima que começa um treino a partir de uma rotina ou vazio
- [ ] Os três aprovam o PR

## 11. Treino ao vivo completo
Labels: mobile, semana-4

- [ ] Cada série tem tipo (normal, aquecimento, falha, drop), carga, repetições e RPE opcional
- [ ] Coluna "anterior" preenche carga e reps da última vez com um toque
- [ ] Checkmark marca a série como feita (só as marcadas são salvas)
- [ ] Cronômetro de descanso por exercício: começa ao marcar a série, ±15 s, pular, notificação local ao terminar (compatível com Expo Go)
- [ ] Superset, reordenar e trocar exercício durante o treino

## 12. Rascunho local, cache offline e fila de envio
Labels: mobile, semana-4

- [ ] O treino em andamento é salvo continuamente no celular (`expo-sqlite`) e sobrevive ao app ser fechado
- [ ] Rotinas, biblioteca e valores "anterior" ficam em cache: dá para começar um treino sem internet
- [ ] Ao finalizar sem internet, o treino vai para uma fila e é reenviado quando a conexão voltar
- [ ] Nenhum treino é perdido (testar com modo avião)

## 13. Finalizar treino com cálculo de recordes (API)
Labels: api, semana-4

- [ ] `POST /workouts` salva o treino completo
- [ ] Recordes detectados: maior carga, 1RM estimado (fórmula de Epley: `carga × (1 + reps/30)`) e melhor carga por número de repetições, em `personal_record`
- [ ] Resposta inclui os recordes batidos
- [ ] Testes do cálculo, incluindo séries de aquecimento (que não contam) e reenvio duplicado da fila (não duplica o treino)

## 14. Histórico e detalhe do exercício com gráfico
Labels: mobile, iniciante, semana-4

- [ ] Lista de treinos feitos (data, duração, volume)
- [ ] Detalhe do treino
- [ ] Tela do exercício com gráfico do 1RM estimado ao longo do tempo e recordes por número de reps, com histórico completo

## 15. "Atualizar rotina?" e resumo do treino
Labels: mobile, semana-5

- [ ] Ao finalizar, se o treino mudou em relação à rotina, perguntar "Atualizar a rotina com o que você fez hoje?"
- [ ] Resumo: volume total, séries, duração e recordes batidos (os recordes aparecem quando o servidor confirmar)

## 16. Estatísticas: séries por grupo muscular na semana
Labels: api, mobile, semana-5

- [ ] Endpoint com séries por grupo muscular por semana (primário vale 1, secundário 0,5), sem limite de histórico
- [ ] Tela com o gráfico
- [ ] Testes do cálculo

## 17. Importar ficha por texto
Labels: api, iniciante, semana-5

- [ ] `POST /routines/import` recebe o texto colado (ex.: `A – Peito/Tríceps: Supino reto 4x8-10…`) e cria a pasta e as rotinas
- [ ] Casa os nomes com a biblioteca pelos nomes pt-BR e sinônimos (#2); o que não casar volta numa lista "não reconhecidos"
- [ ] Muitos testes com formatos diferentes de ficha
- [ ] Tela no app para colar o texto e revisar antes de salvar

## 18. Modo turma
Labels: api, mobile, semana-6

- [ ] Criar grupo, entrar por código de convite, sair (tabelas `group` e `group_member`)
- [ ] Ranking por exercício pelo melhor 1RM estimado
- [ ] Meta semanal coletiva de treinos e sequência de semanas treinando (semana de segunda a domingo, fuso America/Sao_Paulo)
- [ ] Testes das regras de semana e ranking

## 19. APK Android via EAS Build
Labels: mobile, semana-6

- [ ] Build do APK pelo EAS no plano grátis, apontando para a API do Render
- [ ] Instruções de instalação no README
- [ ] Os dois Android instalam e fazem um treino completo na academia
