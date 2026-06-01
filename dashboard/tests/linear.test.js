import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import request from 'supertest';
import { createLinearRouter } from '../routes/linear.js';

// ─── Mocks ───────────────────────────────────────────────────────────────────
vi.mock('../services/llm.js', () => ({
  makeHttpsPost: vi.fn().mockImplementation((url, headers, body) => {
    // Intercepta chamadas a API GraphQL do Linear e retorna dados consistentes
    if (url.includes('graphql')) {
      const query = body.query;
      if (query.includes('viewer')) {
        return Promise.resolve({
          statusCode: 200,
          body: JSON.stringify({
            data: {
              viewer: {
                id: 'usr-456',
                name: 'Gigio Flow AI Partner'
              }
            }
          })
        });
      }
      if (query.includes('IssueCreate')) {
        return Promise.resolve({
          statusCode: 200,
          body: JSON.stringify({
            data: {
              issueCreate: {
                success: true,
                issue: {
                  id: 'iss-999',
                  identifier: 'GF-42',
                  url: 'https://linear.app/issue/GF-42'
                }
              }
            }
          })
        });
      }
    }
    return Promise.resolve({ statusCode: 404, body: 'Not Found' });
  }),
  buildSystemContext: vi.fn()
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_WORKSPACE = path.join(__dirname, 'tmp-workspace-linear');

describe('Linear Router (routes/linear.js)', () => {
  let app;
  let state;

  beforeAll(() => {
    // 1. Cria a estrutura física temporária do workspace
    const dirs = [
      path.join(TEMP_WORKSPACE, 'workflows', 'em-progresso'),
      path.join(TEMP_WORKSPACE, '.ai', 'history', 'concluidos'),
      path.join(TEMP_WORKSPACE, 'knowledge'),
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // 2. Inicializa arquivos de knowledge
    fs.writeFileSync(path.join(TEMP_WORKSPACE, 'knowledge', 'ESTADO_ATUAL.md'), '# Estado Atual\n\n', 'utf8');
    fs.writeFileSync(path.join(TEMP_WORKSPACE, 'knowledge', 'HISTORICO.md'), '# Historico\n\n', 'utf8');

    // 3. Monta o app Express
    state = { activeWorkspaceDir: TEMP_WORKSPACE };
    app = express();
    app.use(express.json());
    app.use('/api/linear', createLinearRouter(state));
  });

  afterAll(() => {
    // Remove workspace temporario
    if (fs.existsSync(TEMP_WORKSPACE)) {
      fs.rmSync(TEMP_WORKSPACE, { recursive: true, force: true });
    }
    
    // Remove o arquivo de configuracao linear gerado pelos testes
    const configFile = path.join(__dirname, '..', 'linear-config.json');
    if (fs.existsSync(configFile)) {
      fs.unlinkSync(configFile);
    }
  });

  beforeEach(() => {
    // Limpa os cards de teste a cada execucao
    const cleanDir = (subPath) => {
      const p = path.join(TEMP_WORKSPACE, subPath);
      if (fs.existsSync(p)) {
        fs.readdirSync(p).forEach(f => {
          if (f.endsWith('.md')) fs.unlinkSync(path.join(p, f));
        });
      }
    };
    cleanDir('workflows/em-progresso');
    cleanDir('.ai/history/concluidos');
  });

  describe('GET e POST /api/linear/settings', () => {
    it('deve retornar que a conexao nao esta configurada inicialmente', async () => {
      const res = await request(app).get('/api/linear/settings');
      expect(res.statusCode).toBe(200);
      expect(res.body.connected).toBe(false);
      expect(res.body.apiKey).toBe(false);
    });

    it('deve salvar as configuracoes e testar conexao com sucesso', async () => {
      const res = await request(app)
        .post('/api/linear/settings')
        .send({
          apiKey: 'fake-api-key-test',
          teamId: 'team-abc-123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.connected).toBe(true);

      const statusRes = await request(app).get('/api/linear/settings');
      expect(statusRes.body.connected).toBe(true);
      expect(statusRes.body.apiKey).toBe(true); // Mascarado (true se configurado)
      expect(statusRes.body.teamId).toBe('team-abc-123');
    });

    it('deve retornar 400 se apiKey ou teamId forem ausentes', async () => {
      const res = await request(app)
        .post('/api/linear/settings')
        .send({ teamId: 'so-team' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/linear/create-issue', () => {
    it('deve extrair dados do card, chamar GraphQL e apensar a issue no Markdown', async () => {
      // 1. Cria o card fisico de teste
      const cardPath = path.join(TEMP_WORKSPACE, 'workflows', 'em-progresso', 'card-linear.md');
      fs.writeFileSync(
        cardPath,
        `# Card Linear Teste
        
## Descrição
Esta e uma tarefa a ser vinculada ao Linear.

## 🎯 Critérios de Aceite
- [ ] Critério 1
`,
        'utf8'
      );

      // 2. Cria a issue chamando o endpoint
      const res = await request(app)
        .post('/api/linear/create-issue')
        .send({
          cardId: 'card-linear.md',
          phase: 'em-progresso'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.issueId).toBe('iss-999');
      expect(res.body.issueUrl).toBe('https://linear.app/issue/GF-42');

      // 3. Valida se o card fisico recebeu a issue do Linear no rodapé
      const cardContent = fs.readFileSync(cardPath, 'utf8');
      expect(cardContent).toContain('## 🔗 Linear Issue');
      expect(cardContent).toContain('Linear Issue: GF-42 (https://linear.app/issue/GF-42)');
      expect(cardContent).toContain('Linear ID: iss-999');
    });
  });

  describe('POST /api/linear/webhook', () => {
    it('deve capturar webhook do estado Done, mover card para concluidos e atualizar base de conhecimento', async () => {
      // 1. Cria um card na fase de em-progresso contendo o ID da issue do Linear
      const cardPath = path.join(TEMP_WORKSPACE, 'workflows', 'em-progresso', 'card-webhook.md');
      fs.writeFileSync(
        cardPath,
        `# Card Webhook Teste
        
Este card esta ativo.
Linear ID: iss-999
`,
        'utf8'
      );

      // 2. Dispara a chamada simulada do webhook do Linear indicando estado Done
      const res = await request(app)
        .post('/api/linear/webhook')
        .send({
          action: 'update',
          type: 'Issue',
          data: {
            id: 'iss-999',
            identifier: 'GF-42',
            state: {
              name: 'Done'
            }
          }
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);

      // 3. O card original em em-progresso deve ter sido movido
      expect(fs.existsSync(cardPath)).toBe(false);

      // 4. O card deve existir fisicamente na pasta de concluidos
      const destPath = path.join(TEMP_WORKSPACE, '.ai', 'history', 'concluidos', 'card-webhook.md');
      expect(fs.existsSync(destPath)).toBe(true);

      const content = fs.readFileSync(destPath, 'utf8');
      expect(content).toContain('## Resultado');
      expect(content).toContain('Issue Linear GF-42 marcada como Done.');

      // 5. Verifica se o ESTADO_ATUAL e HISTORICO foram devidamente atualizados
      const estadoAtual = fs.readFileSync(path.join(TEMP_WORKSPACE, 'knowledge', 'ESTADO_ATUAL.md'), 'utf8');
      expect(estadoAtual).toContain('card-webhook.md');
      expect(estadoAtual).toContain('Issue Linear GF-42 marcada como Done.');

      const historico = fs.readFileSync(path.join(TEMP_WORKSPACE, 'knowledge', 'HISTORICO.md'), 'utf8');
      expect(historico).toContain('card-webhook.md concluido via Linear');
    });
  });
});
