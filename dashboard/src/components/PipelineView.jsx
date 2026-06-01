import React, { useState } from 'react';
import { ChevronLeft, RefreshCw, Check, X, Copy, CheckCircle2 } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

const PHASES_ORDER = ['propostas', 'pendentes', 'em-progresso', 'concluidos'];

function detectSteps(rawContent = '') {
  return {
    step1: rawContent.includes('## 🔧 Refinamento LLM') || rawContent.includes('## 🔧 Refine'),
    step2: rawContent.includes('## ⚖️ Estimativa de Complexidade') || rawContent.includes('Estimativa:'),
    step3: rawContent.includes('Human-Approved: true'),
    step5: rawContent.includes('## 🧪 Relatório de QA Técnico') || rawContent.includes('QA-Status:'),
    step6: rawContent.includes('Human-QA-Approved: true'),
    step7: rawContent.includes('Linear Issue:') || rawContent.includes('linear-issue:'),
  };
}

function StepRow({ number, title, children }) {
  return (
    <div style={{
      display: 'flex',
      gap: '14px',
      padding: '14px 16px',
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-color)',
      borderRadius: '6px',
    }}>
      <div style={{
        width: '28px', height: '28px', flexShrink: 0,
        background: 'var(--accent-purple-dim)',
        color: 'var(--accent-purple)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: '11px',
      }}>
        {number}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>{title}</h4>
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ done, doneLabel = 'Concluído', pendingLabel = 'Aguardando' }) {
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
      background: done ? 'var(--accent-green-dim)' : 'rgba(255,255,255,0.05)',
      color: done ? 'var(--accent-green)' : 'var(--text-muted)',
    }}>
      {done ? `✅ ${doneLabel}` : `⏳ ${pendingLabel}`}
    </span>
  );
}

