import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

function LinearSettings({ triggerNotification }) {
  const [settings, setSettings] = useState({
    apiKey: '',
    teamId: '',
  });
  const [status, setStatus] = useState(null); // null | 'connected' | 'error'
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/linear/settings`);
        const data = await res.json();
        if (data.apiKey || data.teamId) {
          setSettings({ apiKey: '', teamId: data.teamId || '' });
          setStatus(data.connected ? 'connected' : 'error');
        }
      } catch (err) {
        console.error('Failed to load Linear settings:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/linear/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.connected ? 'connected' : 'error');
        triggerNotification(
          data.connected ? '✅ Linear conectado com sucesso!' : '⚠️ Configuração salva, mas conexão falhou.',
          data.connected ? 'success' : 'error'
        );
      } else {
        setStatus('error');
        triggerNotification('Erro ao salvar configuração: ' + (data.error || 'Desconhecido'), 'error');
      }
    } catch (err) {
      setStatus('error');
      triggerNotification('Falha ao comunicar com o servidor.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-slide-in" style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Integrações Externas
        </span>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 600, marginTop: '2px' }}>Configuração do Linear</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '6px', lineHeight: '1.4' }}>
          Conecte o Gigio Flow Studio à sua conta do Linear para criar issues diretamente do pipeline de cards.
        </p>
      </div>

      <div className="glass-card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '24px' }}>
        {/* Status indicator */}
        {status && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', borderRadius: '6px', marginBottom: '20px',
            background: status === 'connected' ? 'var(--accent-green-dim)' : 'var(--accent-red-dim)',
            border: `1px solid ${status === 'connected' ? 'var(--accent-green)' : 'var(--accent-red)'}`,
          }}>
            {status === 'connected'
              ? <CheckCircle2 size="14" style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
              : <AlertCircle size="14" style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
            }
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: status === 'connected' ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {status === 'connected' ? 'Conectado ao Linear com sucesso!' : 'Não conectado — verifique sua API Key e Team ID.'}
            </span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Linear API Key</label>
            <input
              type="password"
              className="form-input"
              placeholder={status === 'connected' ? 'Chave configurada nesta sessÃ£o' : 'lin_api_xxxxxxxxxxxxx'}
              value={settings.apiKey}
              onChange={e => setSettings({ ...settings, apiKey: e.target.value })}
            />
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Sua chave de API pessoal do Linear. Nunca é compartilhada com servidores externos.
            </span>
          </div>

          <div className="form-group">
            <label>Linear Team ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: ABC ou team_xxxxxx"
              value={settings.teamId}
              onChange={e => setSettings({ ...settings, teamId: e.target.value })}
            />
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
              Encontrado em Settings → Teams no seu workspace do Linear.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <a
              href="https://linear.app/settings/api"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-purple)', textDecoration: 'none' }}
            >
              <ExternalLink size="12" />
              Como obter minha API Key do Linear
            </a>

            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              disabled={saving}
            >
              {saving ? (
                <><RefreshCw size="12" style={{ animation: 'spin 1.2s linear infinite' }} /> Testando conexão...</>
              ) : (
                '💾 Salvar e Testar Conexão'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* How-to guide */}
      <div className="glass-card" style={{ marginTop: '20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '20px' }}>
        <h3 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📖 Como configurar
        </h3>
        <ol style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            'Acesse linear.app e faça login na sua conta.',
            'Vá em Settings → API → Personal API Keys.',
            'Clique em "Create key" e copie a chave gerada.',
            'Para o Team ID, acesse Settings → Teams e copie o identificador do seu time.',
            'Cole as informações acima e clique em "Salvar e Testar Conexão".',
          ].map((step, i) => (
            <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export default LinearSettings;
