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

  return router;
}
