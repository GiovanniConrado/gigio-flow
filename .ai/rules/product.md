# Product and Business Rules — {{NOME_DO_PROJETO}}

> These rules are immutable and mandatory for the PM Agent, Dev Agent, and CTO Agent. They describe the fundamental pillars of the product and prevent strategic deviations.

---

## 🎯 1. The Product's Core Value (User Focus)

Defines your product's central promise:
-   **The Main Pain to Solve:** [Describe here in one clear sentence what the main customer problem this product solves. e.g., Simplify appointment scheduling.]
-   **The Non-Negotiable Value:** [What is the essential experience the user must have? e.g., Scheduling must be completed in fewer than 3 clicks.]
-   **What the Product is NOT:** [Define clear boundaries to prevent the AI from wanting to add scopes from other markets. e.g., This product is not a social network and must not have feeds or open chats.]

---

## 👥 2. Ecosystem Personas (Who Uses the System?)

To guide the PM Agent's copies, tones, and journeys, we define the following official personas:

1.  **Persona Type A (e.g., End Customer):**
    -   *Profile:* A regular user seeking to resolve their pain.
    -   *Tone of voice:* Friendly, simple, jargon-free, welcoming.
    -   *Ideal interface:* Clean screens, large buttons, direct actions, and minimal typing.
2.  **Persona Type B (e.g., Administrator/Partner):**
    -   *Profile:* A professional user managing the platform.
    -   *Tone of voice:* Efficient, corporate, precise, direct.
    -   *Ideal interface:* Data panels (dashboards), reports, filters, and robust tables.

---

## 🚫 3. Critical Business Rule Limits (Locks)

These rules prevent the AI from creating absurd or insecure logical flows:
-   **Premium Access Lock:** Non-subscriber users (`tier: 'free'`) must never have access to [Feature X]. The subscription check must be performed on the client AND rigorously validated on the backend.
-   **Minimum Data Collection (Data Privacy):** Never request personal data that is not strictly necessary for the feature to function. Avoid forms with more than 4 fields during the initial onboarding.
-   **Offline Behavior:** The product must be designed to handle internet outages gracefully. Always display loading placeholders (skeletons) or friendly error messages, preventing blank screens or freezes.

---

## 🛠️ How to Customize This File

Replace the text inside brackets (`[...]`) with the real rules of your startup, application, or website. The clarity of this file will guide the **PM Agent** in writing perfect Acceptance Criteria and will prevent the **Dev Agent** from making decisions that violate your company's business model.
