# Regras de Travas de Segurança (Safety Locks) — {{NOME_DO_PROJETO}}

> Estas regras são imutáveis e de cumprimento obrigatório para QUALQUER sessão autônoma de desenvolvimento (Dev Agent) ou planejamento técnico (CTO Agent).

---

## 🎨 1. Trava de Design (Design Lock — No Ad-hoc Styles)

Para garantir que a identidade visual premium, consistente e de alta fidelidade do produto nunca seja corrompida por implementações descuidadas ou arbitrárias:
-   **Uso estrito de tokens:** Todas as cores, fontes, margens, paddings, cantos arredondados, pesos tipográficos e sombras DEVEM ser importados diretamente do Design System central do projeto (caminho definido em `knowledge/DESIGN_SYSTEM.md`).
-   **Proibido estilos ad-hoc (hardcoded):** É terminantemente proibido usar valores absolutos de estilo em componentes visuais, tais como:
    -   Cores em formato Hexadecimal ou RGB manuais (`color: '#FF0055'`, `backgroundColor: 'rgba(0,0,0,0.5)'`). Use os tokens de tema oficiais (`theme.colors.[token]` ou equivalentes da sua stack CSS/Tailwind).
    -   Margens, paddings, alturas e larguras em números "mágicos" aleatórios (`margin: 17`, `paddingHorizontal: 23`). Use os multiplicadores de espaçamento do tema (`theme.spacing.[token]`).
-   **Responsividade Integrada:** Todo componente de tela deve estar preparado para se adaptar a diferentes tamanhos de tela. Evite travar larguras e alturas fixas (`width: 375px`) onde layouts fluidos, flexbox ou grid seriam mais adequados.
-   **Acessibilidade Inegociável:** Todo componente interativo (botão, link, menu) deve conter obrigatoriamente tags ou propriedades de acessibilidade adequadas à plataforma (ex: `accessibilityLabel`, `accessibilityRole`, tags `aria-*` para web).

---

## 🚫 2. Bloqueio de Scope Creep (Creative Creep Lock — No Creative Creep)

Os agentes de IA às vezes tentam ser "criativos" ou adicionar pequenos recursos úteis que não foram explicitamente solicitados na especificação original. No Gigio Flow, isso é considerado um **risco grave de regressão**.
-   **Foco estrito na issue:** O Dev Agent deve implementar **apenas e tão somente** o que está detalhado nos Critérios de Aceitação da tarefa (issue).
-   **Proibido "Código Bônus":** Não adicione botões adicionais, novas rotas de navegação, interações visuais não solicitadas ou configurações adicionais baseadas em suposições próprias.
-   **Caminho para Melhorias:** Se identificar uma oportunidade real de melhoria visual ou de regra de produto durante o desenvolvimento, o Dev Agent deve reportar isso ao **Process Analyst** ou criar um novo arquivo markdown na pasta `workflows/propostas/` como sugestão. Ele **nunca** deve implementá-la de surpresa no código da issue atual.

---

## 🛡️ 3. Integridade de Tipos (Static Typing Lock)

Compilação livre de erros e tipagem estática robusta garantem a estabilidade de longo prazo de qualquer codebase:
-   **Proibido usar `any`:** O uso de `any` para escapar ou calar avisos do compilador é estritamente proibido. Tipos devem ser explícitos e interfaces compartilhadas de domínio devem ser documentadas.
-   **Validação estática obrigatória:** Antes de mover a tarefa para a homologação do QA, o Dev Agent deve rodar a checagem de tipos estática na raiz do projeto (ex: `npm run tsc -- --noEmit` para TypeScript). Se houver qualquer erro de compilação, o handoff para o QA é **automaticamente bloqueado**.

---

## 🗄️ 4. Retrocompatibilidade de Banco de Dados e APIs (API Lock)

Alterações em bancos de dados e contratos de APIs não podem quebrar ambientes de produção ativos ou versões antigas do app/site que estejam rodando em cache nos clientes.
-   **Migrações apenas aditivas:** É proibido deletar tabelas, renomear colunas em uso ou alterar tipos de colunas existentes que estejam em uso por versões anteriores em produção.
-   **Novos campos com valores padrão:** Ao adicionar novos campos obrigatórios (`NOT NULL`), garanta que eles tenham valores padrões (`DEFAULT`) definidos para evitar falhas de gravação em cadastros antigos.
-   **Auditoria de Acesso:** Nenhuma tabela nova ou rota de API modificada pode ir ao ar sem um parecer explícito do CTO e do QA Agent validando as políticas de acesso.
