import React from 'react';
import { X } from 'lucide-react';

function SquadOrganogram({
  squads,
  selectedAgent,
  setSelectedAgent,
  onToggleSquad,
  onSquadCustomRulesChange,
  onSquadPresetChange,
  saving,
  onSave,
  project,
}) {
  return (
    <div className="animate-slide-in" style={{ maxWidth: '1000px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Orquestrador
          </span>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Mapa Visual da Squad</h1>
        </div>
        <button onClick={onSave} disabled={saving} className="btn-primary" style={{ padding: '6px 12px' }}>
          {saving ? 'Salvando...' : 'Salvar Alterações nos Squads'}
        </button>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
        Rede neural SVG representando a hierarquia das squads de IA. Clique nos nós para configurar diretrizes na Sidebar à direita.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: selectedAgent ? '1fr 340px' : '1fr', gap: '20px', alignItems: 'start', transition: 'var(--transition-smooth)' }}>

        {/* SVG NETWORK CHART */}
        <div className="glass-card" style={{ display: 'flex', justifyContent: 'center', background: 'var(--bg-secondary)', padding: '24px 10px', minHeight: '480px', border: '1px solid var(--border-color)' }}>
          <svg width="560" height="400" viewBox="0 0 560 400" style={{ maxWidth: '100%' }}>
            {/* Connectors */}
            <path d="M 280 45 L 280 110" fill="none" stroke="var(--accent-purple)" strokeWidth="1.5" className="org-connector" />
            <path d="M 280 150 C 280 190, 140 190, 140 220" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
            <path d="M 280 150 C 280 190, 420 190, 420 220" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
            <path d="M 140 260 L 140 300" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
            <path d="M 420 260 L 420 300" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
            <path d="M 140 340 C 140 375, 280 375, 280 320" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3" />
            <path d="M 420 340 C 420 375, 280 375, 280 320" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="3" />

            {/* NODE: FOUNDER */}
            <g className="org-node" onClick={() => setSelectedAgent({ id: 'human', name: '👑 VOCÊ (BOARD)', isActive: true, description: 'Fundador supremo do ecossistema. Fornece aprovação humana em rituais do Gigio Flow, dita prioridades do roadmap e homologa releases.', preset: 'Human-in-the-loop', customRules: 'Fundador supremo do ecossistema.' })}>
              <rect x="180" y="10" width="200" height="36" rx="4" fill="var(--bg-primary)" stroke="var(--accent-purple)" strokeWidth="1.5" />
              <text x="280" y="32" fill="var(--text-primary)" fontSize="10" fontWeight="700" textAnchor="middle">👑 VOCÊ (BOARD / FOUNDER)</text>
            </g>

            {squads.map(s => {
              let coords = { x: 180, y: 110 };
              if (s.id === 'pm') coords = { x: 40, y: 220 };
              if (s.id === 'cto') coords = { x: 320, y: 220 };
              if (s.id === 'dev') coords = { x: 40, y: 300 };
              if (s.id === 'qa') coords = { x: 320, y: 300 };
              if (s.id === 'process-analyst') coords = { x: 180, y: 280 };

              const isSel = selectedAgent && selectedAgent.id === s.id;
              const strokeColor = !s.isActive
                ? 'var(--text-muted)'
                : isSel ? 'var(--accent-purple)' : 'var(--border-color)';

              return (
                <g
                  key={s.id}
                  className="org-node"
                  onClick={() => setSelectedAgent(s)}
                  transform={`translate(${coords.x}, ${coords.y})`}
                >
                  <rect x="0" y="0" width="200" height="36" rx="4" fill="var(--bg-primary)" stroke={strokeColor} strokeWidth={isSel ? 2 : 1} style={{ transition: 'all 0.15s' }} />
                  {s.isActive && <rect x="0" y="0" width="200" height="36" rx="4" fill="none" stroke="var(--accent-purple)" strokeWidth="1" opacity="0.3" className="org-connector" />}
                  <circle cx="16" cy="18" r="4" fill={s.isActive ? 'var(--accent-green)' : 'var(--accent-red)'} />
                  <text x="28" y="21" fill={s.isActive ? 'var(--text-primary)' : 'var(--text-muted)'} fontSize="10" fontWeight="600">
                    {s.name.replace(' Agent', '')}
                  </text>
                  {s.isActive && (
                    <text x="185" y="21" fill="var(--accent-teal)" fontSize="8" fontWeight="600" textAnchor="end">
                      {s.preset || 'Speedrun'}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* PROPERTY DRAWER SIDEBAR */}
        {selectedAgent && (
          <div className="glass-card animate-slide-in" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedAgent.name}</h3>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{selectedAgent.id !== 'human' ? `${selectedAgent.id}.md` : 'Manual'}</span>
              </div>
              <button onClick={() => setSelectedAgent(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size="14" />
              </button>
            </div>

            {selectedAgent.id !== 'human' ? (
              <div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-primary)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Status da Persona</span>
                  <button
                    type="button"
                    onClick={() => onToggleSquad(selectedAgent.id)}
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.68rem',
                      borderRadius: '4px',
                      background: selectedAgent.isActive ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
                      border: selectedAgent.isActive ? '1px solid var(--accent-green)' : '1px solid var(--accent-red)',
                      color: selectedAgent.isActive ? 'var(--accent-green)' : 'var(--accent-red)',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedAgent.isActive ? 'Ativo' : 'Inativo'}
                  </button>
                </div>

                {selectedAgent.isActive && (
                  <div className="animate-slide-in">
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '0.68rem' }}>Modo de Trabalho (Preset)</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => onSquadPresetChange(selectedAgent.id, 'Speedrun')}
                          className={selectedAgent.preset === 'Speedrun' ? 'btn-primary' : 'btn-secondary'}
                          style={{ padding: '6px', fontSize: '0.72rem', justifyContent: 'center', borderRadius: '4px' }}
                        >
                          ⚡ Speedrun
                        </button>
                        <button
                          type="button"
                          onClick={() => onSquadPresetChange(selectedAgent.id, 'Enterprise')}
                          className={selectedAgent.preset === 'Enterprise' ? 'btn-primary' : 'btn-secondary'}
                          style={{ padding: '6px', fontSize: '0.72rem', justifyContent: 'center', borderRadius: '4px' }}
                        >
                          🏛️ Enterprise
                        </button>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.68rem' }}>Diretrizes do Agent</label>
                      <textarea
                        className="form-input form-textarea"
                        style={{ fontFamily: 'monospace', fontSize: '0.75rem', minHeight: '140px', background: 'var(--bg-primary)' }}
                        value={selectedAgent.customRules}
                        onChange={(e) => onSquadCustomRulesChange(selectedAgent.id, e.target.value)}
                        placeholder="Injete regras de foco específicas aqui..."
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                {selectedAgent.description}
              </p>
            )}
          </div>
        )}
      </div>

      {!selectedAgent && (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>
          Selecione um agente no mapa visual acima!
        </div>
      )}
    </div>
  );
}

export default SquadOrganogram;
