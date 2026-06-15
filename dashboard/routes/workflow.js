/**
 * routes/workflow.js
 * Rotas do quadro Kanban e pipeline LLM:
 *
 * Existentes:
 *   GET  /api/workflow/board
 *   POST /api/workflow/move
 *   POST /api/workflow/approve-ceo
 *   POST /api/workflow/approve-ceo-real
 *
 * Novas:
 *   POST /api/workflow/create-card
 *   POST /api/workflow/refine
 *   POST /api/workflow/estimate
 *   POST /api/workflow/qa-review
 *   POST /api/workflow/human-approve
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fileExists, readFile, writeFile, validatePath } from '../services/files.js';
import { callLLM, buildSystemContext, makeHttpsPost } from '../services/llm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const LINEAR_CONFIG_FILE = path.join(__dirname, '..', 'linear-config.json');

// ─── Fases válidas do workflow ───────────────────────────────────────────────
const VALID_PHASES = ['propostas', 'pendentes', 'em-progresso'];
const MOVABLE_PHASES = ['propostas', 'pendentes', 'em-progresso', 'concluidos'];

// Mapa de progressão de fases para human-approve
const PHASE_PROGRESSION = {
  'propostas':   'pendentes',
  'pendentes':   'em-progresso',
  'em-progresso': 'concluidos'
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Gera slug a partir de um título.
 */
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Retorna o caminho absoluto de um card, tratando 'concluidos' separadamente.
 */
function getCardPath(workspaceDir, phase, cardId) {
  if (phase === 'concluidos') {
    return path.join(workspaceDir, '.ai', 'history', 'concluidos', cardId);
  }
  return path.join(workspaceDir, 'workflows', phase, cardId);
}

function safeCardPath(workspaceDir, phase, cardId) {
  if (!MOVABLE_PHASES.includes(phase)) {
    throw new Error(`Fase invalida: ${phase}`);
  }
  if (!cardId || cardId.includes('/') || cardId.includes('\\') || !cardId.endsWith('.md')) {
    throw new Error('cardId invalido');
  }
  return validatePath(workspaceDir, getCardPath(workspaceDir, phase, cardId));
}

function appendKnowledgeLog(workspaceDir, cardTitle, cardId, resultText, source) {
  const today = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();

  const estadoAtual = readFile(workspaceDir, 'knowledge', 'ESTADO_ATUAL.md');
  if (estadoAtual) {
    const updateNote = `\n\n## Atualizacao ${today} - ${cardTitle}\n\n- **Status:** concluido.\n- **Card:** ${cardId}\n- **Origem:** ${source}\n- **Resultado:** ${resultText}\n`;
    writeFile(workspaceDir, 'knowledge', 'ESTADO_ATUAL.md', estadoAtual + updateNote);
  }

  const historico = readFile(workspaceDir, 'knowledge', 'HISTORICO.md');
  if (historico) {
    const historyNote = `\n\n### [${today}] - ${cardTitle}\n- **O que mudou:** Card ${cardId} concluido e arquivado pelo Studio.\n- **Contexto & Motivacao:** Fechamento atomico do pipeline Gigio Flow com resultado registrado.\n- **Impacto no Sistema:** ${resultText}\n- **Registro tecnico:** ${source} em ${timestamp}.\n\n---\n`;
    writeFile(workspaceDir, 'knowledge', 'HISTORICO.md', historico + historyNote);
  }
}

function completeCard(workspaceDir, cardId, fromPhase, resultText = 'Concluido pelo Studio.', source = 'workflow') {
  const sourcePath = safeCardPath(workspaceDir, fromPhase, cardId);
  if (!fileExists(sourcePath)) {
    throw new Error('Card nao encontrado');
  }

  let content = fs.readFileSync(sourcePath, 'utf8');
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const cardTitle = titleMatch ? titleMatch[1].trim() : cardId.replace('.md', '');

  if (!content.includes('## Resultado')) {
    content += `\n\n---\n\n## Resultado\n\n${resultText}\n`;
  }

  const destPath = safeCardPath(workspaceDir, 'concluidos', cardId);
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  fs.writeFileSync(sourcePath, content, 'utf8');
  fs.renameSync(sourcePath, destPath);
  appendKnowledgeLog(workspaceDir, cardTitle, cardId, resultText, source);

  return { cardTitle, destPath };
}

