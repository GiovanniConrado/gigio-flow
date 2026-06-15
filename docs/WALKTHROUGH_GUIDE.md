# Walkthrough Guide — Complete Delivery Pipeline

> This guide walks through the entire Gigio Flow pipeline using two real-world
> scenarios: one simple (bug fix) and one complex (payment integration).
>
> Use this as a reference when running your first cycles.

---

## Quick Reference

```
                    PIPELINE OVERVIEW
  ───────────────────────────────────────────────────────────────

  [STUDIO]                     [AGENT (qualquer IDE)]   [LINEAR]

  1. PRD em propostas/
  2. Refinamento LLM ──────►  3. PRD → Issues ──────► Issues criadas
  3. Estimativa                                       no backlog
  4. ▼ GATE 1: Você aprova
                              5. Dev Agent implementa
                              6. Commit "GIG-42: ..."
                              7. Atualiza status ──► QA-Tecnica
  8. QA Técnico LLM
  9. ▼ GATE 2: Você aprova
                             10. Deploy
                             11. Retrospectiva ──► Skills evoluem
```

### Pré-requisitos

| Ferramenta | Como ativar |
|---|---|
| **Studio** | `npm run studio` em `dashboard/` → `localhost:5173` |
| **MCP Linear** | Configure `.opencode/mcp.json` ou no seu IDE com `LINEAR_API_KEY` |
| **Skills** | Já estão em `.ai/skills/` — o agente lê automaticamente |
| **DeepSeek V4** | Selecione "deepseek" no Studio ou configure no Opencode |

---

## Cenário 1 — Tarefa Simples

### Contexto

> **Projeto:** App de delivery (Gigio Lanches)
> **Problema:** A foto do avatar do usuário não carrega na tela de perfil
> **Impacto:** Baixo — apenas um componente visual quebrado

### Passo a Passo

---

### ① Criação do Card

Via Studio ou manualmente, crie o artefato em
`workflows/propostas/`:

```markdown
# 🐛 Avatar não carrega na tela de perfil

> **Status:** ⏳ Em análise
> **Fase:** propostas

## Descrição

A foto do avatar do usuário está quebrada na tela `/profile`.
O console mostra erro 404 na URL da imagem.

## Critérios de Aceite

- [ ] Avatar carrega corretamente quando usuário tem foto
- [ ] Mostra fallback (iniciais) quando não tem foto
- [ ] Trata erro 404 com fallback silencioso
```

O artefato passa a existir em `workflows/propostas/`.

---

### ② Refinamento (Studio)

No Studio, rode a ação de refinamento com IA.

O LLM lê o contexto do projeto e enriquece o card com:
- Arquivos afetados: `src/components/Avatar.jsx`, `src/services/user.js`
- Dependências: nenhuma
- Risco: baixo (componente isolado)

---

### ③ Estimativa (Studio)

No Studio, rode a ação de estimativa.

O LLM analisa e retorna: **2 story points**, complexidade **Baixa**.

---

### ④ Gate 1 — Aprovação Humana

Você analisa:
- Escopo: ✅ claro e pequeno
- Estimativa: ✅ justa (2 SP)
- Risco: ✅ baixo

Clique em **"✅ Aprovar"**.

O card move para `workflows/pendentes/`.

---

### ⑤ PRD → Issues no Linear

Agora você (ou o agente) executa o skill `prd-to-linear.md`.

**No Opencode/IDE, diga:**
```
Execute o skill .ai/skills/prd-to-linear.md para o card "Avatar não carrega".
```

O agente:
1. Lê o card em `workflows/pendentes/`
2. Chama `linear_create_issue` via MCP:

```json
{
  "title": "[DEV] Fix avatar loading with fallback",
  "description": "## Scope\n\nFix avatar URL...\n\n## Acceptance Criteria\n- [ ] Avatar loads from correct URL\n- [ ] Fallback initials shown when no photo\n- [ ] 404 handled gracefully",
  "teamId": "<team>",
  "priority": 3,
  "estimate": 2
}
```

