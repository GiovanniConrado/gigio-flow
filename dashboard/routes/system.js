/**
 * routes/system.js
 * Rotas de status e diagnóstico do sistema:
 *   GET  /api/project/status
 *   POST /api/project/initialize
 *   POST /api/project/apply-template
 *   POST /api/project/apply-example
 *   GET  /api/system/check
 *   POST /api/system/fix-placeholder
 */

import express from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileExists, readFile, writeFile } from '../services/files.js';
import { loadProjects, saveProjects } from './projects.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function checkCommand(cmd) {
  return new Promise((resolve) => {
    exec(cmd, (err, stdout) => {
      if (err) {
        resolve({ installed: false, version: 'Não encontrado' });
      } else {
        const ver = stdout.trim().split('\n')[0] || 'Instalado';
        resolve({ installed: true, version: ver });
      }
    });
  });
}

function parseVisaoFile(workspaceDir) {
  const content = readFile(workspaceDir, 'knowledge', 'VISAO.md');
  if (!content) return null;

  let projectName = 'Meu Projeto';
  const nameMatch = content.match(/# (?:Visão do Produto e Modelo de Negócio|Visão do Produto) —? (.*)/i);
  if (nameMatch && nameMatch[1]) projectName = nameMatch[1].trim();

  const extractBullet = (label) => {
    const regex = new RegExp(`\\*\\*${label}:?\\*\\*\\s*(.*)`, 'i');
    const match = content.match(regex);
    return match && match[1] ? match[1].trim() : '';
  };

  const mission        = extractBullet('A Missão');
  const customerPain   = extractBullet('A Dor do Cliente a Curar');
  const proposedSolution = extractBullet('A Solução Proposta');
  const targetAudience = extractBullet('Público-Alvo Primário');
  const monetization   = extractBullet('Estratégia de Monetização');
  const acquisition    = extractBullet('Canais de Aquisição');

  const isTemplate =
    projectName.includes('{{NOME_DO_PROJETO}}') ||
    mission.includes('[Descreva') ||
    customerPain.includes('[Qual') ||
    content.includes('{{NOME_DO_PROJETO}}');

  return { projectName, mission, customerPain, proposedSolution, targetAudience, monetization, acquisition, isTemplate };
}

function parseArquiteturaFile(workspaceDir) {
  const content = readFile(workspaceDir, 'knowledge', 'ARQUITETURA.md');
  if (!content) return null;

  const extractTableValue = (label) => {
    const regex = new RegExp(`\\|\\s*\\*\\*${label}\\*\\*\\s*\\|\\s*(.*?)\\s*\\|`, 'i');
    const match = content.match(regex);
    return match && match[1] ? match[1].trim() : '';
  };

  const frontend    = extractTableValue('Frontend / Cliente');
  const backend     = extractTableValue('Backend / API');
  const database    = extractTableValue('Banco de Dados');
  const thirdParty  = extractTableValue('Serviços de Terceiros');
  const isTemplate  = content.includes('[Ex: Next.js') || content.includes('{{NOME_DO_PROJETO}}');

  return { frontend, backend, database, thirdParty, isTemplate };
}

function getSquadsList(workspaceDir) {
  const squadsDir = path.join(workspaceDir, '.ai', 'squads');
  if (!fs.existsSync(squadsDir)) return [];

  return fs.readdirSync(squadsDir)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const filePath = path.join(squadsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      let title = file.replace('.md', '').toUpperCase();
      const titleMatch = content.match(/# (.*)/);
      if (titleMatch && titleMatch[1]) title = titleMatch[1].split('—')[0].trim();

      let description = '';
      const descMatch = content.match(/## 👔 Sua Identidade e Missão\s*\n*(.*?)\n/i);
      if (descMatch && descMatch[1]) {
        description = descMatch[1].trim();
      } else {
        const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('>'));
        if (lines.length > 0) description = lines[0];
      }

      const statusMatch = content.match(/Status:\s*(Ativo|Inativo)/i);
      const isActive = statusMatch ? statusMatch[1].toLowerCase() === 'ativo' : true;

      return { id: file.replace('.md', ''), name: title, description, isActive, rawContent: content };
    });
}

// ─── Router Factory ──────────────────────────────────────────────────────────

export function createSystemRouter(state) {
  const router = express.Router();

  // GET /api/project/status
  router.get('/project/status', (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const visao  = parseVisaoFile(workspaceDir);
      const arqui  = parseArquiteturaFile(workspaceDir);
      const squads = getSquadsList(workspaceDir);

      const initialized = visao && !visao.isTemplate && arqui && !arqui.isTemplate;

      let approvals = { ceoApproval: true, pmApproval: true, ctoApproval: false };
      const safetyLocksContent = readFile(workspaceDir, '.ai/rules', 'safety-locks.md');
      if (safetyLocksContent) {
        approvals.ceoApproval = !safetyLocksContent.includes('CEO_APPROVAL: FALSE') && !safetyLocksContent.includes('CEO_APPROVAL: false');
        approvals.pmApproval  = !safetyLocksContent.includes('PM_APPROVAL: FALSE')  && !safetyLocksContent.includes('PM_APPROVAL: false');
        approvals.ctoApproval = safetyLocksContent.includes('CTO_APPROVAL: TRUE')   || safetyLocksContent.includes('CTO_APPROVAL: true');
      }

      res.json({
        initialized,
        activePath: workspaceDir,
        project: visao ? {
          name: visao.projectName,
          mission: visao.mission,
          customerPain: visao.customerPain,
          proposedSolution: visao.proposedSolution,
          targetAudience: visao.targetAudience,
          monetization: visao.monetization,
          acquisition: visao.acquisition
        } : null,
        architecture: arqui ? {
          frontend: arqui.frontend,
          backend: arqui.backend,
          database: arqui.database,
          thirdParty: arqui.thirdParty
        } : null,
        squads,
        approvals
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/project/initialize
  router.post('/project/initialize', (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { project, architecture, squads, approvals } = req.body;

      if (!project || !project.name) {
        return res.status(400).json({ error: 'Nome do projeto é obrigatório' });
      }

      // VISAO.md
      let visaoTemplate = readFile(workspaceDir, 'knowledge', 'VISAO.md');
      if (!visaoTemplate || visaoTemplate.includes('{{NOME_DO_PROJETO}}') || visaoTemplate.includes('[Descreva')) {
        visaoTemplate = `# Visão do Produto e Modelo de Negócio — ${project.name}

> Este arquivo é a fonte da verdade sobre o propósito do negócio. O PM Agent e o CEO Agent o utilizam para garantir o alinhamento de novos recursos com a estratégia da empresa.

---

## 🎯 1. Declaração de Missão e Propósito

-   **A Missão:** ${project.mission || ''}
-   **A Dor do Cliente a Curar:** ${project.customerPain || ''}
-   **A Solução Proposta:** ${project.proposedSolution || ''}

---

## 📊 2. Modelo de Negócios e Monetização

-   **Público-Alvo Primário:** ${project.targetAudience || ''}
-   **Estratégia de Monetização:** ${project.monetization || ''}
-   **Canais de Aquisição:** ${project.acquisition || ''}

---

## 🛡️ 3. Valores Inegociáveis do Produto

1.  **Simplicidade Extrema:** A interface deve ser limpa e direta, exigindo o mínimo de esforço mental e cliques do cliente.
2.  **Segurança e Confiança:** Os dados dos clientes são sagrados. Nenhuma vulnerabilidade ou vazamento é tolerável.
3.  **Foco em Resultados:** O produto deve ajudar o cliente a resolver sua dor rapidamente, sem distrações visuais ou fluxos longos de onboarding.
`;
      } else {
        visaoTemplate = visaoTemplate
          .replace(/# Visão do Produto e Modelo de Negócio — .*/, `# Visão do Produto e Modelo de Negócio — ${project.name}`)
          .replace(/\*\*A Missão:\*\*.*/, `**A Missão:** ${project.mission}`)
          .replace(/\*\*A Dor do Cliente a Curar:\*\*.*/, `**A Dor do Cliente a Curar:** ${project.customerPain}`)
          .replace(/\*\*A Solução Proposta:\*\*.*/, `**A Solução Proposta:** ${project.proposedSolution}`)
          .replace(/\*\*Público-Alvo Primário:\*\*.*/, `**Público-Alvo Primário:** ${project.targetAudience}`)
          .replace(/\*\*Estratégia de Monetização:\*\*.*/, `**Estratégia de Monetização:** ${project.monetization}`)
          .replace(/\*\*Canais de Aquisição:\*\*.*/, `**Canais de Aquisição:** ${project.acquisition}`);
      }
      writeFile(workspaceDir, 'knowledge', 'VISAO.md', visaoTemplate);

      // ARQUITETURA.md
      let arquiTemplate = readFile(workspaceDir, 'knowledge', 'ARQUITETURA.md');
      if (!arquiTemplate || arquiTemplate.includes('{{NOME_DO_PROJETO}}') || arquiTemplate.includes('[Ex: Next.js')) {
        arquiTemplate = `# Arquitetura Técnica do Sistema — ${project.name}

> Este arquivo é o manual técnico oficial da infraestrutura. O CTO Agent e o Dev Agent o consultam e o mantêm atualizado a cada evolução na stack.

---

## 🛠️ 1. Visão Geral da Stack Tecnológica

| Camada | Tecnologia Selecionada | Papel no Sistema |
| :--- | :--- | :--- |
| **Frontend / Cliente** | ${architecture.frontend || ''} | Interface do usuário e lógica local de navegação. |
| **Backend / API** | ${architecture.backend || ''} | Regras de negócio centralizadas, autenticação e rotas. |
| **Banco de Dados** | ${architecture.database || ''} | Armazenamento relacional e integridade de dados. |
| **Serviços de Terceiros**| ${architecture.thirdParty || ''} | Gateway de pagamentos e monitoramento de logs. |

---

## 🌐 2. Fluxo e Integração de Dados

\`\`\`mermaid
graph TD
    A[App Mobile / Web] -->|Chamadas HTTPS / REST| B(API Gateway / Backend)
    B -->|Consultas SQL / ORM| C[(Banco de Dados Relacional)]
    B -->|Integração de Webhooks| D[Gateway de Pagamentos]
    A -->|Rastreamento Anônimo| E[Analytics / PostHog]
\`\`\`

---

## 🔒 3. Políticas de Segurança e Controle de Acesso

-   **Autenticação:** Baseada em tokens JWT expiráveis com renovação segura.
-   **Segurança de Banco de Dados:** Uso obrigatório de políticas de Row Level Security (RLS) para garantir que cada usuário tenha acesso estrito apenas aos seus próprios registros cadastrados.
-   **Comunicação:** Todas as chamadas de API trafegam obrigatoriamente sob criptografia HTTPS (TLS 1.3).

---

## 🚀 4. Ambientes e Pipelines de Deploy

-   **Desenvolvimento:** Ambiente local de teste em sandbox de banco de dados.
-   **Staging:** Deploy automático em ambiente de homologação a cada Pull Request aberto na branch de desenvolvimento.
-   **Produção:** Deploy manual ou automático na branch principal após validação estrita do QA e aprovação humana.
`;
      } else {
        arquiTemplate = arquiTemplate
          .replace(/# Arquitetura Técnica do Sistema — .*/, `# Arquitetura Técnica do Sistema — ${project.name}`)
          .replace(/(\|\s*\*\*Frontend \/ Cliente\*\*\s*\|)\s*.*?\s*(\|)/, `$1 ${architecture.frontend} $2`)
          .replace(/(\|\s*\*\*Backend \/ API\*\*\s*\|)\s*.*?\s*(\|)/, `$1 ${architecture.backend} $2`)
          .replace(/(\|\s*\*\*Banco de Dados\*\*\s*\|)\s*.*?\s*(\|)/, `$1 ${architecture.database} $2`)
          .replace(/(\|\s*\*\*Serviços de Terceiros\*\*\s*\|)\s*.*?\s*(\|)/, `$1 ${architecture.thirdParty} $2`);
      }
      writeFile(workspaceDir, 'knowledge', 'ARQUITETURA.md', arquiTemplate);

      // safety-locks.md
      if (approvals) {
        let safetyLocks = readFile(workspaceDir, '.ai/rules', 'safety-locks.md');
        if (safetyLocks) {
          safetyLocks = safetyLocks
            .replace(/CEO_APPROVAL:\s*(true|false)/gi, `CEO_APPROVAL: ${approvals.ceoApproval ? 'TRUE' : 'FALSE'}`)
            .replace(/PM_APPROVAL:\s*(true|false)/gi,  `PM_APPROVAL: ${approvals.pmApproval ? 'TRUE' : 'FALSE'}`)
            .replace(/CTO_APPROVAL:\s*(true|false)/gi, `CTO_APPROVAL: ${approvals.ctoApproval ? 'TRUE' : 'FALSE'}`);
          writeFile(workspaceDir, '.ai/rules', 'safety-locks.md', safetyLocks);
        }
      }

      // Substituir {{NOME_DO_PROJETO}} em todos os arquivos relevantes
      const replaceInFile = (dir, file) => {
        let content = readFile(workspaceDir, dir, file);
        if (content) {
          content = content.replace(/\{\{NOME_DO_PROJETO\}\}/g, project.name);
          writeFile(workspaceDir, dir, file, content);
        }
      };

      replaceInFile('', 'CLAUDE.md');
      replaceInFile('knowledge', 'ESTADO_ATUAL.md');
      replaceInFile('knowledge', 'ROADMAP.md');
      replaceInFile('knowledge', 'HISTORICO.md');
      replaceInFile('knowledge', 'GLOSSARIO.md');
      replaceInFile('knowledge', 'DESIGN_SYSTEM.md');

      if (squads && Array.isArray(squads)) {
        squads.forEach(s => {
          let content = readFile(workspaceDir, '.ai/squads', `${s.id}.md`);
          if (content) {
            if (content.includes('Status:')) {
              content = content.replace(/Status:\s*(Ativo|Inativo)/i, `Status: ${s.isActive ? 'Ativo' : 'Inativo'}`);
            } else {
              content = content.replace(/(# .*\n)/, `$1Status: ${s.isActive ? 'Ativo' : 'Inativo'}\n`);
            }
            content = content.replace(/\{\{NOME_DO_PROJETO\}\}/g, project.name);
            if (s.customRules) {
              if (content.includes('## 🔮 Diretrizes Customizadas')) {
                content = content.replace(/## 🔮 Diretrizes Customizadas\n[\s\S]*/, `## 🔮 Diretrizes Customizadas\n\n${s.customRules}`);
              } else {
                content += `\n\n---\n\n## 🔮 Diretrizes Customizadas\n\n${s.customRules}\n`;
              }
            }
            writeFile(workspaceDir, '.ai/squads', `${s.id}.md`, content);
          }
        });
      }

      res.json({ success: true, message: 'Customizado com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/project/apply-template
  router.post('/project/apply-template', (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { templateType } = req.body;

      if (!templateType) {
        return res.status(400).json({ error: 'Tipo do template é obrigatório' });
      }

      const squadsDir = path.join(workspaceDir, '.ai', 'squads');
      if (!fs.existsSync(squadsDir)) {
        return res.status(404).json({ error: 'Diretório .ai/squads não encontrado no projeto ativo.' });
      }

      let activeSquadIds = [];
      let presetBehavior = 'Speedrun';
      let approvals = { ceoApproval: false, pmApproval: false, ctoApproval: false };
      let presetRules = '';

      if (templateType === 'lean') {
        activeSquadIds = ['ceo', 'pm', 'dev'];
        presetBehavior = 'Speedrun';
        approvals = { ceoApproval: true, pmApproval: false, ctoApproval: false };
        presetRules = `Modo Speedrun ativado.\n- Foque em MVPs enxutos com o mínimo de código viável para validação imediata.\n- Evite otimizações arquiteturais complexas. Use o princípio de Pareto (80/20).`;
      } else if (templateType === 'enterprise') {
        activeSquadIds = ['ceo', 'pm', 'cto', 'dev', 'qa', 'process-analyst'];
        presetBehavior = 'Enterprise';
        approvals = { ceoApproval: true, pmApproval: true, ctoApproval: true };
        presetRules = `Modo Enterprise ativo.\n- Foque em documentações densas cobrindo acessibilidade (WCAG), segurança de banco de dados, tratamento de erros resiliente e compliance.\n- Escreva testes unitários rigorosos e use estritamente os padrões de design de DESIGN_SYSTEM.md.`;
      } else if (templateType === 'tech') {
        activeSquadIds = ['cto', 'dev', 'qa'];
        presetBehavior = 'Speedrun';
        approvals = { ceoApproval: false, pmApproval: false, ctoApproval: false };
        presetRules = `Modo Técnico Speedrun ativo.\n- Focado na iteração bruta de backend, refinamento de APIs e performance de consultas.\n- Corte burocracias de especificação funcional e UX.`;
      }

      const files = fs.readdirSync(squadsDir);
      files.filter(f => f.endsWith('.md')).forEach(file => {
        const id = file.replace('.md', '');
        const isActive = activeSquadIds.includes(id);
        const filePath = path.join(squadsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        if (content.includes('Status:')) {
          content = content.replace(/Status:\s*(Ativo|Inativo)/i, `Status: ${isActive ? 'Ativo' : 'Inativo'}`);
        } else {
          content = content.replace(/(# .*\n)/, `$1Status: ${isActive ? 'Ativo' : 'Inativo'}\n`);
        }

        if (isActive) {
          if (content.includes('## 🔮 Diretrizes Customizadas')) {
            content = content.replace(/## 🔮 Diretrizes Customizadas\n[\s\S]*/, `## 🔮 Diretrizes Customizadas\n\n${presetRules}`);
          } else {
            content += `\n\n---\n\n## 🔮 Diretrizes Customizadas\n\n${presetRules}\n`;
          }
        }

        fs.writeFileSync(filePath, content, 'utf8');
      });

      let safetyLocks = readFile(workspaceDir, '.ai/rules', 'safety-locks.md');
      if (safetyLocks) {
        safetyLocks = safetyLocks
          .replace(/CEO_APPROVAL:\s*(true|false)/gi, `CEO_APPROVAL: ${approvals.ceoApproval ? 'TRUE' : 'FALSE'}`)
          .replace(/PM_APPROVAL:\s*(true|false)/gi,  `PM_APPROVAL: ${approvals.pmApproval ? 'TRUE' : 'FALSE'}`)
          .replace(/CTO_APPROVAL:\s*(true|false)/gi, `CTO_APPROVAL: ${approvals.ctoApproval ? 'TRUE' : 'FALSE'}`);
        writeFile(workspaceDir, '.ai/rules', 'safety-locks.md', safetyLocks);
      }

      res.json({ success: true, message: `Template "${templateType.toUpperCase()}" aplicado com sucesso fisicamente no Workspace!` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/project/apply-example
  router.post('/project/apply-example', (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { exampleId } = req.body;
      if (!exampleId) {
        return res.status(400).json({ error: 'Exemplo ID é obrigatório' });
      }

      let project = {};
      let architecture = {};
      let activeSquadIds = [];
      let approvals = { ceoApproval: false, pmApproval: false, ctoApproval: false };
      let presetRules = '';

      if (exampleId === 'lanchonete') {
        project = {
          name: 'Gigio Lanches Delivery',
          mission: 'Entregar lanches gourmet quentes em menos de 25 minutos na região central, eliminando atritos de pedido.',
          customerPain: 'Lentidão e complexidade nos apps de delivery tradicionais que cobram taxas abusivas.',
          proposedSolution: 'Web app progressivo ultra-rápido de lanches com checkout em 1 clique.',
          targetAudience: 'Jovens profissionais e estudantes famintos com pressa.',
          monetization: 'Margem direta nos lanches gourmet + taxa de entrega dinâmica baseada na pressa do cliente.',
          acquisition: 'Anúncios de tráfego pago geolocalizados no Instagram das 18h às 23h + parcerias universitárias.'
        };
        architecture = {
          frontend: 'Next.js 14 (App Router) + Tailwind CSS',
          backend: 'Supabase Edge Functions (TypeScript)',
          database: 'Supabase PostgreSQL (Autenticação integrada)',
          thirdParty: 'Stripe Checkout API + Twilio SMS para rastreio'
        };
        activeSquadIds = ['ceo', 'pm', 'dev'];
        approvals = { ceoApproval: true, pmApproval: false, ctoApproval: false };
        presetRules = `Modo Speedrun ativado.\n- Foque em entregar o fluxo de compra e checkout de lanche em 1 clique o mais rápido possível.\n- Evite otimizações arquiteturais complexas no início. Use o princípio de Pareto (80/20).`;
      } else if (exampleId === 'crm') {
        project = {
          name: 'Enterprise CRM Seguro',
          mission: 'Centralizar a gestão de leads e contratos de grandes indústrias com conformidade LGPD e segurança militar.',
          customerPain: 'Vazamento de dados corporativos e perda de histórico de e-mails em planilhas descentralizadas.',
          proposedSolution: 'Plataforma de CRM multi-inquilino com criptografia em nível de campo e auditoria de acessos.',
          targetAudience: 'Diretores de vendas e gerentes de TI de indústrias de médio e grande porte.',
          monetization: 'Assinatura recorrente anual (SaaS Enterprise Tier) baseada em número de assentos e volume de auditoria.',
          acquisition: 'Prospecção ativa outbound (Cold Calling e LinkedIn Sales Navigator) + e-books técnicos de compliance.'
        };
        architecture = {
          frontend: 'React 18 + Vite + Shadcn/ui (Tailored Design System)',
          backend: 'Node.js (NestJS Framework com TypeScript)',
          database: 'PostgreSQL corporativo com PostgreSQL Row Level Security (RLS) habilitado',
          thirdParty: 'Salesforce Sync API + Auth0 Enterprise SSO Identity System'
        };
        activeSquadIds = ['ceo', 'pm', 'cto', 'dev', 'qa', 'process-analyst'];
        approvals = { ceoApproval: true, pmApproval: true, ctoApproval: true };
        presetRules = `Modo Enterprise ativo.\n- Foque em documentações densas cobrindo acessibilidade (WCAG), segurança de banco de dados, tratamento de erros resiliente e compliance.\n- Escreva testes unitários rigorosos e use estritamente os padrões de design de DESIGN_SYSTEM.md.`;
      } else if (exampleId === 'agente-ai') {
        project = {
          name: 'AI Video Generator',
          mission: 'Transformar artigos de blog escritos em vídeos narrados e editados de alta conversão em 60 segundos.',
          customerPain: 'Custo proibitivo e tempo excessivo (dias) para contratar editores de vídeo humanos.',
          proposedSolution: 'Orquestrador inteligente que gera roteiro, sintetiza voz e monta cenas de vídeo via APIs de IA.',
          targetAudience: 'Criadores de conteúdo, afiliados de marketing e profissionais de marketing digital.',
          monetization: 'Créditos pré-pagos por minuto de vídeo gerado + Assinatura de plano Pro mensal com renderização em nuvem rápida.',
          acquisition: 'Criação automática de vídeos promocionais virais postados no TikTok, Instagram Reels e YouTube Shorts.'
        };
        architecture = {
          frontend: 'SvelteKit + Tailwind CSS',
          backend: 'FastAPI (Python 3.11) + Celery Asynchronous Workers',
          database: 'MongoDB Atlas (Armazenamento de Roteiros/Metadados) + Redis Cache',
          thirdParty: 'Gemini 2.5 Flash API + ElevenLabs Voice API + Cloudinary CDN'
        };
        activeSquadIds = ['cto', 'dev', 'qa'];
        approvals = { ceoApproval: false, pmApproval: false, ctoApproval: false };
        presetRules = `Modo Técnico Speedrun ativo.\n- Focado na iteração bruta de renderização, refinação de prompts da API do Gemini e latência de voz da ElevenLabs.\n- Ignore burocracias funcionais e foque na velocidade de processamento do vídeo.`;
      }

      // 1. VISAO.md
      const visaoContent = `# Visão do Produto e Modelo de Negócio — ${project.name}

> Este arquivo é a fonte da verdade sobre o propósito do negócio. O PM Agent e o CEO Agent o utilizam para garantir o alinhamento de novos recursos com a estratégia da empresa.

---

## 🎯 1. Declaração de Missão e Propósito

-   **A Missão:** ${project.mission}
-   **A Dor do Cliente a Curar:** ${project.customerPain}
-   **A Solução Proposta:** ${project.proposedSolution}

---

## 📊 2. Modelo de Negócios e Monetização

-   **Público-Alvo Primário:** ${project.targetAudience}
-   **Estratégia de Monetização:** ${project.monetization}
-   **Canais de Aquisição:** ${project.acquisition}

---

## 🛡️ 3. Valores Inegociáveis do Produto

1.  **Foco em Resultados:** O produto deve ajudar o cliente a resolver sua dor rapidamente, sem distrações visuais ou fluxos longos de onboarding.
2.  **Simplicidade Extrema:** A interface deve ser limpa e direta, exigindo o mínimo de esforço mental e cliques do cliente.
3.  **Segurança e Confiança:** Os dados dos clientes são sagrados. Nenhuma vulnerabilidade ou vazamento é tolerável.
`;
      writeFile(workspaceDir, 'knowledge', 'VISAO.md', visaoContent);

      // 2. ARQUITETURA.md
      const arquiContent = `# Arquitetura Técnica do Sistema — ${project.name}

> Este arquivo é o manual técnico oficial da infraestrutura. O CTO Agent e o Dev Agent o consultam e o mantêm atualizado a cada evolução na stack.

---

## 🛠️ 1. Visão Geral da Stack Tecnológica

| Camada | Tecnologia Selecionada | Papel no Sistema |
| :--- | :--- | :--- |
| **Frontend / Cliente** | ${architecture.frontend} | Interface do usuário e lógica local de navegação. |
| **Backend / API** | ${architecture.backend} | Regras de negócio centralizadas, autenticação e rotas. |
| **Banco de Dados** | ${architecture.database} | Armazenamento relacional e integridade de dados. |
| **Serviços de Terceiros**| ${architecture.thirdParty} | Gateway de pagamentos e APIs de IA. |

---

## 🌐 2. Fluxo e Integração de Dados

\`\`\`mermaid
graph TD
    A[App Mobile / Web] -->|Chamadas HTTPS / REST| B(API Gateway / Backend)
    B -->|Consultas SQL / ORM| C[(Banco de Dados Relacional)]
    B -->|Integração de Webhooks| D[Serviços de Terceiros]
\`\`\`

---

## 🔒 3. Políticas de Segurança e Controle de Acesso

-   **Autenticação:** Baseada em tokens expiráveis com renovação segura.
-   **Segurança de Banco de Dados:** Uso obrigatório de políticas de Row Level Security (RLS) ou controle estrito de acesso para garantir que cada usuário tenha acesso estrito apenas aos seus próprios registros cadastrados.
-   **Comunicação:** Todas as chamadas de API trafegam obrigatoriamente sob criptografia HTTPS.
`;
      writeFile(workspaceDir, 'knowledge', 'ARQUITETURA.md', arquiContent);

      // 3. safety-locks.md
      let safetyLocks = readFile(workspaceDir, '.ai/rules', 'safety-locks.md');
      if (safetyLocks) {
        safetyLocks = safetyLocks
          .replace(/CEO_APPROVAL:\s*(true|false)/gi, `CEO_APPROVAL: ${approvals.ceoApproval ? 'TRUE' : 'FALSE'}`)
          .replace(/PM_APPROVAL:\s*(true|false)/gi,  `PM_APPROVAL: ${approvals.pmApproval ? 'TRUE' : 'FALSE'}`)
          .replace(/CTO_APPROVAL:\s*(true|false)/gi, `CTO_APPROVAL: ${approvals.ctoApproval ? 'TRUE' : 'FALSE'}`);
        writeFile(workspaceDir, '.ai/rules', 'safety-locks.md', safetyLocks);
      }

      // 4. Squads
      const squadsDir = path.join(workspaceDir, '.ai', 'squads');
      if (fs.existsSync(squadsDir)) {
        const squadFiles = fs.readdirSync(squadsDir);
        squadFiles.filter(f => f.endsWith('.md')).forEach(file => {
          const id = file.replace('.md', '');
          const isActive = activeSquadIds.includes(id);
          const filePath = path.join(squadsDir, file);
          let content = fs.readFileSync(filePath, 'utf8');

          if (content.includes('Status:')) {
            content = content.replace(/Status:\s*(Ativo|Inativo)/i, `Status: ${isActive ? 'Ativo' : 'Inativo'}`);
          } else {
            content = content.replace(/(# .*\n)/, `$1Status: ${isActive ? 'Ativo' : 'Inativo'}\n`);
          }

          if (isActive) {
            if (content.includes('## 🔮 Diretrizes Customizadas')) {
              content = content.replace(/## 🔮 Diretrizes Customizadas\n[\s\S]*/, `## 🔮 Diretrizes Customizadas\n\n${presetRules}`);
            } else {
              content += `\n\n---\n\n## 🔮 Diretrizes Customizadas\n\n${presetRules}\n`;
            }
          }

          fs.writeFileSync(filePath, content, 'utf8');
        });
      }

      // 5. Atualiza nome do projeto na lista
      const list = loadProjects();
      const idx = list.findIndex(p => p.path === workspaceDir);
      if (idx > -1) {
        list[idx].name = project.name;
        saveProjects(list);
      }

      res.json({
        success: true,
        message: `Exemplo "${project.name}" aplicado com sucesso no disco!`,
        project,
        architecture
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET /api/system/check
  router.get('/system/check', async (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const nodeStatus = await checkCommand('node -v');
      const gitStatus  = await checkCommand('git --version');
      const npmStatus  = await checkCommand('npm -v');

      const environment = { node: nodeStatus, git: gitStatus, npm: npmStatus };

      const folders = {
        aiConfig:  fs.existsSync(path.join(workspaceDir, '.ai')),
        squads:    fs.existsSync(path.join(workspaceDir, '.ai', 'squads')),
        rules:     fs.existsSync(path.join(workspaceDir, '.ai', 'rules')),
        knowledge: fs.existsSync(path.join(workspaceDir, 'knowledge')),
        workflows: fs.existsSync(path.join(workspaceDir, 'workflows')),
        boards:    fs.existsSync(path.join(workspaceDir, 'boards'))
      };

      const placeholders = [];
      const filesToScan = [
        { path: 'knowledge/VISAO.md',       label: 'VISAO.md' },
        { path: 'knowledge/ARQUITETURA.md', label: 'ARQUITETURA.md' },
        { path: '.ai/squads/ceo.md',        label: 'squads/ceo.md' },
        { path: '.ai/squads/pm.md',         label: 'squads/pm.md' },
        { path: '.ai/squads/cto.md',        label: 'squads/cto.md' },
        { path: '.ai/squads/dev.md',        label: 'squads/dev.md' },
        { path: '.ai/squads/qa.md',         label: 'squads/qa.md' }
      ];

      filesToScan.forEach(f => {
        const fullPath = path.join(workspaceDir, f.path);
        if (fileExists(fullPath)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          content.split('\n').forEach((line, index) => {
            if (line.includes('{{NOME_DO_PROJETO}}') || line.match(/\[Descreva|\[Qual|\[Ex:/i)) {
              placeholders.push({ file: f.path, label: f.label, lineNum: index + 1, snippet: line.trim() });
            }
          });
        }
      });

      const isHealthy = placeholders.length === 0 && folders.aiConfig && folders.knowledge;

      res.json({
        environment,
        folders,
        placeholders,
        isHealthy,
        score: Math.max(0, 100 - placeholders.length * 10)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST /api/system/fix-placeholder
  router.post('/system/fix-placeholder', (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { filePath: relPath, targetText, replacementText } = req.body;

      if (!relPath || !targetText) {
        return res.status(400).json({ error: 'Parâmetros insuficientes' });
      }

      const fullPath = path.join(workspaceDir, relPath);
      if (!fileExists(fullPath)) {
        return res.status(404).json({ error: 'Arquivo físico não encontrado' });
      }

      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes(targetText)) {
        return res.status(400).json({ error: 'Texto original não encontrado no arquivo.' });
      }

      content = content.replace(targetText, replacementText);
      fs.writeFileSync(fullPath, content, 'utf8');

      res.json({ success: true, message: 'Placeholder preenchido!' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── POST /api/project/bootstrap ─────────────────────────────────────────
  // Mapeia um projeto existente e cria workspace Gigio Flow
  router.post('/project/bootstrap', (req, res) => {
    try {
      const { projectPath, name } = req.body;

      if (!projectPath) {
        return res.status(400).json({ error: 'projectPath é obrigatório' });
      }

      const resolvedPath = path.resolve(projectPath);

      if (!fs.existsSync(resolvedPath)) {
        return res.status(404).json({ error: 'Caminho não encontrado' });
      }

      // 1. Detectar se já é um workspace Gigio Flow
      const isAlreadyWorkspace = fs.existsSync(path.join(resolvedPath, '.ai')) &&
        fs.existsSync(path.join(resolvedPath, 'knowledge'));

      // 2. Detectar tech stack
      const detection = { stack: 'unknown', framework: '', database: '', testing: '', build: '', dev: '' };

      if (fs.existsSync(path.join(resolvedPath, 'package.json'))) {
        try {
          const pkg = JSON.parse(fs.readFileSync(path.join(resolvedPath, 'package.json'), 'utf8'));
          const deps = { ...pkg.dependencies, ...pkg.devDependencies };

          detection.stack = 'Node.js';
          if (deps.react || deps['react-dom']) detection.framework = 'React';
          else if (deps.next) detection.framework = 'Next.js';
          else if (deps.vue) detection.framework = 'Vue';
          else if (deps.express) detection.framework = 'Express';
          else detection.framework = Object.keys(deps).slice(0, 3).join(', ');

          detection.build = pkg.scripts?.build || 'N/A';
          detection.dev = pkg.scripts?.dev || 'N/A';
          detection.testing = pkg.scripts?.test || 'N/A';

          if (deps.typescript || deps['@types/react']) detection.stack = 'TypeScript';
          if (deps.prisma || deps['typeorm']) detection.database = 'PostgreSQL (via ORM)';
          else if (deps.mongoose) detection.database = 'MongoDB';
          else if (deps.pg) detection.database = 'PostgreSQL';

          detection.name = pkg.name || name || path.basename(resolvedPath);
        } catch {}
      } else if (fs.existsSync(path.join(resolvedPath, 'requirements.txt'))) {
        detection.stack = 'Python';
        const reqTxt = fs.readFileSync(path.join(resolvedPath, 'requirements.txt'), 'utf8');
        if (reqTxt.includes('django')) detection.framework = 'Django';
        else if (reqTxt.includes('flask')) detection.framework = 'Flask';
        else if (reqTxt.includes('fastapi')) detection.framework = 'FastAPI';
        detection.name = name || path.basename(resolvedPath);
      } else if (fs.existsSync(path.join(resolvedPath, 'Cargo.toml'))) {
        detection.stack = 'Rust';
        detection.name = name || path.basename(resolvedPath);
      } else if (fs.existsSync(path.join(resolvedPath, 'go.mod'))) {
        detection.stack = 'Go';
        detection.name = name || path.basename(resolvedPath);
      } else {
        detection.name = name || path.basename(resolvedPath);
      }

      // 3. Scan directory (top 2 levels) — collect structure
      let structure = '';
      try {
        const entries = fs.readdirSync(resolvedPath).filter(e =>
          !e.startsWith('.') && e !== 'node_modules' && e !== 'dist' && e !== 'build' && e !== 'target'
        );
        structure = entries.map(e => {
          const full = path.join(resolvedPath, e);
          if (fs.statSync(full).isDirectory()) {
            const sub = fs.readdirSync(full).filter(s =>
              !s.startsWith('.') && s !== 'node_modules'
            ).slice(0, 8).map(s => `  ├── ${s}`).join('\n');
            return `├── ${e}/\n${sub}`;
          }
          return `├── ${e}`;
        }).join('\n');
      } catch {}

      // 4. Se não é workspace, criar estrutura
      if (!isAlreadyWorkspace) {
        // Criar diretórios
        const dirs = [
          '.ai/squads', '.ai/rules', '.ai/skills', '.ai/templates', '.ai/history/concluidos',
          'knowledge', 'workflows/propostas', 'workflows/pendentes'
        ];
        dirs.forEach(d => {
          const full = path.join(resolvedPath, d);
          if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
        });

        // Copiar templates do workspace default
        const sourceDir = state.activeWorkspaceDir;
        const copyIfMissing = (relDir) => {
          const srcDir = path.join(sourceDir, relDir);
          const dstDir = path.join(resolvedPath, relDir);
          if (fs.existsSync(srcDir)) {
            fs.readdirSync(srcDir).filter(f => f.endsWith('.md')).forEach(f => {
              const dst = path.join(dstDir, f);
              if (!fs.existsSync(dst)) {
                fs.copyFileSync(path.join(srcDir, f), dst);
              }
            });
          }
        };
        copyIfMissing('.ai/squads');
        copyIfMissing('.ai/rules');
        copyIfMissing('.ai/skills');
        copyIfMissing('.ai/templates');
      }

      // 5. Gerar knowledge/ARQUITETURA.md (se não existir ou for template)
      const arquiPath = path.join(resolvedPath, 'knowledge', 'ARQUITETURA.md');
      if (!fs.existsSync(arquiPath) || fs.readFileSync(arquiPath, 'utf8').includes('{{NOME_DO_PROJETO}}')) {
        const arquiContent = `# Technical Architecture — ${detection.name}

> Auto-generated by Gigio Flow Bootstrap on ${new Date().toISOString().split('T')[0]}

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Language / Stack** | ${detection.stack} |
| **Framework** | ${detection.framework || 'N/A'} |
| **Database** | ${detection.database || 'N/A'} |
| **Testing** | ${detection.testing || 'N/A'} |

## 📁 Project Structure

\`\`\`
${structure}
\`\`\`

## 🚀 Commands

| Command | Script |
|---------|--------|
| dev | \`${detection.dev || 'N/A'}\` |
| build | \`${detection.build || 'N/A'}\` |
| test | \`${detection.testing || 'N/A'}\` |
`;
        fs.writeFileSync(arquiPath, arquiContent, 'utf8');
      }

      // 6. Gerar knowledge/ESTADO_ATUAL.md (se não existir)
      const estadoPath = path.join(resolvedPath, 'knowledge', 'ESTADO_ATUAL.md');
      if (!fs.existsSync(estadoPath)) {
        const estadoContent = `# Current Project State — ${detection.name}

> **Last Update:** ${new Date().toISOString().split('T')[0]}
> **Status:** ⏳ Initialized via Bootstrap

## Modules

| Module | Status | Notes |
|--------|--------|-------|
| **${detection.name}** | ⏳ Pending | Project initialized by Gigio Flow Bootstrap |
`;
        fs.writeFileSync(estadoPath, estadoContent, 'utf8');
      }

      // 7. Gerar knowledge/VISAO.md placeholder (se não existir)
      const visaoPath = path.join(resolvedPath, 'knowledge', 'VISAO.md');
      if (!fs.existsSync(visaoPath)) {
        const visaoContent = `# Product Vision & Business Model — ${detection.name}

> **Auto-generated by Gigio Flow Bootstrap**
> **Please fill in the sections below with your project's business context.**

---

## 🎯 1. Mission & Purpose

- **The Mission:** [What problem does this solve?]
- **Customer Pain:** [Who is suffering and why?]
- **Proposed Solution:** [How does this fix it?]

---

## 📊 2. Business Model

- **Target Audience:** [Who pays?]
- **Monetization:** [How does it make money?]
- **Acquisition:** [How do users find it?]
`;
        fs.writeFileSync(visaoPath, visaoContent, 'utf8');
      }

      // 8. Gerar knowledge/HISTORICO.md (se não existir)
      const historicoPath = path.join(resolvedPath, 'knowledge', 'HISTORICO.md');
      if (!fs.existsSync(historicoPath)) {
        const historicoContent = `# Decision History — ${detection.name}

> Auto-generated by Gigio Flow Bootstrap

---

### [${new Date().toISOString().split('T')[0]}] — Project Initialized

- **What changed:** Project mapped by Gigio Flow Bootstrap
- **Stack detected:** ${detection.stack} ${detection.framework ? `/ ${detection.framework}` : ''}
- **Status:** Ready for first PRD
`;
        fs.writeFileSync(historicoPath, historicoContent, 'utf8');
      }

      // 9. Registrar nos projetos
      const projectsList = loadProjects();
      const existingIdx = projectsList.findIndex(p => p.path === resolvedPath);
      if (existingIdx === -1) {
        projectsList.push({
          id: 'proj-' + Date.now(),
          name: detection.name,
          path: resolvedPath,
          active: false
        });
        saveProjects(projectsList);
      }

      res.json({
        success: true,
        project: {
          name: detection.name,
          path: resolvedPath,
          isNewWorkspace: !isAlreadyWorkspace
        },
        detection: {
          stack: detection.stack,
          framework: detection.framework || null,
          database: detection.database || null,
          dev: detection.dev || null,
          build: detection.build || null,
          test: detection.testing || null
        },
        totalFiles: fs.readdirSync(resolvedPath).length
      });

    } catch (error) {
      console.error('[Bootstrap] Erro:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // ── GET /api/knowledge ─────────────────────────────────────────────────
  // Lista todos os arquivos de knowledge com seus conteúdos
  router.get('/knowledge', (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const knowledgeDir = path.join(workspaceDir, 'knowledge');
      const aiDir = path.join(workspaceDir, '.ai', 'rules');

      if (!fs.existsSync(knowledgeDir)) {
        return res.json({ files: [] });
      }

      const knowledgeFiles = [
        { id: 'visao',           label: 'VISAO.md',          path: path.join(knowledgeDir, 'VISAO.md'),        dir: 'knowledge' },
        { id: 'arquitetura',     label: 'ARQUITETURA.md',    path: path.join(knowledgeDir, 'ARQUITETURA.md'),  dir: 'knowledge' },
        { id: 'estado-atual',    label: 'ESTADO_ATUAL.md',   path: path.join(knowledgeDir, 'ESTADO_ATUAL.md'), dir: 'knowledge' },
        { id: 'roadmap',         label: 'ROADMAP.md',        path: path.join(knowledgeDir, 'ROADMAP.md'),      dir: 'knowledge' },
        { id: 'historico',       label: 'HISTORICO.md',      path: path.join(knowledgeDir, 'HISTORICO.md'),    dir: 'knowledge' },
        { id: 'glossario',       label: 'GLOSSARIO.md',      path: path.join(knowledgeDir, 'GLOSSARIO.md'),    dir: 'knowledge' },
        { id: 'design-system',   label: 'DESIGN_SYSTEM.md',  path: path.join(knowledgeDir, 'DESIGN_SYSTEM.md'),dir: 'knowledge' },
      ];

      const files = knowledgeFiles.map(f => {
        let content = '';
        let exists = false;
        if (fs.existsSync(f.path)) {
          content = fs.readFileSync(f.path, 'utf8');
          exists = true;
        }
        return {
          id: f.id,
          label: f.label,
          exists,
          content: content.substring(0, 10000),  // limit to 10k chars for UI
          size: content.length,
          isTemplate: content.includes('{{NOME_DO_PROJETO}}') || content.includes('[Descreva')
        };
      });

      res.json({ files, activeWorkspaceDir: workspaceDir });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── POST /api/knowledge/save ──────────────────────────────────────────
  // Salva o conteúdo de um knowledge file
  router.post('/knowledge/save', (req, res) => {
    try {
      const workspaceDir = state.activeWorkspaceDir;
      const { fileId, content } = req.body;

      if (!fileId || content === undefined) {
        return res.status(400).json({ error: 'fileId e content são obrigatórios' });
      }

      const fileMap = {
        'visao':           { dir: 'knowledge', name: 'VISAO.md' },
        'arquitetura':     { dir: 'knowledge', name: 'ARQUITETURA.md' },
        'estado-atual':    { dir: 'knowledge', name: 'ESTADO_ATUAL.md' },
        'roadmap':         { dir: 'knowledge', name: 'ROADMAP.md' },
        'historico':       { dir: 'knowledge', name: 'HISTORICO.md' },
        'glossario':       { dir: 'knowledge', name: 'GLOSSARIO.md' },
        'design-system':   { dir: 'knowledge', name: 'DESIGN_SYSTEM.md' },
      };

      const file = fileMap[fileId];
      if (!file) {
        return res.status(400).json({ error: `Arquivo desconhecido: ${fileId}` });
      }

      writeFile(workspaceDir, file.dir, file.name, content);

      res.json({ success: true, fileId, size: content.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── GET /api/workspace/status ─────────────────────────────────────────
  // Status detalhado de todos os arquivos do workspace
  router.get('/workspace/status', (req, res) => {
    try {
      const wd = state.activeWorkspaceDir;
      const safeRead = (relPath, max = 50000) => {
        const full = path.join(wd, relPath);
        if (!fs.existsSync(full)) return '';
        const stat = fs.statSync(full);
        if (!stat.isFile() || stat.size > max) return '';
        return fs.readFileSync(full, 'utf8');
      };

      const includesText = (relPath, text) => safeRead(relPath).includes(text);

      const scanDir = (relDir) => {
        const full = path.join(wd, relDir);
        if (!fs.existsSync(full)) return { exists: false, files: [] };
        const entries = fs.readdirSync(full).map(f => {
          const fPath = path.join(full, f);
          const stat = fs.statSync(fPath);
          let isTemplate = false;
          let content = '';
          if (f.endsWith('.md') && stat.size < 50000) {
            content = fs.readFileSync(fPath, 'utf8').substring(0, 2000);
            isTemplate = content.includes('{{NOME_DO_PROJETO}}') || content.includes('[Descreva') || content.includes('[Qual');
          }
          return {
            name: f,
            path: `${relDir}/${f}`,
            size: stat.size,
            isDirectory: stat.isDirectory(),
            isMarkdown: f.endsWith('.md'),
            isTemplate,
            isEmpty: stat.size === 0,
            hasContent: stat.size > 50,
          };
        });
        return { exists: true, files: entries };
      };

      const workspaceStatus = {
        activePath: wd,
        ai: {
          squads: scanDir('.ai/squads'),
          rules: scanDir('.ai/rules'),
          skills: scanDir('.ai/skills'),
          templates: scanDir('.ai/templates'),
          history: scanDir('.ai/history/concluidos'),
        },
        knowledge: scanDir('knowledge'),
        workflows: {
          propostas: scanDir('workflows/propostas'),
          pendentes: scanDir('workflows/pendentes'),
        },
        llm: {
          hasApiKey: !!(process.env.GIGIO_LLM_KEY || ''),
          configuredInLocalStorage: true, // frontend checks this
        },
        linear: {
          hasApiKey: !!(process.env.LINEAR_API_KEY || ''),
          hasTeamId: !!(process.env.LINEAR_TEAM_ID || ''),
        },
      };

      const contractPath = '.ai/WORKFLOW_CONTRACT.md';
      const evidenceTemplatePath = '.ai/templates/evidence-comment.md';
      const statusMapPath = '.ai/linear-status-map.json';
      const docsToCheck = [
        'AGENTS.md',
        '.ai/squads/dev.md',
        '.ai/skills/auto-evolucao.md',
        '.ai/skills/dev-cycle.md',
        '.ai/skills/prd-to-linear.md',
        '.ai/skills/retrospective.md',
        'docs/WALKTHROUGH_GUIDE.md',
        'docs/CODEX_WORKFLOWS.md',
      ];

      let statusMap = null;
      try {
        const rawStatusMap = safeRead(statusMapPath);
        statusMap = rawStatusMap ? JSON.parse(rawStatusMap) : null;
      } catch {
        statusMap = null;
      }

      const officialStatuses = [
        'Backlog',
        'Todo',
        'Desenvolvimento',
        'QA-Tecnica',
        'QA-Funcional',
        'Concluido',
        'Em-Producao',
      ];

      const mappedStatuses = officialStatuses.filter(statusName => {
        const value = statusMap?.statuses?.[statusName];
        return typeof value === 'string' && value.trim().length > 0;
      });

      const contractRefs = docsToCheck
        .filter(relPath => includesText(relPath, '.ai/WORKFLOW_CONTRACT.md'));

      const legacyReferences = docsToCheck
        .filter(relPath => includesText(relPath, 'workflows/em-progresso/'));

      workspaceStatus.operational = {
        contract: {
          exists: fs.existsSync(path.join(wd, contractPath)),
          referencedBy: contractRefs,
          expectedReferences: docsToCheck.length,
        },
        evidenceTemplate: {
          exists: fs.existsSync(path.join(wd, evidenceTemplatePath)),
        },
        linearStatusMap: {
          exists: fs.existsSync(path.join(wd, statusMapPath)),
          mapped: mappedStatuses,
          missing: officialStatuses.filter(statusName => !mappedStatuses.includes(statusName)),
        },
        drift: {
          legacyReferences,
        },
      };

      // Calcular scores a partir do workspace real
      const requiredGroups = [
        workspaceStatus.knowledge.files,
        workspaceStatus.ai.rules.files,
        workspaceStatus.ai.squads.files,
        workspaceStatus.ai.skills.files,
      ];
      const totalRequired = requiredGroups.reduce((sum, files) => sum + files.length, 0);
      let completed = 0;
      workspaceStatus.knowledge.files.forEach(f => { if (!f.isTemplate && f.hasContent) completed++; });
      workspaceStatus.ai.rules.files.forEach(f => { if (f.hasContent) completed++; });
      workspaceStatus.ai.squads.files.forEach(f => { if (f.hasContent) completed++; });
      workspaceStatus.ai.skills.files.forEach(f => { if (f.hasContent) completed++; });

      workspaceStatus.score = totalRequired > 0 ? Math.round((completed / totalRequired) * 100) : 0;
      const operationalChecks = [
        workspaceStatus.operational.contract.exists,
        workspaceStatus.operational.evidenceTemplate.exists,
        workspaceStatus.operational.contract.referencedBy.length === workspaceStatus.operational.contract.expectedReferences,
        workspaceStatus.operational.drift.legacyReferences.length === 0,
        workspaceStatus.operational.linearStatusMap.exists,
      ];
      const operationalPassed = operationalChecks.filter(Boolean).length;
      workspaceStatus.operational.score = Math.round((operationalPassed / operationalChecks.length) * 100);
      workspaceStatus.isFullyConfigured = workspaceStatus.score >= 80 &&
        workspaceStatus.linear.hasApiKey &&
        workspaceStatus.operational.score >= 80;

      res.json(workspaceStatus);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
