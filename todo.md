# Licitador Inteligente 14.133 - TODO

## Fase 1: Análise e Planejamento
- [x] Pesquisa sobre Lei 14.133/2021 e requisitos de licitações públicas
- [x] Definição da arquitetura de banco de dados
- [x] Planejamento da estrutura de pastas e componentes

## Fase 2: Banco de Dados e Schema
- [x] Criar tabelas: companies, tenders, products, suppliers, documents, proposals, declarations
- [x] Configurar relacionamentos e índices
- [x] Implementar migrations com Drizzle

## Fase 3: Autenticação e Dashboard
- [ ] Integrar OAuth Manus
- [ ] Criar layout principal com sidebar (DashboardLayout)
- [ ] Implementar dashboard com widgets de prazos, propostas e alertas
- [ ] Criar página de onboarding para novo usuário

## Fase 4: Cadastro da Empresa
- [ ] Formulário de cadastro de CNPJ com busca automática de dados
- [ ] Campos de regime tributário, percentual de impostos, dados bancários
- [ ] Upload de logomarca e representante legal
- [ ] Página de edição de dados da empresa

## Fase 5: Gestão de Documentos
- [ ] Sistema de upload de documentos em nuvem (S3)
- [ ] Cadastro de data de validade
- [ ] Alertas de vencimento por e-mail
- [ ] Download múltiplo em PDF único
- [ ] Checklist dinâmico de documentos exigidos

## Fase 6: Upload e Análise de Editais
- [ ] Interface de upload de PDF/Word
- [ ] Integração com IA para extração de informações
- [ ] Extração de: objeto, prazos, requisitos, critérios, itens/lotes
- [ ] Armazenamento de editais analisados
- [ ] Visualização de análise de risco e prazos

## Fase 7: Calculadora de Precificação (Produtos)
- [ ] Formulário de entrada de produtos
- [ ] Cálculo automático de custos, impostos, margem
- [ ] Distribuição de frete por peso/valor
- [ ] Resumo financeiro

## Fase 8: Calculadora de Serviços/Obras (BDI)
- [ ] Formulário específico para serviços
- [ ] Cálculo de BDI (Benefícios e Despesas Indiretas)
- [ ] Geração de planilha de custos detalhada
- [ ] Relatório BDI exportável

## Fase 9: Gerador de Propostas e Declarações
- [ ] Gerador de propostas em PDF timbrado (normas ABNT)
- [ ] Gerador de declarações padrão Lei 14.133/2021
- [ ] Criação de declarações manuais
- [ ] Preenchimento automático de dados da empresa

## Fase 10: Gerenciador de Produtos e Fornecedores
- [ ] Cadastro manual de produtos
- [ ] Importação de produtos via planilha
- [ ] Cadastro de fornecedores
- [ ] Busca e autocomplete de produtos

## Fase 11: Testes e Refinamentos
- [ ] Testes unitários com Vitest
- [ ] Testes de integração
- [ ] Otimizações de performance
- [ ] Validação de conformidade com Lei 14.133/2021

## Fase 12: Entrega Final
- [ ] Documentação do sistema
- [ ] Checkpoint final
- [ ] Apresentação ao usuário
