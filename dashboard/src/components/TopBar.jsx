import React from 'react';
import { ExternalLink, Sun, Moon, RefreshCw } from 'lucide-react';
import PipelineProgress from './PipelineProgress';

function TopBar({ project, board, theme, toggleTheme }) {
  const handleRefresh = () => window.location.reload();

  return (
    <header style={{ flexShrink: 0 }}>
      {/* Header row */}
      <div style={{
        height: '42px', borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)', padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Left: logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '6px',
            background: 'var(--accent-purple)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '10px',
          }}>GF</div>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {project?.name || 'Gigio Flow Studio'}
          </span>
        </div>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="https://linear.app" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ExternalLink size="11" /> Linear
          </a>
          <button onClick={handleRefresh}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
            <RefreshCw size="13" />
          </button>
          <button onClick={toggleTheme}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}>
            {theme === 'dark' ? <Sun size="13" /> : <Moon size="13" />}
          </button>
        </div>
      </div>

      {/* Pipeline bar */}
      <PipelineProgress board={board} />
    </header>
  );
}

export default TopBar;
