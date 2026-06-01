# 🔧 Feature: Drag-and-Drop no Kanban Board

> **Status:** ⏳ Pendente (aprovada, aguardando execução)
> **Origem:** Análise crítica do Studio — 2026-05-27
> **Squad:** Dev Agent
> **Story Points:** 3 | Complexidade: Baixa

---

## 📋 Especificação Técnica

### Objetivo
Adicionar drag-and-drop nativo (HTML5 Drag API) ao Kanban do Studio, permitindo que o usuário arraste cards entre colunas visualmente, em vez de usar o dropdown de seleção de fase.

### Critérios de Aceite
- [ ] O card se torna `draggable` com `draggable={true}` no elemento
- [ ] Ao iniciar o drag, o card fica com `opacity: 0.5` como feedback visual
- [ ] A coluna de destino exibe `border: 2px dashed var(--accent-purple)` enquanto um card é arrastado sobre ela
- [ ] Ao soltar (drop) em outra coluna, chama `POST /api/workflow/move` com `{ cardId, fromPhase, toPhase }`
- [ ] Após o drop, o board é re-fetchado para refletir a mudança
- [ ] Não é possível arrastar dentro da mesma coluna (sem ação)

### Implementação

```jsx
// No card:
draggable
onDragStart={(e) => {
  e.dataTransfer.setData('cardId', card.id);
  e.dataTransfer.setData('fromPhase', phase);
  e.currentTarget.style.opacity = '0.5';
}}
onDragEnd={(e) => {
  e.currentTarget.style.opacity = '1';
}}

// Na coluna:
onDragOver={(e) => {
  e.preventDefault();
  e.currentTarget.style.borderColor = 'var(--accent-purple)';
}}
onDragLeave={(e) => {
  e.currentTarget.style.borderColor = 'var(--border-color)';
}}
onDrop={(e) => {
  e.preventDefault();
  e.currentTarget.style.borderColor = 'var(--border-color)';
  const cardId = e.dataTransfer.getData('cardId');
  const fromPhase = e.dataTransfer.getData('fromPhase');
  if (fromPhase !== phase) onMoveCard(cardId, fromPhase, phase);
}}
```

### Arquivo a Modificar
`dashboard/src/components/KanbanBoard.jsx` (ou criar este componente ao refatorar App.jsx)

### Dependências
- Sem dependências externas (HTML5 nativo)
- Não quebra nenhuma lógica existente (complementa o dropdown atual)
