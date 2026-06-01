/**
 * server.js — Gigio Flow Backend V5
 *
 * Servidor Express modular:
 *  - CORS restrito a origens locais conhecidas
 *  - Rate limiting nas rotas LLM
 *  - Estado compartilhado (activeWorkspaceDir) via objeto mutável injetado nos routers
 *  - Rotas organizadas em módulos: projects, system, workflow, linear
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { createProjectsRouter, loadProjects, DEFAULT_WORKSPACE_DIR } from './routes/projects.js';
import { createSystemRouter }   from './routes/system.js';
import { createWorkflowRouter } from './routes/workflow.js';
import { createLinearRouter }   from './routes/linear.js';
import { fileExists }           from './services/files.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Estado compartilhado ────────────────────────────────────────────────────
// Objeto mutável passado por referência para todos os routers.
// Isso evita variáveis globais soltas e permite que cada router
// leia e escreva activeWorkspaceDir de forma coerente.

const state = {
  activeWorkspaceDir: DEFAULT_WORKSPACE_DIR
};

// Inicializa o workspace ativo com base no projeto marcado como active
const projects     = loadProjects();
const activeProject = projects.find(p => p.active);
if (activeProject && fileExists(activeProject.path)) {
  state.activeWorkspaceDir = activeProject.path;
}

// ─── App ─────────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── Body Parser ─────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Rate Limiting (rotas LLM custosas) ──────────────────────────────────────
const llmRateLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minuto
  max: 10,               // máximo 10 requisições por janela
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições para a LLM. Aguarde 1 minuto e tente novamente.' }
});

app.use('/api/workflow/refine',           llmRateLimiter);
app.use('/api/workflow/estimate',         llmRateLimiter);
app.use('/api/workflow/qa-review',        llmRateLimiter);
app.use('/api/workflow/approve-ceo-real', llmRateLimiter);

// ─── Routers ──────────────────────────────────────────────────────────────────
app.use('/api/projects',  createProjectsRouter(state));
app.use('/api',           createSystemRouter(state));    // monta /api/project/* e /api/system/*
app.use('/api/workflow',  createWorkflowRouter(state));
app.use('/api/linear',    createLinearRouter(state));

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    version: 'V5',
    activeWorkspaceDir: state.activeWorkspaceDir,
    timestamp: new Date().toISOString()
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Gigio Flow Backend V5] Servidor rodando em http://localhost:${PORT}`);
  console.log(`[Gigio Flow Backend V5] Workspace ativo: ${state.activeWorkspaceDir}`);
});