function PipelineView({ card, llmConfig, onClose, onMoveCard, onRefresh, triggerNotification }) {
  const [loading, setLoading] = useState({});
  const [copied, setCopied] = useState(false);
  const [rawContent, setRawContent] = useState(card.rawContent || '');
  const [result, setResult] = useState('');

  const steps = detectSteps(rawContent);

  const callApi = async (endpoint, body, stepKey) => {
    setLoading(prev => ({ ...prev, [stepKey]: true }));
    try {
      const res = await fetch(`${API_BASE}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card.id,
          phase: card.phase,
          apiKey: llmConfig?.apiKey,
          provider: llmConfig?.provider,
          ...body,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh rawContent by fetching board
        if (onRefresh) onRefresh();
        if (data.rawContent) setRawContent(data.rawContent);
        triggerNotification(`Passo executado com sucesso!`);
      } else {
        triggerNotification(data.error || 'Erro desconhecido', 'error');
      }
      return data;
    } catch (err) {
      triggerNotification('Falha na comunicação com o servidor.', 'error');
    } finally {
      setLoading(prev => ({ ...prev, [stepKey]: false }));
    }
  };

  const handleRefine = () => callApi('workflow/refine', {}, 'step1');
  const handleEstimate = () => callApi('workflow/estimate', {}, 'step2');
  const handleApprove = (approved) => callApi('workflow/human-approve', { approvalType: 'scope', approved }, 'step3');
  const handleQA = () => callApi('workflow/qa-review', {}, 'step5');
  const handleHumanQA = (approved) => callApi('workflow/human-approve', { approvalType: 'human-qa', approved }, 'step6');
  const handleLinear = () => callApi('linear/create-issue', {}, 'step7');
  const handleComplete = async () => {
    const data = await callApi('workflow/complete', { result }, 'step8');
    if (data?.success) {
      if (onRefresh) onRefresh();
      onClose();
    }
  };

  const devPrompt = `Aja como Dev Agent. Leia os arquivos abaixo e implemente exatamente o que está nos Critérios de Aceite:\n\n${rawContent || card.description}`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(devPrompt).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      triggerNotification('Prompt copiado para o clipboard!');
    });
  };

  const Spinner = () => <RefreshCw size="12" style={{ animation: 'spin 1.2s linear infinite', display: 'inline-block' }} />;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99998, padding: '20px',
    }}>
      <div className="glass-card animate-slide-in" style={{
        width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid var(--border-focus)',
        background: 'var(--bg-secondary)',
        padding: '0',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-primary)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <ChevronLeft size="13" /> Voltar
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pipeline</span>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {card.title}
            </h2>
          </div>
          <span style={{ fontSize: '0.65rem', background: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', padding: '2px 8px', borderRadius: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {card.phase}
          </span>
        </div>

        {/* Steps */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {/* Step 1: PRD / Especificação */}
          <StepRow number="①" title="PRD / Especificação — Refinamento LLM">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <StatusBadge done={steps.step1} pendingLabel="Aguardando refinamento" />
              <button
                onClick={handleRefine}
                className="btn-primary"
                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                disabled={loading.step1}
              >
                {loading.step1 ? <><Spinner /> Refinando...</> : 'Refinar com IA ▶'}
              </button>
              {rawContent && (
                <details style={{ width: '100%', marginTop: '6px' }}>
                  <summary style={{ fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer' }}>Ver conteúdo atual</summary>
                  <pre style={{ marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', background: 'var(--bg-secondary)', padding: '8px', borderRadius: '4px', maxHeight: '150px', overflowY: 'auto' }}>
                    {rawContent.substring(0, 500)}{rawContent.length > 500 ? '...' : ''}
                  </pre>
                </details>
              )}
            </div>
          </StepRow>

          {/* Step 2: Estimativa de Complexidade */}
          <StepRow number="②" title="Estimativa de Complexidade">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusBadge done={steps.step2} pendingLabel="Aguardando estimativa" />
              <button
                onClick={handleEstimate}
                className="btn-primary"
                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                disabled={loading.step2}
              >
                {loading.step2 ? <><Spinner /> Estimando...</> : 'Estimar com IA ▶'}
              </button>
            </div>
          </StepRow>

          {/* Step 3: Aprovação Humana de Escopo */}
          <StepRow number="③" title="Aprovação de Escopo (Humano)">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <StatusBadge done={steps.step3} doneLabel="Aprovado" pendingLabel="Aguardando aprovação" />
              {!steps.step3 && (
                <>
                  <button
                    onClick={() => handleApprove(true)}
                    className="btn-primary"
                    style={{ padding: '4px 10px', fontSize: '0.72rem', background: 'var(--accent-green)' }}
                    disabled={loading.step3}
                  >
                    {loading.step3 ? <Spinner /> : '✅ Aprovar'}
                  </button>
                  <button
                    onClick={() => handleApprove(false)}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.72rem', color: 'var(--accent-red)' }}
                    disabled={loading.step3}
                  >
                    ❌ Rejeitar
                  </button>
                </>
              )}
            </div>
          </StepRow>

          {/* Step 4: Execução Dev Agent */}
          <StepRow number="④" title="Execução (Dev Agent)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Copie o prompt abaixo e cole no seu Dev Agent preferido:
              </p>
              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '10px', maxHeight: '120px', overflowY: 'auto' }}>
                <pre style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>
                  {devPrompt.substring(0, 300)}{devPrompt.length > 300 ? '...' : ''}
                </pre>
              </div>
              <button
                onClick={handleCopyPrompt}
                className="btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.72rem', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {copied ? <><CheckCircle2 size="12" style={{ color: 'var(--accent-green)' }} /> Copiado!</> : <><Copy size="12" /> Copiar prompt para clipboard</>}
              </button>
            </div>
          </StepRow>

          {/* Step 5: QA Técnica (LLM) */}
          <StepRow number="⑤" title="QA Técnica (LLM)">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusBadge done={steps.step5} pendingLabel="Aguardando QA" />
              <button
                onClick={handleQA}
                className="btn-primary"
                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                disabled={loading.step5}
              >
                {loading.step5 ? <><Spinner /> Rodando QA...</> : 'Rodar QA Técnico ▶'}
              </button>
            </div>
          </StepRow>

          {/* Step 6: QA Humano */}
          <StepRow number="⑥" title="QA Humano">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <StatusBadge done={steps.step6} doneLabel="QA Aprovado" pendingLabel="Aguardando revisão" />
              {!steps.step6 && (
                <>
                  <button
                    onClick={() => handleHumanQA(true)}
                    className="btn-primary"
                    style={{ padding: '4px 10px', fontSize: '0.72rem', background: 'var(--accent-green)' }}
                    disabled={loading.step6}
                  >
                    {loading.step6 ? <Spinner /> : '✅ Aprovado'}
                  </button>
                  <button
                    onClick={() => handleHumanQA(false)}
                    className="btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.72rem', color: 'var(--accent-red)' }}
                    disabled={loading.step6}
                  >
                    ❌ Reprovado
                  </button>
                </>
              )}
            </div>
          </StepRow>

          {/* Step 7: Linear */}
          <StepRow number="⑦" title="Sincronizar com Linear">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <StatusBadge done={steps.step7} doneLabel="Issue criada" pendingLabel="Não criada" />
              <button
                onClick={handleLinear}
                className="btn-primary"
                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                disabled={loading.step7}
              >
                {loading.step7 ? <><Spinner /> Criando...</> : 'Criar Issue no Linear ▶'}
              </button>
            </div>
          </StepRow>

          {/* Step 8: Concluir */}
          <div style={{ padding: '14px 16px', borderRadius: '6px', border: '1px solid var(--accent-green)', background: 'var(--accent-green-dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-green)' }}>
                ⑧ Concluir e Arquivar
              </span>
              <textarea
                className="form-input"
                value={result}
                onChange={e => setResult(e.target.value)}
                placeholder="Resultado entregue, validação feita e impacto no sistema..."
                style={{ marginTop: '8px', minHeight: '72px', background: 'var(--bg-primary)' }}
              />
            </div>
            <button
              onClick={handleComplete}
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--accent-green)' }}
              disabled={loading.step8 || !result.trim()}
            >
              {loading.step8 ? <><Spinner /> Arquivando...</> : '✓ Concluir e Arquivar'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PipelineView;
