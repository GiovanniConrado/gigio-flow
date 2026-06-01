# Security and Privacy Rules (Security & LGPD/GDPR) — {{NOME_DO_PROJETO}}

> These rules are immutable and mandatory for ANY squad, AI agent, or human developer interacting with this repository.

---

## 🛡️ 1. Credential and API Key Protection (Secret Leak Lock)

To mitigate accidental leakage of private keys and access tokens in public repositories or third-party logs:
-   **No hardcoded credentials:** Never write API keys, passwords, JWT tokens, database connection strings, or private keys directly in project code files.
-   **Use of Environment Variables:** All credentials must be loaded strictly from `.env` files or the execution environment's secret manager (e.g., Vercel, Supabase Secrets, AWS Secrets).
-   **Inclusion in `.gitignore`:** Ensure that files such as `.env`, `.env.local`, `.env.development`, private key files (`.pem`, `.json`), and local credentials are explicitly listed in `.gitignore`.
-   **Pre-Commit Audit:** If the AI or Dev accidentally inserts a key into a file, the commit must be aborted and the file rewritten to clean the history.

---

## 🛡️ 2. Privacy and LGPD/GDPR by Design (Data Protection)

Ensure that user privacy is respected in every application flow:
-   **No logging of sensitive data:** It is strictly forbidden to print sensitive customer data in console logs (`console.log`, `console.error`) or external tracking tools (Sentry, PostHog, etc.). Examples of sensitive data:
    -   Full names, emails, phone numbers, or personal documents (SSN, ID numbers).
    -   Passwords, hashes, or security questions.
    -   Payment data (card numbers, transaction tokens).
    -   Clinical, behavioral, or confidential conversation data.
-   **Explicit Consent:** Every registration or data collection flow must include a clear opt-in consent checkbox and a direct link to the company's Privacy Policy and Terms of Use.
-   **Metric Anonymization:** When sending data to analytics tools, use anonymous system-generated IDs (`UUID`), never information that directly identifies the individual.

---

## 🛡️ 3. Database and API Security (Access Control Lock)

Protect data from malicious access through rigorous backend controls:
-   **Row Level Security (RLS) Active:** If the project uses relational databases with direct client-to-database access (e.g., Supabase), no new table can be created without explicit and restrictive Row Level Security (RLS) policies.
-   **Input Validation (Sanitization):** All data entered by the user via forms or APIs must be validated, sanitized, and typed on the backend to prevent SQL Injection, Cross-Site Scripting (XSS), and script injection attacks.
-   **Principle of Least Privilege:** Local API keys or microservice connections must have only the strictly necessary permissions for the current task (e.g., public read-only keys must never have write access).

---

## 🛡️ 4. Dependency Package Security Auditing (NPM Audit)

-   **Supply Chain Attack Prevention:** Before installing any NPM library or external package, verify that it has consistent downloads, an active repository, and no known vulnerabilities.
-   **Automatic Auditing:** The QA Agent and Dev Agent must periodically run dependency audits:
    ```bash
    npm audit
    ```
    If High or Critical severity vulnerabilities exist, they must be remediated immediately by updating the affected library versions.
