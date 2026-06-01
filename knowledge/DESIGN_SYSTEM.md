# Design System Guide and Tokens — Gigio Flow

> This file brings together the official visual standards, colors, typography, and spacing of Gigio Flow Studio. The Dev Agent must import them strictly to ensure premium visual fidelity (Design Lock).
> 
> **ATTENTION:** These tokens are synchronized with the real values in the `dashboard/src/index.css` file. Any visual change must be made here first and then in the CSS.

---

## 🎨 1. Official Color Palette (Color Tokens)

### Accent Colors
-   `--accent-purple`: `#5e6ad2` → Primary highlight color, primary buttons, active icons
-   `--accent-purple-dim`: `rgba(94, 106, 210, 0.15)` → Subtle backgrounds for purple elements
-   `--accent-teal`: `#06b6d4` → Secondary color, alternative highlight
-   `--accent-green`: `#2ea376` → Success, active status, approvals
-   `--accent-green-dim`: `rgba(46, 163, 118, 0.12)` → Subtle success background
-   `--accent-red`: `#e5484d` → Errors, rejections, critical alerts
-   `--accent-red-dim`: `rgba(229, 72, 77, 0.12)` → Subtle error background

### Dark Theme (Default)
-   `--bg-primary`: `#0c0d10` → Main background (obsidian charcoal)
-   `--bg-secondary`: `#141519` → Cards and panels (graphite)
-   `--bg-tertiary`: `#1c1d24` → Elevated surfaces
-   `--border-color`: `#202127` → Subtle borders
-   `--border-focus`: `#3e3f4a` → Focused borders

### Typography
-   `--text-primary`: `#f1f2f4` → Main text (technical white)
-   `--text-secondary`: `#8a8f98` → Secondary text (graphite gray)
-   `--text-muted`: `#5e6168` → Muted text (dimmed slate)

### Light Theme
-   `--bg-primary`: `#f6f8fa`
-   `--bg-secondary`: `#ffffff`
-   `--text-primary`: `#1b1f23`
-   `--text-secondary`: `#586069`

---

## 📐 2. Spacing and Margin Scale

Based on Linear's 4px scale:
-   `4px` → Micro adjustments, gaps between icon and text in compact elements
-   `6px` → Default gap for buttons and badges
-   `8px` → Internal padding of menu items and navigation
-   `14px` → Button padding
-   `16px` → Sidebar sections, form-groups
-   `18px` → Default glass-card padding
-   `20px` → Sidebar padding
-   `24px` → Content envelope padding
-   `30px` → Dashboard-content padding
-   `35px` → Initial wizard card padding

---

## 🅰️ 3. Typography Standards

-   **Family:** `Inter` (Google Fonts) with fallback `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`
-   **Base:** `13px`, `line-height: 1.5`
-   **Section Labels:** `0.62rem`, `weight: 700`, `uppercase`, `letter-spacing: 0.05em`
-   **Menu Items:** `0.8rem`, `weight: 500`
-   **Body Text:** `0.85rem`, `weight: 400`
-   **Headlines:** `1.4rem`, `weight: 600`
-   **Subtitles:** `0.9rem`, `weight: 600`
-   **Badges/Tags:** `0.62-0.72rem`, `weight: 600-700`

---

## 🧩 4. Design Components

### Buttons
-   `.btn-primary` → Background `--accent-purple`, white text, radius `6px`, padding `8px 14px`, `font-size: 12px`
-   `.btn-secondary` → Background `rgba(255,255,255,0.03)`, border `--border-color`, same padding

### Cards
-   `.glass-card` → Background `--glass-bg`, border `--glass-border`, shadow `0 4px 20px var(--glass-shadow)`, radius `8px`, padding `18px`
-   `:hover` → Border changes to `--border-focus`, shadow increases

### Form Controls
-   `.form-input` → Background `--bg-primary`, border `--border-color`, radius `6px`, padding `8px 12px`, `font-size: 12px`
-   `:focus` → Border + box-shadow `--accent-purple`
-   `.form-textarea` → Same as input with `resize: vertical`, `min-height: 80px`

### Animations
-   `animate-slide-in` → `slideInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)`
-   `pulse-green` → `subtlePulse 2.5s infinite ease-in-out`
-   `org-connector` → `dash 12s linear infinite` (stroke-dasharray)
-   Default transition: `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`

---

## 📱 5. Responsiveness and Breakpoints

-   **Layout:** Fixed 2-column grid `260px 1fr` (sidebar + content)
-   **Sidebar width:** `260px` fixed
-   **Content padding:** `24px 30px`
-   **Header height:** `45px`
-   **Scrollbar:** Custom with `width: 6px`, thumb color `--border-color` → hover `--accent-purple`

> ⚠️ **Current gap:** The Studio is not responsive for mobile (< 768px). This is intentional for the V4 version (local desktop tool). Responsiveness will be added in Phase 3 (Cloud).

---

## 🎨 6. Icon Standards

-   **Library:** `lucide-react` (version `^1.16.0`)
-   **Default sizes:** `9px` (micro), `12-13px` (sidebar), `15px` (section headers), `24px` (feature icons), `28-32px` (hero icons)
-   **Style:** Stroke-based, library default `strokeWidth`
-   **Colors:** Inherited from `color: inherit` or receive `color: var(--accent-purple)` when active
