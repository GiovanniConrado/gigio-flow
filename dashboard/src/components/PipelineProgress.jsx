import React from 'react';

const STEPS = [
  { key: 'prd',       label: 'PRD',          icon: '📝' },
  { key: 'refined',   label: 'Refinado',     icon: '🔧' },
  { key: 'estimated', label: 'Estimado',     icon: '📊' },
  { key: 'approved',  label: 'Aprovado',     icon: '✅' },
  { key: 'linear',    label: 'No Linear',    icon: '⬆️' },
  { key: 'dev',       label: 'Dev',          icon: '💻' },
  { key: 'qa',        label: 'QA',           icon: '🧪' },
  { key: 'deploy',    label: 'Deploy',       icon: '🚀' },
];

function detectPipelineStep(board) {
  const cards = [...(board?.propostas || []), ...(board?.pendentes || [])];
  if (cards.length === 0) return 0;
  const anyRefined = cards.some(c => c.rawContent?.includes('## 🔧 Refinamento LLM'));
  const anyEstimated = cards.some(c => c.rawContent?.includes('## ⚖️ Estimativa'));
  const anyApproved = cards.some(c => c.rawContent?.includes('Human-Approved: true'));
  const anyLinear = cards.some(c => c.rawContent?.includes('## 🔗 Issues no Linear'));
  if (anyLinear) return 4;
  if (anyApproved) return 3;
  if (anyEstimated) return 2;
  if (anyRefined) return 1;
  return 0;
}

function PipelineProgress({ board }) {
  const currentStep = detectPipelineStep(board);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      height: '28px', padding: '0 12px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      fontSize: '0.6rem', fontWeight: 600,
      overflow: 'hidden',
    }}>
      {STEPS.map((step, i) => {
        const isDone = i < currentStep;
        const isCurrent = i === currentStep;
        const isFuture = i > currentStep;
        return (
          <React.Fragment key={step.key}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '3px 8px', borderRadius: '4px',
              background: isCurrent ? 'var(--accent-purple-dim)' : 'transparent',
              color: isDone ? 'var(--accent-green)' : isCurrent ? 'var(--accent-purple)' : 'var(--text-muted)',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}>
              <span>{isDone ? '✓' : step.icon}</span>
              <span style={{
                display: 'inline',
                '@media (max-width: 1000px)': { display: 'none' },
              }}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: '16px', height: '1px',
                background: isDone ? 'var(--accent-green)' : 'var(--border-color)',
                flexShrink: 0,
              }} />
            )}
          </React.Fragment>
        );
      })}
      <span style={{ marginLeft: 'auto', fontSize: '0.55rem', color: 'var(--text-muted)' }}>
        {board?.propostas?.length || 0} propostas · {board?.pendentes?.length || 0} pendentes
      </span>
    </div>
  );
}

export default PipelineProgress;
