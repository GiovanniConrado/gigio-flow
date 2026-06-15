# Gigio Flow

**Estrutura de workspace + AI Console para desenvolvimento orquestrado por IA.**

Um protocolo Markdown aberto que transforma seu projeto em um "SO ágil" onde agentes
de IA (DeepSeek, Gemini, GPT, Opencode, Cursor) operam como squads persistentes com
memória, regras e pipeline de entrega conectado ao Linear.

![Tests](https://img.shields.io/badge/tests-25%20passed-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-%3E%3D20-green)

---

## Quick Start

```bash
# 1. Instalar dependências
cd dashboard
npm install

# 2. Iniciar o Studio (frontend + backend)
npm run studio
# → Frontend: http://localhost:5173
# → Backend:  http://localhost:3001
```

---

## Componentes

| Componente | O que faz | Como acessa |
|---|---|---|
| **Studio** (`dashboard/`) | Console de Conhecimento + IA. Gerencia knowledge base, refine/estimate/QA, diagnóstico e bootstrap. | `http://localhost:5173` |
| **MCP Linear** (`dashboard/mcp-linear.js`) | Ponte direta entre IA e Linear. Agentes criam/atualizam/consultam issues via MCP. | Qualquer IDE com MCP |
| **Skills** (`.ai/skills/`) | Instruções operacionais para agentes em qualquer etapa do pipeline. | Lido pelo agente na sessão |
| **Linear** | Fonte da verdade operacional (colunas: Backlog → Dev → Tech QA → Human QA → Done). | `linear.app` |

---

## Pipeline

```
PRD em propostas/
   ↓
[Studio] Refinar PRD + Estimar
   ↓
▼ GATE 1: Humano aprova escopo
   ↓
[Agente via MCP] PRD → Issues no Linear
   │  Usa: .ai/skills/prd-to-linear.md
   ↓
[Agente via MCP] Dev implementa cada issue
   │  Usa: .ai/skills/dev-cycle.md
   │  Commita com "GIG-42: ..."
   ↓
[Studio] QA Técnico (LLM)
   ↓
▼ GATE 2: Humano aprova QA final
   ↓
Deploy para desenvolvimento
   ↓
[Agente via MCP] Retrospectiva
   │  Usa: .ai/skills/retrospective.md
   │  Skills se auto-modificam para melhorar
```

---

## Studio — Navegação

| Aba | Função |
|---|---|
| **📊 Overview** | Health do workspace + ações rápidas + visão do pipeline |
| **🧠 Knowledge** | Editor visual dos 7 knowledge files (VISAO, ARQUITETURA, ESTADO_ATUAL...) |
| **🤖 AI Console** | CEO Chat, Refinar PRD, Estimar, QA Técnico (tudo num lugar) |
| **⚙️ Config** | Squads, gates de aprovação, integração com Linear |
| **📡 Diagnostics** | Health check, bootstrap de projetos, correção de placeholders |

---

## Para Agentes de IA

Leia o arquivo [`AGENTS.md`](AGENTS.md) — ele contém:

- Estrutura completa do workspace
- Pipeline de entrega detalhado
- Personas dos squads (CEO, PM, CTO, Dev, QA, Process Analyst)
- Regras imutáveis (segurança, design, deploy)
- Skills disponíveis e quando usar cada um
- Ferramentas MCP do Linear
- Rituais de início e fim de sessão

---

## Estrutura do Projeto

```
gigio-flow/
├── .ai/                    ← Squads, regras, skills, templates
├── .opencode/              ← Config MCP do Linear
├── knowledge/              ← Knowledge base (VISAO, ARQUITETURA, ...)
├── dashboard/              ← Studio (React + Express)
│   ├── server.js           ← API REST
│   ├── mcp-linear.js       ← MCP Server para Linear
│   ├── routes/             ← Rotas da API
│   ├── services/           ← Serviços (llm.js, files.js)
│   └── src/                ← Frontend React
├── workflows/              ← Cards físicos
│   ├── propostas/          ← PRDs brutos
│   └── pendentes/          ← PRDs refinados + aprovados
└── docs/                   ← Guias e documentação
```

---

## Licença

MIT
