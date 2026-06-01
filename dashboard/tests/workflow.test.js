import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import request from 'supertest';
import { createWorkflowRouter } from '../routes/workflow.js';

// ─── Mocks ───────────────────────────────────────────────────────────────────
vi.mock('../services/llm.js', () => ({
  callLLM: vi.fn().mockResolvedValue('Mocked LLM Response'),
  buildSystemContext: vi.fn().mockReturnValue('Mocked System Context'),
  makeHttpsPost: vi.fn()
}));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_WORKSPACE = path.join(__dirname, 'tmp-workspace-workflow');

describe('Workflow Router (routes/workflow.js)', () => {
  let app;
  let state;

  beforeAll(() => {
    // 1. Cria a estrutura física temporária do workspace de testes
    const dirs = [
      path.join(TEMP_WORKSPACE, 'workflows', 'propostas'),
      path.join(TEMP_WORKSPACE, 'workflows', 'pendentes'),
      path.join(TEMP_WORKSPACE, 'workflows', 'em-progresso'),
      path.join(TEMP_WORKSPACE, '.ai', 'history', 'concluidos'),
      path.join(TEMP_WORKSPACE, '.ai', 'templates'),
      path.join(TEMP_WORKSPACE, '.ai', 'rules'),
      path.join(TEMP_WORKSPACE, 'knowledge'),
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // 2. Cria arquivos iniciais de knowledge mockados
    fs.writeFileSync(path.join(TEMP_WORKSPACE, 'knowledge', 'ESTADO_ATUAL.md'), '# Estado Atual\n\n', 'utf8');
    fs.writeFileSync(path.join(TEMP_WORKSPACE, 'knowledge', 'HISTORICO.md'), '# Historico\n\n', 'utf8');
    fs.writeFileSync(path.join(TEMP_WORKSPACE, '.ai', 'rules', 'safety-locks.md'), '# Safety Locks\n\n', 'utf8');

    // 3. Inicializa o Express App e o roteador
    state = { activeWorkspaceDir: TEMP_WORKSPACE };
    app = express();
    app.use(express.json());
    app.use('/api/workflow', createWorkflowRouter(state));
  });

  afterAll(() => {
    // Limpa a pasta temporária de testes
    if (fs.existsSync(TEMP_WORKSPACE)) {
      fs.rmSync(TEMP_WORKSPACE, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    // Limpa arquivos dos subdiretórios de workflows para ter testes isolados
    const cleanDir = (subPath) => {
      const p = path.join(TEMP_WORKSPACE, subPath);
      if (fs.existsSync(p)) {
        fs.readdirSync(p).forEach(f => {
          if (f.endsWith('.md')) fs.unlinkSync(path.join(p, f));
        });
      }
    };
    cleanDir('workflows/propostas');
    cleanDir('workflows/pendentes');
    cleanDir('workflows/em-progresso');
    cleanDir('.ai/history/concluidos');
  });

  describe('GET /api/workflow/board', () => {
    it('deve retornar as fases do Kanban vazias inicialmente', async () => {
      const res = await request(app).get('/api/workflow/board');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('propostas');
      expect(res.body.propostas.length).toBe(0);
      expect(res.body.pendentes.length).toBe(0);
    });

    it('deve retornar os cards criados nas fases corretas', async () => {
      // Cria um card físico diretamente
      fs.writeFileSync(
        path.join(TEMP_WORKSPACE, 'workflows', 'propostas', 'card1.md'),
        '# Card 1\n\n## Descrição\nEsta e a descricao 1.',
        'utf8'
      );

      const res = await request(app).get('/api/workflow/board');
      expect(res.statusCode).toBe(200);
      expect(res.body.propostas.length).toBe(1);
      expect(res.body.propostas[0].id).toBe('card1.md');
      expect(res.body.propostas[0].title).toBe('Card 1');
      expect(res.body.propostas[0].description).toBe('Esta e a descricao 1.');
    });
  });

  describe('POST /api/workflow/create-card', () => {
    it('deve criar um card fisico no disco na pasta correta', async () => {
      const res = await request(app)
        .post('/api/workflow/create-card')
        .send({
          title: 'Nova Feature de Teste',
          description: 'Descricao detalhada',
          phase: 'propostas',
          squadId: 'dev'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.fileName).toBe('nova-feature-de-teste.md');

      const fileCreated = path.join(TEMP_WORKSPACE, 'workflows', 'propostas', 'nova-feature-de-teste.md');
      expect(fs.existsSync(fileCreated)).toBe(true);

      const content = fs.readFileSync(fileCreated, 'utf8');
      expect(content).toContain('Nova Feature de Teste');
      expect(content).toContain('Descricao detalhada');
      expect(content).toContain('**Squad:** dev');
    });

    it('deve retornar erro 400 se title ou phase estiverem ausentes', async () => {
      const res = await request(app)
        .post('/api/workflow/create-card')
        .send({ description: 'Sem titulo' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/workflow/move', () => {
    it('deve mover fisicamente um card entre as pastas', async () => {
      const cardPath = path.join(TEMP_WORKSPACE, 'workflows', 'propostas', 'card-mover.md');
      fs.writeFileSync(cardPath, '# Card Mover\n\nDescricao', 'utf8');

      const res = await request(app)
        .post('/api/workflow/move')
        .send({
          cardId: 'card-mover.md',
          fromPhase: 'propostas',
          toPhase: 'pendentes'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(fs.existsSync(cardPath)).toBe(false);
      expect(fs.existsSync(path.join(TEMP_WORKSPACE, 'workflows', 'pendentes', 'card-mover.md'))).toBe(true);
    });
  });

  describe('POST /api/workflow/human-approve', () => {
    it('deve anexar aprovacao e avancar o card de fase no workspace', async () => {
      const cardPath = path.join(TEMP_WORKSPACE, 'workflows', 'pendentes', 'card-aprovado.md');
      fs.writeFileSync(cardPath, '# Card Aprovado\n\nDescricao', 'utf8');

      const res = await request(app)
        .post('/api/workflow/human-approve')
        .send({
          cardId: 'card-aprovado.md',
          phase: 'pendentes',
          approvalType: 'scope',
          approved: true,
          comment: 'Escopo aprovado pelo PM.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.movedTo).toBe('em-progresso');

      const finalPath = path.join(TEMP_WORKSPACE, 'workflows', 'em-progresso', 'card-aprovado.md');
      expect(fs.existsSync(finalPath)).toBe(true);

      const content = fs.readFileSync(finalPath, 'utf8');
      expect(content).toContain('## 👤 Aprovação de Escopo — ✅ APROVADO');
      expect(content).toContain('Escopo aprovado pelo PM.');
    });
  });

  describe('POST /api/workflow/complete', () => {
    it('deve mover o card para concluidos, adicionar resultado e atualizar os logs de knowledge', async () => {
      const cardPath = path.join(TEMP_WORKSPACE, 'workflows', 'em-progresso', 'card-concluir.md');
      fs.writeFileSync(cardPath, '# Card Concluir\n\nDescricao', 'utf8');

      const res = await request(app)
        .post('/api/workflow/workflow/complete') // Nota: na rota definimos router.post('/complete') montado em app.use('/api/workflow') -> rota real: /api/workflow/complete
        .send({
          cardId: 'card-concluir.md',
          phase: 'em-progresso',
          result: 'Todos os testes unitarios estao passando.'
        });

      // Se a rota for montada em /api/workflow/complete, fazemos a requisicao HTTP correta
      let testRes = await request(app)
        .post('/api/workflow/complete')
        .send({
          cardId: 'card-concluir.md',
          phase: 'em-progresso',
          result: 'Todos os testes unitarios estao passando.'
        });

      expect(testRes.statusCode).toBe(200);
      expect(testRes.body.success).toBe(true);
      expect(testRes.body.movedTo).toBe('concluidos');

      // Verifica no disco se o card foi para o historico de concluidos
      const destPath = path.join(TEMP_WORKSPACE, '.ai', 'history', 'concluidos', 'card-concluir.md');
      expect(fs.existsSync(destPath)).toBe(true);

      const content = fs.readFileSync(destPath, 'utf8');
      expect(content).toContain('## Resultado');
      expect(content).toContain('Todos os testes unitarios estao passando.');

      // Verifica se o ESTADO_ATUAL e HISTORICO foram atualizados
      const estadoAtual = fs.readFileSync(path.join(TEMP_WORKSPACE, 'knowledge', 'ESTADO_ATUAL.md'), 'utf8');
      expect(estadoAtual).toContain('card-concluir.md');
      expect(estadoAtual).toContain('Todos os testes unitarios estao passando.');

      const historico = fs.readFileSync(path.join(TEMP_WORKSPACE, 'knowledge', 'HISTORICO.md'), 'utf8');
      expect(historico).toContain('card-concluir.md concluido');
    });
  });

  describe('Interacoes de IA (Refinement, Estimation & QA)', () => {
    let cardPath;

    beforeEach(() => {
      cardPath = path.join(TEMP_WORKSPACE, 'workflows', 'propostas', 'card-ia.md');
      fs.writeFileSync(cardPath, '# Card IA\n\nDescricao', 'utf8');
    });

    it('POST /api/workflow/refine - deve anexar refinamento gerado por IA no card', async () => {
      const res = await request(app)
        .post('/api/workflow/refine')
        .send({
          cardId: 'card-ia.md',
          phase: 'propostas',
          apiKey: 'fake-api-key',
          provider: 'gemini'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.refinedContent).toBe('Mocked LLM Response');

      const content = fs.readFileSync(cardPath, 'utf8');
      expect(content).toContain('## 🔧 Refinamento LLM');
      expect(content).toContain('Mocked LLM Response');
    });

    it('POST /api/workflow/estimate - deve parsear resposta JSON e anexar tabela de complexidade', async () => {
      const { callLLM } = await import('../services/llm.js');
      // Mock da resposta do callLLM especifico para retornar JSON valido
      callLLM.mockResolvedValueOnce(JSON.stringify({
        storyPoints: 5,
        complexity: 'Média',
        squadsNeeded: ['dev', 'qa'],
        estimatedFiles: 3,
        regressionRisk: 'Baixo',
        sessions: '1-2',
        blockers: ['Aguardando Linear API'],
        rationale: 'Racional da complexidade'
      }));

      const res = await request(app)
        .post('/api/workflow/estimate')
        .send({
          cardId: 'card-ia.md',
          phase: 'propostas',
          apiKey: 'fake-api-key'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.estimate.storyPoints).toBe(5);

      const content = fs.readFileSync(cardPath, 'utf8');
      expect(content).toContain('## ⚖️ Estimativa de Complexidade');
      expect(content).toContain('**Story Points** | 5');
      expect(content).toContain('Aguardando Linear API');
      expect(content).toContain('Racional da complexidade');
    });

    it('POST /api/workflow/qa-review - deve gerar relatorio de QA', async () => {
      const { callLLM } = await import('../services/llm.js');
      callLLM.mockResolvedValueOnce('QA review mock text with APROVADO status.');

      const res = await request(app)
        .post('/api/workflow/qa-review')
        .send({
          cardId: 'card-ia.md',
          phase: 'propostas',
          apiKey: 'fake-api-key'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.verdict).toBe('APROVADO');

      const content = fs.readFileSync(cardPath, 'utf8');
      expect(content).toContain('## 🧪 Relatório de QA Técnico');
      expect(content).toContain('**Veredito:** APROVADO');
      expect(content).toContain('QA review mock text');
    });
  });
});
