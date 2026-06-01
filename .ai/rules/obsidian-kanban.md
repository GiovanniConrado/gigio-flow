# Obsidian Kanban Board Standards — {{NOME_DO_PROJETO}}

> These rules are immutable and mandatory for ANY squad or AI agent that creates, updates, or removes cards in the `boards/` folder.

---

## 🎨 1. The Kanban Markdown Structure in Obsidian

The Obsidian Kanban plugin uses metadata in HTML comment blocks and specific ordered/unordered lists to render visual boards. To avoid corrupting the visual layout managed by the founder, strictly follow this structure:

-   **The Configuration Block (final HTML comment):** Every Kanban file must end mandatorily with the Obsidian Kanban metadata tag, without any modification to its key structure:
    ```markdown
    %% kanban:settings
    ```
-   **List Structure (Columns):** Kanban columns are represented by level-2 headings (`##`). Cards (tasks) within each column are unordered lists (`- [ ]` or `- [x]`):
    ```markdown
    ## 📥 Backlog
    - [ ] [BLO-12] Create registration screen
    - [ ] [BLO-15] Adjust login button

    ## 🏃 In Progress
    - [ ] [BLO-10] Integrate payment API

    ## ✅ Done
    - [x] [BLO-08] Landing Page Layout
    ```

---

## 🚫 2. Automatic Card Editing Rules (Card Movement Rules)

Whenever an AI completes a task or moves its status:
-   **Issue ID Preservation:** Never alter or delete the issue ID prefix (e.g., `[BLO-XX]`) contained in the card text.
-   **Completion Marking:** When moving a card to the **Done** column (or equivalent), change the checkbox from `- [ ]` to `- [x]` mandatorily.
-   **Avoid Duplications:** When moving a card from one column to another (e.g., `Backlog` ➔ `In Progress`), remove the corresponding line from the old column before inserting it in the new one. Never leave the same issue ID duplicated in two columns.
-   **Chronological / Priority Order:** Keep the most urgent and prioritized cards at the top of each column's list.

---

## 🔗 3. Use of Obsidian Links and Metadata

-   **Internal Note Links:** If the card has a link to a local task markdown file in `workflows/` or a PRD, use Obsidian's internal link syntax:
    ```markdown
    - [ ] [[workflows/pendentes/BLO-12-cadastro.md|BLO-12 Create registration screen]]
    ```
-   **Priority and Assignee Tags:** Use short tags at the end of the card text to indicate priority and assignees, making visual filtering easier in Obsidian:
    ```markdown
    - [ ] [[workflows/pendentes/BLO-12.md|BLO-12 Registration]] #high #pm @dev
    ```
    -   Suggested Priority Tags: `#high`, `#medium`, `#low`.
    -   Recommended Squad Tags: `#pm`, `#cto`, `#dev`, `#qa`.