3. Anota o card com `## 🔗 Issues no Linear`
4. Mantém o PRD em `workflows/pendentes/` como registro local, enquanto a execução ativa segue no Linear

---

### ⑥ Desenvolvimento (Dev Agent)

**No Opencode/IDE, diga:**
```
Execute o skill .ai/skills/dev-cycle.md para a issue GIG-42.
```

O agente:
1. Lê `linear_get_issue("GIG-42")` — entende o escopo
2. Carrega contexto: lê `knowledge/ARQUITETURA.md`, `DESIGN_SYSTEM.md`
3. Lê os arquivos existentes `Avatar.jsx` e `user.js`
4. **Planeja:**
   ```
   Files: src/components/Avatar.jsx (modify)
   Approach: Add error handler on img tag, show initials fallback
   ```
5. **Você aprova o plano** ("vai em frente")
6. Implementa:

```jsx
function Avatar({ user }) {
  const [hasError, setHasError] = useState(false);
  const initials = user.name.split(' ').map(n => n[0]).join('');

  if (!user.photo || hasError) {
    return <div className="avatar-fallback">{initials}</div>;
  }

  return (
    <img
      src={user.photo}
      alt={user.name}
      onError={() => setHasError(true)}
      className="avatar-img"
    />
  );
}
```

7. Roda `npm run lint` (passa)
8. **Commits:**
```
git commit -m "GIG-42: fix avatar loading with fallback

- Add error handler on img tag
- Show initials fallback on 404 or missing photo"
```

9. Chama `linear_update_issue("GIG-42", { stateId: "<tech-qa-state>" })`

---

### ⑦ QA Técnico (Studio)

No Studio ou no fluxo do agente, rode o QA-Tecnico.

O LLM analisa o código (lê do card + contexto) e retorna:

```
## Relatório de QA Técnico

| Critério | Status |
|----------|--------|
| Avatar carrega com foto | ✅ PASSOU |
| Fallback sem foto | ✅ PASSOU |
| Tratamento de erro 404 | ✅ PASSOU |
| Usa CSS variables | ✅ PASSOU |

**Veredito:** APROVADO
```

---

### ⑧ Gate 2 — QA Humano

Você testa manualmente no navegador:
- ✅ Com foto: aparece
- ✅ Sem foto: mostra iniciais
- ✅ Link quebrado: fallback silencioso

Clique em **"✅ Aprovar"**.

---

### ⑨ Deploy

**No Opencode/IDE, diga:**
```
Execute o deploy para desenvolvimento.
```

```bash
npm run build
git push origin main
# ou: vercel --prod, railway up, etc.
```

Depois, atualize o card manualmente adicionando `## 🚀 Deploy` ao arquivo.

---

### ⑩ Retrospectiva

**No Opencode/IDE, diga:**
```
Execute o skill .ai/skills/retrospective.md para o card concluído.
```

O Process Analyst analisa:
- Estimativa: 2 SP ✅ (acertou)
- QA encontrou algo? ❌ (nenhum bug)
- Processo fluiu bem? ✅

**Resultado:** Nenhuma mudança necessária nos skills — ciclo exemplar.

### ⑪ Arquivar

Ao fechar o ciclo, registre o resultado final e arquive o histórico local quando apropriado.

O registro final vai para `.ai/history/concluidos/` e `knowledge/` é atualizado.

---

## Cenário 2 — Tarefa Complexa

### Contexto

> **Projeto:** AI Video Generator
> **Feature:** Adicionar assinatura mensal com Stripe
> **Envolve:** Banco de dados, API de pagamentos, UI de planos, emails

### Passo a Passo

---

### ① PRD Detalhado

O card em `workflows/propostas/` começa com um PRD completo:

