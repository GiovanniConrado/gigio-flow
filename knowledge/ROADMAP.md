# Roadmap do Produto — Gigio Flow

> Este arquivo orienta a priorização de novas funcionalidades. O PM Agent e o CEO Agent o utilizam e o atualizam para manter o foco nas metas de médio e longo prazo do produto.

---

## 🎯 1. Visão de Entrega (Metas por Fases)

### Fase 1: Studio V4 (MVP Funcional) ← ATUAL
-   **Meta:** Lançar o Studio como painel de configuração/visualização com pipeline básico de IA.
-   **Funcionalidades Core:**
    -   [x] Wizard de setup visual (preenchimento de knowledge/)
    -   [x] Kanban sincronizado com arquivos físicos
    -   [x] CEO Agent chat com Gemini/OpenAI
    -   [x] Multi-workspace management
    -   [x] Diagnóstico de saúde do workspace
    -   [ ] **Drag-and-drop no Kanban** ← Em execução
    -   [ ] **Pipeline LLM completo (refine → estimate → QA → approve)** ← Em execução
    -   [ ] **Criação de card via UI** ← Em execução
    -   [ ] **Integração Linear API** ← Em execução
    -   [ ] **Refatoração backend/frontend em módulos** ← Em execução

### Fase 2: Pipeline Inteligente & Linear Bridge
-   **Meta:** Fechar o loop operacional completo: ideação no Studio → execução no Linear → conclusão registrada automaticamente.
-   **Funcionalidades Core:**
    -   [ ] Webhook Linear → atualização automática de ESTADO_ATUAL.md
    -   [ ] Estimativa com calibração histórica (baseada em HISTORICO.md)
    -   [ ] QA técnico com diff de código real (integração com git)
    -   [ ] Notificações push quando card muda de status no Linear
    -   [ ] Dashboard de métricas: velocity, throughput, lead time

### Fase 3: Gigio Flow Cloud (SaaS)
-   **Meta:** Versão hospedada com sync, colaboração em tempo real e autenticação.
-   **Funcionalidades Core:**
    -   [ ] Autenticação (Clerk ou Supabase Auth)
    -   [ ] Sync de workspace via GitHub (repositório privado como backend)
    -   [ ] Colaboração em tempo real (múltiplos usuários no mesmo Studio)
    -   [ ] Marketplace de templates premium por vertical
    -   [ ] Gigio Flow AI (IA embarcada sem precisar de chave externa)

### Fase 4: Escala & Ecosystem
-   **Meta:** Tornar o Gigio Flow o padrão de mercado para projetos orquestrados por IA.
-   **Funcionalidades Core:**
    -   [ ] Plugin para VS Code e Cursor
    -   [ ] Integração com GitHub Issues, Jira, Asana
    -   [ ] API pública para automação externa
    -   [ ] Gigio Flow para times (Enterprise Tier com SSO e auditoria)

---

## 📅 2. Planejamento da Sprint Atual

-   **Módulo em Foco:** Pipeline de Entrega com LLM + Integração Linear + Refatoração de Código
-   **Principais Tarefas Priorizadas:**
    -   1. `[GIG-01]` Refatorar server.js em módulos (routes/, services/)
    -   2. `[GIG-02]` Refatorar App.jsx em componentes React
    -   3. `[GIG-03]` Implementar POST /api/workflow/refine (LLM + contexto do sistema)
    -   4. `[GIG-04]` Implementar POST /api/workflow/estimate (story points com LLM)
    -   5. `[GIG-05]` Implementar POST /api/workflow/qa-review (QA técnico LLM)
    -   6. `[GIG-06]` Implementar drag-and-drop HTML5 nativo no Kanban
    -   7. `[GIG-07]` Criar PipelineView.jsx (visualização step-by-step do fluxo)
    -   8. `[GIG-08]` Integração Linear API (criar issue com checklist)
    -   9. `[GIG-09]` Corrigir vulnerabilidades de segurança (path traversal, CORS, rate limit)
    -   10. `[GIG-10]` Preencher knowledge/ com dados reais do Gigio Flow (dogfooding)
