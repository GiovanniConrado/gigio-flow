# Regras de Produto e Negócio — {{NOME_DO_PROJETO}}

> Estas regras são imutáveis e de cumprimento obrigatório para o PM Agent, Dev Agent e CTO Agent. Elas descrevem os pilares fundamentais do produto e impedem desvios estratégicos.

---

## 🎯 1. O Core Value do Produto (Foco no Usuário)

Define a promessa central do seu produto:
-   **A Dor Principal a Resolver:** [Descreva aqui em uma frase clara qual o principal problema do cliente que este produto resolve. Ex: Simplificar o agendamento de consultas.]
-   **O Valor Inegociável:** [Qual a experiência essencial que o usuário deve ter? Ex: O agendamento deve ser feito em menos de 3 cliques.]
-   **O que o Produto NÃO É:** [Defina limites claros para evitar que a IA queira adicionar escopos de outros mercados. Ex: Este produto não é uma rede social e não deve possuir feeds ou chats abertos.]

---

## 👥 2. Personas do Ecossistema (Quem Usa o Sistema?)

Para guiar as copies, tons e jornadas do PM Agent, definimos as seguintes personas oficiais:

1.  **Persona Tipo A (Ex: Cliente Final):**
    -   *Perfil:* Usuário comum buscando resolver sua dor.
    -   *Tom de voz com ele:* Amigável, simples, sem jargões técnicos, acolhedor.
    -   *Interface ideal:* Telas limpas, botões grandes, ações diretas e pouca digitação.
2.  **Persona Tipo B (Ex: Administrador/Parceiro):**
    -   *Perfil:* Usuário profissional gerenciando a plataforma.
    -   *Tom de voz com ele:* Eficiente, corporativo, preciso, direto.
    -   *Interface ideal:* Painéis de dados (dashboards), relatórios, filtros e tabelas robustas.

---

## 🚫 3. Limites Críticos de Regras de Negócio (Locks)

Estas regras impedem que a IA crie fluxos lógicos absurdos ou inseguros:
-   **Trava de Acesso Premium:** Usuários não assinantes (`tier: 'free'`) nunca devem ter acesso a [Recurso X]. A checagem de assinatura deve ser feita no cliente E validada rigidamente no backend.
-   **Coleta Mínima de Dados (Data Privacy):** Nunca solicite dados pessoais que não sejam estritamente necessários para o funcionamento do recurso. Evite formulários com mais de 4 campos na integração inicial.
-   **Comportamento Offline:** O produto deve ser desenhado para lidar graciosamente com quedas de internet. Sempre exiba placeholders de carregamento (skeletons) ou mensagens de erro amigáveis, impedindo telas brancas ou congelamentos.

---

## 🛠️ Como Personalizar este Arquivo

Substitua os textos entre colchetes (`[...]`) com as regras reais da sua startup, aplicativo ou site. A clareza deste arquivo guiará o **PM Agent** na escrita de Critérios de Aceitação perfeitos e impedirá que o **Dev Agent** tome decisões que violem o modelo de negócios da sua empresa.
