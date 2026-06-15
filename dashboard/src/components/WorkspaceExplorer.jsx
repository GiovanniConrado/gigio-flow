import React, { useState, useEffect } from 'react';
import { RefreshCw, FileText, FolderOpen, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

const SECTION_LABELS = {
  'ai/squads': { label: 'Squads', icon: '👥' },
  'ai/rules': { label: 'Regras', icon: '🛡️' },
  'ai/skills': { label: 'Skills', icon: '🎯' },
  'ai/templates': { label: 'Templates', icon: '📋' },
  'ai/history/concluidos': { label: 'Histórico', icon: '📜' },
  'knowledge': { label: 'Knowledge Base', icon: '🧠' },
  'workflows/propostas': { label: 'Propostas', icon: '📝' },
  'workflows/pendentes': { label: 'Pendentes', icon: '⏳' },
};

function FileIcon({ file }) {
  if (file.isDirectory) return <FolderOpen size="13" />;
  if (file.isTemplate) return <AlertTriangle size="13" style={{ color: 'var(--accent-red)' }} />;
  if (file.hasContent) return <CheckCircle size="13" style={{ color: 'var(--accent-green)' }} />;
  return <FileText size="13" style={{ color: 'var(--text-muted)' }} />;
}

function StatusBadge({ file }) {
  if (file.isTemplate) return <span style={{ fontSize: '0.55rem', color: 'var(--accent-red)', background: 'var(--accent-red-dim)', padding: '1px 5px', borderRadius: '3px' }}>Placeholder</span>;
  if (!file.hasContent && file.isMarkdown) return <span style={{ fontSize: '0.55rem', color: 'var(--accent-red)', padding: '1px 5px', borderRadius: '3px', border: '1px solid var(--accent-red)' }}>Vazio</span>;
  if (file.isMarkdown) return <span style={{ fontSize: '0.55rem', color: 'var(--accent-green)', background: 'var(--accent-green-dim)', padding: '1px 5px', borderRadius: '3px' }}>OK</span>;
  return null;
}

function WorkspaceExplorer() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/workspace/status`);
      setStatus(await res.json());
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchStatus(); }, []);

  const toggleSection = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const renderSection = (title, icon, data, key) => {
    if (!data?.exists) {
      return (
        <div style={{ padding: '8px 12px', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
          {icon} {title} — <em>não encontrado</em>
        </div>
      );
    }

    const isExpanded = expanded[key];
    const total = data.files.length;
    const ok = data.files.filter(f => f.hasContent && !f.isTemplate).length;
    const issues = data.files.filter(f => f.isTemplate || (!f.hasContent && f.isMarkdown)).length;

    return (
      <div style={{ borderBottom: '1px solid var(--border-color)' }}>
        <button
          onClick={() => toggleSection(key)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            width: '100%', padding: '10px 12px', border: 'none',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--text-primary)', fontSize: '0.78rem', fontWeight: 600,
            textAlign: 'left',
          }}
        >
          <span>{icon}</span>
          <span style={{ flex: 1 }}>{title}</span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{ok}/{total}</span>
          {issues > 0 && (
            <span style={{ fontSize: '0.6rem', color: 'var(--accent-red)', background: 'var(--accent-red-dim)', padding: '1px 6px', borderRadius: '3px' }}>
              {issues} pendente(s)
            </span>
          )}
          <span style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: '0.12s', fontSize: '0.7rem' }}>▶</span>
        </button>
        {isExpanded && (
          <div style={{ padding: '0 12px 8px 28px' }}>
            {data.files.map(f => (
              <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0', fontSize: '0.7rem' }}>
                <FileIcon file={f} />
                <span style={{ color: f.isTemplate ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                  {f.name}
                </span>
                <StatusBadge file={f} />
                <span style={{ marginLeft: 'auto', fontSize: '0.55rem', color: 'var(--text-muted)' }}>
                  {f.size > 1024 ? `${(f.size / 1024).toFixed(1)}kb` : `${f.size}b`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: 'var(--text-secondary)', gap: '10px' }}>
        <RefreshCw size="16" style={{ animation: 'spin 1.2s linear infinite' }} />
        Analisando workspace...
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>📁 Workspace Explorer</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {status && (
            <span style={{
              fontSize: '0.7rem', fontWeight: 700,
              color: status.isFullyConfigured ? 'var(--accent-green)' : status.score > 50 ? 'var(--accent-teal)' : 'var(--accent-red)',
            }}>
              Score: {status.score}%
            </span>
          )}
          <button onClick={fetchStatus} className="btn-secondary" style={{ padding: '2px 6px', fontSize: '0.6rem' }}>
            <RefreshCw size="10" />
          </button>
        </div>
      </div>
      {renderSection('Squads', '👥', status?.ai?.squads, 'squads')}
      {renderSection('Regras', '🛡️', status?.ai?.rules, 'rules')}
      {renderSection('Skills', '🎯', status?.ai?.skills, 'skills')}
      {renderSection('Templates', '📋', status?.ai?.templates, 'templates')}
      {renderSection('Knowledge Base', '🧠', status?.knowledge, 'knowledge')}
      {renderSection('Propostas', '📝', status?.workflows?.propostas, 'propostas')}
      {renderSection('Pendentes', '⏳', status?.workflows?.pendentes, 'pendentes')}
      {renderSection('Histórico', '📜', status?.ai?.history, 'history')}
    </div>
  );
}

export default WorkspaceExplorer;
