import React from 'react';
import {
  Settings,
  Users,
  KanbanSquare,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Plus,
  Bell,
  Sun,
  Moon,
  Trash2,
  Workflow,
  GitPullRequest,
} from 'lucide-react';

function Sidebar({
  activeTab,
  setActiveTab,
  project,
  projects,
  activePath,
  theme,
  toggleTheme,
  sectionsCollapsed,
  toggleSection,
  showAddModal,
  setShowAddModal,
  handleSelectProject,
  handleDeleteProject,
  notification,
  setIsNewProject,
}) {
  const navBtnStyle = (tab) => ({
    background: activeTab === tab ? 'rgba(255,255,255,0.03)' : 'transparent',
    color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
    border: 'none',
    padding: '6px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    fontSize: '0.8rem',
    fontWeight: 500,
  });

  const iconStyle = (tab) => ({
    opacity: activeTab === tab ? 1 : 0.4,
    color: activeTab === tab ? 'var(--accent-purple)' : 'inherit',
  });

  return (
    <aside className="dashboard-sidebar" style={{ userSelect: 'none' }}>
      <div>
        {/* Workspace Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '6px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div style={{ background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-teal) 100%)', width: '20px', height: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ color: '#fff', fontSize: '9px', fontWeight: 800 }}>
                {(project.name || 'G').substring(0, 1).toUpperCase()}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {project.name || 'Meu Projeto'}
            </span>
          </div>
          <ChevronDown size="12" style={{ color: 'var(--text-muted)', cursor: 'pointer' }} onClick={() => setShowAddModal(true)} />
        </div>

        {/* Section 1: GERAL */}
        <div style={{ marginBottom: '16px' }}>
          <div
            onClick={() => toggleSection('workspace')}
            style={{ display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'space-between', cursor: 'pointer', padding: '4px 0', marginBottom: '4px' }}
          >
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Geral
            </span>
            {sectionsCollapsed.workspace ? <ChevronRight size="10" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size="10" style={{ color: 'var(--text-muted)' }} />}
          </div>

          {!sectionsCollapsed.workspace && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }} className="animate-slide-in">
              <button
                onClick={() => { setActiveTab('onboarding'); setIsNewProject(false); }}
                style={navBtnStyle('onboarding')}
              >
                <Sparkles size="13" style={iconStyle('onboarding')} />
                Configuração Inicial
              </button>

              <button
                onClick={() => {}}
                style={{ ...navBtnStyle('inbox'), color: 'var(--text-secondary)' }}
              >
                <Bell size="13" style={{ opacity: 0.4 }} />
                Inbox / Caixa de Entrada
              </button>
            </div>
          )}
        </div>

        {/* Section 2: ESTEIRA DE ENGENHARIA */}
        <div style={{ marginBottom: '16px' }}>
          <div
            onClick={() => toggleSection('workflow')}
            style={{ display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'space-between', cursor: 'pointer', padding: '4px 0', marginBottom: '4px' }}
          >
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Esteira de Engenharia
            </span>
            {sectionsCollapsed.workflow ? <ChevronRight size="10" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size="10" style={{ color: 'var(--text-muted)' }} />}
          </div>

          {!sectionsCollapsed.workflow && (
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }} className="animate-slide-in">
              <button
                onClick={() => { setActiveTab('board'); setIsNewProject(false); }}
                style={navBtnStyle('board')}
              >
                <KanbanSquare size="13" style={iconStyle('board')} />
                Quadro de Ciclo Ativo
              </button>

              <button
                onClick={() => { setActiveTab('squad'); setIsNewProject(false); }}
                style={navBtnStyle('squad')}
              >
                <Users size="13" style={iconStyle('squad')} />
                Organograma da Squad
              </button>

              <button
                onClick={() => { setActiveTab('config'); setIsNewProject(false); }}
                style={navBtnStyle('config')}
              >
                <Settings size="13" style={iconStyle('config')} />
                Rituais e Portões
              </button>

              <button
                onClick={() => { setActiveTab('guia'); setIsNewProject(false); }}
                style={navBtnStyle('guia')}
              >
                <Workflow size="13" style={iconStyle('guia')} />
                Arquitetura &amp; Guia
              </button>

              <button
                onClick={() => { setActiveTab('linear'); setIsNewProject(false); }}
                style={navBtnStyle('linear')}
              >
                <GitPullRequest size="13" style={iconStyle('linear')} />
                Integrações
              </button>
            </nav>
          )}
        </div>

        {/* Section 3: WORKSPACES */}
        <div style={{ marginBottom: '16px' }}>
          <div
            onClick={() => toggleSection('squads')}
            style={{ display: 'flex', alignItems: 'center', justifySelf: 'start', justifyContent: 'space-between', cursor: 'pointer', padding: '4px 0', marginBottom: '4px' }}
          >
            <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Workspaces ({projects.length})
            </span>
            {sectionsCollapsed.squads ? <ChevronRight size="10" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size="10" style={{ color: 'var(--text-muted)' }} />}
          </div>

          {!sectionsCollapsed.squads && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '110px', overflowY: 'auto' }} className="animate-slide-in">
              {projects.map(p => (
                <div
                  key={p.path}
                  onClick={() => !p.active && handleSelectProject(p.path)}
                  style={{
                    background: p.active ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: p.active ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <span style={{ fontSize: '0.76rem', color: p.active ? 'var(--text-primary)' : 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
                    {p.name}
                  </span>
                  {!p.active && (
                    <button
                      onClick={(e) => handleDeleteProject(p.path, e)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', opacity: 0.4 }}
                    >
                      <Trash2 size="9" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Theme Toggle & Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={toggleTheme}
          className="btn-secondary"
          style={{ width: '100%', padding: '6px', fontSize: '0.72rem', justifyContent: 'center', gap: '6px' }}
        >
          {theme === 'dark' ? <Sun size="12" /> : <Moon size="12" />}
          Alternar Tema
        </button>

        <div className="glass-card" style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="pulse-green" style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent-green)' }} />
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Online no Workspace
          </span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
