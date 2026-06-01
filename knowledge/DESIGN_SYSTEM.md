# Guia do Design System e Tokens — Gigio Flow

> Este arquivo reúne os padrões visuais, cores, tipografia e espaçamentos oficiais do Gigio Flow Studio. O Dev Agent deve importá-los estritamente para garantir a fidelidade visual premium (Design Lock).
> 
> **ATENÇÃO:** Estes tokens estão sincronizados com os valores reais do arquivo `dashboard/src/index.css`. Qualquer alteração visual deve ser feita primeiro aqui e depois no CSS.

---

## 🎨 1. Paleta de Cores Oficial (Tokens de Cor)

### Cores de Ênfase (Accent Colors)
-   `--accent-purple`: `#5e6ad2` → Cor principal de destaque, botões primários, ícones ativos
-   `--accent-purple-dim`: `rgba(94, 106, 210, 0.15)` → Backgrounds sutis de elementos purple
-   `--accent-teal`: `#06b6d4` → Cor secundária, destaque alternativo
-   `--accent-green`: `#2ea376` → Sucesso, status ativo, aprovações
-   `--accent-green-dim`: `rgba(46, 163, 118, 0.12)` → Background sutil de sucesso
-   `--accent-red`: `#e5484d` → Erros, rejeições, alertas críticos
-   `--accent-red-dim`: `rgba(229, 72, 77, 0.12)` → Background sutil de erro

### Tema Escuro (Default)
-   `--bg-primary`: `#0c0d10` → Background principal (obsidian charcoal)
-   `--bg-secondary`: `#141519` → Cards e painéis (graphite)
-   `--bg-tertiary`: `#1c1d24` → Superfícies elevadas
-   `--border-color`: `#202127` → Bordas sutis
-   `--border-focus`: `#3e3f4a` → Bordas com foco

### Tipografia
-   `--text-primary`: `#f1f2f4` → Texto principal (branco técnico)
-   `--text-secondary`: `#8a8f98` → Texto secundário (graphite gray)
-   `--text-muted`: `#5e6168` → Texto atenuado (dimmed slate)

### Tema Claro
-   `--bg-primary`: `#f6f8fa`
-   `--bg-secondary`: `#ffffff`
-   `--text-primary`: `#1b1f23`
-   `--text-secondary`: `#586069`

---

## 📐 2. Escala de Espaçamento e Margens

Baseada na escala de 4px do Linear:
-   `4px` → Micro ajustes, gaps entre ícone e texto em elementos compactos
-   `6px` → Gap padrão de botões e badges
-   `8px` → Padding interno de itens de menu e navegação
-   `14px` → Padding de botões
-   `16px` → Seções da sidebar, form-groups
-   `18px` → Padding padrão de glass-card
-   `20px` → Padding da sidebar
-   `24px` → Padding do content envelope
-   `30px` → Padding do dashboard-content
-   `35px` → Padding do wizard card inicial

---

## 🅰️ 3. Padrões de Tipografia

-   **Família:** `Inter` (Google Fonts) com fallback `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`
-   **Base:** `13px`, `line-height: 1.5`
-   **Section Labels:** `0.62rem`, `weight: 700`, `uppercase`, `letter-spacing: 0.05em`
-   **Menu Items:** `0.8rem`, `weight: 500`
-   **Body Text:** `0.85rem`, `weight: 400`
-   **Headlines:** `1.4rem`, `weight: 600`
-   **Subtitles:** `0.9rem`, `weight: 600`
-   **Badges/Tags:** `0.62-0.72rem`, `weight: 600-700`

---

## 🧩 4. Componentes de Design

### Buttons
-   `.btn-primary` → Background `--accent-purple`, texto branco, radius `6px`, padding `8px 14px`, `font-size: 12px`
-   `.btn-secondary` → Background `rgba(255,255,255,0.03)`, borda `--border-color`, mesmos paddings

### Cards
-   `.glass-card` → Background `--glass-bg`, border `--glass-border`, shadow `0 4px 20px var(--glass-shadow)`, radius `8px`, padding `18px`
-   `:hover` → Border muda para `--border-focus`, shadow aumenta

### Form Controls
-   `.form-input` → Background `--bg-primary`, border `--border-color`, radius `6px`, padding `8px 12px`, `font-size: 12px`
-   `:focus` → Border + box-shadow `--accent-purple`
-   `.form-textarea` → Igual ao input com `resize: vertical`, `min-height: 80px`

### Animations
-   `animate-slide-in` → `slideInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)`
-   `pulse-green` → `sutilPulse 2.5s infinite ease-in-out`
-   `org-connector` → `dash 12s linear infinite` (stroke-dasharray)
-   Transição padrão: `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`

---

## 📱 5. Responsividade e Breakpoints

-   **Layout:** Grid 2 colunas fixas `260px 1fr` (sidebar + content)
-   **Sidebar width:** `260px` fixo
-   **Content padding:** `24px 30px`
-   **Header height:** `45px`
-   **Scrollbar:** Custom com `width: 6px`, thumb color `--border-color` → hover `--accent-purple`

> ⚠️ **Gap atual:** O Studio não é responsivo para mobile (< 768px). Isso é intencional para a versão V4 (ferramenta desktop local). Responsividade será adicionada na Fase 3 (Cloud).

---

## 🎨 6. Padrão de Ícones

-   **Biblioteca:** `lucide-react` (versão `^1.16.0`)
-   **Tamanhos padrão:** `9px` (micro), `12-13px` (sidebar), `15px` (headers de seção), `24px` (feature icons), `28-32px` (hero icons)
-   **Estilo:** Stroke-based, `strokeWidth` padrão da lib
-   **Cores:** Herdam de `color: inherit` ou recebem `color: var(--accent-purple)` quando ativos
