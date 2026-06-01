# 📝 Proposta: Pipeline LLM de Entrega Completo

> **Status:** ⏳ Aguardando Refinamento LLM
> **Origem:** Decisão estratégica de produto — 2026-05-27
> **Squad:** PM Agent + CTO Agent

---

## 👥 Resumo de Negócios

### Tese de Valor
O Gigio Flow atualmente permite criar propostas e movê-las no Kanban, mas o fluxo entre "proposta aprovada" e "issue no Linear pronta para execução" é manual e sem estrutura. Esta feature fecha esse gap crítico implementando um pipeline guiado que transforma uma ideia bruta em uma especificação técnica refinada, estimada e aprovada — tudo dentro do Studio.

### Custo vs. Impacto
- **Custo Estimado:** Baixo (reutiliza infraestrutura LLM já existente)
- **Impacto no Produto:** Alto — é a feature que justifica o posicionamento do Studio como "orquestrador de IA"
- **Risco de Regressão:** Baixo (endpoints novos, sem refatorar lógica existente)

### Veredito
✅ **PROSSEGUIR COM MVP** — Implementar os 4 endpoints de pipeline + PipelineView.jsx

---

## 🎯 Especificações de Produto (PM Agent)

### Critérios de Aceite
- [ ] O usuário consegue clicar em um card do Kanban e abrir o PipelineView
- [ ] O PipelineView exibe visualmente os 8 steps do pipeline com status (pendente/completo)
- [ ] O botão "Refinar com IA" chama `/api/workflow/refine` e exibe o resultado inline
- [ ] O botão "Estimar Complexidade" chama `/api/workflow/estimate` e exibe story points
- [ ] O gate de aprovação humana tem botões Aprovar/Rejeitar com campo de comentário
- [ ] O botão "Rodar QA Técnico" chama `/api/workflow/qa-review` e exibe relatório
- [ ] O botão "Criar Issue no Linear" chama `/api/linear/create-issue` (se configurado)
- [ ] Todos os resultados são persistidos fisicamente no arquivo .md do card

---

## 🛠️ Requisitos de Engenharia (CTO Agent)

### Arquivos Impactados
- `dashboard/routes/workflow.js` → 4 novos endpoints
- `dashboard/services/llm.js` → helper `buildSystemContext()`
- `dashboard/src/components/PipelineView.jsx` → novo componente
- `dashboard/src/App.jsx` → estado `selectedPipelineCard` + handler

### Story Points Estimados
**5 pontos** | Complexidade Média | 2-3 sessões de desenvolvimento
