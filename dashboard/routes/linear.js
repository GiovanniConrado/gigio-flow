/**
 * routes/linear.js
 * Integração com o Linear para criação e sincronização de issues:
 *   GET  /api/linear/settings
 *   POST /api/linear/settings
 *   POST /api/linear/create-issue
 *   POST /api/linear/webhook
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fileExists, readFile, writeFile, validatePath } from '../services/files.js';
import { makeHttpsPost } from '../services/llm.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const LINEAR_CONFIG_FILE = path.join(__dirname, '..', 'linear-config.json');

function safeWorkspacePath(workspaceDir, targetPath) {
  return validatePath(workspaceDir, targetPath);
}

function appendCompletionLogs(workspaceDir, cardTitle, cardId, resultText, source) {
  const today = new Date().toISOString().split('T')[0];
  const timestamp = new Date().toISOString();

  const estadoAtual = readFile(workspaceDir, 'knowledge', 'ESTADO_ATUAL.md');
  if (estadoAtual) {
    const updateNote = `\n\n## Atualizacao ${today} - ${cardTitle}\n\n- **Status:** concluido.\n- **Card:** ${cardId}\n- **Origem:** ${source}\n- **Resultado:** ${resultText}\n`;
    writeFile(workspaceDir, 'knowledge', 'ESTADO_ATUAL.md', estadoAtual + updateNote);
  }

  const historico = readFile(workspaceDir, 'knowledge', 'HISTORICO.md');
  if (historico) {
    const historyNote = `\n\n### [${today}] - ${cardTitle}\n- **O que mudou:** Card ${cardId} concluido via Linear e arquivado pelo Studio.\n- **Contexto & Motivacao:** Fechar automaticamente o loop operacional Linear -> Gigio Flow.\n- **Impacto no Sistema:** ${resultText}\n- **Registro tecnico:** ${source} em ${timestamp}.\n\n---\n`;
    writeFile(workspaceDir, 'knowledge', 'HISTORICO.md', historico + historyNote);
  }
}

// ─── Config Linear em memória ────────────────────────────────────────────────
let linearConfig = {
  apiKey: process.env.LINEAR_API_KEY || '',
  teamId: process.env.LINEAR_TEAM_ID || ''
};

// Carrega config persistida se existir
function loadLinearConfig() {
  try {
    if (fs.existsSync(LINEAR_CONFIG_FILE)) {
      const saved = JSON.parse(fs.readFileSync(LINEAR_CONFIG_FILE, 'utf8'));
      // Prioridade: arquivo de config > env
      if (saved.apiKey) linearConfig.apiKey = saved.apiKey;
      if (saved.teamId) linearConfig.teamId = saved.teamId;
    }
  } catch (err) {
    console.warn('[Linear] Falha ao carregar linear-config.json:', err.message);
  }
}

function saveLinearConfig() {
  try {
    fs.writeFileSync(LINEAR_CONFIG_FILE, JSON.stringify({
      // Salva apiKey mascarada apenas para indicar que está configurada
      // O valor real fica em memória e não é re-escrito no arquivo em texto claro
      // Para persistência real, use .env
      apiKey: linearConfig.apiKey ? '***CONFIGURADA***' : '',
      teamId: linearConfig.teamId
    }, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Linear] Falha ao salvar linear-config.json:', err.message);
  }
}

loadLinearConfig();

// ─── Helper Linear API ───────────────────────────────────────────────────────

async function linearGraphQL(query, variables = {}) {
  if (!linearConfig.apiKey || linearConfig.apiKey === '***CONFIGURADA***') {
    throw new Error('Linear API Key não configurada em memória. Configure via POST /api/linear/settings.');
  }

  const result = await makeHttpsPost(
    'https://api.linear.app/graphql',
    { 'Authorization': linearConfig.apiKey },
    { query, variables }
  );

  if (result.statusCode !== 200) {
    throw new Error(`Linear API erro ${result.statusCode}: ${result.body}`);
  }

  const data = JSON.parse(result.body);
  if (data.errors) {
    throw new Error(`Linear GraphQL erro: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
}

/**
 * Testa a conexão com o Linear verificando o viewer.
 * @returns {Promise<boolean>}
 */
async function testLinearConnection() {
  try {
    const data = await linearGraphQL(`query { viewer { id name } }`);
    return !!(data && data.viewer && data.viewer.id);
  } catch {
    return false;
  }
}

// ─── Router Factory ──────────────────────────────────────────────────────────