```markdown
# [PRD] — Assinatura Mensal com Stripe

## 1. Overview
Permitir que usuários assinem planos mensais (Basic/Pro/Enterprise)
com pagamento via Stripe.

## 2. User Journey
- Step 1: Usuário acessa /pricing → vê planos
- Step 2: Clica em "Assinar" → redireciona ao Stripe Checkout
- Step 3: Stripe webhook confirma pagamento
- Step 4: Conta é ativada → email de boas-vindas

## 3. Technical Spec
- Tabelas: subscriptions, plans, invoices
- API: POST /api/subscribe, GET /api/plans
- Webhook: POST /api/stripe/webhook
- UI: PricingPage.jsx, PlanCard.jsx

## 4. Acceptance Criteria
- [ ] Usuário vê 3 planos com preços
- [ ] Checkout Stripe abre corretamente
- [ ] Webhook processa subscription.completed
- [ ] Plano ativo aparece no perfil
- [ ] Email de boas-vindas enviado
- [ ] Cancelamento funciona

## 5. Task Slicing (pré-análise)
- [DEV] Criar tabelas e schemas
- [DEV] Integrar Stripe Checkout
- [DEV] Webhook handler
- [DEV] UI de planos
- [QA] Testar fluxo completo
```

---

### ② Refinamento + Estimativa

No Studio, refine e estime. O LLM identifica:

| Item | Valor |
|---|---|
| Story Points | 13 (total) |
| Complexidade | Alta |
| Squads necessários | DEV, QA |
| Risco de regressão | Alto (pagamentos) |
| Sessões estimadas | 4-5 |

---

### ③ Gate 1 — Aprovação

Você analisa:
- Escopo: ✅ bem detalhado
- Riscos: ✅ mapeados (Stripe, webhook, emails)
- Estimativa: 13 SP parece justo

**Clique em "✅ Aprovar".**

---

### ④ PRD → Issues no Linear (Crucial aqui!)

**No Opencode/IDE, diga:**
```
Execute o skill .ai/skills/prd-to-linear.md.
```

O CTO Agent lê o PRD e **quebra em 5 issues atômicas**:

```json
[
  {
    "title": "[DEV] Create subscriptions schema and RLS policies",
    "estimate": 3,
    "files": ["prisma/schema.prisma", "db/migrations/"],
    "blockedBy": []
  },
  {
    "title": "[DEV] Integrate Stripe Checkout API",
    "estimate": 5,
    "files": ["services/stripe.js", "routes/subscribe.js"],
    "blockedBy": ["GIG-50"]
  },
  {
    "title": "[DEV] Build Stripe webhook handler",
    "estimate": 3,
    "files": ["routes/stripe-webhook.js"],
    "blockedBy": ["GIG-51"]
  },
  {
    "title": "[DEV] Build pricing page UI with design tokens",
    "estimate": 3,
    "files": ["pages/Pricing.jsx", "components/PlanCard.jsx"],
    "blockedBy": ["GIG-50"]
  },
  {
    "title": "[QA] Test full subscription flow",
    "estimate": 2,
    "files": ["tests/subscription.test.js"],
    "blockedBy": ["GIG-52", "GIG-53"]
  }
]
```

Cada uma vira uma issue no Linear com acceptance criteria, estimativa,
dependências e squad. O card original é anotado com todas as referências.

---

### ⑤ Desenvolvimento (4 ciclos de dev)

O Dev Agent pega cada issue em ordem de dependência:

**Ciclo 1 — GIG-50 (schema):**
```
1. Lê issue, carrega contexto
2. Cria migration: subscriptions, plans, invoices tables
3. Adiciona RLS policies
4. Commit: "GIG-50: create subscription schema with RLS"
5. MCP: linear_update_issue → "QA-Tecnica"
```

**Ciclo 2 — GIG-51 (Stripe Checkout):**
```
1. Lê issue, carrega ARQUITETURA.md
2. Cria services/stripe.js com Stripe SDK
3. Cria POST /api/subscribe
4. Commit: "GIG-51: integrate Stripe Checkout API"
5. MCP: linear_update_issue → "QA-Tecnica"
```

**Ciclo 3 — GIG-52 (webhook):**
```
1. Lê issue + contexto
2. Cria POST /api/stripe/webhook
3. Processa subscription.completed / canceled
4. Commit: "GIG-52: handle Stripe webhooks"
5. MCP: linear_update_issue → "QA-Tecnica"
```

