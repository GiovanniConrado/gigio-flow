/**
 * routes/projects.js
 * Rotas de gerenciamento de projetos/workspaces:
 *   GET  /api/projects
 *   POST /api/projects/add
 *   POST /api/projects/select
 *   DELETE /api/projects
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fileExists, copyFolderSync } from '../services/files.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECTS_FILE = path.join(__dirname, '..', 'projects.json');
const DEFAULT_WORKSPACE_DIR = path.resolve(__dirname, '..', '..');

/**
 * Carrega a lista de projetos do arquivo JSON.
 * @returns {Array}
 */
function loadProjects() {
  try {
    if (!fileExists(PROJECTS_FILE)) {
      const initial = [
        {
          id: 'default',
          name: 'Gigio Flow (Atual)',
          path: DEFAULT_WORKSPACE_DIR,
          active: true
        }
      ];
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8'));
  } catch (error) {
    console.error('Erro ao carregar projetos:', error);
    return [];
  }
}

/**
 * Salva a lista de projetos no arquivo JSON.
 * @param {Array} projects
 */
function saveProjects(projects) {
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf8');
  } catch (error) {
    console.error('Erro ao salvar projetos:', error);
  }
}

/**
 * Cria o router de projetos.
 * @param {Object} state - Objeto de estado compartilhado com { activeWorkspaceDir, setActiveWorkspaceDir }
 * @returns {express.Router}
 */
export function createProjectsRouter(state) {
  const router = express.Router();

  // GET /api/projects — lista todos os projetos
  router.get('/', (req, res) => {
    try {
      const list = loadProjects();
      const validated = list.map(p => ({
        ...p,
        exists: fileExists(p.path),
        active: p.path === state.activeWorkspaceDir
      }));
      res.json(validated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/projects/add — adiciona e ativa um projeto
  router.post('/add', (req, res) => {
    try {
      const { name, folderPath, shouldCloneTemplate } = req.body;

      if (!name || !folderPath) {
        return res.status(400).json({ error: 'Nome e caminho absoluto são obrigatórios' });
      }

      const resolvedPath = path.resolve(folderPath);

      if (!fs.existsSync(resolvedPath)) {
        fs.mkdirSync(resolvedPath, { recursive: true });
      }

      if (shouldCloneTemplate) {
        copyFolderSync(DEFAULT_WORKSPACE_DIR, resolvedPath);
        const destDashboard = path.join(resolvedPath, 'dashboard');
        if (fs.existsSync(destDashboard)) {
          fs.rmSync(destDashboard, { recursive: true, force: true });
        }
      }

      const projectsList = loadProjects();
      const existingIndex = projectsList.findIndex(p => p.path === resolvedPath);
      projectsList.forEach(p => p.active = false);

      if (existingIndex > -1) {
        projectsList[existingIndex].active = true;
      } else {
        projectsList.push({
          id: 'proj-' + Date.now(),
          name,
          path: resolvedPath,
          active: true
        });
      }

      saveProjects(projectsList);
      state.activeWorkspaceDir = resolvedPath;

      res.json({ success: true, message: 'Projeto ativado!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/projects/select — seleciona workspace ativo
  router.post('/select', (req, res) => {
    try {
      const { path: selectPath } = req.body;

      if (!selectPath || !fileExists(selectPath)) {
        return res.status(404).json({ error: 'Caminho não existe' });
      }

      const projectsList = loadProjects();
      projectsList.forEach(p => {
        p.active = p.path === selectPath;
      });

      saveProjects(projectsList);
      state.activeWorkspaceDir = selectPath;

      res.json({ success: true, message: `Workspace alterado para: ${selectPath}` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // DELETE /api/projects — remove um projeto da lista
  router.delete('/', (req, res) => {
    try {
      const { path: deletePath } = req.body;
      const projectsList = loadProjects();
      const filtered = projectsList.filter(p => p.path !== deletePath);

      if (deletePath === state.activeWorkspaceDir) {
        filtered.forEach(p => p.active = p.path === DEFAULT_WORKSPACE_DIR);
        state.activeWorkspaceDir = DEFAULT_WORKSPACE_DIR;
      }

      saveProjects(filtered);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

export { loadProjects, saveProjects, DEFAULT_WORKSPACE_DIR };
