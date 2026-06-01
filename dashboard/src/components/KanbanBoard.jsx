import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const COLUMNS = [
  {
    key: 'propostas',
    label: 'Propostas',
    subtitle: 'Aguardando PM',
    accentColor: 'var(--accent-purple)',
    avatarLabel: 'PM',
    avatarBg: 'var(--accent-purple-dim)',
    avatarBorder: 'var(--accent-purple)',
  },
  {
    key: 'pendentes',
    label: 'Pendentes',
    subtitle: 'Para Dev',
    accentColor: 'var(--accent-teal)',
    avatarLabel: 'DEV',
    avatarBg: 'rgba(6,182,212,0.1)',
    avatarBorder: 'var(--accent-teal)',
  },
  {
    key: 'em-progresso',
    label: 'Ativo',
    subtitle: 'Execução Dev',
    accentColor: 'var(--accent-green)',
    avatarLabel: 'QA',
    avatarBg: 'var(--accent-green-dim)',
    avatarBorder: 'var(--accent-green)',
  },
  {
    key: 'concluidos',
    label: 'Feito',
    subtitle: 'Concluído',
    accentColor: 'var(--text-muted)',
    avatarLabel: '✓',
    avatarBg: 'rgba(255,255,255,0.05)',
    avatarBorder: 'var(--border-color)',
  },
];

function PriorityBars({ color1, color2, color3 }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '3px', padding: '2px 4px' }}>
      <span style={{ width: '2px', height: '6px', background: color1, borderRadius: '1px' }} />
      <span style={{ width: '2px', height: '8px', background: color2, borderRadius: '1px' }} />
      <span style={{ width: '2px', height: '10px', background: color3, borderRadius: '1px' }} />
    </span>
  );
}