**Ciclo 4 — GIG-53 (UI):**
```
1. Lê issue + DESIGN_SYSTEM.md
2. Cria PricingPage.jsx, PlanCard.jsx
3. Usa tokens CSS (--accent-purple, --bg-primary...)
4. Commit: "GIG-53: build pricing page UI"
5. MCP: linear_update_issue → "QA-Tecnica"
```

---

### ⑥ QA Técnico (para cada issue)

No Studio, para cada card filho, clique em **"Rodar QA Técnico ▶"**.

O LLM analisa cada issue individualmente. Exemplo para GIG-51:

```
## QA Report — GIG-51: Stripe Checkout

| Criterion | Status | Notes |
|-----------|--------|-------|
| POST /api/subscribe responde 200 | ❌ FALHOU | Mock Stripe não configurado |
| API key não vaza no código | ✅ PASSOU | Em .env |
| Trata erro de cartão inválido | ✅ PASSOU | Retorna 422 |

**Veredito:** PRECISA DE AJUSTES
```

O Dev Agent então corrige o mock do Stripe e atualiza.

---

### ⑦ Gate 2 — QA Humano

Você testa o fluxo completo no ambiente de dev:

- ✅ Acessa /pricing → vê 3 planos
- ✅ Clica "Assinar" → vai para Stripe Checkout
- ✅ Pagamento confirmado → webhook processa
- ✅ Conta ativada → email chega
- ✅ Cancelamento funciona

**Clique em "✅ Aprovar".**

---

### ⑧ Deploy

Múltiplos deploys (um por issue ou batch):

```bash
# Deploy do schema primeiro
git push origin main
npm run db:migrate

# Deploy do backend
npm run build:server
railway up

# Deploy do frontend
npm run build:client
vercel --prod
```

---

### ⑨ Retrospectiva (Auto-Alimentação)

**No Opencode/IDE, diga:**
```
Execute o skill retrospective.md para "<PRD title>".
```

O Process Analyst analisa:

| Métrica | Real | Observação |
|---|---|---|
| Story points estimados | 13 | |
| Story points reais | 13 | ✅ Preciso |
| Sessões de dev | 4 | Conforme planejado |
| Blockers | 1 | Stripe mock ausente no ambiente de teste |
| QA encontrou | 1 bug | Mock mal configurado |

**Melhoria identificada:** O ambiente de teste não tinha Stripe mock.
O Process Analyst adiciona ao `dev-cycle.md`:

```markdown
> [2026-06-06] Retrospective finding: Stripe mock ausente causou
> reprovação no QA técnico. Adicionado ao checklist de pré-dev:
> - [ ] Verificar se mocks de serviços externos estão configurados
```

**Resultado:** O skill evoluiu. O próximo ciclo que envolver Stripe
já terá essa verificação automática.

---

### ⑩ Arquivar

Preencha o resultado e arquive. `knowledge/` é atualizado.

---

## Checklist de Ciclo Completo

### Para toda tarefa

- [ ] Card criado em `workflows/propostas/`
- [ ] Refinamento + estimativa rodados no Studio
- [ ] **Você aprovou o escopo** (Gate 1)
- [ ] PRD quebrado em issues no Linear (via MCP)
- [ ] Cada issue desenvolvida com `dev-cycle.md`
- [ ] Commits com referência `GIG-XXX`
- [ ] Status atualizado no Linear via MCP
- [ ] QA Técnico rodado no Studio (para cada issue)
- [ ] **Você aprovou o QA** (Gate 2)
- [ ] Deploy executado
- [ ] Retrospectiva rodada — skills evoluíram
- [ ] Card arquivado em `.ai/history/concluidos/`

### Para tarefas complexas (adicional)

- [ ] Issues têm dependências mapeadas e ordem definida
- [ ] Issues de schema/DB isoladas das de UI
- [ ] Issues de integração externa (Stripe, etc.) isoladas
- [ ] Mocks de serviços externos verificados antes do dev
- [ ] QA rodado para cada issue individualmente
- [ ] Testes de regressão no fluxo completo