export function createLinearRouter(state) {
  const router = express.Router();

  // ── GET /api/linear/settings ──────────────────────────────────────────────
  // NUNCA retorna a API key real — apenas informa se está configurada
  router.get('/settings', (req, res) => {
    const hasUsableApiKey = !!linearConfig.apiKey && linearConfig.apiKey !== '***CONFIGURADA***';
    res.json({
      apiKey:    hasUsableApiKey,
      teamId:    linearConfig.teamId || null,
      connected: !!(hasUsableApiKey && linearConfig.teamId)
    });
  });

  // ── POST /api/linear/settings ─────────────────────────────────────────────
  router.post('/settings', async (req, res) => {
    try {
      const { apiKey, teamId } = req.body;

      if (!apiKey || !teamId) {
        return res.status(400).json({ error: 'apiKey e teamId são obrigatórios' });
      }

      // Salva em memória
      linearConfig.apiKey = apiKey;
      linearConfig.teamId = teamId;

      // Testa conexão antes de persistir
      const connected = await testLinearConnection();

      // Persiste arquivo de config (sem a key real)
      saveLinearConfig();

      res.json({ success: true, connected });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── POST /api/linear/create-issue ─────────────────────────────────────────
  router.post('/create-issue', async (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { cardId, phase } = req.body;

      if (!cardId || !phase) {
        return res.status(400).json({ error: 'cardId e phase são obrigatórios' });
      }

      if (!linearConfig.apiKey || !linearConfig.teamId) {
        return res.status(400).json({ error: 'Linear não configurado. Use POST /api/linear/settings primeiro.' });
      }

      // Lê o card
      const rawCardPath = phase === 'concluidos'
        ? path.join(workspaceDir, '.ai', 'history', 'concluidos', cardId)
        : path.join(workspaceDir, 'workflows', phase, cardId);
      const cardPath = safeWorkspacePath(workspaceDir, rawCardPath);

      if (!fileExists(cardPath)) {
        return res.status(404).json({ error: 'Card não encontrado' });
      }

      const cardContent = fs.readFileSync(cardPath, 'utf8');

      // Extrai título
      let title = cardId.replace('.md', '');
      const titleMatch = cardContent.match(/^# (.+)/m);
      if (titleMatch) title = titleMatch[1].trim().replace(/^📝\s*/, '');

      // Extrai story points da seção de estimativa
      let storyPoints = null;
      const spMatch = cardContent.match(/\*\*Story Points\*\*\s*\|\s*(\d+)/i);
      if (spMatch) storyPoints = parseInt(spMatch[1], 10);

      // Extrai critérios de aceite
      const acMatch = cardContent.match(/## 🎯 Critérios de Aceite\n([\s\S]*?)(?=\n##|$)/i);
      const acceptanceCriteria = acMatch ? acMatch[1].trim() : '';

      // Monta descrição para o Linear (markdown)
      const description = `${cardContent}\n\n---\n*Criado via Gigio Flow*`;

      // Mutation GraphQL
      const mutation = `
        mutation IssueCreate($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue {
              id
              identifier
              url
            }
          }
        }
      `;

      const variables = {
        input: {
          title,
          description,
          teamId: linearConfig.teamId,
          ...(storyPoints !== null ? { estimate: storyPoints } : {})
        }
      };

      const data = await linearGraphQL(mutation, variables);

      if (!data.issueCreate.success) {
        throw new Error('Linear retornou sucesso=false na criação da issue');
      }

      const { id: issueId, identifier, url: issueUrl } = data.issueCreate.issue;

      // Salva ID e URL no arquivo do card
      const linearFooter = `\n\n---\n\n## 🔗 Linear Issue\n\nLinear Issue: ${identifier} (${issueUrl})\nLinear ID: ${issueId}\n`;
      fs.appendFileSync(cardPath, linearFooter, 'utf8');

      res.json({ success: true, issueId, issueUrl });
    } catch (error) {
      console.error('[Linear] Erro ao criar issue:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ── POST /api/linear/webhook ──────────────────────────────────────────────
  router.post('/webhook', async (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const payload = req.body;

      // Validação básica de assinatura via header X-Linear-Signature (se configurado)
      const webhookSecret = process.env.LINEAR_WEBHOOK_SECRET;
      if (webhookSecret) {
        const signature = req.headers['x-linear-signature'];
        // Nota: em produção, use crypto.createHmac para validar a assinatura real
        if (!signature) {
          return res.status(401).json({ error: 'Assinatura de webhook ausente' });
        }
      }

      const { action, data: eventData, type } = payload;

      // Processa apenas updates de Issues
      if (type === 'Issue' && action === 'update') {
        const stateName = eventData?.state?.name;

        if (stateName === 'Done') {
          // Tenta encontrar o card que referencia esta issue
          const phases = ['propostas', 'pendentes', 'em-progresso'];
          let found = false;

          for (const phase of phases) {
            const phaseDir = path.join(workspaceDir, 'workflows', phase);
            if (!fs.existsSync(phaseDir)) continue;

            const files = fs.readdirSync(phaseDir).filter(f => f.endsWith('.md'));
            for (const file of files) {
              const filePath = safeWorkspacePath(workspaceDir, path.join(phaseDir, file));
              const content  = fs.readFileSync(filePath, 'utf8');

              if (content.includes(eventData.id)) {
                const cardTitleMatch = content.match(/^#\s+(.+)$/m);
                const cardTitle = cardTitleMatch ? cardTitleMatch[1].trim() : file.replace('.md', '');
                const resultText = `Issue Linear ${eventData.identifier || eventData.id} marcada como Done.`;
                const completedContent = content.includes('## Resultado')
                  ? content
                  : `${content}\n\n---\n\n## Resultado\n\n${resultText}\n`;

                // Move para concluidos
                const destDir  = path.join(workspaceDir, '.ai', 'history', 'concluidos');
                const destPath = safeWorkspacePath(workspaceDir, path.join(destDir, file));

                if (!fs.existsSync(destDir)) {
                  fs.mkdirSync(destDir, { recursive: true });
                }

                fs.writeFileSync(filePath, completedContent, 'utf8');
                fs.renameSync(filePath, destPath);
                appendCompletionLogs(workspaceDir, cardTitle, file, resultText, 'POST /api/linear/webhook');

                found = true;
                break;
              }
            }
            if (found) break;
          }
        }
      }

      res.json({ ok: true });
    } catch (error) {
      console.error('[Linear] Erro no webhook:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