function KanbanCard({ card, column, onMoveCard, onOpenPipeline }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData('cardId', card.id);
    e.dataTransfer.setData('fromPhase', column.key);
    setIsDragging(true);
  };

  const handleDragEnd = () => setIsDragging(false);

  const renderActions = () => {
    if (column.key === 'propostas') {
      return (
        <div style={{ display: 'flex', gap: '3px' }}>
          <button
            onClick={() => onOpenPipeline(card, column.key)}
            className="btn-secondary"
            style={{ padding: '2px 5px', fontSize: '0.62rem', borderRadius: '4px' }}
          >
            Pipeline
          </button>
          <button
            onClick={() => onMoveCard(card.id, 'propostas', 'pendentes')}
            className="btn-primary"
            style={{ padding: '2px 6px', fontSize: '0.68rem', borderRadius: '4px' }}
          >
            Aprovar
          </button>
        </div>
      );
    }
    if (column.key === 'pendentes') {
      return (
        <div style={{ display: 'flex', gap: '3px' }}>
          <button
            onClick={() => onOpenPipeline(card, column.key)}
            className="btn-secondary"
            style={{ padding: '2px 5px', fontSize: '0.62rem', borderRadius: '4px' }}
          >
            Pipeline
          </button>
          <button
            onClick={() => onMoveCard(card.id, 'pendentes', 'propostas')}
            className="btn-secondary"
            style={{ padding: '2px 4px', fontSize: '0.68rem', borderRadius: '4px' }}
          >
            Recuar
          </button>
          <button
            onClick={() => onMoveCard(card.id, 'pendentes', 'em-progresso')}
            className="btn-primary"
            style={{ padding: '2px 6px', fontSize: '0.68rem', borderRadius: '4px', background: 'var(--accent-teal)' }}
          >
            Iniciar
          </button>
        </div>
      );
    }
    if (column.key === 'em-progresso') {
      return (
        <div style={{ display: 'flex', gap: '3px' }}>
          <button
            onClick={() => onOpenPipeline(card, column.key)}
            className="btn-secondary"
            style={{ padding: '2px 5px', fontSize: '0.62rem', borderRadius: '4px' }}
          >
            Pipeline
          </button>
          <button
            onClick={() => onMoveCard(card.id, 'em-progresso', 'pendentes')}
            className="btn-secondary"
            style={{ padding: '2px 4px', fontSize: '0.68rem', borderRadius: '4px' }}
          >
            Pausar
          </button>
          <button
            onClick={() => onMoveCard(card.id, 'em-progresso', 'concluidos')}
            className="btn-primary"
            style={{ padding: '2px 6px', fontSize: '0.68rem', borderRadius: '4px', background: 'var(--accent-green)' }}
          >
            Terminar
          </button>
        </div>
      );
    }
    if (column.key === 'concluidos') {
      return (
        <button
          onClick={() => onMoveCard(card.id, 'concluidos', 'em-progresso')}
          className="btn-secondary"
          style={{ padding: '2px 4px', fontSize: '0.62rem', borderRadius: '4px' }}
        >
          Reabrir
        </button>
      );
    }
    return null;
  };

  const isDone = column.key === 'concluidos';

  return (
    <div
      key={card.id}
      className="glass-card animate-slide-in"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        padding: '10px',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderLeft: `3px solid ${column.accentColor}`,
        borderRadius: '4px',
        opacity: isDragging ? 0.5 : isDone ? 0.65 : 1,
        cursor: 'grab',
        transition: 'opacity 0.15s',
      }}
    >
      <h4 style={{
        fontSize: '0.8rem',
        fontWeight: 600,
        color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
        marginBottom: '4px',
        textDecoration: isDone ? 'line-through' : 'none',
      }}>
        {card.title}
      </h4>
      <p style={{ color: isDone ? 'var(--text-muted)' : 'var(--text-secondary)', fontSize: '0.72rem', lineHeight: '1.35', marginBottom: '8px' }}>
        {card.description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px', marginTop: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: column.avatarBg, border: `1px solid ${column.avatarBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: 800, color: isDone ? 'var(--text-muted)' : 'var(--text-primary)' }}>
            {column.avatarLabel}
          </div>
          <PriorityBars
            color1={column.accentColor}
            color2={column.accentColor}
            color3={isDone ? 'var(--text-muted)' : column.accentColor}
          />
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{card.id.substring(0, 5).toUpperCase()}</span>
        </div>
        {renderActions()}
      </div>
    </div>
  );
}

function KanbanColumn({ column, cards, onMoveCard, onCreateCard, onOpenPipeline }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const cardId = e.dataTransfer.getData('cardId');
    const fromPhase = e.dataTransfer.getData('fromPhase');
    if (fromPhase !== column.key) {
      onMoveCard(cardId, fromPhase, column.key);
    }
  };

  return (
    <div
      className="glass-card"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        padding: '12px',
        minHeight: '440px',
        background: 'var(--bg-secondary)',
        borderTop: `2px solid ${column.accentColor}`,
        border: isDragOver ? `2px dashed var(--accent-purple)` : undefined,
        transition: 'border 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {column.label} ({cards.length})
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{column.subtitle}</span>
          {column.key !== 'concluidos' && (
            <button
              onClick={() => onCreateCard(column.key)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
              title={`Criar card em ${column.label}`}
            >
              <Plus size="12" />
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {cards.map(card => (
          <KanbanCard
            key={card.id}
            card={card}
            column={column}
            onMoveCard={onMoveCard}
            onOpenPipeline={onOpenPipeline}
          />
        ))}
        {cards.length === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textAlign: 'center', padding: '30px 0', border: '1px dashed var(--border-color)', borderRadius: '6px' }}>
            Nenhum card.
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanBoard({ board, onMoveCard, onCreateCard, onOpenPipeline }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', alignItems: 'start' }}>
      {COLUMNS.map(col => (
        <KanbanColumn
          key={col.key}
          column={col}
          cards={board[col.key] || []}
          onMoveCard={onMoveCard}
          onCreateCard={onCreateCard}
          onOpenPipeline={onOpenPipeline}
        />
      ))}
    </div>
  );
}

export default KanbanBoard;
