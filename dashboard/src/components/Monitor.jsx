import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, ExternalLink, RefreshCw, Sparkles, XCircle } from 'lucide-react';
import WorkspaceExplorer from './WorkspaceExplorer';
import PipelineProgress from './PipelineProgress';

const API_BASE = 'http://localhost:3001/api';

function Monitor({ project, board, triggerNotification }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/workspace/status`);
      setStatus(await res.json());
    } catch {
      triggerNotification?.('Falha ao carregar o monitor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchKnowledge = async () => {
    try {
      const res = await fetch(`${API_BASE}/knowledge`);
      const data = await res.json();
      setStatus((prev) => (prev ? { ...prev, _knowledge: data.files || [] } : prev));
    } catch {}
  };

  useEffect(() => {
    fetchStatus().then(fetchKnowledge);
  }, []);

  const handleRefresh = () => {
    fetchStatus().then(fetchKnowledge);
  };

  const handleBootstrap = async () => {
    const projectPath = prompt('Caminho do projeto:');
    if (!projectPath) return;

    try {
      const res = await fetch(`${API_BASE}/project/bootstrap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectPath }),
      });
      const data = await res.json();

      if (!data.success) {
        triggerNotification?.(data.error || 'Erro ao mapear projeto', 'error');
        return;
      }

      triggerNotification?.(`Projeto ${data.project.name} mapeado`);
      handleRefresh();
    } catch {
      triggerNotification?.('Erro de conexao', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: 'var(--text-secondary)', gap: '10px' }}>
        <RefreshCw size="18" style={{ animation: 'spin 1.2s linear infinite', color: 'var(--accent-purple)' }} />
        Carregando monitor...
      </div>
    );
  }

  const score = status?.score ?? 0;
  const operationalScore = status?.operational?.score ?? 0;
  const knowledge = status?._knowledge || [];
  const okFiles = knowledge.filter((file) => file.hasContent && !file.isTemplate).length;
  const totalFiles = knowledge.length || 7;
  const isConfigured = status?.isFullyConfigured || score >= 50;
  const linearOk = status?.linear?.hasApiKey;
  const operational = status?.operational || {};
  const legacyReferences = operational?.drift?.legacyReferences || [];
  const contractCoverage = operational?.contract?.expectedReferences
    ? `${operational.contract.referencedBy?.length || 0}/${operational.contract.expectedReferences}`
    : '0/0';
  const missingMappedStatuses = operational?.linearStatusMap?.missing || [];

  const missingKnowledge = knowledge
    .filter((file) => !file.hasContent || file.isTemplate)
    .map((file) => ({
      section: 'knowledge',
      label: file.label,
      icon: file.isTemplate ? 'warning' : 'error',
      hint: file.isTemplate ? 'placeholder' : 'vazio',
    }));

  const missingSkills = status?.ai?.skills?.files?.filter((file) => !file.hasContent || file.isTemplate) || [];
  const missingRules = status?.ai?.rules?.files?.filter((file) => !file.hasContent) || [];
  const missingSquads = status?.ai?.squads?.files?.filter((file) => !file.hasContent) || [];

  const allMissing = [
    ...missingKnowledge,
    ...missingSkills.map((file) => ({
      section: 'skills',
      label: file.name,
      icon: file.isTemplate ? 'warning' : 'error',
      hint: file.isTemplate ? 'placeholder' : 'vazio',
    })),
    ...missingRules.map((file) => ({ section: 'rules', label: file.name, icon: 'error', hint: 'vazio' })),
    ...missingSquads.map((file) => ({ section: 'squads', label: file.name, icon: 'error', hint: 'vazio' })),
  ];

  if (score < 30 || allMissing.length > 0) {
    return (
      <div className="animate-slide-in" style={{ maxWidth: '760px', margin: '40px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ background: 'var(--accent-purple)', width: '56px', height: '56px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Sparkles style={{ color: '#fff', width: '28px', height: '28px' }} />
          </div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 600, margin: '0 0 8px' }}>
            {score < 10 ? 'Workspace nao configurado' : 'Workspace precisa de atencao'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            O agente resolve isso pelo terminal.
          </p>
        </div>

        {allMissing.length > 0 && (
          <div className="glass-card" style={{ padding: '18px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '12px' }}>
              O que esta faltando ({allMissing.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {allMissing.map((item, index) => (
                <div key={`${item.section}-${item.label}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '4px', background: 'var(--bg-primary)', fontSize: '0.75rem' }}>
                  <span style={{ color: item.icon === 'warning' ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                    {item.icon === 'warning' ? <AlertTriangle size="14" /> : <XCircle size="14" />}
                  </span>
                  <span style={{ color: 'var(--text-primary)', flex: 1 }}>
                    {item.section}/{item.label}
                  </span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', padding: '2px 6px', borderRadius: '3px', border: '1px solid var(--border-color)' }}>
                    {item.hint}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="glass-card" style={{ flex: 1, minWidth: '180px', padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Linear</div>
            <div style={{ fontWeight: 600, color: linearOk ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.78rem' }}>
              {linearOk ? 'Conectado' : 'Nao configurado'}
            </div>
          </div>
          <div className="glass-card" style={{ flex: 1, minWidth: '180px', padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Contrato</div>
            <div style={{ fontWeight: 600, color: operationalScore >= 80 ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.78rem' }}>
              {operationalScore}% operacional
            </div>
          </div>
          <div className="glass-card" style={{ flex: 1, minWidth: '180px', padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Health</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: score >= 50 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {score}%
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px', fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginBottom: '20px' }}>
          <div style={{ marginBottom: '8px' }}><strong>Diga ao agente:</strong></div>
          {score < 10 ? (
            <>
              <div style={{ marginBottom: '4px' }}>Novo: "Crie workspace em &lt;path&gt; com &lt;stack&gt;"</div>
              <div>Existente: "Mapeie o projeto em &lt;path&gt; no Gigio Flow"</div>
            </>
          ) : (
            <div>"Configure o que esta faltando" ou "Corrija os arquivos com placeholder"</div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={handleBootstrap} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem' }}>
            Mapear projeto
          </button>
          <button onClick={handleRefresh} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.78rem' }}>
            Atualizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gigio Flow Monitor</span>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 600, margin: '2px 0 0' }}>{project?.name || 'Workspace Ativo'}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: isConfigured ? 'var(--accent-green)' : 'var(--accent-red)', lineHeight: 1 }}>
              {score}%
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Health</div>
          </div>
          <button onClick={handleRefresh} className="btn-secondary" style={{ padding: '4px 8px' }}>
            <RefreshCw size="13" />
          </button>
        </div>
      </div>

      <PipelineProgress board={board} />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '16px', alignItems: 'start' }}>
        <WorkspaceExplorer />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '10px' }}>
              Knowledge Base <span style={{ fontWeight: 400, marginLeft: '4px' }}>{okFiles}/{totalFiles}</span>
            </h3>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {knowledge.map((file) => {
                const ok = file.hasContent && !file.isTemplate;
                return (
                  <span
                    key={file.id}
                    style={{
                      fontSize: '0.62rem',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      background: ok ? 'var(--accent-green-dim)' : file.isTemplate ? 'var(--accent-red-dim)' : 'rgba(255,255,255,0.03)',
                      color: ok ? 'var(--accent-green)' : file.isTemplate ? 'var(--accent-red)' : 'var(--text-muted)',
                      border: `1px solid ${ok ? 'rgba(46,163,118,0.3)' : file.isTemplate ? 'rgba(229,72,77,0.3)' : 'var(--border-color)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {ok ? <CheckCircle size="9" /> : file.isTemplate ? <AlertTriangle size="9" /> : <XCircle size="9" />}
                    {file.label.replace('.md', '')}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '10px' }}>
              Contrato Operacional
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Contrato referenciado: <strong style={{ color: 'var(--text-primary)' }}>{contractCoverage}</strong>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                Status mapeados: <strong style={{ color: 'var(--text-primary)' }}>{7 - missingMappedStatuses.length}/7</strong>
              </div>
            </div>
            {legacyReferences.length > 0 && (
              <div style={{ marginBottom: '10px', padding: '10px', borderRadius: '6px', background: 'var(--accent-red-dim)', border: '1px solid rgba(229,72,77,0.28)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--accent-red)', fontWeight: 700, marginBottom: '6px' }}>
                  Referencias antigas detectadas
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                  {legacyReferences.map((item) => <span key={item}>{item}</span>)}
                </div>
              </div>
            )}
            {missingMappedStatuses.length > 0 && (
              <div style={{ padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '6px' }}>
                  Faltam IDs reais do Linear
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {missingMappedStatuses.map((statusName) => (
                    <span
                      key={statusName}
                      style={{
                        fontSize: '0.62rem',
                        padding: '4px 8px',
                        borderRadius: '999px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {statusName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '8px' }}>Linear</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: linearOk ? 'var(--accent-green)' : 'var(--accent-red)' }} />
                <span style={{ color: linearOk ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                  {linearOk ? 'Conectado' : 'Nao configurado'}
                </span>
              </div>
              <a
                href="https://linear.app"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.62rem', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', textDecoration: 'none' }}
              >
                <ExternalLink size="9" /> Abrir Linear
              </a>
            </div>

            <div className="glass-card" style={{ padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '8px' }}>Workflows</h3>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span>Propostas: <strong>{(board?.propostas || []).length}</strong></span>
                <span>Pendentes: <strong>{(board?.pendentes || []).length}</strong></span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '14px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '8px' }}>
              Atividade Recente
            </h3>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', maxHeight: '120px', overflowY: 'auto' }}>
              {knowledge.find((file) => file.id === 'historico')?.content?.split('\n')
                .filter((line) => line.startsWith('### ['))
                .slice(0, 3)
                .map((line, index) => (
                  <div key={`${line}-${index}`} style={{ marginBottom: '4px', padding: '4px 0', borderBottom: index < 2 ? '1px solid var(--border-color)' : 'none' }}>
                    {line}
                  </div>
                ))}
              {!knowledge.find((file) => file.id === 'historico')?.content && (
                <span>Nenhuma atividade registrada ainda.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Monitor;
