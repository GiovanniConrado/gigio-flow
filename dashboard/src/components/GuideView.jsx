import React from 'react';
import { Workflow, FolderOpen, TrendingUp, Activity, Terminal } from 'lucide-react';

function GuideView({
  diagnostics,
  activeFix,
  setActiveFix,
  onFixPlaceholder,
  onRunDiagnostics,
  project,
  architecture,
  llmConfig,
  onSaveApiConfig,
  triggerNotification,
}) {
  return (
    <div className="animate-slide-in" style={{ maxWidth: '960px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <Workflow size="20" style={{ color: 'var(--accent-purple)' }} />
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sistemas de bordo
          </span>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Arquitetura &amp; Guia de Engenharia</h1>
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5', marginBottom: '24px' }}>
        O Gigio Flow Studio opera sob o conceito de <strong>Infraestrutura como Código de Documentação</strong>. Toda a inteligência da sua startup reside em arquivos markdown planos gravados no seu computador, permitindo controle absoluto e portabilidade de dados.
      </p>

      {/* 1. INTERACTIVE FOLDER SCHEMATIC TREE DIAGRAM */}
      <div className="glass-card" style={{ marginBottom: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FolderOpen size="14" style={{ color: 'var(--accent-purple)' }} /> Mapeamento Físico de Arquivos e Inputs do Painel
        </h3>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '16px' }}>
          Clique nas pastas e arquivos abaixo para visualizar quais parâmetros locais eles controlam no seu computador:
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', alignItems: 'start' }}>
          <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-primary)', background: 'var(--bg-primary)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-color)', lineHeight: '1.7' }}>
            <div style={{ color: 'var(--text-secondary)' }}>📁 active-workspace/</div>
            <div style={{ paddingLeft: '16px' }}>
              <span style={{ color: 'var(--text-muted)' }}>├── 📁</span> <strong style={{ color: 'var(--accent-purple)' }}>knowledge/</strong>
              <div style={{ paddingLeft: '16px' }}>
                <span style={{ color: 'var(--text-muted)' }}>│   ├── 📄</span> <span style={{ cursor: 'pointer', borderBottom: '1px dashed var(--accent-purple)' }} onClick={() => triggerNotification('VISAO.md: Controla Missão, Dor a Curar, Solução, Monetização e Público-Alvo.')}>VISAO.md</span> <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>&lt;-- Visão Geral do Negócio</span>
                <br />
                <span style={{ color: 'var(--text-muted)' }}>│   └── 📄</span> <span style={{ cursor: 'pointer', borderBottom: '1px dashed var(--accent-purple)' }} onClick={() => triggerNotification('ARQUITETURA.md: Controla Frontend, Backend, DB e APIs de Terceiros.')}>ARQUITETURA.md</span> <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>&lt;-- Stack Tecnológica</span>
              </div>

              <span style={{ color: 'var(--text-muted)' }}>├── 📁</span> <strong style={{ color: 'var(--accent-teal)' }}>.ai/</strong>
              <div style={{ paddingLeft: '16px' }}>
                <span style={{ color: 'var(--text-muted)' }}>│   ├── 📁</span> <strong style={{ color: 'var(--accent-teal)' }}>rules/</strong>
                <div style={{ paddingLeft: '16px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>│   │   └── 📄</span> <span style={{ cursor: 'pointer', borderBottom: '1px dashed var(--accent-teal)' }} onClick={() => triggerNotification('safety-locks.md: Controla approvals de rituais do CEO, PM e CTO.')}>safety-locks.md</span> <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>&lt;-- Portões de Segurança</span>
                </div>
                <span style={{ color: 'var(--text-muted)' }}>│   └── 📁</span> <strong style={{ color: 'var(--accent-teal)' }}>squads/</strong>
                <div style={{ paddingLeft: '16px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>│       ├── 📄</span> <span style={{ cursor: 'pointer', borderBottom: '1px dashed var(--accent-teal)' }} onClick={() => triggerNotification('ceo.md: Controla a personalidade estratégica de ROI da IA.')}>ceo.md</span>
                  <br />
                  <span style={{ color: 'var(--text-muted)' }}>│       ├── 📄</span> <span style={{ cursor: 'pointer', borderBottom: '1px dashed var(--accent-teal)' }} onClick={() => triggerNotification('pm.md: Diretivas funcionais de produto da persona PM.')}>pm.md</span>
                  <br />
                  <span style={{ color: 'var(--text-muted)' }}>│       └── 📄</span> <span style={{ color: 'var(--text-muted)' }}>...outros agents</span> <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>([agent].md)</span>
                </div>
              </div>

              <span style={{ color: 'var(--text-muted)' }}>└── 📁</span> <strong style={{ color: 'var(--accent-green)' }}>workflows/</strong>
              <div style={{ paddingLeft: '16px' }}>
                <span style={{ color: 'var(--text-muted)' }}>    └── 📁</span> <strong style={{ color: 'var(--accent-green)' }}>propostas/</strong>
                <div style={{ paddingLeft: '16px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>        └── 📄</span> <span style={{ color: 'var(--text-secondary)' }}>proposta-feature.md</span> <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>&lt;-- Cartões do Kanban</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--accent-purple)', fontWeight: 700, marginBottom: '4px' }}>🛡️ Transparência e Portabilidade</h4>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Ao contrário de ferramentas SaaS proprietárias fechadas, o Gigio Flow grava tudo como arquivos Markdown padrão. Se você quiser parar de usar o painel, toda a sua documentação continua legível em qualquer IDE ou editor de texto.
              </p>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.78rem', color: 'var(--accent-teal)', fontWeight: 700, marginBottom: '4px' }}>⚡ Sincronização Dinâmica</h4>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                Qualquer alteração realizada nos Markdowns usando seu editor preferido (como Obsidian ou VS Code) é refletida instantaneamente no painel e vice-versa ao rodar o comando de sincronização.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE COMPLETE VALUE LIFECYCLE */}
      <div className="glass-card" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <TrendingUp size="14" style={{ color: 'var(--accent-teal)' }} /> 🚀 Esteira de Valor: PM Ideation até o QA Delivery
        </h3>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '16px' }}>
          O ciclo completo de engenharia de ponta a ponta percorrido pelo Gigio Flow Studio local:
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { num: 1, color: 'var(--accent-purple-dim)', textColor: 'var(--accent-purple)', title: '1. Idealização & ROI estratégico (CEO)', desc: 'Você submete uma ideia estratégia. O CEO Agent analisa o ROI da funcionalidade comparando-o com os valores em VISAO.md. Se aprovado, cria a proposta física na pasta workflows/propostas/.' },
            { num: 2, color: 'rgba(6, 182, 212, 0.1)', textColor: 'var(--accent-teal)', title: '2. Detalhamento Funcional & Copy das Telas (PM)', desc: 'O PM Agent assume o background técnico de produto e detalha a especificação em uma PRD física completa, definindo os critérios de aceitação e os copies das telas.' },
            { num: 3, color: 'rgba(255,255,255,0.05)', textColor: 'var(--text-primary)', title: '3. Validação Arquitetural & Segurança RLS (CTO)', desc: 'O CTO Agent valida o impacto técnico da PRD, mapeia o esquema das tabelas em ARQUITETURA.md e estabelece travas de segurança (como Row Level Security).' },
            { num: 4, color: 'var(--accent-green-dim)', textColor: 'var(--accent-green)', title: '4. Codificação Atômica & Validação de Qualidade (Dev & QA)', desc: 'O Dev Agent cria e edita os arquivos físicos de código. O QA Agent atua em paralelo: valida acessibilidade CSS (WCAG), roda lints estritos de segurança e certifica o funcionamento das rotas.' },
            { num: 5, color: 'rgba(255, 255, 255, 0.05)', textColor: 'var(--accent-purple)', title: '5. Sincronização e Lançamento Visual no Linear (MCP)', desc: 'Validada localmente no Studio, a squad move os cards correspondentes no seu quadro do Linear via MCP Server, postando relatórios de testes e atualizando o status do ciclo de sprint.' },
          ].map(step => (
            <div key={step.num} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ background: step.color, color: step.textColor, width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '10px', flexShrink: 0 }}>
                {step.num}
              </div>
              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{step.title}</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.4' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GuideView;
