import React from 'react';
import { Search, Bell } from 'lucide-react';

const TAB_LABELS = {
  onboarding: 'Configuração Inicial',
  board: 'Quadro de Ciclo Ativo',
  config: 'Rituais e Portões',
  squad: 'Organograma da Squad',
  guia: 'Arquitetura e Guia',
  mcp: 'Linear MCP Integration',
  linear: 'Integrações',
};

function TopBar({ activeTab, triggerNotification }) {
  return (
    <header style={{
      height: '45px',
      borderBottom: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0
    }}>
      {/* Left: Section title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projetos</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/</span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>
          {TAB_LABELS[activeTab] || activeTab}
        </span>
      </div>

      {/* Right: Search + Bell */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div
          style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '180px',
            cursor: 'pointer'
          }}
          onClick={() => triggerNotification('A pesquisa global Ctrl+K está simulada. Digite suas ações na interface!')}
        >
          <Search size="11" style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flex: 1 }}>Buscar...</span>
          <kbd style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '3px', padding: '1px 4px', color: 'var(--text-muted)' }}>Ctrl K</kbd>
        </div>

        <Bell
          size="13"
          style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}
          onClick={() => triggerNotification('Você não possui novas notificações da Squad.')}
        />
      </div>
    </header>
  );
}

export default TopBar;
