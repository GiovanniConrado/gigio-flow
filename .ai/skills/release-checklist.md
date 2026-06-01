# Skill: Checklist de Homologação Final (Release Checklist) — {{NOME_DO_PROJETO}}

> Este é o protocolo oficial e obrigatório de garantia de qualidade e conformidade técnica a ser executado pelo QA Agent e CTO Agent antes de autorizar qualquer mesclagem (merge) ou deploy em produção.

---

## 📋 O Protocolo de Homologação Final

Nenhum código é enviado para produção sem a validação rigorosa dos seguintes quatro pilares de qualidade do **Gigio Flow**:

### 1. Funcionalidade & Golden Path (Aprovado pelo QA)
-   [ ] **Critérios de Aceite cumpridos:** Todos os pontos listados na PRD/Issue foram validados e marcados como concluídos com sucesso.
-   [ ] **Nenhum Bug Crítico:** O fluxo principal funciona perfeitamente sem quebras de layout, crashes ou erros lógicos no console.
-   [ ] **Resiliência Offline / Falhas:** O sistema lida graciosamente com falhas de rede (exibe loading, permite tentar novamente e exibe mensagens de erro amigáveis).
-   [ ] **Teste de Inputs:** Os campos de formulário e inputs de usuário possuem validações de formato (ex: e-mail, telefone, senhas) ativas e impedem envios em branco ou quebrados.

### 2. Design System & Acessibilidade (Design Lock)
-   [ ] **Sem Estilos Hardcoded:** Todos os novos estilos visuais utilizam as variáveis/tokens do Design System descritas em `knowledge/DESIGN_SYSTEM.md`.
-   [ ] **Contraste & Tipografia:** O contraste visual das novas cores atende aos padrões de legibilidade e as tipografias seguem a hierarquia estabelecida.
-   [ ] **Acessibilidade ativa:** Todos os botões, links, modais e elementos interativos modificados contam com tags de acessibilidade apropriadas (`accessibilityLabel`, `accessibilityRole` ou equivalentes ARIA).

### 3. Segurança, LGPD & RLS (Security Lock)
-   [ ] **Sem Vazamento de Credenciais:** Nenhuma chave de API, senha de banco de dados ou token privado foi exposto nos arquivos de código ou no controle de versão (Git).
-   [ ] **Row Level Security (RLS) ativo:** Novas tabelas ou views de banco de dados possuem políticas RLS testadas e ativas.
-   [ ] **Privacidade de Dados:** Nenhum dado sensível de clientes (telefones, e-mails, dados de pagamento) é impresso em console de logs ou ferramentas de analytics públicas.

### 4. Integridade do Repositório (Self-Evolution Lock)
-   [ ] **TypeScript & Compilação livre:** O código compila sem erros estáticos e está livre do uso de `any` para calar avisos do TypeScript.
-   [ ] **Estado Atual Atualizado:** O arquivo `knowledge/ESTADO_ATUAL.md` foi devidamente modificado contendo a data atual e as modificações da versão.
-   [ ] **Histórico Registrado:** O log de decisões em `knowledge/HISTORICO.md` possui a nova entrada cronológica correspondente.
-   [ ] **Boards do Obsidian atualizados:** O cartão da tarefa foi movido e marcado como concluído (`- [x]`) no Kanban correspondente em `boards/`.
