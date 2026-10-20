# Befit Pessoal

App pessoal de registro de treino de musculação. Funciona offline: todos os dados ficam
no SQLite local do aparelho, sem backend e sem conta.

Stack: **Expo SDK 58 · React Native 0.88 · React 19 · TypeScript (strict) · expo-sqlite · React Navigation 7**.

## Funcionalidades

| Área             | O que faz                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------- |
| **Início**       | Faixa da semana (seg–dom) com os dias treinados, último treino e atalho para começar.       |
| **Treinos**      | Cria treinos manualmente ou **gera um plano por regras** (objetivo, nível, dias, ambiente). |
| **Sessão**       | Registra séries (carga × repetições), **timer de descanso** e **troca de exercício**.       |
| **Exercícios**   | Catálogo de 61 exercícios com busca, filtro por grupo e ambiente, e passo a passo.          |
| **Histórico**    | Lista das sessões realizadas.                                                               |
| **Progresso**    | Gráfico de progressão de carga por exercício.                                               |
| **Estatísticas** | Totais (treinos, séries, volume), maior carga e **conquistas** com barra de progresso.      |

## Como rodar

Pré-requisitos: [Node.js](https://nodejs.org) LTS e o app **Expo Go** no celular (ou um emulador).

```bash
npm install
npm start
```

Escaneie o QR code com o Expo Go (Android) ou com a câmera (iPhone). Celular e computador
precisam estar na mesma rede; se não conectar, use `npm run start:tunnel`.

> **Versão do Expo Go:** o projeto usa o SDK 58, o mesmo do Expo Go atual da loja. Quando o
> Expo lançar um SDK novo e o Expo Go disser que o projeto é incompatível, atualize com
> `npx expo install expo@latest` seguido de `npx expo install --fix` e rode `npm run check`.

> **Web:** `npm run web` abre o app no navegador. O banco na web usa SQLite em WebAssembly e
> precisa de `SharedArrayBuffer`, liberado pelos cabeçalhos COOP/COEP: o `metro.config.js` os
> envia no servidor de desenvolvimento e `public/coi-serviceworker.js` cobre hosts que não
> deixam configurar cabeçalhos (ex.: GitHub Pages). Os dados ficam no próprio navegador.

## Scripts

| Comando                | Descrição                                     |
| ---------------------- | --------------------------------------------- |
| `npm start`            | Inicia o servidor de desenvolvimento do Expo. |
| `npm run start:tunnel` | Inicia com túnel (redes diferentes).          |
| `npm run android`      | Abre no emulador/aparelho Android.            |
| `npm run ios`          | Abre no simulador iOS (macOS).                |
| `npm run typecheck`    | Verifica os tipos com `tsc --noEmit`.         |
| `npm run format`       | Formata o código com Prettier.                |
| `npm run format:check` | Confere a formatação sem alterar arquivos.    |
| `npm run check`        | Roda `typecheck` e `format:check`.            |

## Estrutura

```
.
├── App.tsx                 # Ponto de entrada: inicializa o banco e monta a navegação
├── app.json                # Configuração do Expo
├── src/
│   ├── components/         # Componentes reutilizáveis (ex.: TimerDescanso)
│   ├── data/               # Dados estáticos (catálogo de exercícios)
│   ├── db/                 # Conexão SQLite, schema e seed
│   ├── navigation/         # Rotas (abas + pilhas)
│   ├── repositories/       # Todo o SQL fica aqui
│   ├── screens/            # Telas (consomem repositories, não conhecem SQL)
│   ├── types/              # Modelo de domínio
│   └── utils/              # Regras puras (gerador de plano, conquistas)
└── .vscode/                # Configurações compartilhadas do VS Code
```

### Princípios

- **Telas nunca importam `expo-sqlite`.** Toda leitura/escrita passa por `repositories/`. Para trocar
  o SQLite por um backend remoto, só essa camada muda.
- **Regras de negócio em funções puras** (`utils/`): sem banco nem estado de tela, fáceis de testar.
- **Alias `@/`** aponta para `src/` (configurado em `tsconfig.json` e `babel.config.js`).

## Modelo de dados

```
exercicios(id, nome, grupo_muscular)
treinos(id, nome)
treino_exercicios(id, treino_id → treinos, exercicio_id → exercicios, ordem)
sessoes_treino(id, treino_id → treinos, data)
series_registradas(id, sessao_id → sessoes_treino, exercicio_id → exercicios, carga, repeticoes, rpe)
```

`treinos` é o plano; `sessoes_treino` é uma execução real dele. Separar os dois permite comparar o
planejado com o realizado.

## Limitações conhecidas

- O treino salvo guarda só a **ordem dos exercícios**. Séries, repetições e descanso do plano
  gerado aparecem na prévia, mas não são gravados.
- A **troca de exercício** na sessão vale só para aquela sessão; o treino salvo não muda.
- Sem testes automatizados ainda; a lógica pura em `utils/` é a candidata natural a começar.

## Desenvolvimento no VS Code

Ao abrir a pasta, o VS Code sugere as extensões recomendadas (Prettier, EditorConfig, Expo Tools).
O código é formatado ao salvar. Tarefas prontas em **Terminal → Executar tarefa de build**
(`Ctrl+Shift+B`): iniciar o Expo, iniciar com túnel, verificar tipos e verificar formatação.