/**
 * Lê e parseia todos os cards de uma fase do board.
 */
function readPhaseCards(workspaceDir, phase) {
  const dirPath = phase === 'concluidos'
    ? path.join(workspaceDir, '.ai', 'history', 'concluidos')
    : path.join(workspaceDir, 'workflows', phase);

  if (!fs.existsSync(dirPath)) return [];

  return fs.readdirSync(dirPath)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
      let title = file.replace('.md', '');
      const titleMatch = content.match(/# (.*)/);
      if (titleMatch && titleMatch[1]) title = titleMatch[1].trim();

      let description = 'Sem descrição.';
      const descMatch = content.match(/(?:## Descrição|## Descricao)\n*(.*?)\n/i);
      if (descMatch && descMatch[1]) {
        description = descMatch[1].trim();
      } else {
        const para = content.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('>'));
        if (para.length > 0) description = para[0];
      }

      return { id: file, title, description, rawContent: content, phase };
    });
}

// ─── Router Factory ──────────────────────────────────────────────────────────

export function createWorkflowRouter(state) {
  const router = express.Router();

  // ── GET /api/workflow/board ────────────────────────────────────────────────
  router.get('/board', (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const board = {
        propostas:       readPhaseCards(workspaceDir, 'propostas'),
        pendentes:       readPhaseCards(workspaceDir, 'pendentes'),
        'em-progresso':  readPhaseCards(workspaceDir, 'em-progresso'),
        concluidos:      readPhaseCards(workspaceDir, 'concluidos').map(c => ({ ...c, description: 'Concluído com sucesso.' }))
      };
      res.json(board);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── POST /api/workflow/move ───────────────────────────────────────────────
  router.post('/move', (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { cardId, fromPhase, toPhase } = req.body;

      if (!cardId || !fromPhase || !toPhase) {
        return res.status(400).json({ error: 'Faltam parâmetros' });
      }

      const sourcePath = safeCardPath(workspaceDir, fromPhase, cardId);
      const destPath   = safeCardPath(workspaceDir, toPhase, cardId);

      if (!fileExists(sourcePath)) {
        return res.status(404).json({ error: 'Origem não encontrada' });
      }

      if (toPhase === 'concluidos') {
        const resultText = req.body.result || 'Concluido manualmente pelo quadro do Studio.';
        completeCard(workspaceDir, cardId, fromPhase, resultText, 'POST /api/workflow/move');
        return res.json({ success: true, movedTo: 'concluidos' });
      }

      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      fs.renameSync(sourcePath, destPath);

      // Atualiza link no board MD se existir
      const boardPath = path.join(workspaceDir, 'boards', '📱 Produto.md');
      if (fileExists(boardPath)) {
        let boardContent = fs.readFileSync(boardPath, 'utf8');
        const fromLink = `workflows/${fromPhase}/${cardId.replace('.md', '')}`;
        const toLink   = `workflows/${toPhase}/${cardId.replace('.md', '')}`;
        if (boardContent.includes(fromLink)) {
          boardContent = boardContent.replace(fromLink, toLink);
          fs.writeFileSync(boardPath, boardContent, 'utf8');
        }
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── POST /api/workflow/approve-ceo (simulação) ────────────────────────────
  router.post('/approve-ceo', (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { ideaTitle, ideaDescription } = req.body;
      if (!ideaTitle) return res.status(400).json({ error: 'Título da ideia é obrigatório' });

      const parecer = `# 📊 Parecer de Viabilidade Estratégica: ${ideaTitle}

*(Nota: Executando no modo Simulação de Workspace)*

## 1. Tese de Valor (Por que fazer isso?)
A proposta de "${ideaTitle}" visa resolver de forma enxuta a dor primária do usuário, criando uma experiência rápida e integrada de side-projects.

## 2. Análise de Custo vs. Impacto
- **Custo Estimado de IA/Infra:** Baixo
- **Complexidade Operacional:** Baixo (MVP isolado)
- **Impacto no Negócio:** Validação ágil de funil de aquisição de novos prestadores de serviço.

## 3. Riscos Mapeados (O que pode dar errado?)
- **Risco 1:** Foco exagerado em perfumaria cosmética (scope creep) antes do core operacional.
- **Risco 2:** Limitações de processadores de pagamentos para liberação imediata.

## 4. Veredito do CEO Agent
- **Recomendação:** ✅ PROSSEGUIR COM MVP (Modo Simulação)
- **Próximo Passo Proposto:** Encaminhar para o PM Agent detalhar os critérios funcionais na esteira.
`;

      const prdFileName = `proposta-${ideaTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
      const prdContent  = `# 📝 Proposta de Feature: ${ideaTitle}

> **Status:** ⏳ Aguardando Detalhes do PM / Aprovado pelo CEO
> **Origem:** Ideação com CEO (Modo Simulação) no Gigio Flow Studio

## 👥 Resumo de Negócios (Parecer do CEO)
${parecer}

## 🎯 Especificações de Produto (PM Agent)
[O PM Agent detalhará os critérios de aceite e fluxos de UX para esta funcionalidade na próxima sessão.]

---

## 🛠️ Requisitos de Engenharia (CTO Agent)
[O CTO Agent validará o impacto arquitetural e as regras de segurança aplicáveis.]
`;

      writeFile(workspaceDir, 'workflows/propostas', prdFileName, prdContent);

      res.json({ success: true, fileName: prdFileName, parecer, message: 'Ideia simulada aprovada e salva na pasta de propostas!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── POST /api/workflow/approve-ceo-real (IA real) ─────────────────────────
  router.post('/approve-ceo-real', async (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { ideaTitle, ideaDescription, apiKey, provider } = req.body;

      if (!ideaTitle) return res.status(400).json({ error: 'Título da ideia é obrigatório' });
      if (!apiKey)    return res.status(400).json({ error: 'API Key é obrigatória para usar IA real' });

      const ceoIdentity    = readFile(workspaceDir, '.ai/squads', 'ceo.md');
      const businessContext = readFile(workspaceDir, 'knowledge', 'VISAO.md');

      const systemPrompt = `Você é o CEO Agent do projeto governado pelo Gigio Flow.
Sua identidade e regras inegociáveis estão definidas no arquivo squads/ceo.md anexado abaixo.
Seu papel é atuar como um sparring partner de negócios crítico, pragmático e focado em viabilidade financeira, ROI e métricas.

---
### SUAS INSTRUÇÕES E RITUAL (squads/ceo.md):
${ceoIdentity || 'Você é o CEO estratégico.'}

---
### CONTEXTO DE NEGÓCIOS DO PROJETO (knowledge/VISAO.md):
${businessContext || 'Projeto geral.'}
`;

      const userPrompt = `O fundador me enviou a seguinte ideia de negócio para debater e obter o Parecer de Viabilidade Estratégica:
Título da Ideia: "${ideaTitle}"
Descrição detalhada / Pedido: "${ideaDescription || 'Sem detalhes fornecidos.'}"

Por favor, faça uma análise crítica premium e retorne o Parecer de Viabilidade Estratégica em formato Markdown completo, estruturado EXATAMENTE com os 4 tópicos definidos no seu ritual do ceo.md:
1. Tese de Valor (Por que fazer isso?)
2. Análise de Custo vs. Impacto (Custo IA/Infra, Complexidade, Impacto CAC/LTV)
3. Riscos Mapeados (Mínimo 2 riscos reais)
4. Veredito final (Recomendação clara: PROSSEGUIR COM MVP / Modificar escopo / Engavetar) com o emoji adequado.`;

      const responseMarkdown = await callLLM({ provider, apiKey, systemPrompt, userPrompt });

      const prdFileName = `proposta-${ideaTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`;
      const prdContent  = `# 📝 Proposta de Feature: ${ideaTitle}

> **Status:** ⏳ Aguardando Detalhes do PM / Aprovado pelo CEO
> **Origem:** Ideação Real de IA no Gigio Flow Studio

## 👥 Resumo de Negócios (Parecer Real do CEO Agent)
${responseMarkdown}

---

## 🎯 Especificações de Produto (PM Agent)
[O PM Agent detalhará os critérios de aceite e fluxos de UX para esta funcionalidade na próxima sessão.]

---

## 🛠️ Requisitos de Engenharia (CTO Agent)
[O CTO Agent validará o impacto arquitetural e as regras de segurança aplicáveis.]
`;

      writeFile(workspaceDir, 'workflows/propostas', prdFileName, prdContent);

      res.json({
        success: true,
        fileName: prdFileName,
        parecer: responseMarkdown,
        message: 'Parecer autêntico gerado com sucesso por IA real e salvo na esteira!'
      });
    } catch (error) {
      console.error('Erro na API da LLM:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ── POST /api/workflow/create-card ────────────────────────────────────────
  router.post('/create-card', (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { title, description, phase, squadId } = req.body;

      if (!title || !phase) {
        return res.status(400).json({ error: 'title e phase são obrigatórios' });
      }

      if (!VALID_PHASES.includes(phase)) {
        return res.status(400).json({ error: `phase deve ser um de: ${VALID_PHASES.join(', ')}` });
      }

      // Tenta usar o template de feature.md se existir
      let templateContent = readFile(workspaceDir, '.ai/templates', 'feature.md');

      let cardContent;
      if (templateContent) {
        // Substitui placeholders básicos do template
        cardContent = templateContent
          .replace(/\{\{TITULO\}\}/gi, title)
          .replace(/\{\{DESCRICAO\}\}/gi, description || '')
          .replace(/\{\{SQUAD\}\}/gi, squadId || '')
          .replace(/\{\{DATA\}\}/gi, new Date().toISOString().split('T')[0]);
      } else {
        // Template padrão limpo
        cardContent = `# 📝 ${title}

> **Status:** ⏳ Em análise
> **Fase:** ${phase}
> **Squad:** ${squadId || 'Não definido'}
> **Criado em:** ${new Date().toISOString().split('T')[0]}

## Descrição

${description || 'Descrição a ser preenchida.'}

---

## 🎯 Critérios de Aceite

- [ ] Critério 1
- [ ] Critério 2

---

## 🛠️ Requisitos Técnicos

A definir pelo CTO Agent.

---

## 📎 Notas Adicionais

_Seção para comentários, links e referências._
`;
      }

      const baseSlug = slugify(title);
      let fileName = `${baseSlug}.md`;
      let suffix = 2;
      while (fileExists(path.join(workspaceDir, 'workflows', phase, fileName))) {
        fileName = `${baseSlug}-${suffix}.md`;
        suffix += 1;
      }
      const filePath = path.join(workspaceDir, 'workflows', phase, fileName);

      writeFile(workspaceDir, `workflows/${phase}`, fileName, cardContent);

      res.json({ success: true, fileName, filePath });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── POST /api/workflow/refine ─────────────────────────────────────────────
  router.post('/refine', async (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { cardId, phase, apiKey, provider } = req.body;

      if (!cardId || !phase || !apiKey) {
        return res.status(400).json({ error: 'cardId, phase e apiKey são obrigatórios' });
      }

      const cardPath = safeCardPath(workspaceDir, phase, cardId);
      if (!fileExists(cardPath)) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      const cardContent    = fs.readFileSync(cardPath, 'utf8');
      const systemContext  = buildSystemContext(workspaceDir);

      const systemPrompt = `Você é o PM Agent + CTO Agent do Gigio Flow. Sua missão é enriquecer a PRD abaixo com critérios de aceite atômicos e testáveis, identificar arquivos/tabelas impactados, dependências e riscos técnicos. Use o contexto completo do sistema fornecido para personalizar a análise ao sistema real.`;

      const userPrompt = `${systemContext}

---

## 📋 PRD A REFINAR:

${cardContent}`;

      const refinedContent = await callLLM({ provider: provider || 'gemini', apiKey, systemPrompt, userPrompt });

      // Appenda refinamento ao arquivo do card
      const appendSection = `\n\n---\n\n## 🔧 Refinamento LLM\n\n> Gerado automaticamente em ${new Date().toISOString()}\n\n${refinedContent}\n`;
      fs.appendFileSync(cardPath, appendSection, 'utf8');

      res.json({ success: true, refinedContent });
    } catch (error) {
      console.error('Erro no refinamento LLM:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ── POST /api/workflow/estimate ───────────────────────────────────────────
  router.post('/estimate', async (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { cardId, phase, apiKey, provider } = req.body;

      if (!cardId || !phase || !apiKey) {
        return res.status(400).json({ error: 'cardId, phase e apiKey são obrigatórios' });
      }

      const cardPath = safeCardPath(workspaceDir, phase, cardId);
      if (!fileExists(cardPath)) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      const cardContent   = fs.readFileSync(cardPath, 'utf8');
      const systemContext = buildSystemContext(workspaceDir);

      const systemPrompt = `Você é o CTO Agent do Gigio Flow especializado em estimativa de complexidade. Analise a PRD e o estado atual do sistema e retorne APENAS um JSON válido com os campos: storyPoints (número), complexity (string: Baixa/Média/Alta/Muito Alta), squadsNeeded (array de strings), estimatedFiles (número), regressionRisk (string: Baixo/Médio/Alto), sessions (string), blockers (array de strings), rationale (string explicando a estimativa).`;

      const userPrompt = `${systemContext}

---

## 📋 PRD PARA ESTIMAR:

${cardContent}`;

      const rawResponse = await callLLM({ provider: provider || 'gemini', apiKey, systemPrompt, userPrompt });

      // Parseia JSON — extrai bloco JSON se vier dentro de markdown
      let estimate;
      try {
        const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/) || rawResponse.match(/(\{[\s\S]*\})/);
        const jsonStr   = jsonMatch ? jsonMatch[1] : rawResponse;
        estimate = JSON.parse(jsonStr.trim());
      } catch {
        throw new Error(`LLM retornou resposta não-JSON: ${rawResponse.substring(0, 300)}`);
      }

      // Formata e appenda ao card
      const estimateSection = `\n\n---\n\n## ⚖️ Estimativa de Complexidade\n
> Gerada automaticamente em ${new Date().toISOString()}

| Campo | Valor |
|-------|-------|
| **Story Points** | ${estimate.storyPoints} |
| **Complexidade** | ${estimate.complexity} |
| **Squads Necessários** | ${(estimate.squadsNeeded || []).join(', ')} |
| **Arquivos Estimados** | ${estimate.estimatedFiles} |
| **Risco de Regressão** | ${estimate.regressionRisk} |
| **Sessões Estimadas** | ${estimate.sessions} |

**Blockers identificados:**
${(estimate.blockers || []).map(b => `- ${b}`).join('\n')}

**Racional da Estimativa:**
${estimate.rationale}
`;
      fs.appendFileSync(cardPath, estimateSection, 'utf8');

      res.json({ success: true, estimate });
    } catch (error) {
      console.error('Erro na estimativa LLM:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ── POST /api/workflow/qa-review ──────────────────────────────────────────
  router.post('/qa-review', async (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { cardId, phase, apiKey, provider } = req.body;

      if (!cardId || !phase || !apiKey) {
        return res.status(400).json({ error: 'cardId, phase e apiKey são obrigatórios' });
      }

      const cardPath = safeCardPath(workspaceDir, phase, cardId);
      if (!fileExists(cardPath)) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      const cardContent     = fs.readFileSync(cardPath, 'utf8');
      const safetyLocks     = readFile(workspaceDir, '.ai/rules', 'safety-locks.md');
      const releaseChecklist = readFile(workspaceDir, '.ai/rules', 'release-checklist.md');

      const systemPrompt = `Você é o QA Agent do Gigio Flow. Analise a PRD/especificação abaixo e os safety-locks do projeto. Retorne um relatório de QA técnico em Markdown listando cada critério de aceite com status ✅ PASSOU, ❌ FALHOU ou ⚠️ ATENÇÃO, seguido de observações técnicas. Ao final, dê um veredito: APROVADO, REPROVADO ou PRECISA DE AJUSTES.`;

      const userPrompt = `## 📋 PRD / ESPECIFICAÇÃO:

${cardContent}

---

## 🔒 SAFETY LOCKS:

${safetyLocks || '*(safety-locks.md não encontrado)*'}

---

## ✅ RELEASE CHECKLIST:

${releaseChecklist || '*(release-checklist.md não encontrado)*'}`;

      const qaReport = await callLLM({ provider: provider || 'gemini', apiKey, systemPrompt, userPrompt });

      // Extrai veredito
      let verdict = 'PRECISA DE AJUSTES';
      if (qaReport.includes('APROVADO')) verdict = 'APROVADO';
      else if (qaReport.includes('REPROVADO')) verdict = 'REPROVADO';

      // Appenda ao card
      const qaSection = `\n\n---\n\n## 🧪 Relatório de QA Técnico\n
> Gerado automaticamente em ${new Date().toISOString()}
> **Veredito:** ${verdict}

${qaReport}
`;
      fs.appendFileSync(cardPath, qaSection, 'utf8');

      res.json({ success: true, qaReport, verdict });
    } catch (error) {
      console.error('Erro no QA review LLM:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ── POST /api/workflow/human-approve ──────────────────────────────────────
  router.post('/human-approve', (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { cardId, phase, approvalType, approved, comment } = req.body;

      if (!cardId || !phase || approvalType === undefined || approved === undefined) {
        return res.status(400).json({ error: 'cardId, phase, approvalType e approved são obrigatórios' });
      }

      const cardPath = safeCardPath(workspaceDir, phase, cardId);
      if (!fileExists(cardPath)) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      // Registra a aprovação/rejeição no arquivo
      const approvalLabel = approvalType === 'human-qa' ? 'Aprovação Humana de QA' : 'Aprovação de Escopo';
      const status        = approved ? '✅ APROVADO' : '❌ REJEITADO';
      const timestamp     = new Date().toISOString();

      const approvalSection = `\n\n---\n\n## 👤 ${approvalLabel} — ${status}\n
> **Data:** ${timestamp}
> **Tipo:** ${approvalType}
> **Resultado:** ${status}
${comment ? `\n**Comentário:** ${comment}` : ''}
`;
      fs.appendFileSync(cardPath, approvalSection, 'utf8');

      let movedTo = null;

      if (approved) {
        const nextPhase = PHASE_PROGRESSION[phase];
        if (nextPhase) {
          if (nextPhase === 'concluidos') {
            const resultText = comment || 'Aprovado no gate humano e concluido pelo Studio.';
            completeCard(workspaceDir, cardId, phase, resultText, 'POST /api/workflow/human-approve');
            return res.json({ success: true, movedTo: nextPhase });
          }

          const destPath = safeCardPath(workspaceDir, nextPhase, cardId);
          const destDir  = path.dirname(destPath);

          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }

          fs.renameSync(cardPath, destPath);
          movedTo = nextPhase;
        }
      }

      res.json({ success: true, movedTo });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/complete', (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { cardId, phase, result } = req.body;

      if (!cardId || !phase || !result || !result.trim()) {
        return res.status(400).json({ error: 'cardId, phase e result sao obrigatorios para concluir' });
      }

      const completed = completeCard(
        workspaceDir,
        cardId,
        phase,
        result.trim(),
        'POST /api/workflow/complete'
      );

      res.json({ success: true, movedTo: 'concluidos', ...completed });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Helper: Linear GraphQL (self-contained, reads config from env/file) ──────
  async function linearGraphQL(query, variables = {}) {
    let apiKey = process.env.LINEAR_API_KEY || '';
    let teamId = process.env.LINEAR_TEAM_ID || '';

    if (!apiKey) {
      try {
        if (fs.existsSync(LINEAR_CONFIG_FILE)) {
          const cfg = JSON.parse(fs.readFileSync(LINEAR_CONFIG_FILE, 'utf8'));
          if (cfg.apiKey && cfg.apiKey !== '***CONFIGURADA***') apiKey = cfg.apiKey;
          if (cfg.teamId) teamId = cfg.teamId;
        }
      } catch {}
    }

    if (!apiKey) throw new Error('Linear API Key não configurada');
    if (!teamId) throw new Error('Linear Team ID não configurado');

    const result = await makeHttpsPost(
      'https://api.linear.app/graphql',
      { 'Authorization': apiKey },
      { query, variables }
    );

    if (result.statusCode !== 200) {
      throw new Error(`Linear API erro ${result.statusCode}: ${result.body}`);
    }
    const data = JSON.parse(result.body);
    if (data.errors) throw new Error(`Linear GraphQL erro: ${JSON.stringify(data.errors)}`);
    return data.data;
  }

  // ── POST /api/workflow/prd-to-issues ────────────────────────────────────
  // Pega um PRD aprovado, quebra em issues atômicas usando LLM,
  // cria cada issue no Linear e anota o card.
  router.post('/prd-to-issues', async (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { cardId, phase, apiKey, provider } = req.body;

      if (!cardId || !phase) {
        return res.status(400).json({ error: 'cardId e phase são obrigatórios' });
      }

      // 1. Ler o card PRD
      const cardPath = safeCardPath(workspaceDir, phase, cardId);
      if (!fileExists(cardPath)) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }
      const cardContent = fs.readFileSync(cardPath, 'utf8');

      // 2. Extrair título
      let cardTitle = cardId.replace('.md', '');
      const titleMatch = cardContent.match(/^#\s+(.+)$/m);
      if (titleMatch) cardTitle = titleMatch[1].trim();

      // 3. Pegar IDs do estado Backlog e Tech QA do Linear
      const teamId = process.env.LINEAR_TEAM_ID || '';
      let backlogStateId = '';
      let techQaStateId = '';

      if (teamId) {
        try {
          const teamData = await linearGraphQL(
            `query ($teamId: String!) {
              team(id: $teamId) { states { nodes { id name type } } }
            }`,
            { teamId }
          );
          const states = teamData.team.states.nodes;
          const backlog = states.find(s => s.type === 'backlog' || s.name === 'Backlog' || s.name === 'Todo');
          const techQa = states.find(s => s.name === 'Tech QA' || s.name === 'In Review');
          if (backlog) backlogStateId = backlog.id;
          if (techQa) techQaStateId = techQa.id;
        } catch (err) {
          console.warn('[prd-to-issues] Falha ao buscar estados do Linear:', err.message);
        }
      }

      // 4. Chamar LLM (CTO Agent) para quebrar PRD em issues
      const systemContext = buildSystemContext(workspaceDir);
      const ctoIdentity = readFile(workspaceDir, '.ai/squads', 'cto.md');

      const systemPrompt = `Você é o CTO Agent do Gigio Flow. Sua missão é analisar o PRD abaixo e quebrá-lo em issues atômicas e implementáveis seguindo a Session Atomicity Rule.

REGRAS:
- Cada issue deve ser implementável em UMA sessão de IA
- Separe backend, frontend e QA em issues distintas
- Máximo de 8 story points por issue
- Cada issue deve ter 3-5 acceptance criteria testáveis
- Identifique dependências entre issues

Retorne APENAS um array JSON válido com a seguinte estrutura:
[
  {
    "title": "[DEV] Título curto e acionável",
    "description": "## Scope\\n\\n[1-2 frases]\\n\\n## Acceptance Criteria\\n- [ ] Critério 1\\n- [ ] Critério 2",
    "squad": "DEV",
    "priority": 2,
    "estimate": 3,
    "files": ["src/file1.js", "src/file2.js"],
    "blockedBy": []
  }
]`;

      const userPrompt = `${systemContext}

---

## 📋 PRD A SER QUEBRADO EM ISSUES:

${cardContent}`;

      const llmApiKey = apiKey || process.env.GIGIO_LLM_KEY || '';
      const llmProvider = provider || process.env.GIGIO_LLM_PROVIDER || 'gemini';

      const rawResponse = await callLLM({
        provider: llmProvider,
        apiKey: llmApiKey,
        systemPrompt,
        userPrompt
      });

      // 5. Parsear JSON da resposta
      let issues;
      try {
        const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : rawResponse;
        issues = JSON.parse(jsonStr.trim());
        if (!Array.isArray(issues)) throw new Error('Resposta não é um array');
      } catch (err) {
        return res.status(500).json({
          error: 'LLM retornou formato inválido',
          rawResponse: rawResponse.substring(0, 500)
        });
      }

      // 6. Criar cada issue no Linear
      const created = [];
      for (const issue of issues) {
        try {
          const data = await linearGraphQL(
            `mutation ($input: IssueCreateInput!) {
              issueCreate(input: $input) {
                success
                issue { id identifier title url }
              }
            }`,
            {
              input: {
                title: issue.title,
                description: issue.description,
                teamId,
                priority: issue.priority || 2,
                estimate: issue.estimate || 3,
                ...(backlogStateId ? { stateId: backlogStateId } : {}),
              }
            }
          );

          if (data.issueCreate.success) {
            created.push(data.issueCreate.issue);
          }
        } catch (err) {
          console.warn(`[prd-to-issues] Falha ao criar issue "${issue.title}":`, err.message);
          created.push({ title: issue.title, error: err.message });
        }
      }

      // 7. Anotar o card PRD com as issues criadas
      const issueTable = created.map(i =>
        `| ${i.identifier || 'ERRO'} | ${i.title} | ${i.url || i.error || 'Falha ao criar'} |`
      ).join('\n');

      const annotation = `\n\n---\n\n## 🔗 Issues no Linear\n\n| Issue | Título | URL |\n|-------|-------|-----|\n${issueTable}\n`;
      fs.appendFileSync(cardPath, annotation, 'utf8');

      // 8. Mover card de pendentes para em-progresso
      try {
        const currentPhase = phase;
        const nextPhase = 'em-progresso';
        const sourcePath = safeCardPath(workspaceDir, currentPhase, cardId);
        const destPath = safeCardPath(workspaceDir, nextPhase, cardId);
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.renameSync(sourcePath, destPath);
      } catch (err) {
        console.warn('[prd-to-issues] Falha ao mover card:', err.message);
      }

      res.json({
        success: true,
        cardTitle,
        issues: created,
        totalIssues: created.length
      });

    } catch (error) {
      console.error('[prd-to-issues] Erro:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
