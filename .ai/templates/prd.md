# [PRD] — [Título da Funcionalidade / Recurso]

> **Autores:** PM Agent & CTO Agent
> **Data:** [YYYY-MM-DD]
> **Status:** ⏳ Em Revisão (Aguardando aprovação humana com "OK")
> **Issue ID:** [GIG-XX]

---

## 🎯 1. Visão Geral e Contexto de Negócio (PM)

### Objetivo
[Qual problema real do cliente ou do negócio este recurso resolve? Uma frase clara e de fácil entendimento.]

### Personas Afetadas
- [ ] **[Nome da Persona A]:** [Ex: Cliente final buscando agilidade.]
- [ ] **[Nome da Persona B]:** [Ex: Administrador gerenciando relatórios.]

### Impacto nas Métricas
[Qual indicador de sucesso (KPI) pretendemos impactar? Ex: Aumentar taxa de conversão em 5%, reduzir bounce rate, etc.]

---

## 🎨 2. Jornada do Usuário & UX (PM)

### Fluxo Ideal (Golden Path)
- **Passo 1:** [Ação inicial do usuário] ➔ **Resultado:** [O que o sistema exibe/faz]
- **Passo 2:** [Segunda ação] ➔ **Resultado:** [O que o sistema exibe/faz]

### Casos de Borda (Edge Cases)
- **Sem Conexão de Rede:** [Como o sistema reage]
- **Campos em Branco / Inválidos:** [Como os formulários exibem os erros de validação]

---

## 🛠️ 3. Especificação Técnica & Arquitetura (CTO)

### Modelagem de Dados (Banco de Dados)
*Descreva alterações em tabelas, colunas, chaves primárias e políticas RLS/Segurança.*

```sql
-- Script de Migração SQL Sugerido:
-- CREATE TABLE public.exemplo (
--     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
--     created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
-- );
```

### Gerenciamento de Estado & APIs
- **Stores Globais:** [Caminho do arquivo de store e variáveis a criar]
- **Rotas de API / Endpoints:** [Novos endpoints ou conexões de microsserviços]

### Trava de Design (Design System)
- **Cores / Tokens Utilizados:** [Tokens a importar de knowledge/DESIGN_SYSTEM.md]
- **Componentes de UI Reutilizáveis:** [Componentes existentes a reutilizar]

---

## 🧪 4. Critérios de Aceite & Checklist de QA

### Critérios de Aceite Funcionais
- [ ] **Ação:** [Passo a passo testável] ➔ **Resultado esperado:** [Comportamento correto]
- [ ] **Ação:** [Passo a passo testável] ➔ **Resultado esperado:** [Comportamento correto]

### Acessibilidade
- [ ] Todo componente interativo modificado possui `accessibilityLabel` ou tags equivalentes.
- [ ] Contraste visual atende às especificações WCAG.

---

## 📋 5. Fatiamento de Tarefas Ágeis (Linear/GitHub/Obsidian)

*Divisão das tarefas seguindo a regra de Atomicidade da Sessão de IA.*

### 👥 Squad PM (Especificações & Textos)
- **Título:** [PM] Detalhar copy e fluxos para [Funcionalidade]
- **Prioridade:** [High/Medium/Low]
- **Critérios:**
  - [ ] Copy validada e livre de erros ortográficos.

### 💻 Squad DEV (Codificação)
- **Título:** [DEV] Implementar backend/store para [Funcionalidade]
- **Prioridade:** [High/Medium/Low]
- **Critérios:**
  - [ ] Criar tabelas e rotas de API conforme a especificação técnica do CTO.
- **Título:** [DEV] Implementar telas visuais para [Funcionalidade]
- **Prioridade:** [High/Medium/Low]
- **Critérios:**
  - [ ] Implementar as telas utilizando estritamente os tokens de design oficiais.

### 🛡️ Squad QA (Homologação)
- **Título:** [QA] Homologar fluxos e segurança de [Funcionalidade]
- **Prioridade:** [High/Medium/Low]
- **Critérios:**
  - [ ] Validar todos os Critérios de Aceite funcionais em Staging.
  - [ ] Auditar políticas de segurança de dados e acessibilidade.
