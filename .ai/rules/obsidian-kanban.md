# Padrões de Boards Kanban do Obsidian — {{NOME_DO_PROJETO}}

> Estas regras são imutáveis e de cumprimento obrigatório para QUALQUER squad ou agente de IA que crie, atualize ou remova cartões na pasta `boards/`.

---

## 🎨 1. A Estrutura do Kanban Markdown no Obsidian

O plugin Obsidian Kanban utiliza metadados em blocos de comentários HTML e listas ordenadas/desordenadas específicas para renderizar os quadros visuais. Para evitar corromper o layout visual que o fundador gerencia, siga estritamente esta estrutura:

-   **O Bloco de Configuração (comentário HTML final):** Todo arquivo Kanban deve terminar obrigatoriamente com a tag de metadados do Obsidian Kanban, sem qualquer modificação na sua estrutura de chaves:
    ```markdown
    %% kanban:settings
    ```
-   **Estrutura de Listas (Colunas):** As colunas do Kanban são representadas por cabeçalhos de nível 2 (`##`). Os cartões (tasks) dentro de cada coluna são listas desordenadas (`- [ ]` ou `- [x]`):
    ```markdown
    ## 📥 Backlog
    - [ ] [BLO-12] Criar tela de cadastro
    - [ ] [BLO-15] Ajustar botão de login

    ## 🏃 Em Progresso
    - [ ] [BLO-10] Integrar API de pagamento

    ## ✅ Concluído
    - [x] [BLO-08] Layout da Landing Page
    ```

---

## 🚫 2. Regras de Edição Automática de Cartões (Card Movement Rules)

Sempre que a IA concluir uma tarefa ou mover seu status:
-   **Preservação de IDs de Issues:** Nunca altere ou apague o prefixo de ID da issue (ex: `[BLO-XX]`) contido no texto do cartão.
-   **Marcação de Conclusão:** Ao mover um cartão para a coluna **Concluído** (ou equivalente), altere a caixa de seleção de `- [ ]` para `- [x]` obrigatoriamente.
-   **Evitar Duplicações:** Ao mover um cartão de uma coluna para outra (ex: `Backlog` ➔ `Em Progresso`), remova a linha correspondente da coluna antiga antes de inseri-la na nova. Nunca deixe o mesmo ID de issue duplicado em duas colunas.
-   **Ordem Cronológica / Prioridade:** Mantenha os cartões mais urgentes e prioritários no topo da lista de cada coluna.

---

## 🔗 3. Uso de Links e Metadados do Obsidian

-   **Links Internos de Notas:** Se o cartão possuir um link para um arquivo markdown de tarefa local em `workflows/` ou uma PRD, use a sintaxe de link interno do Obsidian:
    ```markdown
    - [ ] [[workflows/pendentes/BLO-12-cadastro.md|BLO-12 Criar tela de cadastro]]
    ```
-   **Tags de Prioridade e Responsáveis:** Utilize tags curtas no final do texto do cartão para indicar prioridade e responsáveis, facilitando a filtragem visual humana no Obsidian:
    ```markdown
    - [ ] [[workflows/pendentes/BLO-12.md|BLO-12 Cadastro]] #alta #pm @dev
    ```
    -   Tags de Prioridade sugeridas: `#alta`, `#media`, `#baixa`.
    -   Tags de Squad recomendadas: `#pm`, `#cto`, `#dev`, `#qa`.
