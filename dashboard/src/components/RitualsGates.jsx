import React from 'react';
import { Lock, Check } from 'lucide-react';

function RitualsGates({ approvals, setApprovals, saving, onSave, triggerNotification }) {
  return (
    <div className="animate-slide-in" style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Rituais e Portões
        </span>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 600 }}>Portões de Aprovação</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px', lineHeight: '1.4' }}>
          Configure quais aprovações são obrigatórias antes de avançar na esteira de engenharia.
        </p>
      </div>

      <div className="glass-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
          <Lock size="12" style={{ color: 'var(--accent-purple)' }} />
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rituais e Portões</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { key: 'ceoApproval', label: 'CEO Ideation Approval', description: 'Requer aprovação do CEO antes de criar cards de proposta.' },
            { key: 'pmApproval', label: 'PM PRD Acceptance', description: 'Requer que o PM aprove a especificação antes de iniciar desenvolvimento.' },
            { key: 'ctoApproval', label: 'CTO Architecture RLS Lock', description: 'Requer que o CTO valide a arquitetura e segurança antes do deploy.' },
          ].map(gate => (
            <div key={gate.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{gate.label}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{gate.description}</span>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}>
                <span style={{ fontSize: '0.68rem', color: approvals[gate.key] ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {approvals[gate.key] ? 'Ativo' : 'Inativo'}
                </span>
                <input
                  type="checkbox"
                  checked={approvals[gate.key]}
                  onChange={e => setApprovals({ ...approvals, [gate.key]: e.target.checked })}
                  style={{ cursor: 'pointer', width: '14px', height: '14px' }}
                />
              </label>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button onClick={onSave} disabled={saving} className="btn-primary" style={{ padding: '8px 14px' }}>
            {saving ? 'Sincronizando...' : 'Gravar Alterações Físicas'} <Check size="13" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RitualsGates;
