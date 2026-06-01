import React from 'react';
import { Sparkles, RefreshCw, ChevronRight } from 'lucide-react';

function OnboardingWizard({
  project,
  architecture,
  squads,
  approvals,
  llmConfig,
  saving,
  wizardStep,
  setWizardStep,
  onSave,
  onChange,
  onApplyExample,
  onApplyTemplate,
  onSaveApiConfig,
  onSquadChange,
  triggerNotification,
  board,
  setActiveTab,
}) {
  return (
    <div className="animate-slide-in" style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Acelere seu Onboarding
        </span>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 600, marginTop: '2px' }}>Guia de Configuração Inicial</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px', lineHeight: '1.4' }}>
          Configure o cérebro das squads de IA, persistindo diretrizes de negócios, stacks de tecnologia, regras de rituais e pareamento MCP diretamente nos arquivos markdown locais do seu computador.
        </p>
      </div>

      {/* 1. EXAMPLES LIBRARY SECTION */}
      <div className="glass-card" style={{ marginBottom: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Sparkles size="15" style={{ color: 'var(--accent-purple)' }} />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Biblioteca de Exemplos de Organização (1-Click Fill)</h3>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '16px' }}>
          Selecione um exemplo real pré-configurado de produto e stack para preencher automaticamente todo o seu workspace local de ponta a ponta:
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { id: 'lanchonete', color: 'var(--accent-purple)', bgColor: 'rgba(94,106,210,0.1)', label: '⚡ B2C Lean (Lanchonete Delivery)', desc: 'Foco em checkout em 1 clique. Stack Next.js + Supabase no preset Speedrun.' },
            { id: 'crm', color: 'var(--accent-teal)', bgColor: 'rgba(6,182,212,0.1)', label: '🏛️ B2B Enterprise (CRM Seguro)', desc: 'Compliance LGPD, Row Level Security, stack robusta (NestJS + PostgreSQL).' },
            { id: 'agente-ai', color: 'var(--accent-green)', bgColor: 'rgba(46,163,118,0.1)', label: '🤖 AI Video App (Agente AI)', desc: 'Roteiro e narração automática. Stack FastAPI + MongoDB + ElevenLabs.' },
          ].map(ex => (
            <div
              key={ex.id}
              onClick={() => onApplyExample(ex.id)}
              style={{ border: '1px solid var(--border-color)', background: 'var(--bg-primary)', padding: '12px', borderRadius: '6px', cursor: 'pointer', transition: 'var(--transition-smooth)', display: 'flex', flexDirection: 'column', gap: '6px' }}
              className="org-node"
            >
              <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: ex.color }}>{ex.label}</h4>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: '1.3', flex: 1 }}>{ex.desc}</p>
              <div style={{ fontSize: '0.62rem', background: ex.bgColor, color: ex.color, padding: '2px 6px', borderRadius: '3px', alignSelf: 'start', fontWeight: 600 }}>
                Gravar no Disco
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. ONBOARDING CHECKLIST STEPS */}
      <div className="glass-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '20px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          📋 Checklist Interativo de Onboarding (Zero to One)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Step 1: LLM Key */}
          <div style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', alignItems: 'center' }}>
            <div style={{ background: llmConfig.apiKey ? 'var(--accent-green-dim)' : 'var(--accent-purple-dim)', color: llmConfig.apiKey ? 'var(--accent-green)' : 'var(--accent-purple)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
              {llmConfig.apiKey ? '✓' : '1'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700 }}>Conectar o Cérebro (API LLM)</h4>
                <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: llmConfig.apiKey ? 'var(--accent-green-dim)' : 'rgba(255,255,255,0.05)', color: llmConfig.apiKey ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                  {llmConfig.apiKey ? 'Ativo (Real)' : 'Simulação'}
                </span>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Habilita debates realistas de negócios com o CEO Agent. Salvo localmente em localStorage.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="password"
                placeholder="Cole sua API Key do Gemini..."
                defaultValue={llmConfig.apiKey}
                onChange={(e) => onSaveApiConfig(e.target.value, llmConfig.provider)}
                style={{ height: '26px', fontSize: '0.7rem', width: '180px', padding: '0 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Step 2: Product Vision */}
          <div style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', alignItems: 'center' }}>
            <div style={{ background: (project.mission && !project.mission.includes('[Descreva')) ? 'var(--accent-green-dim)' : 'rgba(255,255,255,0.05)', color: (project.mission && !project.mission.includes('[Descreva')) ? 'var(--accent-green)' : 'var(--text-muted)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
              {(project.mission && !project.mission.includes('[Descreva')) ? '✓' : '2'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700 }}>Estratégia e Escopo do Produto</h4>
                <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: (project.mission && !project.mission.includes('[Descreva')) ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)', color: (project.mission && !project.mission.includes('[Descreva')) ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {(project.mission && !project.mission.includes('[Descreva')) ? 'Mapeado' : 'Pendente'}
                </span>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Define a missão e dores a curar na fonte da verdade estratégica: knowledge/VISAO.md.
              </p>
            </div>
            <button onClick={() => setActiveTab('config')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.7rem', height: '26px' }}>
              Configurar Missão
            </button>
          </div>

          {/* Step 3: Technical Architecture */}
          <div style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', alignItems: 'center' }}>
            <div style={{ background: (architecture.frontend && !architecture.frontend.includes('[Ex: Next.js')) ? 'var(--accent-green-dim)' : 'rgba(255,255,255,0.05)', color: (architecture.frontend && !architecture.frontend.includes('[Ex: Next.js')) ? 'var(--accent-green)' : 'var(--text-muted)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
              {(architecture.frontend && !architecture.frontend.includes('[Ex: Next.js')) ? '✓' : '3'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700 }}>Desenho de Arquitetura de Dados</h4>
                <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: (architecture.frontend && !architecture.frontend.includes('[Ex: Next.js')) ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)', color: (architecture.frontend && !architecture.frontend.includes('[Ex: Next.js')) ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {(architecture.frontend && !architecture.frontend.includes('[Ex: Next.js')) ? 'Definido' : 'Pendente'}
                </span>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Especifica as camadas técnicas de frontend, backend e banco de dados em knowledge/ARQUITETURA.md.
              </p>
            </div>
            <button onClick={() => setActiveTab('config')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.7rem', height: '26px' }}>
              Configurar Stack
            </button>
          </div>

          {/* Step 4: Active Squad */}
          <div style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', alignItems: 'center' }}>
            <div style={{ background: squads.some(s => s.isActive) ? 'var(--accent-green-dim)' : 'rgba(255,255,255,0.05)', color: squads.some(s => s.isActive) ? 'var(--accent-green)' : 'var(--text-muted)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
              {squads.some(s => s.isActive) ? '✓' : '4'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700 }}>Orquestração de Agentes da Squad</h4>
                <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: squads.some(s => s.isActive) ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)', color: squads.some(s => s.isActive) ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {squads.filter(s => s.isActive).length} Agentes Ativos
                </span>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Mapeia as diretivas customizadas e presets das personas de IA salvando em .ai/squads/*.md.
              </p>
            </div>
            <button onClick={() => setActiveTab('squad')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.7rem', height: '26px' }}>
              Mapa de Agentes
            </button>
          </div>

          {/* Step 5: First Feature request */}
          <div style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', alignItems: 'center' }}>
            <div style={{ background: (board.propostas.length > 0 || board.pendentes.length > 0 || board['em-progresso'].length > 0) ? 'var(--accent-green-dim)' : 'rgba(255,255,255,0.05)', color: (board.propostas.length > 0 || board.pendentes.length > 0 || board['em-progresso'].length > 0) ? 'var(--accent-green)' : 'var(--text-muted)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
              {(board.propostas.length > 0 || board.pendentes.length > 0 || board['em-progresso'].length > 0) ? '✓' : '5'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700 }}>Ideação do Primeiro Recurso</h4>
                <span style={{ fontSize: '0.58rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', background: (board.propostas.length > 0 || board.pendentes.length > 0 || board['em-progresso'].length > 0) ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)', color: (board.propostas.length > 0 || board.pendentes.length > 0 || board['em-progresso'].length > 0) ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {(board.propostas.length > 0 || board.pendentes.length > 0 || board['em-progresso'].length > 0) ? 'Proposto' : 'Pendente'}
                </span>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Submeta um pedido estratégico no debate do CEO e gere o primeiro card físico em workflows/propostas/.
              </p>
            </div>
            <button onClick={() => setActiveTab('board')} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.7rem', height: '26px' }}>
              Debater com CEO
            </button>
          </div>

          {/* Step 6: Linear MCP Sync */}
          <div style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', alignItems: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--accent-purple)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0 }}>
              6
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700 }}>Conexão com Quadro Linear (MCP)</h4>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Integre o Gigio Flow Studio ao seu app oficial do Linear executando a ponte via MCP Server.
              </p>
            </div>
            <button
              onClick={() => triggerNotification("Execute 'npx @linear/mcp-server' nas regras do seu app Linear local.")}
              className="btn-primary"
              style={{ padding: '4px 10px', fontSize: '0.7rem', height: '26px', background: 'var(--accent-purple)' }}
            >
              Instruções MCP
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default OnboardingWizard;
