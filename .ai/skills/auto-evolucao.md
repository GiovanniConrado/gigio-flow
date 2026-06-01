# Skill: Auto-Evolução do Workspace (Self-Evolution Skill) — {{NOME_DO_PROJETO}}

> Esta skill ensina os agentes de IA a atualizarem autonomamente o estado e a base de conhecimento do projeto a cada entrega, garantindo que o repositório seja auto-documentado.

---

## 🧠 A Filosofia da Auto-Evolução

Em projetos ágeis comuns, a documentação técnica (arquitetura, estado atual das telas, logs de decisão) rapidamente se torna obsoleta porque os desenvolvedores humanos priorizam a escrita de código em detrimento da escrita de textos explicativos.

No **Gigio Flow**, a IA resolve esse problema através do ritual de **Auto-Evolução**. Toda vez que uma tarefa é concluída ou uma decisão arquitetural relevante é tomada, a própria IA atua ativamente para registrar essa mudança na base de conhecimento, garantindo que o repositório seja a única e definitiva Fonte da Verdade ("Single Source of Truth") atualizada em tempo real.

---

## 🛠️ O Protocolo de Execução (Passo a Passo)

Imediatamente após receber a validação final (APROVADO) do QA Agent para uma tarefa, o **Process Analyst Agent** ou o **CTO Agent** deve rodar os seguintes passos:

### Passo 1: Atualizar o `knowledge/ESTADO_ATUAL.md`
-   Abra o arquivo [`knowledge/ESTADO_ATUAL.md`](file:///c:/Users/conra/Desktop/gigio-flow/knowledge/ESTADO_ATUAL.md).
-   Localize a seção correspondente ao componente modificado.
-   Atualize a data de "Última Modificação" para a data atual.
-   Escreva um resumo objetivo das novas funções implementadas, arquivos criados e novos endpoints ativos.
-   Se houver um refactoring técnico, registre o impacto no tamanho final ou performance da aplicação.

### Passo 2: Adicionar uma entrada em `knowledge/HISTORICO.md`
-   Abra o arquivo [`knowledge/HISTORICO.md`](file:///c:/Users/conra/Desktop/gigio-flow/knowledge/HISTORICO.md).
-   Insira uma nova linha ou bloco no topo da lista cronológica de marcos com a data atual.
-   Estrutura da Entrada:
    ```markdown
    ### [YYYY-MM-DD] — [Título curto da Decisão/Entrega]
    - **O que mudou:** [Resumo de 1 frase da entrega]
    - **Contexto & Motivação:** [Por que essa decisão foi tomada ou o que motivou a mudança]
    - **Impacto no Sistema:** [Quais arquivos/tabelas foram impactados e riscos mitigados]
    ```

### Passo 3: Registrar e Arquivar a Tarefa concluída localmente
-   Mova o arquivo markdown da tarefa correspondente de `workflows/em-progresso/` para a pasta `.ai/history/concluidos/` (ou crie a pasta se não existir).
-   Adicione uma seção especial no final do arquivo markdown chamada `## Resultado da Execução` detalhando:
    -   Commits gerados (hashes e mensagens).
    -   Evidências dos testes estáticos e manuais rodados pelo QA.
    -   Data e hora de conclusão.

---

## 🚫 Regras que a IA nunca quebra

-   **Sem Sessões sem Registro:** É expressamente proibido que a IA conclua uma alteração de código ou de PRD e encerre a sessão sem realizar os Passos 1 e 2.
-   **Rigor nas Datas:** Todas as datas devem seguir o formato internacional padrão ISO: `YYYY-MM-DD` (ex: `2026-05-27`).
-   **Clareza Humilde:** A escrita dos logs de histórico e estado atual deve ser técnica, precisa, resumida e humilde, evitando termos promocionais ou superlativos.
