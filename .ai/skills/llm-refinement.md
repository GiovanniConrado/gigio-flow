# Skill: Refinamento de Backlog por IA (LLM Refinement) — {{NOME_DO_PROJETO}}

> Esta skill descreve a prática recomendada de faturamento e refinamento de tarefas projetada sob medida para agentes de Inteligência Artificial, substituindo estimativas tradicionais de story points humanos.

---

## 🧠 A Premissa: Por que Story Points não funcionam para IAs?

Modelos de linguagem (LLMs) não têm noção de "horas humanas de trabalho" ou "velocidade de sprint". A capacidade de uma IA executar uma tarefa com sucesso e sem erros de regressão depende essencialmente de três fatores:

1.  **Tamanho do Contexto:** Quantos arquivos ela precisa ler e modificar ao mesmo tempo.
2.  **Ambiguidades:** O quão detalhados, lógicos e testáveis são os Critérios de Aceite na issue.
3.  **Escopo da Edição:** Tarefas que envolvem muitas modificações paralelas em diferentes camadas (banco de dados, rotas de API, store global de estado, interface de usuário) geram alta probabilidade de alucinação de código e esquecimento de metadados.

Portanto, o refinamento no **Gigio Flow** mede a complexidade baseado na **Atomicidade da Sessão de IA**.

---

## 📏 A Regra de Ouro: Atomicidade de Sessão

> **Uma tarefa está refinada de forma excelente quando pode ser completamente implementada, testada estaticamente e aprovada pelo QA em uma única conversa (sessão), sem estourar o limite de contexto da IA.**

### Limites para Fatiamento de Tarefas (Split Thresholds)

O PM Agent e o CTO Agent devem obrigatoriamente desmembrar uma proposta de funcionalidade em tarefas menores e atômicas se ela violar qualquer um dos seguintes limites:

-   **Limite de Arquivos Modificados:** A tarefa exige alterar mais do que **3 arquivos de código** simultaneamente (excluindo arquivos de configuração como `package.json`, `pnpm-lock.yaml` ou `CLAUDE.md`).
-   **Limite de Responsabilidade (Database vs UI):** A tarefa envolve alterar o banco de dados (schemas, RLS, migrations) E a interface visual (CSS, HTML, React, etc.).
    -   *Como fatiar:* Divida em sub-tasks ordenadas:
        1.  `TASK-A` (Backend: Criar Tabela/Campos/Migration e Políticas de Segurança).
        2.  `TASK-B` (Integração: Conectar API, gerenciar estados globais e stores).
        3.  `TASK-C` (UI: Telas visuais, navegação, responsividade e acessibilidade).
-   **Limite de Integrações Externas:** Alterações que mexem com chaves de API e fluxos de pagamentos ou gateways de terceiros (ex: Stripe, RevenueCat, gateways locais) devem ser totalmente isoladas de implementações visuais cosméticas.

---

## 📊 Classificação de Complexidade de Contexto

Em vez de pontos (1, 2, 3, 5, 8), as tarefas serão classificadas por **Grau de Esforço de Contexto**:

| Classificação | Impacto em Arquivos | Risco de Regressão | Tipo de Teste Exigido |
| :--- | :--- | :--- | :--- |
| **Fácil (Low)** | 1 arquivo | Baixo | Teste de renderização visual básico |
| **Médio (Medium)** | 1 a 2 arquivos | Médio | Teste de fluxo completo (Golden Path) |
| **Complexo (High)** | 2 a 3 arquivos | Alto | Teste offline + simulação de falha de conexão |
| **Crítico (Critical)** | Mexe com RLS, Pagamentos ou Autenticação | Altíssimo | Auditoria de segurança + Logs LGPD + Teste em ambiente de Staging |

---

## 📋 Checklist de Refinamento (Definition of Ready)

Antes de mover uma tarefa da pasta `workflows/propostas/` para `workflows/pendentes/` (sinalizando que está pronta para o Dev Agent iniciar), o PM e o CTO devem assinar o seguinte checklist de refinamento:

-   [ ] **Critérios Atômicos:** Os critérios de aceitação descrevem comportamentos únicos e facilmente verificáveis de ponta a ponta?
-   [ ] **Mapeamento de Arquivos:** Os arquivos exatos que serão modificados foram identificados e listados na issue?
-   [ ] **Métricas Definidas:** A issue especifica qual log deve ser gerado ou qual métrica de analytics deve ser impactada?
-   [ ] **Dependências Declaradas:** Ficou claro se essa tarefa depende de chaves de API externas ou de outras issues concluídas?
-   [ ] **Trava de Design:** Há referência visual (Figma link, layout system ou tokens de design) para que a IA não invente estilos?
-   [ ] **Registro no Kanban:** As tarefas foram obrigatoriamente lançadas na coluna de Backlog do Kanban board correto na pasta `boards/`?
