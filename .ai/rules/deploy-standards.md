# Padrões de Release e Deploy (Deploy Standards) — {{NOME_DO_PROJETO}}

> Estas regras são imutáveis e de cumprimento obrigatório para QUALQUER squad, agente de IA ou desenvolvedor humano que interaja com este repositório.

---

## 🚀 1. Filosofia de Entrega Incremental e Atômica (Atomic Releases)

Para garantir que o produto esteja sempre em estado estável e implantável:
-   **Commits Pequenos e Focados:** Evite commits gigantescos contendo dezenas de alterações não relacionadas. Cada commit deve representar uma alteração lógica única e atômica.
-   **Trabalho por Branches Atômicas:** Todo desenvolvimento deve ser feito em branches específicas de feature/bug (ex: `feature/nome-recurso` ou `bug/correcao-fluxo`).
-   **Mesclagem via Pull Request (PR):** É expressamente proibido fazer commits diretos na branch principal (`main`/`master`) em produção. Todas as alterações devem passar por Pull Requests validados pelo QA Agent e aprovados pelo fundador.

---

## 🧪 2. Testes Estáticos e de Linters Obrigatórios (Pre-Release Validation)

Antes de abrir qualquer Pull Request ou enviar a tarefa para o QA:
-   **Checagem de Tipos Estáticos:** O Dev Agent deve rodar obrigatoriamente a verificação de compilação estática do compilador correspondente à stack em uso (ex: `npm run tsc -- --noEmit`).
-   **Execução do Linter:** O código deve estar livre de avisos e erros de estilo do linter oficial do projeto (ex: ESLint, Prettier):
    ```bash
    npm run lint
    ```
-   **Execução de Testes Unitários/Integração:** Se o projeto possuir suíte de testes automatizados (Jest, Vitest, Cypress), todos os testes devem rodar com 100% de sucesso localmente:
    ```bash
    npm run test
    ```
    Qualquer falha de teste unitário bloqueia imediatamente a entrega.

---

## 🛡️ 3. Protocolo de Deploy em Ambientes (Deploy Pipeline)

O ciclo de vida do código deve respeitar rigorosamente os seguintes ambientes:

1.  **Desenvolvimento / Local:** Onde o Dev Agent codifica e roda os testes iniciais.
2.  **Staging / Homologação:** Ambiente idêntico ao de produção onde o QA Agent realiza testes manuais complexos, valida layouts em múltiplos dispositivos e simula conexões.
3.  **Produção (Live):** O ambiente real dos clientes. O deploy em produção só ocorre após o "OK" formal do fundador no ambiente de Staging.

---

## 🔄 4. Estratégia de Rollback (Feature Toggles e Reversão)

-   **Feature Flags / Toggles:** Para funcionalidades complexas ou de alto risco, implemente travas de feature flags para que o novo código possa ser desativado remotamente no backend sem a necessidade de um novo deploy de emergência.
-   **Rollback de Emergência:** Caso um bug crítico passe despercebido e afete os usuários em produção, o CTO Agent e o Dev Agent devem estar preparados para reverter o commit problemático na branch principal em menos de 5 minutos, restaurando a última versão estável conhecida:
    ```bash
    git revert [HASH_DO_COMMIT_DEFEITUOSO]
    ```
-   **Post-Mortem:** Toda reversão de emergência exige uma reunião de auditoria liderada pelo Process Analyst para identificar a falha no processo de QA e atualizar as regras de segurança correspondentes.
