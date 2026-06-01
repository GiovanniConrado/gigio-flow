# 🏗️ Refatoração: Backend em Módulos (routes/ + services/)

> **Status:** 🏃 Em Progresso
> **Início:** 2026-05-27
> **Squad:** CTO Agent + Dev Agent
> **Story Points:** 8 | Complexidade: Alta (por volume de código, não complexidade lógica)

---

## 📋 Especificação Técnica

### Objetivo
Quebrar o `server.js` monolítico de 1231 linhas em módulos organizados por responsabilidade, melhorando manutenibilidade, testabilidade e seguindo os próprios padrões de qualidade do Gigio Flow.

### Estrutura Alvo

```
dashboard/
├── server.js          ← Orquestrador slim (~50 linhas)
├── services/
│   ├── files.js       ← I/O seguro + validatePath()
│   └── llm.js         ← callLLM() + buildSystemContext()
└── routes/
    ├── projects.js    ← CRUD workspaces
    ├── workflow.js    ← Kanban + pipeline LLM
    ├── system.js      ← Status, diagnóstico, initialize
    └── linear.js      ← Integração Linear
```

### Critérios de Aceite
- [ ] `npm run dev` inicia sem erros após refatoração
- [ ] Todas as rotas existentes continuam funcionando identicamente
- [ ] `validatePath()` é usada em TODAS as operações de I/O de arquivos
- [ ] CORS restrito a `http://localhost:5173` e `http://localhost:3000`
- [ ] Rate limiting (10 req/min) ativo nas rotas: `/refine`, `/estimate`, `/qa-review`, `/approve-ceo-real`
- [ ] `dotenv` carregado no início do server.js
- [ ] Novos endpoints do pipeline implementados nos módulos corretos

### Progresso Atual
- [x] `dashboard/.env` criado
- [x] `dotenv` e `express-rate-limit` instalados
- [ ] `services/files.js` criado
- [ ] `services/llm.js` criado
- [ ] `routes/projects.js` criado
- [ ] `routes/workflow.js` criado (com novos endpoints)
- [ ] `routes/system.js` criado
- [ ] `routes/linear.js` criado
- [ ] `server.js` refatorado para slim

### Riscos
- Manter o estado compartilhado `activeWorkspaceDir` entre módulos sem criar acoplamento excessivo
- Express 5.x ainda é beta — testar compatibilidade com `express-rate-limit`
