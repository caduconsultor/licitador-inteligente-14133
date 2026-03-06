# Licitador Inteligente - TODO (Opção B: Arquitetura Robusta)

## 🎯 Objetivo Geral
Sistema robusto para consultores gerenciarem múltiplas empresas, seus editais e gerar propostas/declarações automaticamente.

## 📋 Status Geral
- **Abordagem:** Opção B - Reconstrução com arquitetura robusta
- **Prioridade:** Múltiplas empresas + Editais associados
- **Começar:** Do zero (sem dados antigos)
- **Checkpoints:** A cada fase consolidada
- **GitHub:** https://github.com/caduconsultor/licitador-inteligente-14133

---

## FASE 1: Redesenho do Schema ⏳

### Problemas do Schema Atual
- [ ] Associação 1:1 entre usuário e empresa (precisa ser N:N)
- [ ] Tipos de data inconsistentes (Date vs string)
- [ ] Editais não associados a empresas
- [ ] Falta de relacionamentos claros

### Tarefas
- [ ] Analisar schema atual
- [ ] Redesenhar tabelas:
  - companies (sem userId, será associado via user_companies)
  - user_companies (tabela de junção)
  - tenders (adicionar companyId)
  - proposals (adicionar companyId)
  - declarations (adicionar companyId)
- [ ] Padronizar tipos de data (usar TIMESTAMP para tudo)
- [ ] Criar índices para performance
- [ ] Documentar novo schema

### Checkpoint 1
- [ ] Schema redesenhado e validado
- [ ] Sem erros de tipo de data
- [ ] Relacionamentos claros

---

## FASE 2: Limpeza e Migrações ⏳

### Tarefas
- [ ] Deletar dados antigos (começar do zero)
- [ ] Executar migrações sem erros
- [ ] Validar integridade do banco
- [ ] Testar conexão com banco

### Checkpoint 2
- [ ] Banco limpo e pronto
- [ ] Migrações executadas com sucesso
- [ ] Sem erros de schema

---

## FASE 3: Interface de Múltiplas Empresas ⏳

### Tarefas
- [ ] Criar procedimento `company.list` (listar todas as empresas)
- [ ] Criar procedimento `company.getById` (obter empresa específica)
- [ ] Criar seletor de empresa no Dashboard (dropdown)
- [ ] Atualizar CompanySettings para editar empresa selecionada
- [ ] Implementar CRUD de empresas (criar, editar, deletar)
- [ ] Validação de CNPJ em tempo real
- [ ] Testes unitários

### Checkpoint 3
- [ ] Múltiplas empresas funcionando
- [ ] Seletor de empresa no Dashboard
- [ ] CRUD de empresas completo
- [ ] Testes passando

---

## FASE 4: Associação de Editais a Empresas ⏳

### Tarefas
- [ ] Adicionar campo `companyId` em tenders
- [ ] Atualizar procedimento de upload de edital para selecionar empresa
- [ ] Criar procedimento `tender.listByCompany` (listar editais da empresa)
- [ ] Atualizar página de Tenders para filtrar por empresa selecionada
- [ ] Atualizar TenderDetail para mostrar empresa associada
- [ ] Testes unitários

### Checkpoint 4
- [ ] Editais associados a empresas
- [ ] Filtro por empresa funcionando
- [ ] Testes passando

---

## FASE 5: Gerador de Propostas Integrado ⏳

### Tarefas
- [ ] Integrar componente de proposta existente
- [ ] Adicionar campo `companyId` em proposals
- [ ] Usar IA para gerar conteúdo de proposta baseado no edital
- [ ] Salvar propostas no banco
- [ ] Exportar para PDF
- [ ] Testes unitários

### Checkpoint 5
- [ ] Gerador de propostas funcional
- [ ] Propostas salvas no banco
- [ ] PDF exportável
- [ ] Testes passando

---

## FASE 6: Gerador de Declarações Integrado ⏳

### Tarefas
- [ ] Integrar componente de declarações existente
- [ ] Adicionar campo `companyId` em declarations
- [ ] Gerar declarações automaticamente
- [ ] Salvar e exportar
- [ ] Testes unitários

### Checkpoint 6
- [ ] Gerador de declarações funcional
- [ ] Declarações salvas no banco
- [ ] PDF exportável
- [ ] Testes passando

---

## FASE 7: Testes e Validação ⏳

### Tarefas
- [ ] Testar fluxo completo (empresa -> edital -> proposta -> declaração)
- [ ] Testar com múltiplas empresas
- [ ] Validar performance
- [ ] Corrigir bugs encontrados
- [ ] Testes de integração

### Checkpoint 7
- [ ] Sistema completo testado
- [ ] Sem bugs críticos
- [ ] Performance aceitável

---

## FASE 8: Documentação para Claude ⏳

### Tarefas
- [ ] Documentar arquitetura final
- [ ] Criar guia de continuação
- [ ] Organizar repositório
- [ ] Criar README com instruções
- [ ] Fazer checkpoint final

### Checkpoint 8
- [ ] Documentação completa
- [ ] Repositório organizado
- [ ] Pronto para transição para Claude

---

## 📊 Checkpoints Planejados

| Checkpoint | Fase | Status | Data |
|-----------|------|--------|------|
| 1 | Schema redesenhado | ⏳ | - |
| 2 | Banco limpo e migrações | ⏳ | - |
| 3 | Múltiplas empresas | ⏳ | - |
| 4 | Editais associados | ⏳ | - |
| 5 | Gerador de propostas | ⏳ | - |
| 6 | Gerador de declarações | ⏳ | - |
| 7 | Sistema completo | ⏳ | - |
| 8 | Documentação final | ⏳ | - |

---

## 📝 Notas Importantes

- Começar do zero (sem dados antigos)
- Prioridade: Múltiplas empresas + Editais associados
- Fazer checkpoints frequentes para transição para Claude
- Manter GitHub sincronizado após cada checkpoint
- Usar tipos de data consistentes (TIMESTAMP)
- Testes unitários obrigatórios para cada fase
