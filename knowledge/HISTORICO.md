# Histórico de Decisões e Marcos — Gigio Flow

> Log cronológico reverso de todas as decisões arquiteturais (ADRs) e marcos de entrega relevantes. Atualizado pela IA a cada sessão concluída.

---

### [2026-06-01] — Suíte de Testes Automatizados com Vitest e Supertest
- **O que mudou:** Implementação de 25 testes automatizados unitários e de integração abrangendo segurança de I/O em disco contra Path Traversal, rotas de Kanban local, simulações avançadas de pipeline LLM (refine, estimate, qa-review) e webhooks/APIs do Linear.
- **Contexto & Motivação:** Preparação técnica do repositório para o programa Codex for Open Source da OpenAI. A ausência de testes automatizados era o principal gargalo técnico para aprovação em programas de excelência open-source.
- **Impacto no Sistema:** Instalação de `vitest` e `supertest` no ambiente de desenvolvimento do Studio. Criação da pasta `dashboard/tests/` contendo testes 100% isolados que rodam de forma offline, veloz (680ms) e sem alterar arquivos reais de produção do usuário.

---

### [2026-05-27] — Pipeline LLM Completo + Integração Linear Iniciados
- **O que mudou:** Início da implementação do pipeline completo de entrega: refinamento LLM com contexto do sistema, estimativa de complexidade, QA técnico automatizado, gate de aprovação humana e integração com Linear API.
- **Contexto & Motivação:** Análise crítica do projeto revelou que o Studio estava incompleto como painel de configuração e que o fluxo operacional precisava ser conectado ao Linear como ferramenta de execução. Decisão de usar o Linear como sistema operacional de tarefas e o Studio como painel de configuração/visualização/pipeline.
- **Impacto no Sistema:** Adição de 4 novos endpoints no backend (refine, estimate, qa-review, create-card), novo componente PipelineView.jsx, refatoração do server.js em módulos routes/ e services/. Instalação de dotenv e express-rate-limit.

---

### [2026-05-27] — Dogfooding: knowledge/ Preenchido com Dados Reais
- **O que mudou:** Todos os arquivos da pasta `knowledge/` foram preenchidos com os dados reais do próprio Gigio Flow como produto.
- **Contexto & Motivação:** Contradição identificada: o projeto promovia gestão de conhecimento estruturada mas não aplicava isso em si mesmo. VISAO.md, ESTADO_ATUAL.md, ROADMAP.md, ARQUITETURA.md, HISTORICO.md, GLOSSARIO.md e DESIGN_SYSTEM.md agora contêm informações reais.
- **Impacto no Sistema:** A IA agora tem contexto real sobre o próprio produto ao trabalhar no Gigio Flow, tornando o refinamento LLM muito mais preciso.

---

### [2026-05-26] — Studio V4 Lançado com CEO Agent Real
- **O que mudou:** Publicação do Gigio Flow Studio V4 com suporte a Gemini 2.5 Flash e GPT-4o-mini para análise estratégica real pelo CEO Agent. Feature de multi-workspace implementada.
- **Contexto & Motivação:** Versões anteriores do Studio (V1-V3) tinham apenas simulação de análise. V4 conecta com APIs reais de LLM, permitindo debates estratégicos genuínos.
- **Impacto no Sistema:** Adição de rotas `/api/workflow/approve-ceo-real` e `/api/workflow/approve-ceo` (fallback simulação). Estado `llmConfig` no frontend para gerenciar provider/key.

---

### [2026-05-25] — Arquitetura Markdown-as-Database Consolidada
- **O que mudou:** Decisão definitiva de usar arquivos Markdown como única fonte da verdade do sistema, sem banco de dados relacional ou NoSQL.
- **Contexto & Motivação:** Avaliamos usar SQLite para persistência do Studio, mas concluímos que o Markdown é superior para o propósito do Gigio Flow: é legível por humanos, legível por IAs, portátil, versionável com git, e não requer infraestrutura adicional.
- **Impacto no Sistema:** Todo I/O passa por `fs.readFileSync/writeFileSync`. O estado do servidor é volátil (reiniciar o servidor recarrega do disco), o que é o comportamento correto.

---

### [2026-05-24] — Estrutura de Squads e Regras Definida
- **O que mudou:** Criação das 6 personas de Squad (.ai/squads/), 5 regras imutáveis (.ai/rules/), 3 skills operacionais (.ai/skills/) e 4 templates (.ai/templates/).
- **Contexto & Motivação:** A hipótese central do Gigio Flow é que IAs trabalham melhor com personas específicas, regras rígidas e rituais de sessão definidos. A estrutura de arquivos materializa essa hipótese.
- **Impacto no Sistema:** Cada arquivo de squad tem ~3.5KB de contexto rico. A IA carrega automaticamente a persona correta ao abrir o workspace em Claude Code/Cursor.

---

### [2026-06-01] - Open Source Launch Pack para Codex
- **O que mudou:** Repositorio preparado para publicacao open source MIT com README Codex-first, LICENSE, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, issue templates, PR template, `.gitignore`, `.env.example`, roadmap publico e documentacao de workflows/integracoes.
- **Contexto & Motivacao:** Decisao de posicionar o Gigio Flow como protocolo/workspace local para squads de IA com Codex, combinando artefatos de produto, memoria tecnica e integracoes com Linear, GitHub e Vercel.
- **Impacto no Sistema:** A base publica agora explica que o Linear e o board operacional visual, enquanto o Gigio Flow controla contexto, discovery, PRDs, refinamento, handoff tecnico e registro historico para agentes.
