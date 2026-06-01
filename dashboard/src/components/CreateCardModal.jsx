import React, { useState } from 'react';
import { X } from 'lucide-react';

const PHASES = [
  { value: 'propostas', label: 'Propostas' },
  { value: 'pendentes', label: 'Pendentes' },
  { value: 'em-progresso', label: 'Em Progresso' },
];

function CreateCardModal({ isOpen, defaultPhase, onClose, onSubmit, squads, saving }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    phase: defaultPhase || 'propostas',
    squadId: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  const handleClose = () => {
    setForm({ title: '', description: '', phase: defaultPhase || 'propostas', squadId: '' });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
    }}>
      <div className="glass-card animate-slide-in" style={{
        maxWidth: '520px',
        width: '90%',
        border: '1px solid var(--border-focus)',
        background: 'var(--bg-secondary)',
        padding: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>📝 Criar Novo Card</h3>
          <button onClick={handleClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size="16" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Título <span style={{ color: 'var(--accent-red)' }}>*</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Checkout Simplificado"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Descreva brevemente o objetivo deste card..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ minHeight: '80px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Fase</label>
              <select
                className="form-input"
                value={form.phase}
                onChange={e => setForm({ ...form, phase: e.target.value })}
                style={{ height: '34px' }}
              >
                {PHASES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Squad Responsável</label>
              <select
                className="form-input"
                value={form.squadId}
                onChange={e => setForm({ ...form, squadId: e.target.value })}
                style={{ height: '34px' }}
              >
                <option value="">Sem squad</option>
                {squads.filter(s => s.isActive).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
            <button type="button" onClick={handleClose} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} disabled={saving || !form.title.trim()}>
              {saving ? 'Criando...' : 'Criar Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCardModal;
