import React from 'react';
import { MessageSquare, RefreshCw, ChevronRight, CheckCircle2 } from 'lucide-react';

function CeoChat({ ceoChat, llmConfig, board, onSubmit, onReset, onMoveCard, triggerNotification, setCeoChat }) {
  return (
    <div className="glass-card" style={{ marginBottom: '20px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageSquare size="16" />
        </div>
        <div>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 600 }}>💬 Bate-papo de Ideação do CEO Agent</h3>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            {llmConfig.apiKey ? 'Connected (API Real Gemini/OpenAI)' : 'Offline (Modo Simulação local ativo)'}
          </span>
        </div>
      </div>

      {!ceoChat.response ? (
        <form onSubmit={onSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '10px', marginBottom: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Título do Recurso</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Checkout Simplificado"
                value={ceoChat.ideaTitle}
                onChange={e => setCeoChat({ ...ceoChat, ideaTitle: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Descrição do Pedido / Dor a Curar</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ex: Permitir compras em 1 clique salvando dados do cartão..."
                value={ceoChat.ideaDescription}
                onChange={e => setCeoChat({ ...ceoChat, ideaDescription: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={ceoChat.generating} className="btn-primary" style={{ padding: '6px 12px' }}>
              {ceoChat.generating ? (
                <>
                  <RefreshCw style={{ animation: 'spin 1.2s linear infinite' }} size="13" /> CEO Analisando...
                </>
              ) : (
                <>
                  Validar com CEO Agent <ChevronRight size="13" />
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="animate-slide-in">
          <div className="glass-card" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '14px', marginBottom: '14px', maxHeight: '250px', overflowY: 'auto' }}>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: '1.45' }}>
              {ceoChat.response}
            </pre>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--accent-teal)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size="14" style={{ color: 'var(--accent-green)' }} /> Proposta física Markdown criada na esteira local!
            </p>
            <button onClick={onReset} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
              Validar Nova Ideia de Negócio
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CeoChat;
