# Safety Lock Rules — {{NOME_DO_PROJETO}}

> These rules are immutable and mandatory for ANY autonomous development session (Dev Agent) or technical planning (CTO Agent).

---

## 🎨 1. Design Lock (No Ad-hoc Styles)

To ensure that the product's premium, consistent, and high-fidelity visual identity is never corrupted by careless or arbitrary implementations:
-   **Strict token usage:** All colors, fonts, margins, paddings, rounded corners, typographic weights, and shadows MUST be imported directly from the project's central Design System (path defined in `knowledge/DESIGN_SYSTEM.md`).
-   **No ad-hoc (hardcoded) styles:** It is strictly forbidden to use absolute style values in visual components, such as:
    -   Colors in manual Hexadecimal or RGB format (`color: '#FF0055'`, `backgroundColor: 'rgba(0,0,0,0.5)'`). Use the official theme tokens (`theme.colors.[token]` or your CSS/Tailwind stack equivalents).
    -   Margins, paddings, heights, and widths as random "magic numbers" (`margin: 17`, `paddingHorizontal: 23`). Use the theme's spacing multipliers (`theme.spacing.[token]`).
-   **Integrated Responsiveness:** Every screen component must be prepared to adapt to different screen sizes. Avoid locking fixed widths and heights (`width: 375px`) where fluid layouts, flexbox, or grid would be more appropriate.
-   **Non-Negotiable Accessibility:** Every interactive component (button, link, menu) must mandatorily contain accessibility tags or properties appropriate for the platform (e.g., `accessibilityLabel`, `accessibilityRole`, `aria-*` tags for web).

---

## 🚫 2. Scope Creep Block (Creative Creep Lock — No Creative Creep)

AI agents sometimes try to be "creative" or add small useful features that were not explicitly requested in the original specification. In Gigio Flow, this is considered a **serious regression risk**.
-   **Strict focus on the issue:** The Dev Agent must implement **only and exactly** what is detailed in the task's Acceptance Criteria (issue).
-   **No "Bonus Code":** Do not add extra buttons, new navigation routes, unsolicited visual interactions, or additional configurations based on your own assumptions.
-   **Path for Improvements:** If a real opportunity for a visual improvement or product rule is identified during development, the Dev Agent must report it to the **Process Analyst** or create a new markdown file in the `workflows/propostas/` folder as a suggestion. It must **never** be implemented as a surprise in the current issue's code.

---

## 🛡️ 3. Type Integrity (Static Typing Lock)

Error-free compilation and robust static typing ensure the long-term stability of any codebase:
-   **No `any` allowed:** The use of `any` to escape or silence compiler warnings is strictly prohibited. Types must be explicit and shared domain interfaces must be documented.
-   **Mandatory static validation:** Before moving the task to QA review, the Dev Agent must run the static type check at the project root (e.g., `npm run tsc -- --noEmit` for TypeScript). If there are any compilation errors, the handoff to QA is **automatically blocked**.

---

## 🗄️ 4. Database and API Backward Compatibility (API Lock)

Changes to databases and API contracts must not break active production environments or older versions of the app/site running in client caches.
-   **Additive migrations only:** It is forbidden to delete tables, rename in-use columns, or alter the types of existing columns that are in use by previous versions in production.
-   **New fields with default values:** When adding new mandatory fields (`NOT NULL`), ensure they have defined default values (`DEFAULT`) to prevent write failures in existing records.
-   **Access Audit:** No new table or modified API route can go live without an explicit sign-off from the CTO and the QA Agent validating the access policies.
