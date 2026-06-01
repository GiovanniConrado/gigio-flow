# Glossário de Termos — Gigio Flow

> Dicionário de termos específicos do domínio Gigio Flow. A IA usa este glossário para garantir consistência semântica em toda a documentação, código e comunicação.

---

## Termos Fundamentais

**Workspace**
: Uma pasta raiz de projeto que segue a estrutura do Gigio Flow (contém `.ai/`, `knowledge/`, `workflows/`, `boards/`). Um workspace representa um projeto, produto ou startup.

**Squad**
: Uma persona de IA especializada com identidade, responsabilidades e regras inegociáveis definidas em `.ai/squads/`. Cada squad atua como um papel específico em uma equipe de produto: CEO, PM, CTO, Dev, QA, Process Analyst.

**Studio**
: O painel visual local (dashboard/) que serve como interface de configuração, visualização e controle do workspace Gigio Flow. Roda em `http://localhost:5173` (frontend) e `http://localhost:3001` (backend).

**Pipeline de Entrega**
: O fluxo sequencial de uma tarefa desde a ideação até a produção: Proposta → Refinamento LLM → Estimativa → Aprovação Humana → Execução → QA Técnico → QA Humano → Linear → Concluído.

**Knowledge Base (Base de Conhecimento)**
: A pasta `knowledge/` contendo os 7 documentos fundamentais do projeto: VISAO, ARQUITETURA, ESTADO_ATUAL, ROADMAP, HISTORICO, GLOSSARIO, DESIGN_SYSTEM. É a memória persistente do projeto.

**Ritual de Sessão**
: Protocolo obrigatório que a IA segue ao iniciar (`knowledge/ESTADO_ATUAL.md` → tarefas pendentes → proposta) e ao encerrar (atualiza ESTADO_ATUAL → registra em HISTORICO → move card).

**Auto-Evolução**
: A skill que instrui a IA a atualizar autonomamente os arquivos de conhecimento após cada entrega, garantindo que o workspace seja sempre a Fonte da Verdade atualizada.

**Safety Lock**
: Uma regra imutável em `.ai/rules/safety-locks.md` que bloqueia comportamentos indesejados da IA: estilos ad-hoc, scope creep, uso de `any` em TypeScript, mudanças destrutivas em banco de dados.

**Design Lock**
: A regra específica que proíbe a IA de usar valores de estilo hardcoded (cores em hex, margins mágicas). Todo estilo deve vir dos tokens do `DESIGN_SYSTEM.md`.

**Parecer de Viabilidade Estratégica**
: O documento estruturado que o CEO Agent gera ao analisar uma nova ideia. Contém: Tese de Valor, Custo vs. Impacto, Riscos Mapeados e Veredito (Prosseguir/Modificar/Engavetar).

**Card**
: Um arquivo Markdown dentro de uma das pastas de workflow (`propostas/`, `pendentes/`, `em-progresso/`) representando uma tarefa ou especificação.

**Esteira de Entrega**
: O conjunto das pastas de workflow (`workflows/`) que formam o Kanban físico local: propostas → pendentes → em-progresso → concluídos (`.ai/history/concluidos/`).

**PRD (Product Requirements Document)**
: O documento de especificação funcional de uma feature ou tarefa. Criado pelo PM Agent usando o template em `.ai/templates/prd.md`.

**Story Points**
: Unidade de medida de complexidade de uma tarefa, estimada pelo CTO Agent com base na análise do escopo técnico, arquivos impactados e risco de regressão.

**Refinamento LLM**
: O processo de enriquecer uma PRD bruta com critérios de aceite atômicos, dependências técnicas e riscos, usando o contexto completo do sistema como input para a LLM.

**Gate de Aprovação**
: Ponto de checkagem humana no pipeline onde o fundador/PM valida se a proposta ou o resultado da QA pode avançar para a próxima etapa.

**Dogfooding**
: Prática de usar o próprio Gigio Flow para gerenciar o desenvolvimento do Gigio Flow. O workspace em `c:\Users\conra\Desktop\gigio-flow` é o caso de uso real do produto.
