# Regras de Segurança e Privacidade (Security & LGPD) — {{NOME_DO_PROJETO}}

> Estas regras são imutáveis e de cumprimento obrigatório para QUALQUER squad, agente de IA ou desenvolvedor humano que interaja com este repositório.

---

## 🛡️ 1. Proteção de Credenciais e Chaves de API (Secret Leak Lock)

Para mitigar o vazamento acidental de chaves privadas e acessos em repositórios públicos ou logs de terceiros:
-   **Proibido credenciais hardcoded:** Nunca escreva chaves de API, senhas, tokens JWT, conexões de banco de dados ou chaves privadas diretamente nos arquivos de código do projeto.
-   **Uso de Variáveis de Ambiente:** Todas as credenciais devem ser carregadas estritamente de arquivos `.env` ou do gerenciador de segredos do ambiente de execução (ex: Vercel, Supabase Secrets, AWS Secrets).
-   **Inclusão no `.gitignore`:** Garanta que arquivos como `.env`, `.env.local`, `.env.development`, arquivos de chaves privadas (`.pem`, `.json`) e credenciais locais estejam explicitados no `.gitignore`.
-   **Auditoria Pré-Commit:** Caso a IA ou o Dev insira acidentalmente uma chave em um arquivo, o commit deve ser abortado e o arquivo reescrito para limpar o histórico.

---

## 🛡️ 2. Privacidade e LGPD / GDPR por Design (Data Protection)

Garantir que a privacidade do usuário seja respeitada em cada fluxo da aplicação:
-   **Proibido logs de dados sensíveis:** É terminantemente proibido imprimir dados sensíveis de clientes em logs de console (`console.log`, `console.error`) ou ferramentas de rastreamento externas (Sentry, PostHog, etc.). Exemplos de dados sensíveis:
    -   Nomes completos, e-mails, telefones ou documentos pessoais (CPF/RG).
    -   Senhas, hashes ou perguntas de segurança.
    -   Dados de pagamento (números de cartão, tokens de transação).
    -   Dados clínicos, comportamentais ou conversas confidenciais.
-   **Consentimento Explícito:** Todo fluxo de cadastro ou coleta de dados deve possuir caixa de consentimento (opt-in) clara e link direto para a Política de Privacidade e Termos de Uso da empresa.
-   **Anonimização de Métricas:** Ao enviar dados para ferramentas de analytics, utilize IDs anônimos (`UUID`) gerados pelo sistema, nunca informações que identifiquem diretamente o indivíduo.

---

## 🛡️ 3. Segurança no Banco de Dados e APIs (Access Control Lock)

Proteger os dados de acessos mal-intencionados através de controles rigorosos de backend:
-   **Row Level Security (RLS) Ativo:** Se o projeto utiliza bancos de dados relacionais com acesso direto cliente-banco (ex: Supabase), nenhuma tabela nova pode ser criada sem políticas de Row Level Security (RLS) explícitas e restritivas.
-   **Validação de Inputs (Sanitization):** Todos os dados inseridos pelo usuário em formulários ou APIs devem ser validados, sanitizados e tipados no backend para evitar ataques de SQL Injection, Cross-Site Scripting (XSS) e injeções de scripts.
-   **Princípio do Menor Privilégio:** Chaves de API locais ou conexões de microsserviços devem possuir apenas as permissões estritamente necessárias para a tarefa atual (ex: chaves públicas de leitura nunca devem possuir acesso de escrita).

---

## 🛡️ 4. Auditoria de Segurança nos Pacotes de Dependências (NPM Audit)

-   **Prevenção de Ataques de Cadeia de Suprimentos:** Antes de instalar qualquer biblioteca NPM ou pacote externo, verifique se a mesma possui downloads consistentes, repositório ativo e se não possui vulnerabilidades conhecidas.
-   **Auditoria Automática:** O QA Agent e o Dev Agent devem rodar periodicamente auditorias de dependências:
    ```bash
    npm audit
    ```
    Caso existam vulnerabilidades de severidade Alta ou Crítica, as mesmas devem ser corrigidas imediatamente atualizando as versões das bibliotecas afetadas.
